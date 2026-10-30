<script setup lang='ts'>
import { KnownTags } from '@renderer/type'
import { debounce, fromPairs, isEmpty, sortBy, uniq, values } from 'lodash-es'
import { NButton } from 'naive-ui'
import { NAutoComplete, NModal, NTag } from 'naive-ui'
import { pinyin } from 'pinyin-pro'
import { computed, reactive, ref, watch } from 'vue'

const $props = defineProps<{
  thisTags: string[]
  title: string
} & ({
  limit: true
  origin: string[]
  knownTags: KnownTags['character']
} | {
  limit?: false
  origin?: void
  knownTags: string[]
})>()
const $emit = defineEmits<{
  'submit': [tags: string[]]
  'close': []
  'open': []
}>()
const thisTags = reactive($props.thisTags)

const showModal = ref(false)
const submitCallback = debounce(() => {
  if (inputTagTrim.value) {
    thisTags.push(inputTagTrim.value)
  }
  $emit('submit', thisTags)
  showModal.value = false
  inputTag.value = ''
}, 30)

const cancelCallback = () => {
  console.log('cancel')
  showModal.value = false
  inputTag.value = ''
}
const inputTag = ref('')
const inputTagTrim = computed(() => inputTag.value.trim())
const inputIns = ref<InstanceType<typeof NAutoComplete>>()
const knownTagsArray = computed(() =>
  $props.limit ?
    (isEmpty($props.origin) ?
      values($props.knownTags).map(s => ([...s])).flat() :
      $props.origin!.map(v => Array.from($props.knownTags[v] ?? [])).flat()
    ) :
    Array.from($props.knownTags)
)
const pinyinFillerTags = computed(() => fromPairs(knownTagsArray.value.map(v => [v, pinyin(v, { pattern: 'initial', type: 'array' }).join('')])))
const autoTags = computed(() => uniq(sortBy(knownTagsArray.value.filter(
  v => v.startsWith(inputTagTrim.value) || pinyinFillerTags.value[v].startsWith(inputTagTrim.value)
), v => knownTagsArray.value.filter(t => t == v || v == pinyinFillerTags.value[t]).length).toReversed()))

watch(() => inputIns.value?.inputInstRef?.inputElRef, (inputEl) => {
  if (inputEl) {
    inputIns.value?.focus()
    inputEl.addEventListener('keydown', (e) => {
      console.log('keydown', e.key)
      if (e.key === 'Enter' && isEmpty(autoTags.value.filter(v => v != inputTagTrim.value))) {
        submitCallback()
      }
    })
  }
})
const buttonInst = ref<InstanceType<typeof NButton>>()
</script>

<template>
  <div class=" mx-1 px-2 flex flex-col border-x border-y-0 border-solid border-gray-200 h-full w-[33%]">
    <div class="text-lg mb-1">{{ title }}</div>
    <div class="*:m-1">
      <NTag v-for="tag in thisTags" :key="tag" closable
        :type="tag == '原创' ? 'info' : (tag == 'unknown' ? 'error' : 'primary')"
        @close="thisTags.splice(thisTags.indexOf(tag), 1)">
        {{ tag }}
      </NTag>
      <NButton ref="buttonInst" type="primary"
        @click="showModal = true; $emit('open'); (<HTMLButtonElement>buttonInst?.$el).blur()" ghost size="small">
        +
      </NButton>
    </div>
  </div>
  <NModal v-model:show="showModal" preset="dialog" @after-hide="$emit('close')" :title="`添加${title}`" ref="modalIns"
    positive-text="确认" negative-text="取消" @positive-click="submitCallback" @negative-click="cancelCallback">
    <NEl tag="div" class="text-[--warning-color] h-6">
      <span v-if="isEmpty(autoTags)">你现在输入的是未曾出现的项目</span>
    </NEl>
    <NAutoComplete ref="inputIns" v-model:value="inputTag" :placeholder="`输入${title}`"
      :options="autoTags.filter(v => v != inputTagTrim)" @select="submitCallback()" />
  </NModal>
</template>