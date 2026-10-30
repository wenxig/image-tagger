<script setup lang='ts'>
import EditTag from '@renderer/components/editTag.vue'
import { NButton, useMessage } from 'naive-ui'
import { computed, ref, watch } from 'vue'
import { keys, noop } from 'lodash-es'
import { useFilesStore } from '@renderer/stores'
import { createLoadingMessage } from '@renderer/helpers/message'
import { FileObj } from '@renderer/helpers/data'

const $props = defineProps<{
  file: FileObj | undefined
  unremoveable?: boolean
}>()
const selectingFile = ref<FileObj | undefined>()
watch(() => $props.file, file => {
  selectingFile.value = file
},{immediate: true})
const $emit = defineEmits<{
  close: []
  edit: [FileObj | undefined]
}>()
const filesStore = useFilesStore()
const isEditing = ref(false)
const buttonInst = ref<InstanceType<typeof NButton>>()
let stopEmit = noop
watch(isEditing, (isEditing) => {
  console.log('isEditing', isEditing, buttonInst.value)

  if (isEditing)
    return stopEmit()
  buttonInst.value?.$el?.focus()
})

async function compressImageUrlToBase64(name: string) {
  const path = `${filesStore.pathOfDir}/${name}`
  return window.api.compressImage(path)
}
const saveAndRename = async () => {
  if (!selectingFile.value) return
  if (selectingFile.value.meta.length != 3) return
  const file = selectingFile.value
  await createLoadingMessage('保存中').bind(window.api.fs_rename(
    `${filesStore.pathOfDir}/${file.path}`,
    `${filesStore.pathOfDir}/[${(file.meta?.[0] ?? ['']).join('+')}][${(file.meta?.[1] ?? ['']).join('+')}]${(file.meta?.[2] ?? ['']).join('+')}${file.path.match(/\.\w+((?=$)|(?=\s\(\d+\)$))/igm)![0]}`
  ))
  $emit('edit', selectingFile.value)
  $emit('close')
  filesStore.loadFiles()
}


const imageUrl = computed(() => selectingFile.value ? `atom://${encodeURIComponent(`${filesStore.pathOfDir}/${selectingFile.value?.path}`)}` : undefined)
const compressedImgUrl = ref('')
const showCimg = ref(false)
const message = useMessage()
const cimg = () => {
  if (!imageUrl.value) {
    message.error('没有图片')
    return
  }
  return createLoadingMessage('压缩中').bind(compressImageUrlToBase64(selectingFile.value!.path).then(v => {
    compressedImgUrl.value = v
    showCimg.value = true
  }))
}

const remove = async () => {
  if (!selectingFile.value) return
  const file = selectingFile.value
  await createLoadingMessage('删除中').bind(window.api.fs_remove(
    `${filesStore.pathOfDir}/${file.path}`
  ))
  $emit('edit', undefined)
  $emit('close')
  filesStore.loadFiles()
}

</script>

<template>
  <NDrawerContent body-class="h-[30vh]" body-content-class=" w-full items-center flex relative">
    <template #header>
      <span class="">{{ selectingFile?.path }}</span>
      <NPopconfirm @positive-click="remove()" v-if="!unremoveable">
        <template #trigger>
          <NButton type="error" class="ml-1" ghost size="small">
            删除
          </NButton>
        </template>
        确定删除？
      </NPopconfirm>
      <NButton @click="cimg()" type="primary" class="ml-1" ghost size="small">
        临时压缩
      </NButton>
    </template>
    <NImage :src="imageUrl" class="h-[95%] select-all" />

    <div class="ml-3 !w-full flex items-start h-full" v-if="selectingFile && selectingFile.meta">
      <EditTag title="来源" :knownTags="keys(filesStore.tags.origin)" :thisTags="selectingFile.meta[0] || []"
        @submit="v => selectingFile!.meta[0] = v" @open="isEditing = true" @close="isEditing = false" />
      <EditTag title="作者" :knownTags="keys(filesStore.tags.anthor)" :thisTags="selectingFile.meta[1] || []"
        @submit="v => selectingFile!.meta[1] = v" @open="isEditing = true" @close="isEditing = false" />
      <EditTag limit title="角色" :knownTags="filesStore.tags.character" :origin="selectingFile!.meta[0] ?? []"
        :thisTags="selectingFile.meta[2] || []" @submit="v => selectingFile!.meta[2] = v" @open="isEditing = true"
        @close="isEditing = false" />
    </div>
    <NButton ref="buttonInst" type="primary" ghost size="small" class="absolute bottom-1 right-1"
      @click="saveAndRename()">
      保存
    </NButton>
    <NDrawer v-model:show="showCimg" placement="bottom">
      <NImage :src="compressedImgUrl" class="h-[95%] select-all" />
    </NDrawer>
  </NDrawerContent>
</template>