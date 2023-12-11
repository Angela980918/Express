// 引入数据库
const db = require('../db/index.js')
// 引入bcrypt中间件加密
const bcrypt = require('bcrypt')
// 导入jwt配置文件-->用于加密/解密
const jsconfig = require('../jwt_config/index.js')

const {
	NEWDATE,
	DATE
} = require('mysql/lib/protocol/constants/types')

exports.register = (req, res) => {
	// req是前端传过来的数据，res是返回前端的数据
	const reginfo = req.body
	// 1.判断账号或密码是否为空
	if (!reginfo.account || !reginfo.password) {
		return res.send({
			statusL: 1,
			msg: '注册失败,账号或密码不能为空',
		})
	}
	// 2.判断账号在数据库中是否可创建
	const sql = 'select * from users where account = ?'
	db.query(sql, reginfo.account, (err, results) => {
		// 2.1账号已存在
		if (results.length > 0) {
			return res.send({
				statusL: 1,
				msg: '账号已存在',
			})
		}
		// 2.2账号可创建,对密码进行加密
		// 使用中间件加密,bcrypt.js
		reginfo.password = bcrypt.hashSync(reginfo.password, 10)
		// 2.3将账号密码记录到数据库的users表中
		const sqli = 'insert into users set ?'
		// 用户身份
		const identity = '用户'
		// 账户创建时间
		const creat_time = new Date()
		db.query(sqli, {
			account: reginfo.account,
			password: reginfo.password,
			identity,
			creat_time,
			status: 0
		}, (err, results) => {
			// 2.3.1 插入失败
			// affectedRows 影响的行数
			if (results.affectedRows !== 1) {
				return res.send({
					statusL: 1,
					msg: '注册账号失败',
				})
			}
			res.send({
				statusL: 1,
				msg: '注册成功',
			})
		})
	})
}

exports.login = (req, res) => {
	const loginfo = req.body
	// 1.查看前端传入的账号数据库中是否存在
	const sql = 'select * from users where account = ?'
	db.query(sql, loginfo.account, (err, result) => {
	})

}