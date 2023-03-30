<template>
	<view class="register-container">
		<nav-custom></nav-custom>
		<view class="input-container">
			<view class="input-box">
				<!-- 手机号码输入框 -->
				<u--input placeholder="请输入手机号码" type="number" border="surround" v-model="phone" :class="['input',phoneChk===null?'':(phoneChk.code===0?'error':'')]" prefixIcon="phone" prefixIconStyle="font-size: 22px;color: #909399" key="loginbycode_phone" @focus="focus('phone')" @change="phoneChk=null" :suffixIcon="phoneChkIcon" :suffixIconStyle="phoneChkIconStyle"></u--input>
			</view>

			<view class="hint">
				<uni-transition :show="phoneChk!==null" mode-class="fade" class="transition-container">
					<u--text :text="phoneChk===null?'':phoneChk.text" :type="phoneChk===null?'':phoneChk.code===1?'success':'error'" size='15rpx'></u--text>
				</uni-transition>
			</view>
			<view class="input-box">
				<!-- 图形验证码输入框 -->
				<u--input placeholder="图片验证码" type="text" border="surround" v-model="captcha" :class="['input',captchaChk===null?'':(captchaChk.code===0?'error':'')]" prefixIcon="coupon" prefixIconStyle="font-size: 22px;color: #909399" key="loginbycode_img" maxlength="6" @focus="focus('captcha')" @change="captchaChk=null" :suffixIcon="captchaChkIcon" :suffixIconStyle="captchaChkIconStyle"></u--input>
				<view class="captchaImg" :style="captchaStyle" @click="updateCode()"></view>
			</view>
			<view class="hint">
				<uni-transition :show="captchaChk!==null" mode-class="fade" class="transition-container">
					<u--text :text="captchaChk===null?'':captchaChk.text" :type="captchaChk===null?'':captchaChk.code===1?'success':'error'" size='15rpx'></u--text>
				</uni-transition>
			</view>
			<!-- 短信验证码输入框 -->
			<view class="input-box">
				<u--input placeholder="请输入短信验证码" type="number" border="surround" v-model="SMS" :class="['input',SMSChk===null?'':(SMSChk.code===0?'error':'')]" @focus="focus('SMS')" @change="SMSChk=null" prefixIcon="coupon" prefixIconStyle="font-size: 22px;color: #909399" key="loginbycode_text" :suffixIcon="SMSChkIcon" :suffixIconStyle="SMSChkIconStyle"></u--input>
				<view @click="getTextCode" class="my-btn get-code-btn" :class="{ 'disable': !isAllowedSendText }">
					{{ SMSBtnText }}
				</view>
			</view>
			<view class="hint">
				<uni-transition :show="SMSChk!==null" mode-class="fade" class="transition-container">
					<u--text :text="SMSChk===null?'':SMSChk.text" :type="SMSChk===null?'':SMSChk.code===1?'success':'error'" size='15rpx'></u--text>
				</uni-transition>
			</view>
			<!-- 密码输入框 -->
			<view class="input-box">
				<u--input placeholder="请输入密码" type="password" border="surround" v-model="pwd" class="input" prefixIcon="lock" prefixIconStyle="font-size: 22px;color: #909399" @focus="focus('pwd')" @change="pwdChk=null" :suffixIcon="pwdChkIcon" :suffixIconStyle="pwdChkIconStyle"></u--input>
			</view>
			<!-- <text class="common-hint" v-if="SMSChk.code!==0">密码长度应为8～20个字符，同时包含大小写字母、数字和特殊字符</text> -->
			<view class="common-hint">
				<!-- null以及正确时显示灰色的 -->
				<uni-transition :show="pwdChk!==null&&pwdChk.code===0" mode-class="fade" class="transition-container">
					<u--text :text="pwdChk===null?'':pwdChk.text" type="error" size='15rpx' color="#8d8d8d"></u--text>
				</uni-transition>
				<uni-transition :show="pwdChk===null||pwdChk.code===1" mode-class="fade" class="transition-container">
					<u-text text="密码长度应为8～20个字符，同时包含大小写字母、数字和特殊字符" class="common-hint" size='15rpx'></u-text>
				</uni-transition>
			</view>
			<!-- 再次输入密码 -->
			<view class="input-box">
				<u--input placeholder="再次输入密码" type="password" border="surround" v-model="repeatPwd" class="input" prefixIcon="lock" prefixIconStyle="font-size: 22px;color: #909399" @focus="focus('pwdSame')" @change="pwdSameChk=null" :suffixIcon="pwdSameChkIcon" :suffixIconStyle="pwdSameChkIconStyle"></u--input>
			</view>
			<view class="hint">
				<uni-transition :show="pwdSameChk!==null" mode-class="fade" class="transition-container">
					<u--text :text="pwdSameChk===null?'':pwdSameChk.text" :type="pwdSameChk===null?'':pwdSameChk.code===1?'success':'error'" size='15rpx'></u--text>
				</uni-transition>
			</view>
			<!-- 多选框 -->
			<u-checkbox-group class="protocol-container" v-model="checkboxValue">
				<u-checkbox shape="circle" label="同意<MCAKE>购物协议" activeColor="#ffe32a" name="yes"></u-checkbox>
			</u-checkbox-group>
			<view class="login">
				<navigator url="/pages/Login/Login">已有账号, 立即登录</navigator>
			</view>
			<view class="my-btn register-btn" @click="register">
				<text>立即注册</text>
			</view>
		</view>
		<u-toast ref="uToast"></u-toast>
	</view>
</template>

<script>
import { reqTextCode, reqImgCaptcha, reqRegister } from '../../utils/api'
import { mapMutations, mapState,mapActions } from 'vuex'
export default {
	name: 'register',
	data() {
		return {
			phone: '', // 手机号码
			captcha: '', // 输入框输入的图片验证码
			captchaSrc: '', // 图片验证码数据
			SMS: '', // 短信验证码
			pwd: '', // 密码
			repeatPwd: '', // 确认密码
			checkboxValue: [], // 标识是否同意协议,同意协议,该数组length属性为1, 否则为0
			isAllowedSendText: true, // 标识是否允许发送短信, 默认允许
			SMSBtnText: '获取短信验证码', // 短信验证码按钮文本,
			isInCountDown: false, // 标识是否处于倒计时中, 如果处于倒计时, 那么isAllowedSendText不可被更改为true
			captchaText: '', // 图片验证码文本
			phoneChk: null, // 手机号格式验证结果 {code:1,text:''}
			captchaChk: null, // 图片验证码的验证结果, {code:1,text:'验证成功'}
			SMSChk: null, // 短信验证码的验证结果, 只有在点击注册按钮后才会有
			pwdChk: null, // 密码格式验证结果
			pwdSameChk: null, //
			isChkCaptcha:false // 标识是否发送了短信验证码, 默认false
		}
	},
	computed: {
		...mapState('user', {
			token: (state) => state.token,
		}),
		// 手机输入框右侧图标类型
		phoneChkIcon() {
			if (this.phoneChk === null) {
				return ''
			} else if (this.phoneChk.code === 1) {
				return 'checkmark'
			} else if (this.phoneChk.code === 0) {
				return 'error'
			}
		},
		// 手机输入框右侧图标
		phoneChkIconStyle() {
			if (this.phoneChk === null) {
				return ''
			} else if (this.phoneChk.code === 1) {
				return { color: '#79D62E' }
			} else if (this.phoneChk.code === 0) {
				return { color: '#E63F31' }
			}
		},
		// 验证码输入框右侧图标
		captchaChkIcon() {
			if (this.captchaChk === null) {
				return ''
			} else if (this.captchaChk.code === 1) {
				return 'checkmark'
			} else if (this.captchaChk.code === 0) {
				return 'error'
			}
		},
		captchaChkIconStyle() {
			if (this.captchaChk === null) {
				return ''
			} else if (this.captchaChk.code === 1) {
				return { color: '#79D62E' }
			} else if (this.captchaChk.code === 0) {
				return { color: '#E63F31' }
			}
		},
		SMSChkIcon() {
			if (this.SMSChk === null) {
				return ''
			} else if (this.SMSChk.code === 1) {
				// 短信验证码的正确与否不由客户端决定
				return ''
			} else if (this.SMSChk.code === 0) {
				return 'error'
			}
		},
		SMSChkIconStyle() {
			if (this.SMSChk === null) {
				return ''
			} else if (this.SMSChk.code === 1) {
				return { color: '#79D62E' }
			} else if (this.SMSChk.code === 0) {
				return { color: '#E63F31' }
			}
		},
		pwdChkIcon() {
			if (this.pwdChk === null) {
				return ''
			} else if (this.pwdChk.code === 1) {
				return 'checkmark'
			} else if (this.pwdChk.code === 0) {
				return 'error'
			}
		},
		pwdChkIconStyle() {
			if (this.pwdChk === null) {
				return ''
			} else if (this.pwdChk.code === 1) {
				return { color: '#79D62E' }
			} else if (this.pwdChk.code === 0) {
				return { color: '#E63F31' }
			}
		},
		pwdSameChkIcon() {
			if (this.pwdSameChk === null) {
				return ''
			} else if (this.pwdSameChk.code === 1) {
				return 'checkmark'
			} else if (this.pwdSameChk.code === 0) {
				return 'error'
			}
		},
		pwdSameChkIconStyle() {
			if (this.pwdSameChk === null) {
				return ''
			} else if (this.pwdSameChk.code === 1) {
				return { color: '#79D62E' }
			} else if (this.pwdSameChk.code === 0) {
				return { color: '#E63F31' }
			}
		},
		captchaStyle() {
			return {
				backgroundImage: `url('${this.captchaSrc}')`,
			}
		},
		/**
		 * @description: 是否同意了协议
		 */
		isAgreedDeal() {
			return this.checkboxValue.length === 0 ? false : true
		},
	},
	onLoad() {
		this.updateCode()
	},
	methods: {
		...mapMutations('user', [
			'updatePhone',
			'updateIsLogin',
		]),
		...mapMutations('profile',[
			'toggleRegisterSuccessToast'
		]),
		...mapActions('user',['loginAndStorageUserData']),
		checkCaptcha() {
			if (this.captcha === '') {
				return { code: 0, text: '验证码输入框不可为空' }
			} else if (this.captchaText !== this.captcha) {
				return { code: 0, text: '输入的验证码与图片不相符' }
			} else if (this.captchaText === this.captcha) {
				return { code: 1 }
			}
		},
		checkPhone() {
			if (this.phone === '') {
				return { code: 0, text: '手机号码不可为空' }
			} else {
				let reg = /^\d{11}$/
				if (reg.test(this.phone)) {
					return { code: 1 }
				} else {
					return { code: 0, text: '手机号码必须是11位数字' }
				}
			}
		},
		checkSMS() {
			if (this.SMS === '') {
				return { code: 0, text: '短信验证码不可为空' }
			} else {
				return { code: 1 }
			}
		},
		// 检查密码是否符合格式
		checkPwd() {
			//  验证密码是否符合 8-20位字母,数字,下划线, 且首字母不得是下划线 的格式
			if (this.pwd === '') {
				return { code: 0, text: '密码不可为空' }
			} else {
				let reg_pwd = /^[a-zA-Z0-9]\w{7,19}$/g
				if (reg_pwd.test(this.pwd)) {
					return { code: 1 }
				} else {
					return {
						code: 0,
						text: '密码必须是8-20位的字母, 数字或下划线, 且首位不得是下划线',
					}
				}
			}
		},
		checkPwdSame() {
			if(this.pwdChk.code===0){
				return this.pwdChk
			}
			if (this.repeatPwd === '') {
				return { code: 0, text: '密码不可为空' }
			} else {
				if (this.pwd === this.repeatPwd) {
					return { code: 1 }
				} else {
					return { code: 0, text: '两次输入密码不一致' }
				}
			}
		},
		focus(type) {
			if (this[type + 'Chk'] === null) {
				return
			}
			if (this[type + 'Chk'].code !== 1) {
				this[type + 'Chk'] = null
			}
		},

		async updateCode() {
			const captchaImg = await reqImgCaptcha().catch((err) => err)
			if (captchaImg.code === 1) {
				const { img, text } = captchaImg.data
				let reg = /#/g
				this.captchaSrc =
					'data:image/svg+xml;utf8,' + img.replace(reg, '%23')
				this.captchaText = text
				console.log('%c register页面:updateCode函数向服务器发起请求获取到Captcha值为:','padding:5px 2px;color:yellow;background-color:#228B22;')
				console.log(text)
			}
		},
		/**
		 * @description: 点击获取短信验证码
		 */
		async getTextCode() {
			// 1.如果处于不允许发送请求的状态中, 那么return
			if (!this.isAllowedSendText) {
				return
			}
			// 2.检查手机号码, 图片验证码
			this.phoneChk = this.checkPhone()
			this.captchaChk = this.checkCaptcha()
			// 如果两个中有一个不符合, 直接跳出函数
			if (!(this.phoneChk.code === 1 && this.captchaChk.code === 1)) {
				if (this.captchaChk.code === 0) {
					this.updateCode()
				}
				return
			}

			// 2.向服务器发起请求, 并验证图片验证码是否正确
			const res_textcode = await reqTextCode(
				this.phone,
				this.captcha
			).catch((err) => err)

			console.log(res_textcode)
			// 3.设置允许发送短信的标识符为false
			this.isAllowedSendText = false
			// 4.检查服务器响应
			if (res_textcode.code === 1) {
			this.isChkCaptcha=true

			} else {
				// 4.2 图片验证码错误
				// 4.2.1 清空图片验证码输入框
				this.captcha = ''
				// 4.2.2 重新请求图片验证码
				this.updateCode()
				// 4.2.3 弹出toast警告
				let params = { type: 'error', message: res_textcode.msg }
				this.showToast(params)
				// 4.2.4 图片验证码失败时允许继续发送获取短信验证码
				this.isAllowedSendText = true
			}
		},
		/**
		 * @description: 根据传入对象弹出toast提醒
		 * @param {*} params 格式:{type:'default'/'error'/'success',message:'toast弹出的文字信息'}
		 */
		showToast(params) {
			this.$refs.uToast.show({
				...params,
			})
		},
		/**
		 * @description:
		 * @param {*} phone 手机号码
		 * @param {*} password 密码
		 * @param {*} code 短信验证码
		 */
		async register() {
			// 1.检查手机号
			this.phoneChk = this.checkPhone()
			// 2.检查短信验证码
			this.SMSChk = this.checkSMS()
			// 3.检查密码格式
			this.pwdChk = this.checkPwd()
			// 4.检查再次输入密码的格式
			this.pwdSameChk = this.checkPwdSame()
			// 5.上面4个数据都完善
			if(!this.isChkCaptcha){
				console.error('register页面:检测到未发送短信验证码')
				this.updateCode()
				this.SMSChk={code:0,text:'您必须点击按钮接收短信注册码'}
				return
			}
			if (
				this.phoneChk.code === 1 &&
				this.SMSChk.code === 1 &&
				this.pwdChk.code === 1 &&
				this.pwdSameChk.code === 1
			) {
			} else {
				// 更换图片验证码
				this.updateCode()
				return this.$toast('error', '请检查所填信息是否符合格式')
			}
			if (!this.isAgreedDeal) {
				return this.$toast('default', '请确认已同意购物协议')
			}
			// 注册
			const { phone, pwd, SMS } = this
			const res_register = await reqRegister(phone, pwd, SMS).catch(
				(err) => err
			)
			console.log('%c register页面:执行注册逻辑, 向服务器发起请求, 获取到如下数据','padding:5px 2px;color:white;background-color:black;')
			console.log(res_register)
			// 注册成功, 保存用户数据{phone,token}到vuex
			if (res_register.code === 1) {
				const {id,phone,token}=res_register.data
				this.loginAndStorageUserData({phone,id,type:'register'})
				// 3.5.1 保存token到本地
				const resToken = await this.$setStorage('token',token)
				// 3.5.1.1 根据储存返回的结果判断储存是否成功, 成功跳转profile, 失败弹出toast, 且不跳转
				if (resToken.code === 0) {
					let params = { type: 'error', message: '储存token失败' }
					return this.showToast(params)
				}
				// 3.5.2 更改登录状态为true
				this.updateIsLogin(true)
				// 3.5.2 再跳转/profile
				// uni.switchTab({
				// 	url: '/pages/Profile/Profile',
				// })
				this.$switchPage({pageName:'Profile'})
				this.toggleRegisterSuccessToast(true)
			} else {
				this.$toast('error', res_register.msg)
				this.isChkCaptcha=false
				this.SMS=this.captcha=''
				if (
					res_register.code === 0 &&
					res_register.msg === '短信验证码错误'
				) {
					// 3.1.3.1 重新请求图片验证码
					this.updateCode()
					// 3.1.3.2 清空图片验证码输入框和短信输入框
					this.captcha = this.code = ''
				}
			}
		},
	},
	watch: {
		/**
		 * @description: 获取短信验证码按钮文字信息, 点击之后进入10s倒计时, 倒计时内不得再次点击
		 * @param {*} newVal 当前的值
		 */
		isAllowedSendText(newVal) {
			let time = 10
			let timer = null
			// 1. 如果当前值更改为false
			if (!newVal) {
				// 1.1 修改当前按钮文本
				this.SMSBtnText = '倒计时10秒'
				// 1.2 设置一个循环计数器
				timer = setInterval(() => {
					time--
					this.SMSBtnText = '倒计时' + time + '秒'
					if (time === 0) {
						clearInterval(timer)
						timer = null
						this.isAllowedSendText = true
					}
				}, 1000)
			} else {
				if (timer) {
					clearInterval(timer)
					timer = null
				}
				this.SMSBtnText = '获取短信验证码'
			}
		},
	},
}
</script>

<style lang="scss">
.register-container {
	height: 100vh;
	background-color: #fff;

	.my-btn {
		background-color: #ffe32a;

		&.disable {
			background-color: #eeeeee !important;
			color: #ccc;
		}
	}

	& > .input-container {
		width: 100%;
		padding: 20rpx;

		.input-box {
			display: flex;
			justify-content: space-between;
			align-items: center;
			height: 93.75rpx;
			// margin-bottom: 10rpx;

			// input-box由input与image或者button构成
			& .input {
				flex: 1.5;
				height: 100%;
				border-radius: 15rpx;
				background-color: #ededed;
				transition: 0.5s;

				&.error {
					// border-color:'#E63F31'
					box-shadow: 0 0 5px #e63f31;
				}
			}

			& .code,
			& .get-code-btn,
			& .captchaImg {
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

		& .common-hint {
			color: #8d8d8d;
			font-size: 19.5rpx;
			margin-bottom: 20rpx;
			& > .transition-container {
				height: 100%;
			}
		}
		& > .hint {
			width: 100%;
			height: 35rpx;
			& > .transition-container {
				height: 100%;
			}
		}

		& .protocol-container {
			display: flex;
			justify-content: center;
		}

		& > .login {
			width: 100%;
			height: 180rpx;
			line-height: 180rpx;
			text-align: center;
			color: #8d8dab;
		}

		& > .register-btn {
			width: 100%;
			height: 90rpx;
			background-color: #ffe32a;
			border-radius: 15rpx;
			line-height: 90rpx;
			text-align: center;
			color: #000;
			font-weight: 400;
			font-size: 32rpx;
		}
	}
}
</style>

// 1.初次在输入框输入手机号不作检查
// 2.用户随后应该在图片验证码框填写图片验证码
// 3.点击获取短信的按钮， 执行
	// 1.检查手机号是否为空以及手机号是否符合格式， 不符合在输入框右侧显示警告图标， 以及在输入框下方显示红色警告信息； 符合格式显示成功图标
	// 2.检查图片验证码是否正确， 不正确或为空，在输入框右侧显示警告图标， 在输入框下方显示红色信息， 清除输入框的验证码文字， 并且重新更换图片验证码； 正确的话输入框右侧显示成功图标， 并且根据手机号与验证码发起请求


// 输入框逻辑：无论是显示成功还是失败的图标与信息，在光标重新回到该输入框时都要将图标与信息清除
