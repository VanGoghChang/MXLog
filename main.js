const { app, Menu, ipcMain, dialog } = require("electron")
const isDev = require("electron-is-dev")
const path = require('path')
const menuTemplate = require('./src/menuTemplate')
const qiniuManager = require('./src/utils/QiniuManager')
const sqlManager = require('./src/utils/SQLManager')
const AppWindow = require('./src/AppWindow')
const Store = require("electron-store")
const store = new Store()
let mainWindow

const createQiniuManager = () => {
    const accessKey = store.get("accessKey")
    const secretKey = store.get("secretKey")
    const bucket = store.get("bucketName")
    const bucketArea = store.get("bucketArea") || "z0"
    return new qiniuManager(accessKey, secretKey, bucket, bucketArea)
}

const createSQLManager = (path) => {
    return new sqlManager(path)
}

app.on("ready", () => {
    const mainWindowConfig = {
        width: 1440,
        height: 768
    }
    const urlLocation = isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "./index.html")}`
    mainWindow = new AppWindow(mainWindowConfig, urlLocation)
    // mainWindow.webContents.openDevTools()
    mainWindow.on('closed', () => {
        mainWindow = null
    })

    // Open setting window
    ipcMain.on('open-settings-window', () => {
        const settingsWindowConfig = {
            width: 500,
            height: 500,
            parent: mainWindow
        }
        const settingsFileLocation = `file://${path.join(__dirname, './settings/settings.html')}`
        settingsWindow = new AppWindow(settingsWindowConfig, settingsFileLocation)
        // settingsWindow.webContents.openDevTools()
        settingsWindow.on('closed', () => {
            settingsWindow = null
        })
    })

    let menu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menu)

    // Set cloud sync menu item status 
    ipcMain.on("config-is-saved", () => {
        let qiniuMenu = process.platform === "darwin" ? menu.items[3] : menu.items[2]
        const switchItems = (toggle) => {
            [1, 2, 3].map(key => {
                qiniuMenu.submenu.items[key].enabled = toggle
            })
        }
        const qiniuConfig = ["accessKey", "secretKey", "bucketName"].every(key => !!store.get(key))
        if (qiniuConfig) {
            switchItems(true)
        } else {
            switchItems(false)
        }
    })

    // Download active file
    ipcMain.on("download-file", (event, data) => {
        setLoadingStatus(true)
        const manager = createQiniuManager()
        const sqlManager = createSQLManager()
        const { key, path, id } = data
        sqlManager.getSQLFileContent()
        // manager.getFileInfoInCloud(key).then(res => {
        //     console.log("RES______:", res)
        //     manager.downloadFiles(key, path).then(() => {
        //         event.reply("file-downloaded", { status: "download-success", id })
        //         setLoadingStatus(false)
        //     })
        // }, error => {
        //     if (error.statusCode === 612) {
        //         event.reply("file-downloaded", { status: "no-file", id })
        //         setLoadingStatus(false)
        //     }
        // }).catch(err => {
        //     if (err) {
        //         event.reply("file-downloaded", { status: "download-error", id })
        //         setLoadingStatus(false)
        //     }
        // })
    })

    // Delete file
    ipcMain.on("delete-file", (event, data) => {
        const manager = createQiniuManager()
        if (manager) {
            manager.deleteFile(data.key)
                .then(res => {
                    console.log("delete result___:", res)
                    dialog.showMessageBox({
                        type: "info",
                        title: `云端删除成功`,
                        message: `云端删除成功`
                    })
                })
                .catch(error => {
                    console.log("delete error___:", error)
                    dialog.showErrorBox("云端删除失败", "请检查云端配置项是否正确")
                })

        }
    })

    // Search online files
    ipcMain.on("search-files", (event, data) => {
        setLoadingStatus(true)
        const manager = createQiniuManager()
        if (manager) {
            manager.getTargetListToCloud(data.keywords)
                .then(res => {
                    if (res && res.items) {
                        setLoadingStatus(false)
                        if (res.items.length === 0) {
                            dialog.showMessageBox({
                                type: "info",
                                title: `未查询到匹配对象`,
                                message: `未查询到匹配对象`
                            })
                        } else {
                            event.reply("searched-files", res.items)
                        }
                    }
                }, error => {
                    setLoadingStatus(false)
                    dialog.showErrorBox("连接云端搜索失败", "请检查云端配置项是否正确")
                })
                .catch(error => {
                    setLoadingStatus(false)
                    dialog.showErrorBox("连接云端搜索失败", "请检查云端配置项是否正确")
                })
        }
    })

    // Set loading status
    const setLoadingStatus = status => {
        mainWindow.webContents.send("loading-status", status)
    }
})