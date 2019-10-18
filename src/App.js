import React, { useState } from 'react'
import { faFileImport } from '@fortawesome/free-solid-svg-icons'
import uuidv4 from 'uuid/v4'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import "easymde/dist/easymde.min.css"
import Search from './components/Search'
import List from './components/List'
import BottomButton from './components/BottomButton'
import { flattenArray, objectToArray, filterLog } from './utils/helper'
import fileHelper from './utils/fileHelper'
import useIpcRenderer from "./hooks/useIpcRenderer"
import Loader from './components/Loader'

// import Node module
const Path = window.require('path')
const { remote, ipcRenderer } = window.require('electron')
const Store = window.require('electron-store')

const store = new Store()

const getAutoSync = () => ["accessKey", "secretKey", "bucketName"].every(key => !!store.get(key))

const saveFilesToStore = (data) => {
  if (Object.keys(data).length === 0) {
    store.set("files", [])
  } else {
    const fileStoreArray = objectToArray(data)
    const fileStoreObje = fileStoreArray.reduce((result, file) => {
      const id = Path.basename(file.key, ".db")
      const { key, putTime } = file
      result[id] = {
        id: Path.basename(key, ".db"),
        key,
        putTime,
        path: `${store.get("savedFileLocation")}/${key}`
      }
      return result
    }, {})
    store.set("files", fileStoreObje)
  }
}

function App() {
  const [files, setFiles] = useState(store.get("files") || {})
  const [loading, setLoading] = useState(false)

  const filesListSource = objectToArray(files)

  console.log("render files___:", files)

  const fileClick = (id) => {
    const activeFile = files[id]
    const { path, key } = activeFile
    ipcRenderer.send("download-file", { key, path, id })
    // fileHelper.readFile(path)
    //   .then(value => {
    //     // const newFile = { ...files[key], body: value, isLoaded: true }
    //     // setFiles({ ...files, [fileID]: newFile })
    //     console.log(value)
    //   }, error => {
    //     if (getAutoSync()) {
    //       ipcRenderer.send("download-file", { key, path, id })
    //     } else {
    //       remote.dialog.showErrorBox("文件加载失败", "请检查云端配置项是否正确")
    //     }
    //   })
    //   .catch(err => {
    //     if (getAutoSync()) {
    //       ipcRenderer.send("download-file", { key, path, id })
    //     } else {
    //       remote.dialog.showErrorBox("文件加载失败", "请检查云端配置项是否正确")
    //     }
    //   })


  }

  const searchFiles = (keywords) => {
    ipcRenderer.send("search-files", { keywords })
  }

  const importFiles = () => {
    remote.dialog.showOpenDialog({
      title: "选择需要导入的文件",
      properties: ["openFile", "multiSelections"],
      filters: [
        { name: "MarkDown", extensions: ["md"] }
      ]
    }, (paths) => {
      if (Array.isArray(paths) && paths.length > 0) {
        // filter out the path, already have path in electron store
        const addNewFilesPath = paths.filter(path => {
          const alreadyPath = Object.values(files).find(file => {
            return file.path === path
          })
          return !alreadyPath
        })
        // extend the path array to an array contains files info
        const importFilesPathArr = addNewFilesPath.map(path => {
          return {
            id: uuidv4(),
            path,
            title: Path.basename(path, Path.extname(path)),
            createdAt: new Date().getTime()
          }
        })
        // flatten files array
        const newFiles = { ...files, ...flattenArray(importFilesPathArr) }
        // setState && update electron store
        setFiles(newFiles)
        saveFilesToStore(newFiles)
      }
    })
  }

  const filesDownload = (event, message) => {
    const currentFile = files[message.id]
    const { id, path } = currentFile
    fileHelper.readFile(path).then(value => {
      let newFile
      console.log("download status:", message.status)
      if (message.status === "download-success") {
        newFile = { ...files[id], body: value }
      }
      const newFiles = { ...files, [id]: newFile }
      // setState && update electron store
      setFiles(newFiles)
      saveFilesToStore(newFiles)
    })
  }

  const filesSearched = (event, message) => {
    console.log("search files to cloud____:", message)
    const newFiles = flattenArray(filterLog(message))
    console.log("search newFiles____:", newFiles)
    setFiles(newFiles)
    saveFilesToStore(newFiles)
  }

  useIpcRenderer({
    'import-file': importFiles,
    'search-file': searchFiles,
    'file-downloaded': filesDownload,
    'searched-files': filesSearched,
    'loading-status': (event, message) => { setLoading(message) },
  })
  return (
    <div className="App container-fluid px-0">
      {loading ? <Loader /> : null}
      <div className="row no-gutters">
        <div className="col-3 left-panel">
          <Search
            title="我的云文档"
            onSearch={searchFiles}
            onSearchClose={() => { console.log("search close") }}
          />
          <List
            files={filesListSource}
            onFileClick={fileClick}
          />
          <div className="row no-gutters button-group">
            <div className="col">
              <BottomButton
                text="导入"
                colorClass="btn-success"
                icon={faFileImport}
                onClick={importFiles}
              />
            </div>
          </div>
        </div>
        <div className="col-9 right-panel">
          <div className="block-page">
            选择或者创建新的 Markdown 文档
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
