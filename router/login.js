// 登录注册路由模块

// 导入express框架
const express = require('express')

// 使用express框架的路由
const router = express.Router()
// 导入login登录模块
const loginHandler = require('../router_handle/login')

// 创建register路由
router.post('/register',loginHandler.register)

// 创建login路由
router.post('/login',loginHandler.login)

// 暴露路由
module.exports = router