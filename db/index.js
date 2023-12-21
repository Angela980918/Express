// 导入数据库
const mysql = require('mysql')

// 创建与数据库的链接
const db = mysql.createPool({
	host:'localhost',
	user:'back_system',
	password:'123456',
	database:'back_system'
})

// 对外暴露数数据库
module.exports = db
