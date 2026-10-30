<script setup lang='ts'>
import { useFilesStore } from '@renderer/stores'
import { isEmpty } from 'lodash-es'
import { NButton, NInput, NForm, NTabs, NSpin } from 'naive-ui'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'


const pathOfDir = ref<string>(localStorage.getItem('latestPathOfDir') || '')
const $router = useRouter()
const filesStore = useFilesStore()
const isLoading = ref(false)
const submitCallback = async () => {
  isLoading.value = true
  await filesStore.loadFiles(pathOfDir.value)
  localStorage.setItem('latestPathOfDir', pathOfDir.value)
  await $router.push({ path: '/files/overview' })
  isLoading.value = false
}

const selecting = ref<string>('')
</script>

<template>
  <div v-if="filesStore.pathOfDir === ''"
    class="w-[30vw] h-[30vh] flex flex-col justify-center items-center px-8 bg-slate-100 rounded-lg fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
    <NInput placeholder="请输入内容" v-model:value="pathOfDir" />
    <NButton type="primary" @click="submitCallback">确定</NButton>
  </div>
  <NSpin content-class="!w-full !h-[100vh]" class="!w-full !h-[100vh]" size="large" :show=" isLoading" v-else>
    <NTabs default-value="overview" @before-leave="to => $router.push(`/files/${to}`).then(() => true)" class="w-full"
      v-model="selecting">
      <NTab name="overview">编辑</NTab>
      <NTab name="statistics">统计</NTab>
      <template #prefix>
        <div class="px-3"></div>
      </template>
    </NTabs>
    <RouterView />
    <template #description>
      <span>读取文件中</span>
    </template>
  </NSpin>
</template>