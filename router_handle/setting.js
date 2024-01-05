// 导入数据库
const db = require("../db/index.js");
// 导入bcrypt中间件加密
const bcrypt = require("bcrypt");
// 导入node.js的crypto库生成uuid
const crypto = require("crypto");
// 导入fs处理文件
const fs = require("fs");
// 日期
const moment = require("moment");
// 导入参数校验模块
const { checkBodyParams } = require("../utils/check");

// 上传轮播图
exports.uploadSwiper = (req, res) => {
  const { id } = req.body;

  // 1.判断用户是否有上传过轮播图
  const sqld = "select * from setting where id = ?";
  db.query(sqld, [id], async (err, result) => {
    if (err) return res.cc(err);
    if (result.length !== 1) {
      return res.send({
        status: 1,
        msg: "id不存在",
      });
    }

    try {
      // 2.删除旧轮播图（如果存在）
      let dmsg = "";
      if (result[0].set_value) {
        let url = result[0].set_value;
        let startIndex = url.lastIndexOf("upload/");
        let oldFile = "./public/" + url.slice(startIndex);

        await new Promise((resolve, reject) => {
          fs.unlink(oldFile, (err) => {
            if (err) return reject(err);
            resolve(true);
          });
        });
        dmsg = `旧轮播图(id: ${id})删除成功`;
      }
      // 3.上传新轮播图
      const AvatarID = crypto.randomUUID();
      let oldName = req.files[0].filename;
      let newName = Buffer.from(req.files[0].originalname, "latin1").toString(
        "utf8"
      );
      let extension = newName.split(".").pop(); // 获取文件扩展名
      // 防止用户上传相同的文件名的文件
      newName = `${AvatarID}.${extension}`;
      fs.renameSync("./public/upload/" + oldName, "./public/upload/" + newName);

      // 轮播图地址
      let image_url = `http://127.0.0.1:3007/upload/${newName}`;

      // 插入新头像 URL 到数据库
      const sqlInsertSwiper = "update setting set set_value = ? where id = ?";
      db.query(sqlInsertSwiper, [image_url, id], (err, result) => {
        if (err) return res.cc(err);
      });

      res.send({
        AvatarID,
        status: 0,
        image_url,
        dmsg: dmsg || "",
        msg: `轮播图(id: ${id})更新成功`,
      });
    } catch (error) {
      res.cc(error);
    }
  });
};

// 获取所有轮播图
exports.getAllSwiper = (req, res) => {
  const sql = "select * from setting where set_name like '%swiper%'";
  db.query(sql, (err, result) => {
    if (err) return res.cc(err);
    res.send({
      status: 0,
      msg: "获取所有轮播图成功",
      result,
    });
  });
};

// 获取公司全部相关信息
exports.getAllCompanyIntroduce = (req, res) => {
  const sql = "select * from setting where set_name like '%公司%' and set_name not like '%名称%'";
  db.query(sql, (err, result) => {
    if (err) return res.cc(err);
    res.send({
      status: 0,
      msg: "获取公司相关信息成功",
      result,
    });
  });
};

// 修改公司相关信息 set_name set_text
exports.uploadCompanyIntroduce = (req, res) => {
  const { set_name, set_text } = req.body;
  const missingParamError = checkBodyParams(req.body, ["set_name", "set_text"]);
  // 校验参数是否有缺失
  if (missingParamError) {
    return res.cc(missingParamError);
  }

  // 1.判断是否有相关信息
  const sqls = "select * from setting where set_name = ?";
  db.query(sqls, set_name, (err, result) => {
    if (err) return res.cc(err);
    if (result.length !== 1) return res.cc(`'${set_name}'的相关信息不存在`);
    if (result[0].set_text == set_text)
      return res.cc(`'${set_name}'的相关信息无异动`);
    const sqlu = "update setting set set_text = ? where set_name = ?";
    db.query(sqlu, [set_text, set_name], (err, result) => {
      if (err) return res.cc(err);
      if (result.affectedRows !== 1)
        return res.cc(`'${set_name}'的相关信息修改失败`);
      if (result.affectedRows == 1) {
        res.send({
          status: 0,
          msg: `'${set_name}'的相关信息修改成功`,
        });
      }
    });
  });
};

// 获取公司相关信息 set_name
exports.getCompanyIntroduce = (req, res) => {
  const { set_name } = req.body;
  const missingParamError = checkBodyParams(req.body, ["set_name"]);
  // 校验参数是否有缺失
  if (missingParamError) {
    return res.cc(missingParamError);
  }

  // 1.判断是否有相关信息
  const sqls =
    "select * from setting where set_name = ? and set_name like '%公司%'";
  db.query(sqls, set_name, (err, result) => {
    if (err) return res.cc(err);
    if (result.length !== 1) return res.cc(`'${set_name}'的相关信息不存在`);

    res.send({
      status: 0,
      msg: `'${set_name}'获取成功`,
      result,
    });
  });
};

// 获取公司名称
exports.getCompanyName = (req, res) => {
  // 1.判断是否有相关信息
  const sqls = "select * from setting where set_name = '公司名称'";
  db.query(sqls, (err, result) => {
    if (err) return res.cc(err);
    if (result.length !== 1) return res.cc(`'公司名称'的相关信息不存在`);

    res.send({
      status: 0,
      msg: `'公司名称'获取成功`,
      result,
    });
  });
};

// 更新公司名称 set_name set_value
exports.updateCompanyName = (req, res) => {
  const { set_value } = req.body;
  const missingParamError = checkBodyParams(req.body, ["set_value"]);
  // 校验参数是否有缺失
  if (missingParamError) {
    return res.cc(missingParamError);
  }

  // 1.判断是否有相关信息
  const sqls = "select * from setting where set_name = '公司名称'";
  db.query(sqls, (err, result) => {
    if (err) return res.cc(err);
    if (result.length !== 1) return res.cc(`'公司名称'的相关信息不存在`);
    if (result[0].set_value === set_value)
      return res.cc(`'公司名称'的相关信息无异动`);

    // 2.更新相关信息
    const sqlu = "update setting set set_value = ? where set_name = '公司名称'";
    db.query(sqlu, set_value, (err, result) => {
      if (err) return res.cc(err);
      if (result.affectedRows !== 1) return res.cc(`'公司名称'的信息更新失败`);
      res.send({
        status: 0,
        msg: `'公司名称'的信息更新成功`,
      });
    });
  });
};
