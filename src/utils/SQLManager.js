const sqlite3 = require('sqlite3').verbose()
const fs = require("fs")
const path = require("path")
const { dialog } = require("electron")

class SQLManager {
    constructor(loaclPath) {
        this.db = new sqlite3.Database("/Users/changyh/Public/MX1086-ibl-e14-1ffn.db")
    }

    getSQLFileContent() {
        this.db.all(`SELECT * FROM "main"."Log"`, (error, row) => {
            if (error) {
                console.log(`Database select error`, error)
                dialog.showErrorBox("数据解析失败", "请检查解析文件格式是否正确")
            }
            console.log(row);
        })

    }
}

module.exports = SQLManager