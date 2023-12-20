// 导入数据库
const db = require("../db/index.js");
// 导入bcrypt中间件加密
const bcrypt = require("bcrypt");
// 导入node.js的crypto库生成uuid
const crypto = require("crypto");

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

// 获取用户信息 ID
exports.getUserInfo = (req, res) => {
	const sql = 'select * from users where id = ?'
	db.query(sql, req.body.id, (err, result) => {
		if (err) return res.cc(err)
		res.send({
			status: 0,
			result: result[0]
		})
	})
}

// 修改姓名 ID NAME
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

// 修改性别 ID SEX
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

// 修改邮箱 ID EMAIL
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