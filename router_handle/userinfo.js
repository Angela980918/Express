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

/**
 * 上传头像
 */
exports.uploadAvatar = (req, res) => {
  const { id, account } = req.body;

  // 1.判断用户是否有上传过头像
  const sqld = "select * from users where id = ? and account = ?";
  db.query(sqld, [id, account], async (err, result) => {
    if (err) return res.cc(err);
    if (result.length !== 1) {
      return res.send({
        status: 1,
        msg: "用户不存在",
      });
    }

    try {
      // 2.删除旧头像文件（如果存在）
      let dmsg = "";
      if (result[0].image_url) {
        let url = result[0].image_url;
        let startIndex = url.lastIndexOf("upload/");
        let oldFile = "./public/" + url.slice(startIndex);

        await new Promise((resolve, reject) => {
          fs.unlink(oldFile, (err) => {
            if (err) return reject(err);
            resolve(true);
          });
        });
        dmsg = "旧头像删除成功";
      }
      // 3.上传新头像
      const AvatarID = crypto.randomUUID();
      let oldName = req.files[0].filename;
      let newName = Buffer.from(req.files[0].originalname, "latin1").toString(
        "utf8"
      );
      let extension = newName.split(".").pop(); // 获取文件扩展名
      // 防止多个用户上传相同的文件名的文件
      newName = `${AvatarID}.${extension}`;
      fs.renameSync("./public/upload/" + oldName, "./public/upload/" + newName);

      // 插入新头像 URL 到数据库 --> 更新在用户最新一条数据
      // 1.1 查询用户最新的信息
      const sqlImageS =
        "select * from image where account =? order by id desc limit 1";
      db.query(sqlImageS, account, (err, result) => {
        if (err) return res.cc(err);
        if (result.length > 0) {
          let accountID = result[0].id;
          let imgUrl = `http://127.0.0.1:3007/upload/${newName}`;
          // 1.2 新头像更新该数据中
          const sqlImageU =
            "update image SET image_url = ?, onlyid = ? where id = ?";
          db.query(sqlImageU, [imgUrl, AvatarID, accountID], (err, result) => {
            if (err) return res.cc(err);
            console.log(sqlImageU, result);
          });
        } else {
          // 1.3 新头像数据插入到数据库中
          const sqlInsertImage = "INSERT INTO image SET ?";
          db.query(
            sqlInsertImage,
            {
              image_url: `http://127.0.0.1:3007/upload/${newName}`,
              onlyid: AvatarID,
              account,
            },
            (err, result) => {
              if (err) return res.cc(err);
              console.log(sqlInsertImage, result);
            }
          );
        }
        res.send({
          AvatarID,
          status: 0,
          url: "http://127.0.0.1:3007/upload/" + newName,
          dmsg: dmsg || "",
          msg: "头像更新成功",
        });
      });
    } catch (error) {
      res.cc(error);
    }
  });
};

/**
 * 绑定账号
 * onlyid account url 关联 users,image表
 */
exports.bindAccount = (req, res) => {
  const { account, onlyId, url } = req.body;
  // 查询
  const sqls = "select * from image where account = ? order by id desc limit 1";
  db.query(sqls, account, (err, result) => {
    if (err) return res.cc(err);
    if (result.length == 1) {
      // 图片地址保存至user表中
      const sql2 = "update users set image_url = ? where account = ?";
      db.query(sql2, [url, account], (err, result) => {
        if (err) return res.cc(err);
        console.log(result);
        res.send({
          status: 0,
          msg: "修改成功",
        });
      });
    }
  });
};

/**
 * 获取用户信息
 * id
 */
exports.getUserInfo = (req, res) => {
  const { id } = req.body;
  console.log(id);
  const sql = "select * from users where account = ? or user_id = ? or id = ?";
  db.query(sql, [id, id, id], (err, result) => {
    if (err) return res.cc(err);
    res.send({
      status: 0,
      result: result[0],
    });
  });
};

/**
 * 修改姓名
 * id
 * name
 */
exports.changeName = (req, res) => {
  const { id, name } = req.body;
  if (!name) return res.cc("姓名不能为空");

  // 1.查询姓名是否修改过
  const sqls = "select * from users where id = ?";
  db.query(sqls, id, (err, result) => {
    if (err) return res.cc(err);
    if (result.length !== 1) return res.cc("用户不存在");
    if (result[0].name === name) return res.cc("姓名未修改");

    // 2.修改姓名
    const sql = "update users set name = ? where id = ?";
    db.query(sql, [name, id], (err, result) => {
      if (err) return res.cc(err);
      res.send({
        status: 0,
        msg: "修改成功",
      });
    });
  });
};

/**
 * 修改性别
 * id
 * sex
 */
exports.changeSex = (req, res) => {
  const { id, sex } = req.body;
  if (!sex) return res.cc("性别不能为空");

  // 1.查询原来的性别
  const sqls = "select * from users where id = ?";
  db.query(sqls, id, (err, result) => {
    if (err) return res.cc(err);
    if (result.length !== 1) return res.cc("用户不存在");
    if (result[0].sex === sex) return res.cc("性别未修改");

    // 2.修改性别
    const sql = "update users set sex = ? where id = ?";
    db.query(sql, [sex, id], (err, result) => {
      if (err) return res.cc(err);
      res.send({
        status: 0,
        msg: "修改成功",
      });
    });
  });
};

/**
 * 修改用户信息
 *  id 用户ID (*)
 *  name 用户名
 *  identity 身份
 *  department 所属部门
 *  sex 性别
 *  email 邮箱
 */
exports.updateUserInfo = (req, res) => {
  const { id, name, identity, department, sex, email } = req.body;
  const sql = "select * from users where id = ?";
  db.query(sql, id, (err, result) => {
    if (err) return res.cc(err);
    let oldUser = result[0];

    // 更新用户信息
    let updateSql = "update users set ";
    let updateValues = [];

    // 检查是否有需要更新的字段
    let shouldUpdate = false;

    if (oldUser.name !== name) {
      shouldUpdate = true;
      updateSql += "name = ?, ";
      updateValues.push(name);
    }
    if (oldUser.identity !== identity) {
      shouldUpdate = true;
      updateSql += "identity = ?, ";
      updateValues.push(identity);
    }
    if (oldUser.department !== department) {
      shouldUpdate = true;
      updateSql += "department = ?, ";
      updateValues.push(department);
    }
    if (oldUser.sex !== sex) {
      shouldUpdate = true;
      updateSql += "sex = ?, ";
      updateValues.push(sex);
    }
    if (oldUser.email !== email) {
      shouldUpdate = true;
      updateSql += "email = ?, ";
      updateValues.push(email);
    }

    // 无需更新
    if (!shouldUpdate) {
      return res.send({
        msg: "资料无需更新",
      });
    }

    // 删除最后一个逗号和空格
    updateSql = updateSql.slice(0, -2);

    updateSql += " WHERE id = ? ";
    updateValues.push(id);

    db.query(updateSql, updateValues, (err, result) => {
      if (err) return res.cc(err);
      if (result.affectedRows == 1) {
        res.send({
          status: 0,
          msg: "修改成功",
        });
      }
    });
  });
};

/**
 * 修改邮箱
 * id
 * email
 */
exports.changeEmail = (req, res) => {
  const { id, email } = req.body;
  if (!email) return res.cc("邮箱不能为空");

  // 1.查询邮箱是否修改过
  const sqls = "select * from users where id = ?";
  db.query(sqls, id, (err, result) => {
    if (err) return res.cc(err);
    if (result.length !== 1) return res.cc("用户不存在");
    if (result[0].email === email) return res.cc("邮箱未修改");

    // 2.修改邮箱
    const sql = "update users set email = ? where id = ?";
    db.query(sql, [email, id], (err, result) => {
      if (err) return res.cc(err);
      res.send({
        status: 0,
        msg: "修改成功",
      });
    });
  });
};

/**
 * 登陆页修改密码
 * id
 * newPassword
 */
exports.changePasswordInLogin = (req, res) => {
  const user = req.body;
  user.newPassword = bcrypt.hashSync(user.newPassword, 10);
  const sql = "update users set password = ? where id = ?";
  db.query(sql, [user.newPassword, user.id], (err, result) => {
    if (err) return res.cc(err);
    res.send({
      status: 0,
      msg: "密码修改成功",
    });
  });
};

/**
 * 修改用户密码 (旧密码 -> 新密码)
 * 用户id (*)
 * 新密码newPassword (*)
 * 旧密码oldPassword (*)
 */
exports.changePassword = (req, res) => {
  const { id, newPassword, oldPassword } = req.body;
  const sql = "select password from users where id = ?";
  db.query(sql, id, (err, result) => {
    if (err) return res.cc(err);
    const compareResult = bcrypt.compareSync(oldPassword, result[0].password);
    if (!compareResult) {
      return res.send({
        status: 1,
        msg: "原始密码错误",
      });
    }
    const newPasswordSync = bcrypt.hashSync(newPassword, 10);
    const sql1 = "update users set password = ? where id = ?";
    db.query(sql1, [newPasswordSync, id], (err, result) => {
      if (err) return res.cc(err);
      res.send({
        status: 0,
        msg: "密码修改成功",
      });
    });
  });
};

/**
 * 自动生成ID
 * 用户id (*)
 */
exports.createID = (req, res) => {
  const { id } = req.body;

  // 判断员工ID是否已存在
  const sqls = "select user_id from users where id = ?";
  db.query(sqls, id, (err, result) => {
    if (err) return res.cc(err);
    if (result[0].user_id)
      return res.send({
        status: 1,
        msg: "员工ID已存在，无需创建",
      });
    if (!result[0].user_id) {
      // ID统一前缀
      const card = "CB";
      const currentDate = moment().format("YYYYMMDD");
      const sql = `SELECT COUNT(*) AS count FROM users WHERE user_id LIKE '${card}${currentDate}%'`;
      db.query(sql, (err, result) => {
        if (err) return res.cc(err);
        // 统计该日期下的账号总数
        const count = result[0].count + 1;
        // 0 --> 01,
        const suffix = count > 0 ? count.toString().padStart(2, "0") : "01";
        // 生成ID
        const newID = `${card}${currentDate}${suffix}`;

        // 更新
        const sql1 = "update users set user_id = ? where id = ?";
        db.query(sql1, [newID, id], (err, result) => {
          if (err) return res.cc(err);
          res.send({
            status: 0,
            msg: "员工ID已经生成",
          });
        });
      });
    }
  });
};

/**
 * 修改密码 (验证用户邮箱email,用户账号account)
 * 用户邮箱 email(*)
 * 用户账号 account (*)
 */
exports.verifyAccountAndEmail = (req, res) => {
  const { account, email } = req.body;

  const sql = "select * from users where account = ?";
  db.query(sql, account, (err, result) => {
    if (err) return res.cc(err);
    // 1.判断账号是否存在
    if (Array.isArray(result) && result.length === 0)
      return res.send({
        status: 1,
        msg: "账号不存在",
      });
    // 2.判断邮箱是否已绑定
    if (!result[0].email)
      return res.send({
        status: 1,
        msg: "邮箱未绑定,请联系管理员",
      });
    // 判断邮箱是否正确
    if (result[0].email == email) {
      res.send({
        status: 0,
        id: result[0].id,
        msg: "验证通过",
      });
    } else {
      res.send({
        status: 1,
        msg: "邮箱不正确",
      });
    }
  });
};

// ------------------------用户管理------------------------//

/**
 * 添加管理员
 */
exports.createAdmin = (req, res) => {
  const { account, password, name, sex, department, email, identity } =
    req.body;

  // 判断账号是否存在与数据库中
  const sqls = "select * from users where account = ?";
  db.query(sqls, account, (err, result) => {
    if (err) return res.cc(err);
    if (result.length > 0) {
      return res.send({
        status: 1,
        msg: "账号已存在",
      });
    }
    const hashPassword = bcrypt.hashSync(password, 10);
    // 如无异常，将资料插入users表
    const sqli = "insert into users set ?";
    // 创建时间
    const create_time = new Date();
    db.query(
      sqli,
      {
        account,
        password: hashPassword,
        name,
        sex,
        department,
        email,
        identity,
        create_time,
        // 初始未冻结状态为0
        status: 0,
      },
      (err, result) => {
        if (err) return res.cc(err);
        if (result.affectedRows !== 1) {
          return res.send({
            status: 1,
            msg: "添加管理员失败",
          });
        }
        res.send({
          status: 0,
          msg: "添加管理员成功",
        });
      }
    );
  });
};

/**
 * 获取管理员列表
 */
exports.getAdminList = (req, res) => {
  // 判断账号是否存在与数据库中
  const sqls = "select * from users where identity = ?";
  db.query(sqls, req.body.identity, (err, result) => {
    if (err) return res.cc(err);
    result.forEach((item) => {
      item.password = "";
      item.create_time = "";
      item.image_url = "";
      item.status = "";
    });
    res.send({
      status: 0,
      result,
    });
  });
};

/**
 * 编辑管理员账号信息
 */
exports.editAdmin = (req, res) => {
  const { id, name, sex, email, department } = req.body;
  console.log(req);
  // 记录修改时间
  const date = new Date();

  // 判断账号是否存在与数据库中
  const sqls = "select department from users where id = ?";
  db.query(sqls, id, (err, result) => {
    if (err) return res.cc(err);
    if (result[0].department == department) {
      // 修改的内容
      const updateContent = {
        name,
        sex,
        email,
        department,
        update_time: date,
      };
      const sqlu = "update users set ? where id = ?";
      db.query(sqlu, [updateContent, id], (err, result) => {
        if (err) return res.cc(err);
        res.send({
          status: 0,
          msg: "修改管理员信息成功",
          result,
        });
      });
    }
  });
};

/**
 * 对管理员取消赋权
 * id *
 */
exports.changeAdminToUser = (req, res) => {
  const { id } = req.body;
  const identity = "用户";
  // 记录修改时间
  const date = new Date();

  // 查询当前用户状态
  const sqls = "select * from users where id = ?";
  db.query(sqls, id, (err, result) => {
    if (err) return res.cc(err);
    if (result.length !== 1)
      return res.send({
        status: 1,
        msg: "该员工不存在",
      });
    if (result[0].identity === identity)
      return res.send({
        status: 1,
        msg: `该员工已是${identity},无需取消赋权`,
      });
    const sqlu = "update users set identity = ?, update_time = ? where id = ?";
    db.query(sqlu, [identity, date, id], (err, result) => {
      if (err) return res.cc(err);
      res.send({
        status: 0,
        msg: "降权成功",
      });
    });
  });
};

/**
 * 对普通用户进行赋权
 * id *
 */
exports.changeUserToAdmin = (req, res) => {
  const { id, identity } = req.body;
  // 记录修改时间
  const date = new Date();

  // 查询当前用户状态
  const sqls = "select * from users where id = ?";
  db.query(sqls, id, (err, result) => {
    if (err) return res.cc(err);
    if (result.length !== 1)
      return res.send({
        status: 1,
        msg: "该员工不存在",
      });
    if (result[0].identity === identity)
      return res.send({
        status: 1,
        msg: `该员工已是${identity},无需重新赋权`,
      });
    const sqlu = "update users set identity = ?, update_time = ? where id = ?";
    db.query(sqlu, [identity, date, id], (err, result) => {
      if (err) return res.cc(err);
      res.send({
        status: 0,
        msg: "赋权成功",
      });
    });
  });
};

/**
 * 冻结用户
 * id
 */
exports.freezeUser = (req, res) => {
  const { id } = req.body;
  // 记录修改时间
  const date = new Date();
  // 冻结状态
  const status = 1;

  // 查询当前用户状态
  const sqls = "select * from users where id = ?";
  db.query(sqls, id, (err, result) => {
    if (err) return res.cc(err);
    if (result.length !== 1)
      return res.send({
        status: 1,
        msg: "该员工不存在",
      });
    if (result[0].status == status)
      return res.send({
        status: 1,
        msg: `该员工账号已冻结`,
      });

    // 冻结账号
    const sqlu = "update users set status = ?, update_time = ? where id = ?";
    db.query(sqlu, [status, date, id], (err, result) => {
      if (err) return res.cc(err);
      res.send({
        status: 0,
        msg: "账号冻结成功",
      });
    });
  });
};

/**
 * 解冻用户
 * id
 */
exports.unFreezeUser = (req, res) => {
  const { id } = req.body;
  // 记录修改时间
  const date = new Date();
  // 解冻状态
  const status = 0;

  // 查询当前用户状态
  const sqls = "select * from users where id = ?";
  db.query(sqls, id, (err, result) => {
    if (err) return res.cc(err);
    if (result.length !== 1)
      return res.send({
        status: 1,
        msg: "该员工不存在",
      });
    if (result[0].status == status)
      return res.send({
        status: 1,
        msg: `该员工账号已解冻`,
      });
    const sqlu = "update users set status = ?, update_time = ? where id = ?";
    db.query(sqlu, [status, date, id], (err, result) => {
      if (err) return res.cc(err);
      res.send({
        status: 0,
        msg: "账号解冻成功",
      });
    });
  });
};

/**
 * 获取冻结状态的用户列表
 */
exports.getFreezeUserList = (req, res) => {
  // 冻结状态
  const status = 1;

  // 查询冻结用户列表
  const sqls = "select * from users where status = ?";
  db.query(sqls, status, (err, result) => {
    if (err) return res.cc(err);
    if (result.length == 0)
      return res.send({
        status: 1,
        msg: "暂无冻结用户",
      });
    res.send({
      status: 0,
      msg: "获取冻结用户列表成功",
      result,
    });
  });
};

/**
 * 删除用户
 * id
 * account
 */
exports.deleteUser = (req, res) => {
  const { id, account } = req.body;

  // 查询用户信息
  const sqls = "select * from users where id = ? and account = ?";
  db.query(sqls, [id, account], (err, result) => {
    if (err) return res.cc(err);
    if (result.length == 0)
      return res.send({
        status: 1,
        msg: "暂无此用户",
      });
    // 1.删除user表中用户信息
    const sqld = "delete from users where id = ?";
    db.query(sqld, id, (err, result) => {
      if (err) return res.cc(err);

      // 2.查询image表中用户头像地址
      // 2.1删除用户头像,避免造成系统冗余
      const sqls2 =
        "select * from image where account = ? order by id desc limit 1";
      db.query(sqls2, account, async (err, result) => {
        if (err) return res.cc(err);
        if (result.length == 1)
          try {
            // 2.删除旧头像文件（如果存在）
            let dmsg = "";
            if (result[0].image_url) {
              let url = result[0].image_url;
              let startIndex = url.lastIndexOf("upload/");
              let oldFile = "./public/" + url.slice(startIndex);

              await new Promise((resolve, reject) => {
                fs.unlink(oldFile, (err) => {
                  if (err) return reject(err);
                  resolve(true);
                });
              });
              dmsg = "旧头像删除成功";
            }

            // 3.删除image表中的用户相关信息
            const sqld = "delete from image where account = ?";
            db.query(sqld, account, (err, result) => {
              if (err) return res.cc(err);
              res.send({
                status: 0,
                dmsg: dmsg || "",
                msg: "删除用户成功",
              });
            });
          } catch (err) {
            res.cc(err);
          }
      });
    });
  });
};

/**
 * 获取对应身份的一个总人数
 * identity
 */
exports.getPeopleListLength = (req, res) => {
  const { identity } = req.body;

  const sqls = "select * from users where identity = ?";
  db.query(sqls, identity, (err, result) => {
    if (err) return res.cc(err);
    res.send({
      status: 0,
      msg: `${identity}总人数为：${result.length}`,
      length: result.length,
    });
  });
};
