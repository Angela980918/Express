// 导入数据库
const db = require("../db/index.js");
// 导入bcrypt中间件加密
const bcrypt = require("bcrypt");
// 导入node.js的crypto库生成uuid
const crypto = require("crypto");
// 日期
const moment = require('moment');

// 上传头像
exports.uploadAvatar = (req, res) => {
	// 生成唯一标识
	const AvatarID = crypto.randomUUID();
	let oldName = req.files[0].filename;
	let newName = Buffer.from(req.files[0].originalname, 'latin1').toString('utf8')
	const sql = 'insert into image set ?'
	db.query(sql, {
		image_url: `http://127.0.0.1:3007/upload/${newName}`,
		onlyid: AvatarID
	}, (err, result) => {
		if (err) return res.cc(err)
		res.send({
			status: 0,
			url: "http://127.0.0.1:3007/upload/" + newName,
		})
	})
};

// 绑定账号 onlyid account url 关联 users,image表
exports.bindAccount = (req, res) => {
	const {
		account,
		onlyId,
		url
	} = req.body
	const sql = 'update image set account = ? where onlyId = ?'
	db.query(sql, [account, onlyId], (err, result) => {
		if (err) return res.cc(err)
		if (result.affectedRows == 1) {
			const sql2 = 'update users set image_url = ? where account = ?'
			db.query(sql2, [url, account], (err, result) => {
				if (err) return res.cc(err)
				res.send({
					status: 0,
					msg: "修改成功"
				})
			})
		}
	})
}

// 获取用户信息 id
exports.getUserInfo = (req, res) => {
	const sql = 'select * from users where id = ?'
	db.query(sql, req.body.id, (err, result) => {
		if (err) return res.cc(err)
		res.send({
			status: 0,
			result: result[0],
		})
	})
}

// 修改姓名 id name
exports.changeName = (req, res) => {
	const {
		id,
		name
	} = req.body
	const sql = 'update users set name = ? where id = ?'
	db.query(sql, [name, id], (err, result) => {
		if (err) return res.cc(err)
		res.send({
			status: 0,
			message: '修改成功'
		})
	})
}

// 修改性别 id sex
exports.changeSex = (req, res) => {
	const {
		id,
		sex
	} = req.body
	const sql = 'update users set sex = ? where id = ?'
	db.query(sql, [sex, id], (err, result) => {
		if (err) return res.cc(err)
		res.send({
			status: 0,
			message: '修改成功'
		})
	})
}


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
	const {
		id,
		name,
		identity,
		department,
		sex,
		email
	} = req.body
	const sql = 'select * from users where id = ?'
	db.query(sql, id, (err, result) => {
		if (err) return res.cc(err)
		let oldUser = result[0]

		// 更新用户信息
		let updateSql = 'update users set '
		let updateValues = [];

		// 检查是否有需要更新的字段
		let shouldUpdate = false;

		if (oldUser.name !== name) {
			shouldUpdate = true;
			updateSql += 'name = ?, ';
			updateValues.push(name);
		}
		if (oldUser.identity !== identity) {
			shouldUpdate = true;
			updateSql += 'identity = ?, ';
			updateValues.push(identity);
		}
		if (oldUser.department !== department) {
			shouldUpdate = true;
			updateSql += 'department = ?, ';
			updateValues.push(department);
		}
		if (oldUser.sex !== sex) {
			shouldUpdate = true;
			updateSql += 'sex = ?, ';
			updateValues.push(sex);
		}
		if (oldUser.email !== email) {
			shouldUpdate = true;
			updateSql += 'email = ?, ';
			updateValues.push(email);
		}

		// 无需更新
		if (!shouldUpdate) {
			return res.send({
				msg: '资料无需更新'
			});
		}

		// 删除最后一个逗号和空格
		updateSql = updateSql.slice(0, -2);

		updateSql += ' WHERE id = ?';
		updateValues.push(id);

		db.query(updateSql, updateValues, (err, result) => {
			if (err) return res.cc(err)
			if (result.affectedRows == 1) {
				res.send({
					status: 0,
					msg: "修改成功"
				})
			}
		})
	})
}

// 修改邮箱 id email
exports.changeEmail = (req, res) => {
	const {
		id,
		email
	} = req.body
	const sql = 'update users set email = ? where id = ?'
	db.query(sql, [email, id], (err, result) => {
		if (err) return res.cc(err)
		res.send({
			status: 0,
			message: '修改成功'
		})
	})
}

// 登陆页修改密码 newPassword id
exports.changePasswordInLogin = (req, res) => {
	const user = req.body
	user.newPassword = bcrypt.hashSync(user.newPassword, 10)
	const sql = 'update users set password = ? where id = ?'
	db.query(sql, [user.newPassword, user.id], (err, result) => {
		if (err) return res.cc(err)
		res.send({
			status: 0,
			msg: '密码修改成功'
		})
	})
}

/**
 * 修改用户密码 (旧密码 -> 新密码)
 * 用户id (*)
 * 新密码newPassword (*)
 * 旧密码oldPassword (*)
 */
exports.changePassword = (req, res) => {
	const {
		id,
		newPassword,
		oldPassword
	} = req.body
	const sql = 'select password from users where id = ?'
	db.query(sql, id, (err, result) => {
		if (err) return res.cc(err)
		const compareResult = bcrypt.compareSync(oldPassword, result[0].password)
		if (!compareResult) {
			return res.send({
				status: 1,
				message: '原密码错误'
			})
		}
		const newPasswordSync = bcrypt.hashSync(newPassword, 10)
		const sql1 = 'update users set password = ? where id = ?'
		db.query(sql1, [newPasswordSync, id], (err, result) => {
			if (err) return res.cc(err)
			res.send({
				status: 0,
				message: '密码修改成功'
			})
		})
	})
}

/**
 * 自动生成ID
 * 用户id (*)
 */
exports.createID = (req, res) => {
	const {
		id
	} = req.body

	// 判断员工ID是否已存在
	const sqls = 'select user_id from users where id = ?'
	db.query(sqls, id, (err, result) => {
		if (err) return res.cc(err)
		if (result[0].user_id) return res.send({
			status: 1,
			msg: '员工ID已存在，无需创建'
		})
		if (!result[0].user_id) {
			// ID统一前缀
			const card = 'CB'
			const currentDate = moment().format('YYYYMMDD')
			const sql = `SELECT COUNT(*) AS count FROM users WHERE user_id LIKE '${card}${currentDate}%'`
			db.query(sql, (err, result) => {
				if (err) return res.cc(err)
				// 统计该日期下的账号总数
				const count = result[0].count + 1;
				// 0 --> 01,
				const suffix = count > 0 ? count.toString().padStart(2, '0') : '01'
				// 生成ID
				const newID = `${card}${currentDate}${suffix}`

				// 更新
				const sql1 = 'update users set user_id = ? where id = ?'
				db.query(sql1, [newID, id], (err, result) => {
					if (err) return res.cc(err)
					res.send({
						status: 0,
						msg: '员工ID已经生成'
					})
				})
			})
		}
	})
}

/**
 * 修改密码 (验证用户邮箱email,用户账号account)
 * 用户邮箱 email(*)
 * 用户账号 account (*)
 */
exports.verifyAccountAndEmail = (req, res) => {
	const {
		account,
		email
	} = req.body

	const sql = 'select * from users where account = ?'
	db.query(sql, account, (err, result) => {
		if (err) return res.cc(err)
		// 1.判断账号是否存在
		if (Array.isArray(result) && result.length === 0) return res.send({
			status: 1,
			msg: '账号不存在'
		})
		// 2.判断邮箱是否已绑定
		if (!result[0].email) return res.send({
			status: 1,
			msg: '邮箱未绑定,请联系管理员'
		})
		// 判断邮箱是否正确
		if (result[0].email == email) {
			res.send({
				status: 0,
				id: result[0].id,
				msg: '验证通过'
			})
		} else {
			res.send({
				status: 1,
				msg: '邮箱不正确'
			})
		}
	})
}