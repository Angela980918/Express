// 用户信息路由模块

// 导入express框架
const express = require("express");

// 使用express框架的路由
const router = express.Router();

// 导入expreJoi
const expressJoi = require("@escook/express-joi");

// 导入userInfo用户信息模块
const userInfoHandler = require("../router_handle/userinfo");

// 上传头像
router.post("/uploadAvatar", userInfoHandler.uploadAvatar);

// 向外暴露路由
module.exports = router

