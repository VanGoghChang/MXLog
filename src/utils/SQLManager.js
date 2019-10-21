const sqlite3 = require('sqlite3').verbose()
const fs = require("fs")
const path = require("path")
const { dialog } = require("electron")

class SQLManager {
    constructor(localPath) {
        this.db = new sqlite3.Database(localPath)
        this.sqlProtocol = {
            default: `SELECT * FROM "main"."Log"`
        }
    }

    getSQLFileContent() {
        return new Promise((resolve, reject) => {
            this.db.all(this.sqlProtocol.default, this._handlePromiseCallback(resolve, reject))
        })
        // this.db.all(this.sqlProtocol.default, (error, row) => {
        //     if (error) {
        //         console.log(`Database select error`, error)
        //         dialog.showErrorBox("数据解析失败", "请检查解析文件格式是否正确")
        //     }
        //     console.log(row);
        // })

    }

    /**
     * Public promise callback
     * @param {*} resolve 
     * @param {*} reject 
     */
    _handlePromiseCallback(resolve, reject) {
        return (respErr, respBody, respInfo) => {
            if (respErr) {
                throw respErr;
            }
            if (respInfo === undefined) {
                resolve(respBody);
            } else {
                reject ({
                    body: respBody
                })
            }
        }
    }
}

module.exports = SQLManager