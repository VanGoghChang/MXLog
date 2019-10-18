import { useEffect } from "react"
const { ipcRenderer } = window.require("electron")

const useIpcRenderer = (messages) => {
    useEffect(() => {
        Object.keys(messages).map( key => {
            ipcRenderer.on(key, messages[key])
        })
    
        return () => {
            Object.keys(messages).map( key => {
                ipcRenderer.removeListener(key, messages[key])
            })
        }
    })
}

export default useIpcRenderer