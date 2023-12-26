// 导入express框架
const express = require('express')
// 创建express实例
const app = express()

// 导入Joi验证规则
const Joi = require('joi')

// cors跨域
const cors = require('cors')
// 全局挂载
app.use(cors())

//导入中间件
var bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
// 当extended为false时，值为数组或者字符串，当为ture时，值可以为任意类型
app.use(bodyParser.urlencoded({
	extended: true 
}))
app.use(bodyParser.json())

// Multer 是一个 node.js 中间件，用于处理 multipart/form-data 类型的表单数据，它主要用于上传文件。
const multer = require("multer");
// 在server服务端下新建一个public文件夹，在public文件夹下新建upload文件用于存放图片
const upload = multer({
	dest: './public/upload'
})
app.use(upload.any())
// 静态托管
app.use(express.static("./public"));


app.use((req, res, next) => {
	// status=0为成功,status=1为失败,默认设置为1
	// 自定义res.cc方法
	res.cc = (err, status = 1) => {
		res.send({
			status,
			msg: err instanceof Error ? err.message : err
		})
	}
	next()
})

// 导入JWT
const jwtconfig = require('./jwt_config/index.js')
const {
	expressjwt: jwt
} = require('express-jwt')

// 排除不需要携带token请求
// 正则表达式 --> 以/或者/api/开头
app.use(jwt({
	secret: jwtconfig.jwtSecretKey,
	algorithms: ['HS256']
}).unless({
	path: [/^\/(api\/)?/]
}))

// 监听端口
const port = 3007

app.listen(port, () => {
	console.log('127.0.0.1:3007', port)
})

app.get('/', (req, res) => {
	res.send('Hello World!!!')
})

// login请求
const loginRouter = require('./router/login.js')
app.use('/api', loginRouter)

// user请求
const userRouter = require('./router/userinfo.js')
app.use('/user', userRouter)

// 对不符合joi规则的情况进行报错
app.use((err, req, res, next) => {
	if (err instanceof Joi.ValidationError) {
		res.send({
			status: 1,
			msg: '输入的数据不符合验证规则'
		})
	}
})