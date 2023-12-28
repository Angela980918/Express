// 校验请求体参数是否为空
function checkBodyParams(reqBody, params) {
  for (const param of params) {
    if (!reqBody[param]) {
      return `'${param}'参数不能为空`;
    }
  }
  return null; // 如果所有参数都存在，则返回null表示没有错误
}

// 对外暴露函数
module.exports = {
  checkBodyParams,
};
