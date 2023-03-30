<template>
	<view class="root">
		<nav-custom></nav-custom>
		<scroll-view scroll-y @scroll="handleScroll" :scroll-into-view="scrollIntoView" scroll-with-animation class="scroll-container" show-scrollbar>
			<view class="content">
				<view id="top"></view>
				<swiper indicator-dots class="banner" circular>
					<swiper-item v-for="item in 2" @click="handleGoBanner(item.link)" :key="item">
						<image src="/static/images/index.jpg" class="header-img" mode="aspectFill" @load="handleImg"></image>
					</swiper-item>
				</swiper>
				<view class="go-top" v-show="isShow" @click="goTop">
					<text class="cuIcon-top"></text>
				</view>
			</view>
			<good-show v-for="(item, index) in indexData" :goods="item" :key="index" v-if="indexData.length>0"></good-show>
			<view v-if="indexData.length===0">
				<index-skeleton v-for="item in 4" :key="item"></index-skeleton>
			</view>
			<view class="info-container">
				<image src="/static/images/logo2.png" class="foot-logo"></image>
				<image src="/static/images/wx_code.jpg" class="wx-code"></image>
				<view class="icon-container">
					<view class="icon-box">
						<text class="cuIcon-weibo icon"></text>
					</view>
					<view class="icon-box">
						<text class="cuIcon-weixin icon"></text>
					</view>
				</view>
				<text class="footer-info">
					<p>
						Copyright © 2012-2022 上海卡法电子商务有限公司 版权所有
					</p>
					<a href="http://beian.miit.gov.cn" target="_blank">沪ICP备12022075号</a>
					<a href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=31010702005582" target="_blank">沪公网安备31010702005582号</a>
				</text>
			</view>
		</scroll-view>
		<u-toast ref="uToast" duration="1000"></u-toast>
		<u-notify ref="uNotify"></u-notify>
		<u-loading-page :loading="isShowLoading" id="indexLoadingPage" loading-color="#000000" icon-size="100rpx" color="#000"></u-loading-page>
		<!-- 底部导航栏 -->
		<footer-tab :curIdx="0"></footer-tab>
	</view>
</template>

<script>
import goodShow from '@/components/goodShow/goodShow.vue'
import indexSkeleton from '@/components/IndexSkeleton/IndexSkeleton.vue'
import { mapState, mapActions, mapMutations } from 'vuex'
export default {
	name: 'index',
	data() {
		return {
			isShow: false,
			scrollIntoView: '',
			isShowLoading: false, // 标识是否显示加载页, 默认false
		}
	},
	computed: {
		...mapState({
			access_token: (state) => state['access_token'],
			indexData: (state) => state.index.indexData,
			token: (state) => state.token,
			loginObj: (state) => state.user.loginObj,
			autoLoginToast: (state) => state.index.autoLoginToast,
		}),
	},
	methods: {
		// module/index.js 中的actions
		...mapMutations('index', ['reWriteAutoLoginToast']),
		...mapActions('index', ['getIndexData']),

		handleScroll(ev) {
			this.scrollIntoView = ''
			this.isShow = ev.detail.scrollTop >= 500
		},
		// 点击跳转到指定位置
		goTop() {
			this.scrollIntoView = 'top'
		},
		handleGoBanner() {
			uni.navigateTo({
				url: '',
			})
		},
		handleImg(e) {
			console.log(e)
		},
	},
	onShow() {
		console.log('index onshow')
		uni.hideTabBar({
			animation: false,
		})
	},
	onLoad() {
		console.log('index onload')
	},

	async created() {
		console.log('index created')
		// 购物车卡片处理逻辑完毕接收到服务器的信息, 无论成功与否都关闭购物车卡片; 或者购物车卡片点击了取消按钮
		this.$bus.$on('hiddenShopCartCard', () => {
			this.isShowLoading = false
		})
		// 购物车卡片点击确定后成功修改数据库数据
		this.$bus.$on('addShopCartSuccess', (msg) => {
			console.log('add success')
			this.isShowLoading = false
			this.$toast('success', msg)
		})
		// 购物车卡片点击确定后修改数据库数据失败
		this.$bus.$on('addShopCartFail', (msg) => {
			console.log('add fail')
			this.isShowLoading = false
			this.$toast('error', msg)
		})
		// 购物车卡片点击确定按钮, 无论结果如何都显示加载页面
		this.$bus.$on('showLoadingPage', () => {
			this.isShowLoading = true
		})
		// 监听全局总线showToast事件
		this.$bus.$on('showToast', (obj) => {
			const { type, msg } = obj
			this.$toast(type, msg)
		})
		// 获取indexData
		const res_indexData = await this.getIndexData().catch((err) => err)
		this.isShowLoading = false
		if (res_indexData.code !== 1) {
			this.$toast('error', res_indexData.msg || '获取indexData出错')
		}
	},
	mounted() {
		// 1.检查vuex中access-token是否存在数据
		// if (JSON.stringify(this.access_token) === '{}') {
		// 	// 1.1 数据不存在即代表更新数据失败
		// 	return this.$refs.uToast.show({
		// 		type: 'error',
		// 		message: 'access-token无效',
		// 	})
		// }

		// 报错: 登录完成后, 服务器返回数据, 但是此时mounted在服务器返回数据前已完成调用, 无法因此读取不到autoLoginToast数据
		if (Object.keys(this.autoLoginToast).length === 0) {
			return console.error(
				'index.vue:自动登录出现错误, index.vue页面找不到toast信息, 可能情况是在index.vue的mounted调用之前, 服务器未返回自动登录的数据'
			)
		}

		if (this.autoLoginToast.code === 1) {
			 this.$notify('success', this.autoLoginToast.msg, {top:'120rpx'})
			return this.reWriteAutoLoginToast({})
		} else if (this.autoLoginToast.code === 0) {
			if (this.autoLoginToast.msg) {
				this.$notify('error', this.autoLoginToast.msg,{top:'200rpx'})
				return this.reWriteAutoLoginToast({})
			}
		}
	},

	components: {
		goodShow,
		indexSkeleton,
	},

	watch: {
		isLogin(newVal) {
			console.log('isLogin切换')
			// 1.检查isLogin数据是否为true, true代表自动登录成功, 跳出toast
			console.log('isLogin:' + newVal)
		},
		autoLoginToast(newVal) {
			console.log(
				`%c index.vue:检测到autoLoginToast数据变更为以下数据`,
				'padding:2px 4px;color:yellow;background-color:green'
			)
			console.log(newVal)
			if (Object.keys(newVal).length === 0) {
				return
			}
			if (newVal.code === 1) {
				// this.$toast('success', newVal.msg)
				this.$notify('success',newVal.msg)
				this.reWriteAutoLoginToast({})
			}
		},
	},
}
</script>

<style lang="scss" scoped>
.root {
	width: 100%;
	background-color: #fff;

	& > .scroll-container {
		width: 100%;
		height: calc(100vh - 120rpx - 113.5rpx);
		box-sizing: border-box;
		overflow: hidden;

		::-webkit-scrollbar {
			/*滚动条整体样式*/
			width: 4px !important;
			height: 1px !important;
			overflow: auto !important;
			background: #ccc !important;
			-webkit-appearance: auto !important;
			appearance: auto;
			appearance: auto;
			display: block;
		}

		::-webkit-scrollbar-thumb {
			/*滚动条里面小方块*/
			border-radius: 10px !important;
			box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2) !important;
			background: #7b7979 !important;
		}

		::-webkit-scrollbar-track {
			/*滚动条里面轨道*/
			// box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2) !important;
			// border-radius: 10px !important;
			background: #fff !important;
		}

		& .content {
			width: 100%;
			height: auto;

			& > .banner {
				width: 100%;
				height: 790upx;
				overflow: hidden;

				& image {
					width: 100%;
					height: 100%;
				}
			}

			& > .go-top {
				width: 100rpx;
				height: 100rpx;
				background-color: #fff;
				box-shadow: 2rpx 2rpx 2rpx 2rpx #ccc;
				border-radius: 50%;
				position: fixed;
				bottom: 150rpx;
				right: 30rpx;
				z-index: 10;
				line-height: 100rpx;
				text-align: center;
				color: #000;
				font-size: 36rpx;
			}
		}

		& .info-container {
			width: 100%;
			height: 750rpx;
			background-color: #000;
			display: flex;
			flex-direction: column;
			align-items: center;
			position: relative;
			margin-top: 30rpx;

			& > .foot-logo {
				width: 225rpx;
				height: 32rpx;
				margin: 112.5rpx 0 60rpx;
			}

			& > .wx-code {
				width: 225rpx;
				height: 225rpx;
				margin-bottom: 60rpx;

				// position: absolute;
				// top: 50%;
				// left: 50%;
				// transform: translate(-50%, -50%);
			}

			& > .icon-container {
				width: 225rpx;
				height: 75rpx;
				display: flex;
				justify-content: space-around;

				& > .icon-box {
					width: 75rpx;
					height: 75rpx;
					background-color: #fff;
					text-align: center;
					line-height: 75rpx;
					border-radius: 50%;

					& > .icon {
						font-size: 48rpx;
					}
				}
			}

			& > .footer-info {
				font-size: 15rpx;
				color: #9c9c9c;
				text-align: center;
				margin-top: 33.75rpx;

				a:link {
					color: #9c9c9c;
				}
			}
		}
	}

	&::v-deep #indexLoadingPage {
		z-index: 10090;
		background-color: rgba(0, 0, 0, 0.2) !important;
	}
}
</style>
