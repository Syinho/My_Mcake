<template>
	<view class="profile-container">
		<nav-custom></nav-custom>
		<view class="profile-content">
			<view class="bg"></view>
			<view class="info-container">
				<view class="avatar-container">
					<image src="https://img.mcake.com/customer/default_user.gif?x-oss-process=image/auto-orient" class="avatar"></image>
					<view class="user-level-mark">
						<text>v1</text>
					</view>
				</view>
				<text class="phone">{{ isLogin ? phone : '请登录' }}</text>
				<view class="switch-account">
					<text class="cuIcon-order icon"></text>
					<!-- 切换账号按钮 -->
					<text @click="handleLogout">切换账号</text>
				</view>
				<view class="nav-container">
					<view class="item" v-for="(item, index) in list" :key="index">
						<text class="item-icon iconfont" :class="item.icon"></text>
						<text class="item-title">{{ item.name }}</text>
					</view>
				</view>
			</view>
		</view>
		<!-- 弹出窗口 -->
		<view>
			<u-modal :show="isShowLogin" :title="login.title" :content='login.content' confirmText="立即登录" cancelText="以后再说" :showCancelButton="true" confirmColor="#000" cancelColor="#fff" :zoom="true" @confirm="confirm" @cancel="cancel">
			</u-modal>
			<u-modal :show="isShowLogout" :title="logout.title" :content='logout.content' confirmText="确定" cancelText="取消" :showCancelButton="true" confirmColor="#000" cancelColor="#fff" :zoom="true" @confirm="confirmLogout" @cancel="cancelLogout">
			</u-modal>
		</view>
		<!-- toast, 初始状态是隐藏 -->
		<u-toast ref="uToast"></u-toast>
		<!-- 底部导航栏 -->
		<footer-tab :curIdx=3></footer-tab>
	</view>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
export default {
	data() {
		return {
			list: [
				{
					name: '我的订单',
					icon: 'icon-dingdanorder-fill',
				},
				{
					name: '待付款',
					icon: 'icon-wallet_fill',
				},
				{
					name: '待收货',
					icon: 'icon-import',
				},
				{
					name: '会员等级',
					icon: 'icon-VIP',
				},
				{
					name: '积分',
					icon: 'icon-icon-integral',
				},
				{
					name: '余额',
					icon: 'icon-money',
				},
				{
					name: '红包/优惠券',
					icon: 'icon-redenvelope-fill',
				},
				{
					name: '现金卡',
					icon: 'icon-creditcard-fill',
				},
			],
			login: {
				title: '温馨提示',
				content: '您需要先登录才能继续您的操作',
			},
			logout: {
				title: '提示信息',
				content: '确定要退出账号吗?',
			},
			isShowLogin: false, // 标识是否显示需要登录的提示信息, 默认不显示
			isShowLogout: false, // 标识是否显示退出账号的提示信息
		}
	},
	computed: {
		...mapState('user', {
			phone: (state) => state.phone,
			isLogin: (state) => state.isLogin,
			loginWay: (state) => state.loginWay,
			avatar: (state) => state.avatar,
			userName: (state) => state.userName,
		}),
		...mapState('profile', {
			isShowLoginSuccessToast: (state) => state.isShowLoginSuccessToast,
			isShowRegisterSuccessToast: (state) =>
				state.isShowRegisterSuccessToast,
		}),
	},
	beforeCreate() {
		console.log('profile beforeCreate')
	},
	created() {
		console.log('profile created')
		if (this.isLogin) {
			this.isShowLogin = false
		} else {
			this.isShowLogin = true
		}
	},
	watch: {
		islogin(newVal) {
			if (newVal) {
				console.log('/profile watch isLogin 数据更改为 ' + newVal)
				this.isShowLogin = false
			} else {
				console.log('/profile watch isLogin 数据更改为 ' + newVal)
				this.isShowLogin = true
			}
		},
	},
	mounted() {},
	onLoad() {
		console.log('profile onLoad')
	},
	onShow() {
		console.log('profile onshow')
		uni.hideTabBar({
			animation: false,
		})
		// 如果检测到登录, 那么关闭登录提示
		if (this.isLogin) {
			this.isShowLogin = false
		} else {
			this.isShowLogin = true
		}

		// 如果已登录, 且isShowLoginSuccessToast为true,代表其是从login.vue页面登录成功后跳转而来, 跳出toast
		if (this.isLogin) {
			// 关闭登录提示
			this.isShowLogin = false
			// 4.toast登录成功信息 当在login页面完成登录逻辑, 跳转profile页面, 初次加载profile页面时, onLoad, onShow都在created之前调用, 无法读取到$refs.uToast属性
			if (this.isShowLoginSuccessToast) {
				if (this.$refs.uToast) {
					this.$refs.uToast.show({
						type: 'success',
						message: '登录成功',
					})
					// 5.显示toast后立刻把这个数据修改为false
				}
				this.toggleLoginSuccessToast(false)
			}
			if (this.isShowRegisterSuccessToast) {
				if (this.$refs.uToast) {
					this.$refs.uToast.show({
						type: 'success',
						message: '注册成功',
					})
				}
				this.toggleRegisterSuccessToast(false)
			}
		}
	},
	// onReady() {
	// 	// 初次加载profile页面, 在beforeMount之后, mounted之前触发
	// 	// this.$refs.uToast.show({
	// 	// 	type: 'success',
	// 	// 	message: '登录成功',
	// 	// 	complete: () => {
	// 	// 		// 5.显示toast后立刻把这个数据修改为false
	// 	// 		this.toggleLoginSuccessToast(false)
	// 	// 	},
	// 	// })
	// },
	onHide() {
		this.isShowLogin = false
		this.isShowLogout = false
	},
	methods: {
		...mapMutations('user', [
			'updatePhone',
			'updateToken',
			'toggleLoginStatus',
			'toggleIsLogin',
		]),
		...mapMutations('profile', [
			'toggleLoginSuccessToast',
			'toggleRegisterSuccessToast',
		]),
		...mapActions('user', ['clearLoginInfo']),
		...mapMutations('shopCart', ['reWriteCartList']),
		handleToLogin() {
			console.log('跳转/login')
			this.$switchPage({pageName:'Login'})
			// uni.navigateTo({
			// 	url: '/pages/Login/Login',
			// })
		},
		confirm() {
			// 同意跳转登录页面
			// uni.navigateTo({
			// 	url: '/pages/Login/Login',
			// })
			this.$switchPage({pageName:'Login'})
		},
		cancel() {
			// 取消即跳转index页面
			// uni.switchTab({
			// 	url: '/pages/Index/Index',
			// })
			this.$switchPage({pageName:'Index'})
		},
		/**
		 * @description: 退出登录
		 */
		handleLogout() {
			// 1.弹出选择窗口
			this.isShowLogout = true
		},
		/**
		 * @description: 确定退出账户
		 *
		 */
		async confirmLogout() {
			// 1.检查登录信息
			let phone = this.phone

			// 1.将vuex中的数据删去, 取消登录状态
			this.clearLoginInfo()
			// 2.将本地的token删掉
			const res_remove = await this.$removeStorage('token').catch(
				(err) => err
			)
			// 3. 不再显示退出提醒
			this.isShowLogout = false
			// 4.删除购物车数据
			this.reWriteCartList([])

			// 6.跳转登录页面
			if (this.loginWay === 'password') {
				// uni.navigateTo({
				// 	url: `/pages/Login/Login?tabCur=1&phone=${phone}`,
				// })

				this.$switchPage({pageName:'Login',options:`tabCur=1&phone=${phone}`})
			} else {
				// uni.navigateTo({
				// 	url: `/pages/Login/Login`,
				// })
				this.$switchPage({pageName:'Login'})
			}
			// 5.isShowLogin为true
			this.isShowLogin = true
		},
		cancelLogout() {
			// 1.隐藏显示
			this.isShowLogout = false
		},
	},
}
</script>

<style lang="css">
@font-face {
  font-family: "iconfont"; /* Project id 3723869 */
  src: url('//at.alicdn.com/t/c/font_3723869_ede6b37s1f.woff2?t=1666497788347') format('woff2'),
       url('//at.alicdn.com/t/c/font_3723869_ede6b37s1f.woff?t=1666497788347') format('woff'),
       url('//at.alicdn.com/t/c/font_3723869_ede6b37s1f.ttf?t=1666497788347') format('truetype');
}

.iconfont {
  font-family: "iconfont" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.icon-icon-integral:before {
  content: "\e644";
}

.icon-creditcard-fill:before {
  content: "\e860";
}

.icon-money:before {
  content: "\e607";
}

.icon-import:before {
  content: "\e600";
}

.icon-wallet_fill:before {
  content: "\e779";
}

.icon-redenvelope-fill:before {
  content: "\e820";
}

.icon-dingdanorder-fill:before {
  content: "\e7be";
}

.icon-VIP:before {
  content: "\e638";
}

</style>
<style lang="scss">
.profile-container {
	width: 100%;
	height: 100vh;
	background-color: #fff;

	& > .profile-content {
		width: 100%;
		height: calc(100% - 113.5rpx - 120rpx);
		position: relative;

		& > .bg {
			width: 100%;
			height: 50%;
			background-color: #eeeeee;
		}

		& > .info-container {
			width: 100%;
			height: 60%;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			background-color: #fff;
			// border: 1px solid black;
			// background-color: red;
			padding-top: 114rpx;
			text-align: center;

			& > .avatar-container {
				width: 208rpx;
				height: 208rpx;
				border-radius: 50%;
				border: 4px solid #c4c4c4;
				position: absolute;
				top: 0;
				left: 50%;
				transform: translate(-50%, -50%);
				background-color: #fff;

				& > .avatar {
					width: 100%;
					height: 100%;
					border-radius: 50%;
				}

				& > .user-level-mark {
					width: 57rpx;
					height: 57rpx;
					line-height: 57rpx;
					text-align: center;
					background-color: #ffe32a;
					position: absolute;
					bottom: 0;
					right: 0;
					border-radius: 50%;
					// transform: translate(50%, 50%);
				}
			}

			& > .phone {
				font-size: 30rpx;
				font-weight: 600;
			}

			& > .switch-account {
				margin-top: 20rpx;
				color: #8d8d8d;
				font-size: 24rpx;
				font-weight: 1000;

				& > .icon {
					transform: rotateZ(-90deg);
				}
			}

			& > .nav-container {
				width: 100%;
				height: 406rpx;
				border-bottom: 1px solid #e9e9e9;
				position: absolute;
				bottom: 0;
				display: flex;
				flex-wrap: wrap;

				& > .item {
					width: 25%;
					height: 202rpx;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: space-evenly;
					border-left: 1rpx solid #e9e9e9;

					&:nth-of-type(1),
					&:nth-of-type(5) {
						border-left: none;
					}

					& .item-icon {
						font-size: 64rpx;
						color: #888888;
					}

					& .item-title {
						font-size: 24rpx;
						color: #888888;
					}
				}
			}
		}
	}

	::v-deep .u-modal__content__text {
		text-align: center;
	}

	::v-deep .u-modal__button-group__wrapper--cancel {
		background-color: #857a72;
	}

	::v-deep .u-modal__button-group__wrapper--confirm {
		background-color: #ffe32a;
	}

	::v-deep .u-modal__button-group__wrapper {
		height: 75rpx;
	}
}
</style>
