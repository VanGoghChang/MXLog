const fsPromises = window.require('fs').promises

const fileHelper = {
    readFile: (path) => {
        return fsPromises.readFile(path, { encoding: 'utf8'})
    },
    writeFile: (path, content) => {
        return fsPromises.writeFile(path, content, { encoding: 'utf8'})
    },
    deleteFile: (path) => {
        return fsPromises.unlink(path)
    },
    renameFile: (oldPath, newPath) => {
        return fsPromises.rename(oldPath, newPath)
    }
}

export default fileHelper