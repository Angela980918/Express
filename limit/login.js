// 对于登录验证规则
const joi = require('joi')

// string值只能为字符串
// alphanum值为a-z A-Z 0-9
// min是最小长度 max是最大长度
// required是必填项
// pattern是正则

// 账号验证
const account = joi.string().alphanum().min(6).max(15).required()

// 密码验证
const password = joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]+$/).min(6).max(12).required()

exports.login_limit = {
	// 表示对req.body里面的数据进行验证
	body: {
		account,
		password
	}
}