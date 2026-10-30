<script setup lang='ts'>
import { NButton } from 'naive-ui'
import { ref, shallowRef, watch } from 'vue'
import MainEditor from './mainEditor.vue'
import { FileObj } from '@renderer/helpers/data'
import { createLoadingMessage } from '@renderer/helpers/message'
import { useFilesStore } from '@renderer/stores'
const $emit = defineEmits<{
  close: []
}>()
const store = useFilesStore()
const imageUrl = ref('')
const download = async () => {
  if (!imageUrl.value) return window.$message.error('空网址')
  await createLoadingMessage().bind(window.api.downloadFile(imageUrl.value, store.pathOfDir))
  showMainEditor.value = false
  $emit('close')
}
const showMainEditor = ref(false)
const fileObj = shallowRef<FileObj>(FileObj.empty)
watch(imageUrl, () => {
  fileObj.value = FileObj.empty
})
</script>

<template>
  <NDrawerContent body-class="h-[60vh]" body-content-class=" w-full items-center flex relative">
    <template #header>
      <span>从网络下载</span>
    </template>
    <div>
      <NImage :src="imageUrl" class="h-[30vh] select-all" />
      <div>
        <NInput v-model:value="imageUrl"></NInput>
        <NButton @click="download">确定</NButton>
      </div>
    </div>
    <NDrawer v-model:show="showMainEditor" placement="bottom">
      <MainEditor unremoveable @close="showMainEditor = false" @edit="f => fileObj = f!" :file="fileObj" />
    </NDrawer>
  </NDrawerContent>
</template>