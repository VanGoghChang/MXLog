import React, { useState } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import uuidv4 from 'uuid/v4'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import "easymde/dist/easymde.min.css"
import Search from './components/Search'
import List from './components/List'
import Table from './components/Table'
import BottomButton from './components/BottomButton'
import { flattenArray, objectToArray, filterLog, stringSerialize } from './utils/helper'
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
    store.set("files", data)
  }
}

const filesConfigSerialize = (data) => {
  const fileStoreArray = objectToArray(data)
  return fileStoreArray.reduce((result, file) => {
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
}

function App() {
  const [files, setFiles] = useState(store.get("files") || {})
  const [loading, setLoading] = useState(false)
  const [isActive, setActive] = useState(false)
  const [content, setContent] = useState([])
  const [leftBar, setLeftBar] = useState(store.get("leftBar") || "")
  const [detailBar, setDetailBar] = useState("close")
  const [detailData, setDetailData] = useState("")
  // const [tableHeight, setTableHeight] = useState(768)

  const filesListSource = objectToArray(files)

  console.log("render files___:", files)

  const fileClick = (id) => {
    const activeFile = files[id]
    console.log()
    const { path, key } = activeFile
    fileHelper.existsFile(path)
      .then(stats => {
        ipcRenderer.send("read-file", { id, path })
      }, error => {
        if (getAutoSync()) {
          ipcRenderer.send("download-file", { key, path, id })
        } else {
          remote.dialog.showErrorBox("文件加载失败", "请检查云端配置项是否正确")
        }
      })
      .catch(err => {
        if (getAutoSync()) {
          ipcRenderer.send("download-file", { key, path, id })
        } else {
          remote.dialog.showErrorBox("文件加载失败", "请检查云端配置项是否正确")
        }
      })
    // ipcRenderer.send("left-bar-status")
  }

  const searchFiles = (keywords) => {
    console.log("search________start")
    ipcRenderer.send("search-files", { keywords })
  }

  // const importFiles = () => {
  //   remote.dialog.showOpenDialog({
  //     title: "选择需要导入的文件",
  //     properties: ["openFile", "multiSelections"],
  //     filters: [
  //       { name: "MarkDown", extensions: ["md"] }
  //     ]
  //   }, (paths) => {
  //     if (Array.isArray(paths) && paths.length > 0) {
  //       // filter out the path, already have path in electron store
  //       const addNewFilesPath = paths.filter(path => {
  //         const alreadyPath = Object.values(files).find(file => {
  //           return file.path === path
  //         })
  //         return !alreadyPath
  //       })
  //       // extend the path array to an array contains files info
  //       const importFilesPathArr = addNewFilesPath.map(path => {
  //         return {
  //           id: uuidv4(),
  //           path,
  //           title: Path.basename(path, Path.extname(path)),
  //           createdAt: new Date().getTime()
  //         }
  //       })
  //       // flatten files array
  //       const newFiles = { ...files, ...flattenArray(importFilesPathArr) }
  //       // setState && update electron store
  //       setFiles(newFiles)
  //       saveFilesToStore(newFiles)
  //     }
  //   })
  // }

  const filesSearched = (event, message) => {
    const newFiles = filesConfigSerialize(filterLog(message))
    console.log("search newFiles____:", newFiles)
    setFiles(newFiles)
    saveFilesToStore(newFiles)
  }

  const fileRead = (event, message) => {
    const { content, id } = message
    setActive(id)
    console.log("Content______: ", content)
    setContent(content)
  }

  const windowResize = (event, message) => {

  }

  useIpcRenderer({
    // 'import-file': importFiles,
    'search-file': searchFiles,
    'searched-files': filesSearched,
    'read-file': fileRead,
    'set-left-bar-status': (event, message) => { setLeftBar(message.status) },
    'loading-status': (event, message) => { setLoading(message) },
    'window-resize': windowResize
  })

  console.log("detailBar_____:", remote.getCurrentWindow())
  return (
    <div className="app container-fluid px-0">
      <div className="row no-gutters">
        {
          leftBar === "close" && null
        }
        {
          leftBar === "open" &&
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
            {/* <div className="row no-gutters button-group">
              <div className="col">
                <BottomButton
                  text="导入"
                  colorClass="btn-success"
                  icon={faFileImport}
                  onClick={importFiles}
                />
              </div>
            </div> */}
          </div>
        }
        <div className="col-9 right-panel">
          {
            !isActive && <div className="block-page">
              选择或者导入 log 文件
            </div>
          }
          {
            isActive &&
            <>
              <Search
                title="搜索关键时间或关键字"
                onSearch={() => {}}
                onSearchClose={() => { console.log("search close") }}
              />
              <Table
                titles={["时间", "类型", "内容"]}
                dataSource={content}
                itemOnClick={(id, data) => {
                  setDetailData(data)
                  if (id === detailBar) {
                    setDetailBar("close")
                  } else {
                    setDetailBar(id)
                  }
                }}
              />
            </>
          }
        </div>
        {detailBar === "close" && null}
        {
          detailBar !== "close" &&
          <div className="detail-bar">
            <SyntaxHighlighter language="javascript" style={docco}>
              {stringSerialize(detailData)}
            </SyntaxHighlighter>
          </div>
        }
      </div>
      {loading ? <Loader /> : null}
    </div>
  );
}

export default App;
