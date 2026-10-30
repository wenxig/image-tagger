import {  KnownTags } from "@renderer/type"
import { defineStore } from "pinia"
import { computed, nextTick, reactive, readonly, ref } from "vue"
import { FileObj } from '@renderer/helpers/data'

export const useFilesStore = defineStore('files', () => {
  const editedNamedFilesNumber = ref(0)
  const editedFiles = ref<NonNullable<FileObj>[]>([])
  const files = ref<FileObj[]>([])
  const addFile = (fileName: string) => {
    const fileObj = new FileObj(fileName)
    if (fileObj.isEdited) {
      editedNamedFilesNumber.value++
      fileObj.meta[1]!.forEach(v => {
        tags.anthor[v] ??= 0
        tags.anthor[v]++
      })
      fileObj.meta[0]!.forEach(o => {
        tags.origin[o] ??= 0
        tags.origin[o]++
        fileObj.meta[2]!.forEach(v => {
          (tags.character[o] ??= new Set<string>()).add(v)
        })
      })
      editedFiles.value.push(fileObj)
    }
    files.value.push(fileObj)
  }
  const clearFiles = () => {
    files.value = []
    editedFiles.value = []
    tags.anthor = {}
    tags.origin = {}
    tags.character = {}
    editedNamedFilesNumber.value = 0
    pathOfDir.value = ''
  }
  const tags: KnownTags = reactive({
    anthor: {},
    character: {},
    origin: {},
  })
  const pathOfDir = ref('')
  const loadFiles = async (dirPath = pathOfDir.value) => {
    isLoading.value = true
    clearFiles()
    const files = await window.api.fs_ls(pathOfDir.value = dirPath)
    files.forEach(addFile)
    await nextTick()
    await nextTick()
    isLoading.value = false
  }
  const isLoading = ref(false)
  return {
    files,
    addFile,
    clearFiles,
    editedNamedFilesNumber: readonly(editedNamedFilesNumber),
    tags,
    pathOfDir: computed(() => pathOfDir.value.replace(/\\/g, '/')),
    loadFiles,
    isLoading,
    editedFiles
  }
})