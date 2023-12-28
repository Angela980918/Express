//设置相关路由模块

// 导入express框架
const express = require("express");

// 使用express框架的路由
const router = express.Router();

// 导入userInfo用户信息模块
const settingHandler = require("../router_handle/setting");

// 上传轮播图
router.post("/uploadSwiper", settingHandler.uploadSwiper);

// 获取所有轮播图
router.post("/getAllSwiper", settingHandler.getAllSwiper);

// 获取公司相关信息
router.post("/getAllCompanyIntroduce", settingHandler.getAllCompanyIntroduce);

// 修改公司相关信息
router.post("/uploadCompanyIntroduce", settingHandler.uploadCompanyIntroduce);

// 暴露路由
module.exports = router;
