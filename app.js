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

app.use(bodyParser.urlencoded({
	extended: true
}))
app.use(bodyParser.json())

app.use((req, res, next) => {
	// status=0为成功,status=1为失败,默认设置为1
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
app.use(jwt({
	secret: jwtconfig.jwtSecretKey,
	algorithms: ['HS256']
}).unless({
	path: [/^\/api\//]
}))

// 监听端口
const port = 3007

app.listen(port, () => {
	console.log('127.0.0.1:3007', port)
})

app.get('/', (req, res) => {
	res.send('Hello World!!!')
})

// 登录请求
const loginRouter = require('./router/login.js')
app.use('/api', loginRouter)

// 注册请求
const registerRouter = require('./router/login.js')
app.use('/api', registerRouter)