import React, { useState, useEffect, useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons"
import PropTypes from "prop-types"
import useKeyPress from "../hooks/useKeyPress"

const { remote, ipcRenderer } = window.require('electron')

const Search = ({ title, onSearch, onSearchClose }) => {
    const [inputActive, setInputActive] = useState(false)
    const [value, setValue] = useState("")

    const enterPressed = useKeyPress(13)
    const escPressed = useKeyPress(27)

    let node = useRef(null)
    const closeSearch = () => {
        setInputActive(false)
        setValue("")
        onSearchClose()
    }

    useEffect(() => {
        if (enterPressed && inputActive) {
            onSearch(value)
        }
        if (escPressed && inputActive) {
            closeSearch()
        }
    })

    useEffect(() => {
        if (inputActive) {
            node.current.focus()
        }

    }, [inputActive])

    return (
        <div
            className="alert search-container no-border alert-primary d-flex justify-content-between align-items-center mb-0"
            onClick={() => {
                if (!inputActive) {
                    setInputActive(true)
                }
            }}
        >
            {
                !inputActive &&
                <>
                    <span>{title}</span>
                    <button
                        type="button"
                        className="icon-button"
                    >
                        <FontAwesomeIcon size="lg" title="搜索" icon={faSearch} />
                    </button>
                </>
            }
            {
                inputActive &&
                <>
                    <input
                        className="form-control"
                        value={value}
                        ref={node}
                        onChange={e => { setValue(e.target.value) }}
                    />
                    <button
                        type="button"
                        className="icon-button"
                        onClick={closeSearch}
                    >
                        <FontAwesomeIcon size="lg" title="取消" icon={faTimes} />
                    </button>
                </>
            }
        </div>
    )
}

Search.propTypes = {
    title: PropTypes.string,
    onSearch: PropTypes.func
}

export default Search