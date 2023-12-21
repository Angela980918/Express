// 用户信息路由模块

// 导入express框架
const express = require("express");

// 使用express框架的路由
const router = express.Router();

// 导入expreJoi
const expressJoi = require("@escook/express-joi");

// 导入userInfo用户信息模块
const userInfoHandler = require("../router_handle/userinfo");

// 导入验证规则
const {
	name_limit,
	email_limit,
	password_limit,
} = require('../limit/user.js')


// 上传头像
router.post("/uploadAvatar", userInfoHandler.uploadAvatar);

// 绑定账号
router.post("/bindAccount", userInfoHandler.bindAccount);

// 获取用户信息
router.post("/getUserInfo", userInfoHandler.getUserInfo);

// 修改姓名
router.post("/changeName", expressJoi(name_limit), userInfoHandler.changeName)

// 修改性别
router.post("/changeSex", userInfoHandler.changeSex)

// 修改用户信息
router.post("/updateUserInfo", userInfoHandler.updateUserInfo)

// 修改邮箱
router.post("/changeEmail", expressJoi(email_limit), userInfoHandler.changeEmail)

// 修改密码(登陆页)
router.post("/changePasswordInLogin", userInfoHandler.changePasswordInLogin)

// 修改密码(旧密码 -> 新密码)
router.post("/changePassword", expressJoi(password_limit), userInfoHandler.changePassword)

// 自动生成ID
router.post('/createID', userInfoHandler.createID)

// 向外暴露路由
module.exports = router