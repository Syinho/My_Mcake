<template>
	<view class="login-container">
		<nav-custom></nav-custom>
		<scroll-view scroll-x class="bg-white nav">
			<view class="flex text-center">
				<view class="cu-item flex-sub" :class="TabCur === 0 ? 'text-black cur' : 'text-grey'" @tap="tabSelect" data-id="0">
					手机验证码登录
				</view>
				<view class="cu-item flex-sub" :class="TabCur === 1 ? 'text-black cur' : 'text-grey'" @tap="tabSelect" data-id="1">
					账号密码登录
				</view>
			</view>
		</scroll-view>
		<!-- 手机短信验证码登录 -->
		<u-transition :show="TabCur === 0" mode="slide-right">
			<view class="input-container transition" v-show="TabCur === 0">
				<view class="input-box">
					<!-- 手机号码输入框 -->
					<u--input placeholder="请输入手机号码" type="number" border="surround" v-model="phone" class="input" prefixIcon="phone" prefixIconStyle="font-size: 22px;color: #909399" key="loginbycode_phone"></u--input>
				</view>
				<view class="input-box">
					<!-- 图形验证码输入框 -->
					<u--input placeholder="图片验证码" type="text" border="surround" v-model="captcha" class="input" prefixIcon="coupon" prefixIconStyle="font-size: 22px;color: #909399" key="loginbycode_img"></u--input>
					<view class="captchaImg" :style="captchaStyle" @click="updateCode()"></view>
				</view>
				<view class="input-box">
					<!-- 短信验证码输入框 -->
					<u--input placeholder="请输入短信验证码" type="number" border="surround" v-model="code" class="input" prefixIcon="coupon" prefixIconStyle="font-size: 22px;color: #909399" key="loginbycode_text"></u--input>
					<view @click="getCode" class="get-code-btn" :class="[beAllowedToGetSMS?'':'disabled']">{{getSMSBtnText}}</view>
				</view>
			</view>
		</u-transition>
		<!-- 手机号与密码登录 -->
		<u-transition :show="TabCur === 1" mode="slide-left">
			<view class="input-container transition" v-show="TabCur === 1">
				<view class="input-box">
					<!-- 手机号输入框 -->
					<u--input placeholder="请输入手机号码" type="number" border="surround" v-model="phone" class="input" prefixIcon="phone" prefixIconStyle="font-size: 22px;color: #909399" key="loginbypwd_phone"></u--input>
				</view>
				<view class="input-box">
					<!-- 密码输入框 -->
					<u--input placeholder="请输入密码" type="password" border="surround" v-model="password" class="input" prefixIcon="lock" prefixIconStyle="font-size: 22px;color: #909399"></u--input>
				</view>
			</view>
		</u-transition>
		<view class="other-container">
			<view class="help">
				<view class="help-btn" @click="goToRegister">
					<text>立即注册</text>
				</view>
				<u-line direction="col" length="50%" margin="0 40rpx" color="#ccc"></u-line>
				<view class="help-btn">
					<text>忘记密码</text>
				</view>
			</view>
			<view class="other-login-way">
				<view class="text">其它登录方式</view>
				<view class="icon-box">
					<u-icon name="zhifubao-circle-fill" color="#1AABEF" size="37.5px" class="icon"></u-icon>
					<u-icon name="weibo-circle-fill" color="#EA5C5C" size="37.5px" class="icon"></u-icon>
				</view>
			</view>
			<view class="login" @click="login(TabCur)">立即登录</view>
		</view>
		<!-- toast, 初始状态是隐藏 -->
		<u-toast ref="uToast"></u-toast>
		<!-- loading加载页 -->
		<u-loading-page :loading="isShowLoading" class="shopCartLoadingPage"></u-loading-page>
		<u-notify ref="uNotify"></u-notify>
	</view>
</template>

<script>
import {
	reqLoginByPassword,
	reqImgCaptcha,
	reqTextCode,
	reqLoginBySMS,
} from '../../utils/api'
import { mapMutations, mapState, mapActions } from 'vuex'
import md5 from 'md5'
export default {
	name: 'login',
	data() {
		return {
			TabCur: 0, // 0代表手机验证码登录, 1 代表手机号密码登录
			phone: '', // 手机号码
			captcha: '', // 图片验证码
			code: '', // 短信验证码
			captchaSrc: '', // 图片验证码数据

			password: '',
			isShowLoading: false, // 标识是否显示加载页, 默认不显示
			beAllowedToGetSMS: true, // 标识是否允许发送短信验证码, 默认允许, 每次点击后必须间隔10秒才可以进行下一次发送
			getSMSBtnText: '点击获取验证码',
			timer: null,
		}
	},
	computed: {
		...mapState({
			isLogin: (state) => state.user.isLogin,
			cartList: (state) => state.shopCart.cartList,
		}),
		captchaStyle() {
			return {
				backgroundImage: `url('${this.captchaSrc}')`,
			}
		},
	},
	created() {
		this.updateCode()
	},
	onLoad(option) {
		if (this.isLogin) {
			uni.switchTab({
				url: '/pages/profile/profile',
			})
		}
		console.log(option)
	},
	methods: {
		...mapMutations('user', ['updatePhone', 'updateToken']),
		...mapMutations('profile', ['toggleLoginSuccessToast']),
		...mapMutations('shopCart', ['reWriteCartList']),
		...mapActions('user', ['loginAndStorageUserData']),
		...mapActions('shopCart', ['getShopCart']),
		// 点击切换登录表单
		tabSelect(e) {
			// 1.获取el上的id属性
			let id = Number(e.currentTarget.dataset.id)
			// 2.判断点击的tabbar是否是当前的
			if (this.TabCur === id) {
				// 2.1 是的话不作任何反应
				return
			} else {
				// 2.2 不是
				// 2.2.1 如果当前是手机验证码登录,清空手机号, 图片验证码, 短信验证码
				if (this.TabCur === 0) {
					this.phone = this.captcha = this.code = ''
				} else {
					// 2.2.2 清空手机号, 密码
					this.phone = this.password = ''
				}
			}
			// 2.设置tabCur
			this.TabCur = id
		},
		// 点击获取新的验证码图片
		async updateCode() {
			const captchaImg = await reqImgCaptcha().catch((err) => err)
			if (captchaImg.code === 1) {
				const { img, text } = captchaImg.data
				let reg = /#/g
				this.captchaSrc =
					'data:image/svg+xml;utf8,' + img.replace(reg, '%23')
				this.captchaText = text
				console.log(
					'%c login页面:updateCode函数向服务器发起请求获取到Captcha值为:',
					'padding:5px 2px;color:yellow;background-color:#228B22;'
				)
				console.log(text)
			}
		},
		// navigateTo(url) {
		// 	uni.navigateTo({
		// 		url,
		// 	})
		// },
		goToRegister() {
			this.$switchPage({ pageName: 'Register' })
		},
		// 点击获取短信验证码
		async getCode() {
			// 将phone, 图片验证码发送, 在服务器进行验证
			if (this.beAllowedToGetSMS) {
				this.beAllowedToGetSMS = false
				this.getSMSBtnText = '倒计时10秒'
				let num = 10
				this.timer = setInterval(() => {
					if (num === 1) {
						this.updateCode()
						clearInterval(this.timer)
						this.timer = null
						this.beAllowedToGetSMS = true
						this.getSMSBtnText = '点击获取验证码'
						return
					}
					num--
					this.getSMSBtnText = `倒计时${num}秒`
				}, 1000)
				let { phone, captcha } = this
				const req_SMS = await reqTextCode(phone, captcha).catch(
					(err) => err
				)
				// 验证图片验证码成功,
				if (req_SMS.code === 1) {
					console.log(req_SMS.msg)
				}
				// 验证图片验证码失败
				else {
					this.updateCode()
					this.$notify('error', req_SMS.msg)
				}
			}
		},
		// 登录逻辑
		async login(id) {
			this.isShowLoading = true
			// 1.手机验证码登录
			if (id === 0) {
				// 向服务器发起登录请求
				const res_login = await reqLoginBySMS(
					this.phone,
					this.code
				).catch((err) => err)
				if (res_login.code === 1) {
					// 登录验证成功, 保存用户数据并跳转/profile
					let data = res_login.data
					const { token } = data
					let obj = { type: 'SMS' }
					Object.assign(data, obj)
					obj = null
					this.$setStorage('token', token)
					this.loginAndStorageUserData(data)
					// 8.向服务器发起请求, 请求购物车数据
					const res_shopCart = await this.getShopCart().catch(
						(err) => err
					)
					console.log(res_shopCart)
					// 9.检查服务器返回的数据
					if (res_shopCart.code === 1) {
						this.reWriteCartList(res_shopCart.data)
					}
					// 10.code为0, 检查出错, 中止跳转,关闭loading动画, 弹出toast信息
					else {
						this.isShowLoading = false
						return this.$toast('error', res_shopCart.msg)
					}
					// 11.修改isShowLoginSuccessToast数据为true, 令其跳转/proile后能够弹出toast
					this.toggleLoginSuccessToast(true)
					this.$switchPage({ pageName: 'Profile' })
				} else {
					// 12.登录失败, 跳出toast
					this.isShowLoading = false
					this.$refs.uToast.show({
						type: 'error',
						message: res_login.msg || '登录失败',
					})
				}
			}
			// 2.手机号与密码登录
			else {
				const { phone, password } = this
				// 3 根据手机号与密码向服务器发送请求
				const res_login = await reqLoginByPassword(
					phone,
					md5(password)
				).catch((err) => err)
				console.log(res_login)
				// 4 登录成功
				if (res_login.code === 1) {
					// 6 单独获取token数据, 它被保存在storage里
					console.log('通过密码登录成功')
					const { token } = res_login.data
					let obj = { type: 'password' }
					Object.assign(res_login.data, obj)
					obj = null
					// 7 保存phone,id,avatar,username等数据到vuex中, 保存token到vuex与本地储存中, 切换登录状态
					this.$setStorage('token', token)
					this.loginAndStorageUserData(res_login.data)
					// 8.向服务器发起请求, 请求购物车数据
					const res_shopCart = await this.getShopCart().catch(
						(err) => err
					)
					console.log(res_shopCart)
					// 9.检查服务器返回的数据
					if (res_shopCart.code === 1) {
						this.reWriteCartList(res_shopCart.data)
					}
					// 10.code为0, 检查出错, 中止跳转,关闭loading动画, 弹出toast信息
					else {
						this.isShowLoading = false
						return this.$toast('error', res_shopCart.msg)
					}
					// 11.修改isShowLoginSuccessToast数据为true, 令其跳转/proile后能够弹出toast
					this.toggleLoginSuccessToast(true)
					// uni.switchTab({
					// 	url: '/pages/Profile/Profile',
					// 	complete () {
					// 		console.log('switchTab complete')
					// 		// this.isShowLoading = false
					// 	},
					// })
					this.$switchPage({ pageName: 'Profile' })
					// while(this){
					// 	console.log('after complete')
					// }
					console.log('end')
				} else {
					// 12.登录失败, 跳出toast
					this.isShowLoading = false
					this.$refs.uToast.show({
						type: 'error',
						message: res_login.msg || '登录失败',
					})
				}
			}
		},
	},
}
</script>

<style lang="scss">
.login-container {
	height: 100vh;
	background-color: #fff;

	&::v-deep .shopCartLoadingPage {
		z-index: 10090;
		background-color: transparent !important;
	}

	.input-container {
		width: 100%;
		padding: 20rpx;

		.input-box {
			display: flex;
			justify-content: space-between;
			align-items: center;
			height: 93.75rpx;
			margin-bottom: 20rpx;

			// input-box由input与image或者button构成
			& .input {
				flex: 1.5;
				height: 100%;
				border-radius: 15rpx;
				background-color: #ededed;
			}

			& .code,
			& .get-code-btn {
				flex: 1;
				height: 100%;
				margin-left: 20rpx;
				&.disabled{
					background-color: #EDEDED;
					color: #fff;
				}
			}

			.captchaImg {
				flex: 1;
				height: 100%;
				margin-left: 20rpx;
				background-size: contain;
				background-repeat: no-repeat;
				background-position: center center;
			}

			& .get-code-btn {
				line-height: 93.75rpx;
				font-size: 30rpx;
				background-color: #ffe32a;
				text-align: center;
				border-radius: 15rpx;
				font-weight: 400;
			}
		}
	}

	& > .other-container {
		& > .help {
			width: 100%;
			height: 84.5rpx;
			line-height: 84.5rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			margin-bottom: 50rpx;

			& > .help-btn {
				width: 20%;
				height: 100%;
				text-align: center;
				font-size: 28rpx;
				color: grey;
			}
		}

		& > .other-login-way {
			display: flex;
			flex-direction: column;
			align-items: center;

			& > .text {
				font-size: 24rpx;
				margin-bottom: 40rpx;
			}

			& > .icon-box {
				display: flex;
				justify-content: center;

				& > .icon {
					margin: 0 10rpx;
				}
			}
		}

		& > .login {
			height: 90rpx;
			margin: 75rpx 20rpx;
			background-color: #ffe32a;
			border-radius: 15rpx;
			overflow: hidden;
			line-height: 90rpx;
			text-align: center;
			font-size: 36rpx;
		}
	}
}
</style>
