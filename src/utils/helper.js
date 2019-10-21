const path = require("path")
// const Store = require("electron-store")
// const store = new Store()

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
    return time.toLocaleDateString() + " " +time.getHours()+ ":" +time.getMinutes()+ ":" +time.getSeconds()
}

export const stringSerialize = (string) => {
    if(typeof string === 'string' ){
        return JSON.stringify(JSON.parse(string), null,"  ")
    }else{
        return string
    }
}

export const filterLog = (array) => {
    return array.filter(file => {
        console.log("filter files:" , file)
        if(path.extname(file.key) === ".db"){
            return true
        }
    })
}