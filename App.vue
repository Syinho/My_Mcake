<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import { reqAutoLogin, reqGetShopCartData } from './utils/api.js'

export default {
	onLaunch() {
		console.log('App onLaunch')
	},
	onLoad() {
		console.log('App load')
	},
	onShow: function () {
		console.log('App onShow')
	},
	onHide: function () {
		console.log('App onHide')
	},
	onLoad() {
		console.log('App onLoad')
	},
	async created() {
		// 1.对access-token数据进行检查/更新
		const res_accessToken = await this.chkAndGetToken().catch((err) => err)
		let accessToken = ''
		if (res_accessToken.code === 1) {
			accessToken = res_accessToken.data['access-token']
		} else {
			console.error('App.vue:access-token请求失败')
		}

		// 2.自动登录
		const res_autoLogin = await this.autoLogin().catch((err) => err)
		// 3.自动登录成功, 让index.vue页面可以显示登录成功的toast
		if (res_autoLogin.code === 1) {
			this.reWriteAutoLoginToast({ code: 1, msg: '自动登录成功' })
			// 4.根据用户id初始化购物车数据
			const res_initShopCart = await this.initShopCart().catch(
				(err) => err
			)
			// 5.初始化购物车数据成功
			if (res_initShopCart.code === 1) {
				// 不作处理
			}
			// 6.初始化失败
			else {
				console.error('App.vue:初始化购物车数据失败')
			}
		}
		// 7.自动登录失败
		else {
			this.reWriteAutoLoginToast({
				code: 0,
				msg: res_autoLogin.msg ? res_autoLogin.msg : '自动登录失败',
			})
		}
	},
	async mounted() {
		console.log('App mounted')
	},

	methods: {
		...mapMutations('shopCart', ['reWriteCartList']),
		...mapActions(['chkAndGetToken']),
		...mapActions('user', [
			'clearLoginInfo',
			'loginAndStorageUserData',
			'autoLogin',
		]),
		...mapActions('shopCart', ['initShopCart']),
		...mapMutations('index', ['reWriteAutoLoginToast']),
	},
	computed: {
		...mapState('user', {
			isLogin: (state) => state.isLogin,
			message: (state) => state.message,
			loginWay: (state) => state.loginWay,
			avatar: (state) => state.avatar,
			userName: (state) => state.userName,
			userId: (state) => state.userId,
			phone: (state) => state.phone,
			token: (state) => state.token,
		}),
		...mapState('shopCart', {
			cartList: (state) => state.cartList,
		}),
	},
}
</script>


<style lang="scss">
/* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
@import '@/uni_modules/uview-ui/index.scss';

* {
	padding: 0;
	margin: 0;
	box-sizing: border-box;
	user-select: none;
}

a {
	text-decoration: none;
}
</style>
<style lang="css">
/*每个页面公共css */
@import 'ColorUI-UniApp_2.1.6/colorui/main.css';
@import 'ColorUI-UniApp_2.1.6/colorui/icon.css';
@font-face {
  font-family: "iconfont"; /* Project id 3977517 */
  src: url('//at.alicdn.com/t/c/font_3977517_hteorlkrtmv.woff2?t=1679822665471') format('woff2'),
       url('//at.alicdn.com/t/c/font_3977517_hteorlkrtmv.woff?t=1679822665471') format('woff'),
       url('//at.alicdn.com/t/c/font_3977517_hteorlkrtmv.ttf?t=1679822665471') format('truetype');
}

.iconfont {
  font-family: "iconfont" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.icon-zaixianzhifu:before {
  content: "\e6c0";
}

.icon-yidongPOSzhongduan:before {
  content: "\e6c1";
}

.icon-shuaka:before {
  content: "\e6d9";
}

</style>