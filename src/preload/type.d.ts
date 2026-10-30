export type Inject = {
  api: {
    fs_read(path: string): Promise<Blob>
    fs_rename(oldPath: string, newPath: string): Promise<true>
    fs_remove(path: string): Promise<true>
    fs_ls(dirPath: string): Promise<string[]>
    compressImage(imgPath: string): Promise<string>
    downloadFile(imgUrl: string, toFilePath: string): Promise<true>
  }
}
