const initSqlJs = require('sql')
const fileHelper = require("./utils/fileHelper")

initSqlJs().then(SQL => {
    // Create a database
    var db = new SQL.Database(fileHelper.readFile("/Users/changyh/Public/MX1086-ibl-e14-1ffn.db"))


    var res = db.exec("SELECT * FROM Log")

    console.log(res)
})