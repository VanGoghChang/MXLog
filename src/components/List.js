import React from "react"
import PropTypes from "prop-types"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFileAlt } from "@fortawesome/free-solid-svg-icons"
import { findParentNode } from "../utils/helper"
import useContextMenu from "../hooks/useContextMenu"

const List = ({ files, onFileClick }) => {
    const clickedItem = useContextMenu([
        {
            label: "open",
            click: () => {
                const targetNode = findParentNode(clickedItem.current, "list-group-item")
                if (targetNode) {
                    onFileClick(targetNode.dataset.id)
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