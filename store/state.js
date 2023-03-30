export default {
	access_token: {}, // 标识全局使用的token, 在App.vue中, 第一个请求就是检查access-token过期与否, 过期就向服务器请求最新access-token数据, 在程序运行的情况中随时可以获取
	prevPage: 'index' // 标识上一页,默认index. 用于点击返回按钮进行返回, 解决uni.switchTab不能直接传参的问题
}
