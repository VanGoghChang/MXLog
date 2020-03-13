const { app, Menu, ipcMain, dialog } = require("electron")
const { autoUpdater } = require('electron-updater')
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
        height: 870,
        // resizable: false
    }
    this.preWindowSize = { ...mainWindowConfig }
    const urlLocation = isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "./index.html")}`
    mainWindow = new AppWindow(mainWindowConfig, urlLocation)

    if (isDev) {
        autoUpdater.updateConfigPath = path.join(__dirname, 'dev-app-update.yml')
    }

    autoUpdater.autoDownload = false
    autoUpdater.checkForUpdates()
    autoUpdater.on('error', (error) => {
        dialog.showErrorBox('Error: ', error == null ? 'unknown' : (error.stack || error).toString())
    })
    autoUpdater.on('checking-for-updater', () => {
        console.log("Checking for updater....")
    })

    autoUpdater.on('update-available', () => {
        dialog.showMessageBox({
            type: 'info',
            title: '应用有新的版本',
            message: '发现新版本，是否现在更新?',
            buttons: ['是', '否']
        }, (buttonIndex) => {
            if (buttonIndex === 0) {
                autoUpdater.downloadUpdate()
            }
        })
    })

    autoUpdater.on('update-not-available', () => {
        // dialog.showMessageBox({
        //     title: '没有新版本',
        //     message: '当前已经是最新版本'
        // })
    })

    autoUpdater.on('download-progress', (progressObj) => {
        let log_message = "Download speed: " + progressObj.bytesPerSecond;
        log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
        log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
        console.log(log_message)
        mainWindow.webContents.send("download-progress", { progress: Math.ceil(progressObj.percent) })
    })

    autoUpdater.on('update-downloaded', () => {
        dialog.showMessageBox({
            title: '安装更新',
            message: '更新下载完毕，应用将重启并进行安装'
        }, () => {
            setImmediate(() => autoUpdater.quitAndInstall())
        })
    })

    // mainWindow.webContents.openDevTools()
    mainWindow.on('closed', () => {
        mainWindow = null
    })

    mainWindow.on('resize', () => {
        const windowSize = mainWindow.getBounds()
        // console.log("windowSize_____:", windowSize)
        mainWindow.webContents.send("window-resize", { windowHeight: windowSize.height })
        
        // const compareWindowSize = setInterval(() => {
        //     const equalSize = windowSize.height === this.preWindowSize.height
        //     console.log("equalSize value:", equalSize, this.preWindowSize.height, windowSize.height)
        //     if(equalSize){
        //         console.log("resize close~~")
        //         clearInterval(compareWindowSize)
        //         mainWindow.webContents.send("window-resize", { windowSize })
        //     }else{
        //         console.log("this.preWindowSize: ", this.preWindowSize)
        //         this.preWindowSize.height = windowSize.height
        //     }
        // }, 100)
        
    })

    // Open setting window
    ipcMain.on('open-settings-window', () => {
        const settingsWindowConfig = {
            width: 500,
            height: 500,
            parent: mainWindow
        }
        const settingsFileLocation = isDev ? `file://${path.join(__dirname, './settings/settings.html')}`: `file://${path.join(__dirname, '../settings/settings.html')}`
        settingsWindow = new AppWindow(settingsWindowConfig, settingsFileLocation)
        // settingsWindow.webContents.openDevTools()
        settingsWindow.on('closed', () => {
            settingsWindow = null
        })
    })

    let menu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menu)

    // Set left bar status
    store.set("leftBar", "open")

    // Set cloud sync menu item status 
    ipcMain.on("config-is-saved", () => {
        let qiniuMenu = process.platform === "darwin" ? menu.items[3] : menu.items[2]
        // const switchItems = (toggle) => {
        //     [1, 2, 3].map(key => {   
        //         qiniuMenu.submenu.items[key].enabled = toggle
        //     })
        // }
        const qiniuConfig = ["accessKey", "secretKey", "bucketName"].every(key => !!store.get(key))
        // if (qiniuConfig) {
        //     switchItems(true)
        // } else {
        //     switchItems(false)
        // }
    })

    ipcMain.on("left-bar-status", () => {
        let qiniuMenu = process.platform === "darwin" ? menu.items[4] : menu.items[3]

        if (store.get("leftBar") === "open") {
            qiniuMenu.submenu.items[0].label = "开启侧边栏"
            mainWindow.webContents.send("set-left-bar-status", { status: "close" })
            store.set("leftBar", "close")
            console.log("leftBar close")
        } else {
            qiniuMenu.submenu.items[0].label = "隐藏侧边栏"
            mainWindow.webContents.send("set-left-bar-status", { status: "open" })
            store.set("leftBar", "open")
            console.log("leftBar open")
        }
    })

    // Download active file
    ipcMain.on("download-file", (event, data) => {
        setLoadingStatus(true)
        const { key, path, id } = data
        const manager = createQiniuManager()
        const sqlManager = createSQLManager(path)
        manager.getFileInfoInCloud(key).then(res => {
            manager.downloadFiles(key, path).then(() => {
                sqlManager.getSQLFileContent()
                    .then(content => {
                        event.reply("read-file", { id, content })
                        setLoadingStatus(false)
                    }, error => {
                        dialog.showErrorBox("数据解析失败", "请检查解析文件格式是否正确")
                        setLoadingStatus(false)
                    })
                    .catch(error => {
                        dialog.showErrorBox("数据解析失败", "请检查解析文件格式是否正确")
                        setLoadingStatus(false)
                    })

            })
        }, error => {
            if (error.statusCode === 612) {
                dialog.showErrorBox("线上文件失败", "请检查云端配置项是否正确")
                setLoadingStatus(false)
            }
        }).catch(err => {
            if (err) {
                dialog.showErrorBox("线上文件失败", "请检查云端配置项是否正确")
                setLoadingStatus(false)
            }
        })
    })

    // Read file
    ipcMain.on("read-file", (event, data) => {
        setLoadingStatus(true)
        const { path, id } = data
        const sqlManager = createSQLManager(path)
        sqlManager.getSQLFileContent()
            .then(content => {
                event.reply("read-file", { id, content })
                setLoadingStatus(false)
            }, error => {
                dialog.showErrorBox("数据解析失败", "请检查解析文件格式是否正确")
                setLoadingStatus(false)
            })
            .catch(error => {
                dialog.showErrorBox("数据解析失败", "请检查解析文件格式是否正确")
                setLoadingStatus(false)
            })

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
        // setLoadingStatus(true)
        const manager = createQiniuManager()
        if (manager) {
            manager.getTargetListToCloud(data.keywords)
                .then(res => {
                    if (res && res.items) {
                        // setLoadingStatus(false)
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
                    // setLoadingStatus(false)
                    dialog.showErrorBox("连接云端搜索失败", "请检查云端配置项是否正确")
                })
                .catch(error => {
                    // setLoadingStatus(false)
                    dialog.showErrorBox("连接云端搜索失败", "请检查云端配置项是否正确")
                })
        }
    })

    // Set loading status
    const setLoadingStatus = status => {
        mainWindow.webContents.send("loading-status", status)
    }
})