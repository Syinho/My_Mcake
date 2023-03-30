<template>
	<view class="categorys-container">
		<nav-custom></nav-custom>
		<scroll-view scroll-x class="bg-white nav" style="position: relative;z-index:10;">
			<view class="flex text-center">
				<view class="cu-item flex-sub" :class="item.bid == bid ? 'text-black cur' : 'text-grey'" v-for="(item, index) in categorys" :key="index" @tap="tabSelect" :data-bid="item.bid" :data-index="index">
					{{ item.bname }}
				</view>
			</view>
		</scroll-view>
		<scroll-view scroll-y class="bg-white scroll-view-container" show-scrollbar @scrolltolower="loadMore" :scroll-into-view="isGoTop ? 'top' : ''" @scroll="handleScroll">
			<view class="good-content">
				<view id="top"></view>
				<view class="item-container" v-for="(item) in curGoods">
					<good-item :key="item.id" :good="item"></good-item>
				</view>
				<!-- 当goods.length为奇数时, 用于占位 -->
				<view class="placeholder" style="width: 352rpx; height: 352rpx; background-color: transparent" v-if="curGoods.length % 2 !== 0">
				</view>
			</view>
			<view class="cu-load bg-white text-black" :class="isAllowLoad ? 'loading' : 'over'" v-if="!isShowLoadError&&curGoods.length>0"></view>
			<view class="cu-load bg-red erro" v-if="isShowLoadError"></view>
			<u-toast ref="uToast"></u-toast>
			<u-loading-page :loading="isShowLoading" class="loading-page" color="#000" :bgColor="'rgba(255,255,255,0.1)'" iconSize="80rpx" loadingColor="#000" loadingText=""></u-loading-page>
		</scroll-view>
		<footer-tab :curIdx="1"></footer-tab>
	</view>
</template>

<script>
import GoodItem from '@/components/GoodItem/GoodItem.vue'
import FooterTab from '../../components/FooterTab/FooterTab.vue'
import { mapActions, mapState, mapMutations } from 'vuex'
export default {
	name: 'categorys',

	data() {
		return {
			scrollLeft: 0,
			isShowLoadError: false, // 标识是否显示加载错误图标
			isGoTop: false, // 标识scroll-view是否回到顶端
			isShowLoading: false, // 标识是否显示加载页, 默认false
		}
	},
	/**
	 * @description: 加载categorys种类数据, 然后初始化bid数据, 初始显示categorys数据第一位, 根据bid数据再请求page为1的商品数据
	 */
	async onLoad() {
		console.log('categorys onLoad')
		uni.hideTabBar({
			animation: false,
		})
		// 1. 获取categorys数据
		const resCategorys = await this.chkTokenAndGetCategorys().catch(
			(err) => err
		)
		console.log(resCategorys)
		// 2.根据categorys数据来进行数据初始化
		if (resCategorys.code === 1) {
			// 2.1 将bid数据设置为当前categorys第一个对象的bid
			const categorys = resCategorys.data
			this.updateBid(categorys[0].bid)
			// 2.2 将count数据设置为当前categorys第一个对象的num
			this.updateCount(categorys[0].num)
			// 2.3 根据已保存的bid向服务器请求goods数据
			const resGoods = await this.chkTokenAndGetGoodsByBidAndPage()
			// 2.4 判定数据
			if (resGoods.code === 1) {
				// 2.4.1 获取数据成功,更新数据到vuex
				this.updateCurGoods(resGoods.data.list)
			} else {
				// 2.4.2 获取数据失败
				this.$refs.uToast.show({
					type: 'error',
					icon: false,
					message: resGoods.msg,
					complete() {
						// 3.1 弹出提示后将底部提示栏修改为加载失败
						this.isShowLoadError = true
					},
				})
			}
		} else {
			// 3.categorys数据获取失败,toast弹出提示
			this.$refs.uToast.show({
				type: 'error',
				icon: false,
				message: resCategorys.msg,
				complete: () => {
					// 3.1 弹出提示后将底部提示栏修改为加载失败
					this.isShowLoadError = true
				},
			})
		}
	},
	beforeCreate() {
		console.log('categorys beforeCreate')
	},
	created() {
		console.log('categorys created')
		// 购物车卡片处理逻辑完毕接收到服务器的信息, 无论成功与否都关闭购物车卡片; 或者购物车卡片点击了取消按钮
		this.$bus.$on('hiddenShopCartCard', () => {
			this.isShowLoading = false
		})
		// // 购物车卡片点击确定后成功修改数据库数据
		if (this.curGoods.length === 0) {
			this.isShowLoading = true
		}
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
		this.$bus.$on('showLoadingPage', () => {
			this.isShowLoading = true
		})
	},
	/**
	 * @description: 禁止显示默认导航栏
	 */
	onShow() {
		console.log('categorys onShow')
	},
	computed: {
		...mapState('categorys', {
			categorys: (state) => state.categorys,
			curGoods: (state) => state.curGoods,
			bid: (state) => state.bid,
			page: (state) => state.page,
			count: (state) => state.count,
		}),
		// 标识当前是否还能够加载更多商品, true表示可以加载更多, false表示已加载完毕
		isAllowLoad() {
			return this.curGoods.length < this.count
		},
		// isShowLoading(){
		// 	return this.curGoods.length===0
		// }
	},
	watch: {
		curGoods(newVal) {
			if (newVal.length === 0) {
				this.isShowLoading = true
			} else {
				this.isShowLoading = false
			}
		},
	},

	methods: {
		// 注册categorys模块的actions
		...mapActions('categorys', [
			'chkTokenAndGetCategorys',
			'chkTokenAndGetGoodsByBidAndPage',
		]),
		...mapMutations('categorys', [
			'updateCurGoods',
			'updateBid',
			'updatePage',
			'updateCount',
		]),
		/**
		 * @description: 点击切换navTab, 即修改bid数据
		 * @param {*} e
		 */
		async tabSelect(e) {
			const tabBid = Number(e.currentTarget.dataset.bid)
			// 0. 检查点击的tab的bid值是否是当前vuex的bid值, 是的话跳出
			if (tabBid === this.bid) {
				return
			} else {
				// 0.1 当前的CurGoods清零
				this.updateCurGoods([])
			}
			// 1.将bid修改为当前导航项的bid属性
			this.updateBid(tabBid)
			// 2.将page数据修改为1, 默认最开始只显示第一页的数据
			this.updatePage(1)
			// 3.计算navTab的偏移距离
			this.scrollLeft = (e.currentTarget.dataset.index - 1) * 60
			// 4.令scroll-view滚动到顶端
			this.isGoTop = true
			// 5.根据设置的bid获取相应的初始数据(即第一页数据)
			const resGoods = await this.chkTokenAndGetGoodsByBidAndPage()
			// 6.根据获取的数据来修改curGoods数据
			if (resGoods.code === 1) {
				// 6.1 获取数据成功
				const data = resGoods.data
				// 6.2 更新curGoods的数据
				this.updateCurGoods(data.list)
				// 6.3 更新数据长度信息
				this.updateCount(data.count)
			} else {
				// 6.3 获取数据失败
				this.$refs.uToast.show({
					type: 'error',
					icon: false,
					message: resGoods.msg,
					complete() {
						// 3.1 弹出提示后将底部提示栏修改为加载失败
						this.isShowLoadError = true
					},
				})
			}
		},
		/**
		 * @description: 下滑过程中加载更多的数据
		 */
		async loadMore() {
			// 1.检查当前数据是否超过了总量数据长度 ,或者获取数据出错, 如果超过或出错, 跳出函数
			if (!this.isAllowLoad || this.isShowLoadError) {
				return
			}
			// 2.可以加载, 更新page
			let page = this.page + 1
			this.updatePage(page)
			// 3.根据page与bid数据向服务器请求数据
			const resGoods = await this.chkTokenAndGetGoodsByBidAndPage()
			// 4.判断数据
			if (resGoods.code === 1) {
				// 4.1 更新curGodds数据
				const data = resGoods.data
				const list = [].concat(this.curGoods, data.list)
				this.updateCurGoods(list)
			} else {
				// 4.2 获取数据失败, 跳出toast, 并禁止继续加载
				this.$refs.uToast.show({
					type: 'error',
					icon: false,
					message: resGoods.msg,
					complete() {
						// 4.2.1 弹出提示后将底部提示栏修改为加载失败
						this.isShowLoadError = true
					},
				})
			}
		},
		/**
		 * @description: 触发滑动的第一件事就是将跳转顶部el的id修改为''
		 */
		handleScroll() {
			this.isGoTop = false
		},
	},

	components: {
		GoodItem,
		FooterTab,
	},
}
</script>

<style lang="scss" scoped>
.categorys-container {
	height: 100vh;
	background-color: #fff;

	.scroll-view-container {
		height: calc(100vh - 90rpx - 120rpx - 113.5rpx);

		::-webkit-scrollbar {
			/*滚动条整体样式*/
			width: 4px !important;
			height: 1px !important;
			overflow: auto !important;
			background: #ccc !important;
			-webkit-appearance: auto !important;
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
			background: #ffffff !important;
		}

		.good-content {
			width: 100%;
			height: auto;
			display: flex;
			flex-wrap: wrap;
			justify-content: space-around;
			& > .item-container {
				width: 49%;
				height: 510rpx;
			}
		}
	}


	::v-deep .loading-page {
		// background-color: rgba(255,255,255,0.8) !important;
		z-index: 10096 !important;
	}

	// &::v-deep .u-loading-page{
	// 	position: fixed;
	// 	width: 100%;
	// 	height: calc(100vh - 120rpx);
	// }
}
</style>
