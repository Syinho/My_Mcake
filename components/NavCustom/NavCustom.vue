<template>
	<view class="nav-container">
		<view class="cu-bar bg-white">
			<view class="action" v-if="!isShowBack">
				<text class=" text-gray cuIcon-locationfill"></text>上海市
			</view>
			<view class="action" v-if="isShowBack" @click="handleBack">
				<text class="text-gray cuIcon-back"></text>
			</view>
			<view class="content text-bold" @click="goToIndex">
				<image src="/static/images/header.png" mode="aspectFit" @click="handle"></image>
			</view>
			<view class="action text-gray right-bar">
				<!-- 首页,分类显示搜索按钮 -->
				<text class="cuIcon-search" v-if="!isCartShow"></text>
				<!-- 购物车, 个人主页显示商品按钮 -->
				<text class="cuIcon-cart" v-if="isCartShow" @click="goToShopCart"></text>
				<view class="num" v-if="isCartShow && cartList.length > 0">{{ cartList.length }}</view>
				<u-line direction="col" length="15" margin="20rpx 20rpx"></u-line>
				<text class="cuIcon-sort" @click="handleShowMenu"></text>
			</view>
		</view>
		<uni-transition mode-class="slide-top" :show="isMenuShow" class="header-menu">
			<header-menu></header-menu>
		</uni-transition>
		<u-overlay :show="isMenuShow" @click="cancelShowMenu" :duration="400" :class="['shadow',!isShowBack ? 'shadow-address' : 'shadow-login']">
		</u-overlay>
	</view>
</template>

<script>
import HeaderMenu from '../HeaderMenu/HeaderMenu.vue'
import { mapState, mapMutations } from 'vuex'
export default {
	name: 'navCustom',
	data() {
		return {
			isMenuShow: false, // 标识头部菜单显示/隐藏
			isCartShow: false, // 标识购物车图标是否显示, 只有在shopCart, profile页面显示
			isShowBack: false, // 标识是否显示回退按钮, 只有在login, register,detail显示
			createdCall: false, // 如果进入非tabbar页面, 会主动调用created, 但是再次进入tabbar页面只会调用onShow
		}
	},
	computed: {
		...mapState({
			prevPage: (state) => state.prevPage,
			cartList: (state) => state.shopCart.cartList,
		}),
	},
	created() {
		// 1.获取当前路由
		this.createdCall = true
		let routes = getCurrentPages() // 获取当前路由数组
		let curRoute = String(routes[routes.length - 1].route)
		// console.log(curRoute)
		// 2. 判断路由: 当路由为 pages/profile/profile 或者pages/detail/detail 时, 显示购物车图标, 其它显示搜索图标
		// 2.1 对字符串进行处理
		let path = curRoute.slice(curRoute.lastIndexOf('/') + 1)
		console.log(
			'%c navCustom.vue:触发created函数, 现在所在的页面是' + path,
			'color:white;background-color:black;padding:2px 4px;'
		)
		// console.log(path)
		// 2.2 检查路由
		if (
			[
				'Detail',
				'Profile',
				'ShopCart',
				'Address',
				'OrderForm',
				'MapAddress',
			].includes(path)
		) {
			console.log('购物车图标显示')
			this.isCartShow = true
		}
		if (
			[
				'Login',
				'Register',
				'Detail',
				'ShopCart',
				'Address',
				'OrderForm',
				'MapAddress',
			].includes(path)
		) {
			console.log('返回图标显示')
			this.isShowBack = true
		}
	},
	methods: {
		...mapMutations(['updatePrevPage']),
		/**
		 * @description: 点击菜单按钮, 显示/隐藏头部菜单
		 */
		handleShowMenu() {
			this.isMenuShow = !this.isMenuShow
			// this.isShadowShow = !this.isShadowShow
		},
		/**
		 * @description: 点击遮罩, 取消遮罩与菜单的显示
		 */
		cancelShowMenu() {
			this.isMenuShow = false
			// this.isShadowShow = false
		},
		/**
		 * @description: 返回上一页
		 */
		handleBack() {
			if (this.prevPage) {
				if (this.prevPage === 'Detail') {
					this.$switchPage({ pageName: 'Index' })
				} else {
					this.$switchPage({ pageName: this.prevPage })
				}
				this.updatePrevPage('Index')
			}
			// if (['index', 'categorys','shopCart', 'profile'].includes(this.prevPage)) {
			// 	uni.switchTab({
			// 		url: `/pages/${this.prevPage}/${this.prevPage}`
			// 	})
			// } else {
			// 	uni.navigateBack()
			// }
		},
		goToShopCart() {
			let routes = getCurrentPages() // 获取当前路由数组
			let curRoute = String(routes[routes.length - 1].route)
			let path = curRoute.slice(curRoute.lastIndexOf('/') + 1)
			console.log('当前页面为' + path)

			if (path === 'shopCart') {
				console.log('当前位于shopCart')
				return
			}
			this.updatePrevPage(path)
			uni.switchTab({
				url: '/pages/ShopCart/ShopCart',
			})
		},
		goToIndex() {
			console.log('index')
			uni.switchTab({
				url: '/pages/index/index',
			})
		},
		handle() {
			console.log('handle')
		},
	},
	components: {
		HeaderMenu,
	},
}
</script>

<style lang="scss" scoped>
.nav-container {
	width: 100%;
	height: 120rpx;
	position: relative;
	z-index: 10080;
	transform: translate(0, 0);
	// @include bottomLine();

	.cu-bar {
		width: 100%;
		height: 100%;
		z-index: 10080;

		& > .right-bar {
			position: relative;

			& .num {
				width: 35rpx;
				height: 35rpx;
				background-color: #ffe32a;
				position: absolute;
				top: 30rpx;
				left: 10rpx;
				border-radius: 50%;
				color: #000;
				text-align: center;
				line-height: 35rpx;
				transform: translateX(15rpx);
			}
		}

		image {
			width: 178rpx;
			height: 27rpx;
		}
	}

	.header-menu {
		width: 100%;
		height: 213rpx;
		position: relative;
		z-index: 10072;
	}

	.shadow {
		width: 100%;
		position: fixed;
		top: 120rpx !important;
		left: 0;
		z-index: 100;
	}

	.shadow-address {
		height: calc(100vh - 113.5rpx - 120rpx);
	}

	.shadow-login {
		height: calc(100vh - 120rpx);
	}
}
</style>
