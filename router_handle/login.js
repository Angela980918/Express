// 导入数据库
const db = require('../db/index.js')
// 导入bcrypt中间件加密
const bcrypt = require('bcrypt')
// 导入jwt,用于生成token
const jwt = require('jsonwebtoken')
// 导入jwt配置文件-->用于加密/解密
const jwtconfig = require('../jwt_config/index.js')

exports.register = (req, res) => {
	// req是前端传过来的数据，res是返回前端的数据
	const reginfo = req.body
	// 1.判断账号或密码是否为空
	if (!reginfo.account || !reginfo.password) {
		return res.send({
			status: 1,
			msg: '注册失败,账号或密码不能为空',
			reginfo
		})
	}
	// 2.判断账号在数据库中是否可创建
	const sql = 'select * from users where account = ?'
	db.query(sql, reginfo.account, (err, results) => {
		// 2.1账号已存在
		if (results.length > 0) {
			return res.send({
				status: 1,
				msg: '账号已存在',
			})
		}
		// 2.2账号可创建,对密码进行加密
		// 使用中间件加密,bcrypt.js
		reginfo.password = bcrypt.hashSync(reginfo.password, 10)
		// 2.3将账号密码记录到数据库的users表中
		const sqlin = 'insert into users set ?'
		// 用户身份
		const identity = '用户'
		// 账户创建时间
		const create_time = new Date()
		db.query(sqlin, {
			account: reginfo.account,
			password: reginfo.password,
			identity,
			create_time,
			status: 0
		}, (err, results) => {
			// 2.3.1 插入失败
			// affectedRows 影响的行数
			if (results.affectedRows !== 1) {
				return res.send({
					status: 1,
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
		// 执行sql语句失败的情况 一般在数据库断开的情况会执行失败
		if (err) return res.cc(err)
		if (result.length !== 1) return res.cc('登录失败')
		// 2.对前端传过来的密码与数据库保存的加密密码进行解密比较
		const compareResult = bcrypt.compareSync(loginfo.password, result[0].password)
		// 2.1密码错误比较失败
		if (!compareResult) {
			return res.cc('密码错误，登录失败')
		}
		// 3.账号状态是否可用
		if (result[0].status == 1) {
			return res.cc('账号被冻结，请练习管理员')
		}
		// 4.生成返回给前端的token --> 剔除加密后的密码,头像,创建时间等等
		const userInfo = {
			...result[0],
			password: '',
			imageUrl: '',
			create_time: '',
			update_time: '',
		}
		// 5.设置token的有效时长 --> 有效期: 7个小时
		const tokenStr = jwt.sign(userInfo, jwtconfig.jwtSecretKey, {
			expiresIn: '7h'
		})
		res.send({
			result: result[0],
			status: 0,
			msg: '登录成功',
			token: 'Bearer ' + tokenStr,
		})
	})
}