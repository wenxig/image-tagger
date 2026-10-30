import { app, shell, BrowserWindow, protocol, net, utilityProcess, MessageChannelMain, nativeImage } from "electron"
import { join } from "path"
import { electronApp, optimizer, is } from "@electron-toolkit/utils"
import icon from "../../resources/icon.png?asset"
import * as fs from "fs/promises"
import * as fs_old from "fs"
import url from "url"
import { handleMessage } from "./helper"
import { imageminCompass } from './compress'
protocol.registerSchemesAsPrivileged([
  {
    scheme: "atom",
    privileges: {
      supportFetchAPI: true,
    },
  },
])

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.mjs"),
      sandbox: false,
    },
  })

  mainWindow.on("ready-to-show", () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: "deny" }
  })

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"])
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"))
  }
}

app.whenReady().then(() => {
  protocol.handle("atom", (request) => {
    const filePath = decodeURIComponent(request.url.slice("atom://".length))
    console.log("[atom request]", filePath)
    return net.fetch(url.pathToFileURL(filePath).toString())
  })

  electronApp.setAppUserModelId("com.electron")

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  handleMessage({
    async fs_ls(dirPath) {
      console.log("[ls file]", dirPath)
      try {
        const ls = await fs.readdir(dirPath)
        return ls
      } catch (error) {
        throw new Error('error on main', { cause: error })
      }
    },
    async fs_read(path) {
      console.log("[read file]", path)
      try {
        const flie = await fs.readFile(path)
        return new Blob([flie])
      } catch (error) {
        throw new Error('error on main', { cause: error })
      }
    },
    async fs_rename(oldPath, newPath) {
      console.log("[rename file]", oldPath, newPath)
      while (fs_old.existsSync(newPath)) {
        const reg = /\s\(\d+\)(?=\.\w+$)/gim
        if (reg.test(newPath)) {
          newPath = newPath.replace(reg, (s) => {
            s.match(/\d+/)
            return ` (${parseInt(s.match(/\d+/)![0]) + 1})`
          })
        } else {
          newPath = newPath.replace(/(?=\.\w+$)/gim, (v) => ` (1)${v}`)
        }
        console.log("[rename file exist] newPath = ", newPath)
      }
      try {
        await fs.rename(oldPath, newPath)
        return true as const
      } catch (error) {
        throw new Error('error on main', { cause: error })
      }
    },
    async fs_remove(path) {
      console.log("[remove file]", path)
      try {
        await fs.unlink(path)
        return true as const
      } catch (error) {
        throw new Error('error on main', { cause: error })
      }
    },
    compressImage: imageminCompass,
    async downloadFile(imgUrl, toFilePath) {
      const signal = new AbortController()
      const timer = setTimeout(() => {
        signal.abort()
      }, 6000)
      const request = await fetch(imgUrl, { signal: signal.signal })
      clearTimeout(timer)
      const file = await request.blob()
      await fs.writeFile(toFilePath, await file.bytes())
      return true as const
    },
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})