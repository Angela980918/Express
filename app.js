// 导入express框架
const express = require('express')
// 创建express实例
const app = express()

// cors跨域
const cors = require('cors')
// 全局挂载
app.use(cors())

//导入中间件
var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// 监听端口
const port = 3007

app.listen(port, () => {
	console.log('127.0.0.1:3007',port)
})

app.get('/', (req, res) => {
	res.send('Hello World!!!')
})