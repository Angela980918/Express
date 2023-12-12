// 登录注册路由模块

// 导入express框架
const express = require('express')

// 导入Joi验证规则
const Joi = require('joi')

// 使用express框架的路由
const router = express.Router()
// 导入login登录模块
const loginHandler = require('../router_handle/login')

// 导入expreJoi
const expressJoi = require('@escook/express-joi')
// 导入自定义的验证规则
const {
	login_limit
} = require('../limit/login.js')

// 创建register路由
router.post('/register', expressJoi(login_limit), loginHandler.register)

// 创建login路由
router.post('/login', expressJoi(login_limit), loginHandler.login)

// 暴露路由
module.exports = router