import { useEffect, useRef } from "react"

// import Node module
const { remote } =  window.require("electron")
const { Menu, MenuItem } = remote

const useContextMenu = (menuItems, targetSelecter) => {
    let clickedElement = useRef(null)
    useEffect(() => {
        const menu = new Menu()
        menuItems.map(item => {
            menu.append(new MenuItem(item))
        })
        const handleContextMenu = (e) => {
            if(document.querySelector(targetSelecter).contains(e.target)){
                clickedElement.current = e.target
                menu.popup(remote.getCurrentWindow())
            }
        }
        window.addEventListener('contextmenu', handleContextMenu, false)
        return () => {
            window.removeEventListener('contextmenu', handleContextMenu, false)
        }
    }) 
    return clickedElement
}

export default useContextMenu
