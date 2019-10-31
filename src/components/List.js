import React from "react"
import PropTypes from "prop-types"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFileAlt } from "@fortawesome/free-solid-svg-icons"
import { findParentNode } from "../utils/helper"
import fileHelper from "../utils/fileHelper"
import useContextMenu from "../hooks/useContextMenu"

const { shell, remote } = window.require('electron')
const Store = window.require('electron-store')
const store = new Store()

const List = ({ files, onFileClick }) => {
    const clickedItem = useContextMenu([
        {
            label: "Open",
            click: () => {
                const targetNode = findParentNode(clickedItem.current, "list-group-item")
                if (targetNode) {
                    onFileClick(targetNode.dataset.id)
                }
            }
        },
        {
            label: "Show in Finder",
            click: () => {
                const targetNode = findParentNode(clickedItem.current, "list-group-item")
                if (targetNode) {
                    console.log(targetNode.dataset.id)
                    const path = `${store.get("savedFileLocation") || remote.app.getPath('documents')}/${targetNode.dataset.id}.db`
                    fileHelper.existsFile(path)
                        .then(stats => {
                            const openFile = shell.showItemInFolder(path)
                        }, error => {
                            remote.dialog.showErrorBox("文件打开失败", "本地文件未找到，请检查文件路径")
                        })
                }
            }
        }
    ], ".file-list")
    console.log("init list files:", files)
    return (
        <ul className="list-group list-group-flush file-list">
            {
                files.map(file => (
                    <li
                        className="list-group-item row bg-light d-flex align-items-center mx-0"
                        key={file.key}
                        data-id={file.id}
                        data-title={file.key}
                        onClick={() => {
                            onFileClick(file.id)
                        }}
                    >
                        <span className="col-2 c-link">
                            <FontAwesomeIcon size="lg" icon={faFileAlt} />
                        </span>
                        <span className="col-10">
                            {file.key}
                        </span>
                    </li>
                ))
            }
        </ul>
    )
}

List.propTypes = {
    files: PropTypes.array,
    onFileClick: PropTypes.func,
}

export default List