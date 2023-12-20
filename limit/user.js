// 对用户相关基础信息验证规则

const joi = require('joi')

// ID规则
const id = joi.required()

// 姓名规则
const name = joi.string().pattern(/^(?:[a-zA-Z.\s]{2,20}|[\u4e00-\u9fa5]{2,4}(?:·[\u4e00-\u9fa5]{2,4})?)$/).required()

// 邮箱规则
const email = joi.string().pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/).required()

exports.name_limit = {
	// 表示对req.body里面的数据进行验证
	body: {
		id,
		name
	}
}

exports.email_limit ={
	// 表示对req.body里面的数据进行验证
	body:{
		id,
		email
	}
}




