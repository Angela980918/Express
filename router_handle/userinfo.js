// 导入数据库
const db = require("../db/index.js");
// 导入bcrypt中间件加密
const bcrypt = require("bcrypt");
// 导入node.js的crypto库生成uuid
const crypto = require("crypto");

// 上传头像
exports.uploadAvatar = (req, res) => {
  // 生成唯一标识
  // const AvatarID = crypto.randomUUID();
  // let oldName = req.files[0].filename;
  // let newName = Buffer.from()
  res.send({
    status: 0,
    url: "http://127.0.0.1:3007/upload/",
  });
};
