<script setup lang='ts'>
import { useFilesStore } from '@renderer/stores'
import { ref, shallowRef } from 'vue'
import { floor, isEmpty } from 'lodash-es'
import MainEditor from '@renderer/components/mainEditor.vue'
import { FileObj } from '@renderer/helpers/data'
import { NButton } from 'naive-ui'

const fillerString = ref('')
const filesStore = useFilesStore()
const selectingFile = shallowRef<FileObj>()
const showD = ref<boolean>(false)
const showDownload = ref<boolean>(false)  
</script>

<template>
  <div class="flex items-center">
    <NEl tag="span" class="px-2 text-sm text-[--placeholder-color]">
      {{ filesStore.files.length }}/{{ filesStore.editedNamedFilesNumber }}({{ floor((filesStore.editedNamedFilesNumber
        / filesStore.files.length) * 100, 2) }}%)
    </NEl>
    <NInput v-model:value="fillerString" placeholder="搜索" class="!w-20" />

    <NButton @click="showDownload = true">下载</NButton>
  </div>
  <div class="border border-solid rounded-sm w-[95%] mx-auto h-[85vh] select-none">
    <NVirtualList ref="listTns"
      :items="filesStore.files.filter(v => isEmpty(fillerString) || v.path.includes(fillerString))" :itemSize="42"
      class="size-full bg-white">
      <template #default="{ item }: { item: FileObj }">
        <NEl tag="div" @click=" selectingFile = item; showD = true"
          :class="[selectingFile === item && showD ? '!bg-[--primary-color-hover]' : '!bg-white']"
          class="flex items-center transition-colors border-b border border-solid border-gray-300" style="height: 41px">
          {{ item.path }}
        </NEl>
      </template>
    </NVirtualList>
  </div>
  <NDrawer v-model:show="showD" placement="bottom" @after-leave="selectingFile = undefined">
    <MainEditor @close="showD = false" @edit="f => selectingFile = f" :file="selectingFile" />
  </NDrawer>
  <NDrawer v-model:show="showDownload" placement="bottom">
    <Download @close="showDownload = false"/>
  </NDrawer>
</template>