const QiniuManager = require('./utils/QiniuManager')
const path = require("path")

const accessKey = "CCiqyycPWKDiaUSSTtElR8lh6aJZttRXrXknwe9B"
const secretKey = "-_7t5uLMP000XQwSx1cJiBLEMGaqYxxEvY0MS3yz"

const bucket = "supersmart"

const qiniuManager = new QiniuManager(accessKey, secretKey, bucket)

const localPath = "/Users/changyh/Public/loaction.md"
const key = path.basename(localPath)

const downloadPath = path.join(__dirname, key)

// qiniuManager.uploadFiles(key, localPath).then(data => {
//     console.log(data)
// })

// qiniuManager.getBucketDomain().then(data => {
//     console.log(data)
// })

// qiniuManager.generateDownloadLink(key).then(data => {
//     console.log(data)
// })


// qiniuManager.downloadFiles(key, downloadPath).then(res => {
//     console.log(res)
// })

qiniuManager.getTargetListToCloud("MX1086").then(res => {
    console.log(res)
})
.catch(error => {
    console.log(error)
})