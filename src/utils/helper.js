const path = require("path")

export const flattenArray = (array) => {
    return array.reduce((map, item) => {
        map[item.key] = item
        return map
    }, {})
}

export const objectToArray = (obj) => {
    return Object.keys(obj).map(key => obj[key])
}

export const findParentNode = (node, parentClassName) => {
    let current = node
    while(current !== null){
        console.log(current.classList)
        if(current.classList.contains(parentClassName)){
            return current
        }
        current = current.parentNode
    }
    return false
}

export const timeStampSerialize = (timeStamp) => {
    const time = new Date(timeStamp)
    return time.toLocaleDateString() + " " +time.toLocaleTimeString()
}

export const filterLog = (array) => {
    return array.filter(file => {
        console.log("filter files:" , file)
        if(path.extname(file.key) === ".db"){
            return true
        }
    })
}