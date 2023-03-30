<template>
	<view class="detail-container">
		<scroll-view class="scroll-view-container" scroll-y show-scrollbar v-if="JSON.stringify(goodData) !== '{}'">
			<nav-custom class="nav-custom"></nav-custom>
			<swiper indicator-dots circular class="swiper" :indicator-active-color="'#ffe32a'" :indicator-color="'#FFFFFF'" v-if="JSON.stringify(goodData) !== '{}'">
				<swiper-item v-for="(item, index) in goodData.pic.list" item-id="index" :key="index">
					<image :src="goodData.pic.url + item.m" class="swiper-img"></image>
				</swiper-item>
			</swiper>
			<view class="content-container">
				<view class="title">
					<text class="title_c">{{ goodData.name }}</text>
					<text class="title_f">{{ goodData.french }}</text>
				</view>
				<ul class="select-size">
					<li class="item" v-for="(item, index) in goodData.list" :key="index" :style="{ width: itemWidth }" :class="{ active: item.id == goodData.id }" :data-id="item.id" @click="switchItem">
						<span>{{ item.spec }}</span>
						<span>{{ item.weight }}</span>
						<span>{{ item.edible }}</span>
					</li>
				</ul>
				<view class="price detail">
					<text>¥ {{ goodData.price }}</text>
				</view>
				<view class="size-and-tableware detail">
					<text class="cuIcon-tag icon"></text>
					<text>约{{ goodData.size }}</text>
					<text class="cuIcon-presentfill icon"></text>
					<text v-if="!(JSON.stringify(goodData.fittings) === '{}' || goodData.fittings.length === 0)">含{{
                        goodData.fittings['51'].num + goodData.fittings['51'].uname + goodData.fittings['51'].name
                    }}</text>
				</view>
				<view class="tag-container" v-if="tagList">
					<view class="tags detail">
						<text class="cuIcon-tag icon"></text>
						<text v-for="(item, index) in tagList" :key="index" class="tag">{{ item }}</text>
						<view class="clearfix"></view>
					</view>
				</view>
				<view class="hint detail" v-if="goodData.bcid === 1">
					<text class="cuIcon-warn icon"></text>
					<text>蛋糕若不及时食用, 请放置0-10℃冷藏</text>
				</view>
				<view class="introduce detail">
					<text>{{ goodData.brief }}</text><br>
					<text>{{ goodData.frenchBrief }}</text>
				</view>
				<view class="promotion detail">
					<view class="promotion-left">促销</view>
					<view>
						<text class="promotion-attention">换购</text>
						<text>买蛋糕可至购物车参加优惠换购</text>
					</view>
					<view>详情<text class="cuIcon-right"></text></view>
				</view>
				<scroll-view scroll-x class="bg-white nav detail">
					<view class="flex text-center">
						<view class="cu-item flex-sub" :class="index == tabCur ? 'text-black cur' : ''" v-for="(item, index) in goodDetail" :key="index" @tap="tabSelect" :data-id="index">
							{{ item }}
						</view>
					</view>
				</scroll-view>
				<view class="good-info">
					<!-- 商品基本信息 -->
					<keep-alive>
						<view class="basic-info" v-show="goodData.basic && tabCur === 0">
							<view v-for="(item, index) in goodData.basic.list" :key="index" class="basic-info-item">
								<view class="name">{{ item.french }} {{ item.name }}</view>
								<view class="value">{{ item.value }}</view>
							</view>
						</view>
					</keep-alive>
					<!-- 评论 -->
					<keep-alive>
						<view class="good-comment" v-if="tabCur === 1&&cmts.length>0">
							<comment v-for="(item, index) in cmts" :key="index" :comment="item" :loading="loading"></comment>
							<view class="pagination" v-if="cmts.length>0">
								<button class="pagination-btn switch" @tap="handleCmt('substract')" :disabled="curCmtPage === 1">上一页</button>
								<!-- 第一页按钮, 当前为第一页时不予显示 -->
								<button class="pagination-btn num" v-if="curCmtPage !== 1" @tap="handleCmt(1)">1</button>
								<text v-if="curCmtPage !== 1">...</text>
								<!-- 其它页按钮, 包括第一页与尾页, 当出现第一页与尾页时不显示预设的第一页与尾页 -->
								<button class="pagination-btn num" v-for="(item, index) in 5" :key="index" :class="[item === 1 ? 'active' : '']" @tap="handleCmt(curCmtPage + item - 1)">{{ curCmtPage+ item - 1 }}</button>
								<button class="pagination-btn switch" @tap="handleCmt('add')" :disabled="curCmtPage === commentPage">下一页</button>
							</view>
						</view>
						<!-- <view class="req-cmt-error" v-if="isShowCmtsErrCom">
                            <u--text text="请求评论失败,点击刷新重试" type="error"></u--text>
                            <u-button type="primary" @tap="reReqCmt" :loading="!isReqBtnAbled" :disabled="isReqBtnAbled" loadingText="加载中"
                                size="large">点击重新请求</u-button>
                        </view> -->
					</keep-alive>
					<!-- 商品详细信息图片 -->
					<keep-alive>
						<image class="good-detail" :src="detailImgSrc" v-show="goodData.details && tabCur === 2" lazy-load mode="widthFix"></image>
					</keep-alive>
				</view>

				<view id="bottom"></view>
			</view>
			<!-- 立即购买与加入购物车按钮 -->
			<view class="btns-container">
				<u-row class="row" gutter="10">
					<u-col span="6">
						<!-- 立即购买, 加入购物车后跳转shopcart -->
						<u-button color="#857A72" text="立即购买" class="btn" @click="buy"></u-button>
					</u-col>
					<u-col span="6">
						<!-- 加入购物车仅仅加入购物车 -->
						<u-button color="#FFE32A" text="加入购物车" class="btn" @click="putInCart"></u-button>
					</u-col>
				</u-row>
			</view>
		</scroll-view>

		<!-- toast信息提示 -->
		<u-toast ref="uToast" />
		<!-- 模态框 -->
		<u-modal :show="isShowModel" title="温馨提示" content='您需要先登录才能继续您的操作' @confirm="confirm" @cancel="cancel" @close="cancel" :closeOnClickOverlay="true" confirmText="立即登录" cancelText="以后再说" :showCancelButton="true" confirmColor="#000" cancelColor="#fff"></u-modal>
		<u-loading-page :loading="loadingPage.loading" :color="loading.color" :bgColor="loading.bgColor" :iconSize="loading.iconSize" :loadingColor="loading.loadingColor" :loadingText="loading.loadingText"></u-loading-page>
	</view>
</template>

<script>
import { reqDetail, reqComment, reqAddShopCart } from '../../utils/api'
import { mapState, mapMutations, mapActions } from 'vuex'
import comment from '../../components/comment/comment.vue'
export default {
	name: 'UniappDemoDetails',
	data() {
		return {
			tabCur: 2,
			goodDetail: ['基本信息', '商品点评', '商品详情'],
			curCmtPage: 1, // 当前评论是第几页
			preCmtPage: 1,
			loading: false, // 评论区是否显示骨架屏
			isShowCmtsErrCom: false, // 向服务器请求评论失败, 显示错误页面
			isReqBtnAbled: true, // 标识重新请求评论按钮是否可用
			isShowModel: false, // 标识是否显示模态框
			loadingPage: {
				loading: false,
				color: '#000',
				bgColor: 'rgab(255,255,255,0.1)',
				iconSize: '80rpx',
				loadingColor: '#000',
				loadingText: '',
			},
		}
	},
	computed: {
		...mapState('detail', {
			goodData: (state) => state.goodData,
			cmts: (state) => state.cmts,
			cmtCounts: (state) => state.cmtCounts,
		}),
		...mapState('user', {
			isLogin: (state) => state.isLogin,
			userId: (state) => state.userId,
		}),
		itemWidth() {
			let list = this.goodData.list
			return 100 / list.length + '%'
		},
		tagList() {
			if (this.goodData.fname) {
				return this.goodData.fname.split(',')
			} else {
				return false
			}
		},
		detailImgSrc() {
			let reg = /src="(\S+)"/
			if (reg.test(this.goodData.details)) {
				return RegExp.$1
			}
		},
		commentPage() {
			return Math.ceil(this.cmtCounts / this.cmts.length)
		},
	},
	watch: {
		// 1.监视评论区页码更改
		async curCmtPage(newVal, oldVal) {
			// 1.如果前后页码不变, 那么不继续调用代码 多余代码可能?
			if (newVal === oldVal) {
				return
			}
			// 2.如果上一页与现在的页数相同, 那么跳出函数
			if (this.curCmtPage === this.preCmtPage) {
				return
			}

			// 3.清空cmts数据, 使之成为6个空对象的数组; 显示骨架屏
			this.updateComments([{}, {}, {}, {}, {}, {}])
			this.loading = true
			// 4.检查/更新access-token
			const res = await this.chkAndGetToken().catch((err) => err)
			// 5.成功获取access-token向服务器请求新的页码的评论
			if (res.code === 1) {
				const token = res.data['access-token']
				const res_cmt = await reqComment(
					this.goodData.twoId,
					this.curCmtPage,
					token
				).catch((err) => err)
				// 7.检查获取的页码是否获取成功, 成功则保存评论数据并关闭骨架屏, 不成功则弹出提示
				console.log(res_cmt)
				if (res_cmt.code === 1) {
					this.updateComments(res_cmt.data.list)
					this.loading = false
				} else {
					this.curCmtPage = this.preCmtPage
					this.loading = false
					this.toast('errro', '获取评论失败, 请检查服务器')
					this.isShowCmtsErrCom = true
				}
			}
			// 6.获取access-token失败, 获取msg并弹出提示, 评论回到原来的位置
			else {
				this.curCmtPage = this.preCmtPage
				const { msg } = res
				this.toast('error', msg)
			}
		},
	},
	async onLoad(options) {
		// 1.获取商品id
		const { id } = options
		// 2.获取可用的access-token
		const accessTokenObj = await this.chkAndGetToken().catch((err) => err)
		if (accessTokenObj.code === 1) {
			const token = accessTokenObj.data['access-token']
			// 4. 向服务器发起请求, 根据id,access-token获取商品详细数据
			const res_goodData = await reqDetail(id, token).catch((err) => err)
			// 5. 判断响应, 响应成功保存数据到vuex中, 响应失败, 跳出toast, 1500ms后返回商品页
			if (res_goodData.code === 1) {
				this.updateGoodData(res_goodData.data)
			} else {
				this.toast('error', '获取商品数据失败, 检查服务器')
				this.handleErr()
				return
			}
			// 6.获取第一页评论, 响应成功, 保存数据, 响应失败, toast提示并显示错误页面
			const resComment = await reqComment(
				this.goodData.twoId,
				1,
				token
			).catch((err) => err)
			if (resComment.code === 1) {
				this.updateCmtsCounts(resComment.data.count)
				this.updateComments(resComment.data.list)
			} else {
				this.toast('error', '获取评论失败')
				this.isShowCmtsErrCom = true
			}
		} else {
			// 3.获取access-token失败, 弹出toast消息, 1500ms后跳转商品目录页
			this.toast('error', '获取access-token失败, 检查网络连接或服务器')
			this.handleErr()
		}
	},
	onUnload() {
		console.log('detail onUnload')
		// 清空goodData数据, 清空评论数据
		this.updateGoodData({})
		this.updateCmtsCounts(0)
		this.updateComments([])
	},
	methods: {
		...mapMutations('detail', [
			'updateGoodData',
			'updateId',
			'updatePrice',
			'updateSize',
			'updateFittings',
			'updateComments',
			'updateCmtsCounts',
		]),
		...mapActions(['chkAndGetToken']),
		...mapActions('shopCart', ['initShopCart']),
		// 1.选择商品规格按钮点击触发
		switchItem(e) {
			// 1.获取事件对象的触发元素, 以及元素上的sku数据, 并更新goodData的sku属性
			const id = e.currentTarget.dataset.id
            console.log(id)
			// 1.1 检查是否是当前被选中的选项,是的话跳出
			if (id == this.goodData.id) {
				return
			}
			this.updateId(id)
			// 2.根据sku数据获取价格, 然后更新goodData.price数据
            // let food=this.goodData.list.find((item)=>{
            //     return item.id==id
            // })
            // console.log(food)
			this.updatePrice(
               
				this.goodData.list.find((item) => item.id == id).salePrice
			)

			// 3.根据sku数据获取对应的size字符串, fittings(配件)对象, 并更新
			this.updateSize(
				this.goodData.list.find((item) => item.id == id).size
			)
			this.updateFittings(
				this.goodData.list.find((item) => item.id == id).fittings
			)
		},
		tabSelect(e) {
			// 1.根据当前的data-id数据更改tabCur数据
			this.tabCur = e.currentTarget.dataset.id
		},
		handleCmt(valid) {
			if (valid === 'substract') {
				this.preCmtPage = this.curCmtPage--
			} else if (valid === 'add') {
				this.preCmtPage = this.curCmtPage++
			} else if (typeof valid === 'number') {
				this.preCmtPage = this.curCmtPage
				this.curCmtPage = valid
			}
		},
		toast(type, msg) {
			this.$refs.uToast.show({
				title: msg,
				type,
				url: '/pages/detail/detail',
			})
		},
		handleErr() {
			setTimeout(() => {
				// uni.switchTab({
				// 	url: '/pages/categorys/categorys',
				// 	fail() {
				// 		this.toast('error', '跳转页面失败, 检查前端代码')
				// 	},
				// })
				this.$switchPage({ pageName: 'Categorys' })
			}, 1500)
		},
		// 请求评论失败, 点击重新请求评论
		reReqCmt() {},
		// 点击立即购买按钮
		async buy() {
			// 首先检查登录状态, 未登录弹出模态框
			if (!this.isLogin) {
				return (this.isShowModel = true)
			}
			this.loadingPage.loading = true
			// 加入购物车并跳转购物车页面
			const add_goods = await this.addGoodsToShopCart()
			if (add_goods.code === 1) {
				const res_init = await this.initShopCart().catch((err) => err)
				if (res_init.code === 1) {
					this.$switchPage({ pageName: 'ShopCart' })
				} else {
					this.$toast('error', res_init.msg)
				}
			} else {
				this.$toast('error', add_goods.msg)
			}
			this.loadingPage.loading = false
		},
		async putInCart() {
			// 首先检查登录状态, 未登录弹出模态框
			if (!this.isLogin) {
				this.isShowModel = true
			}
			this.loadingPage.loading = true
			const add_goods = await this.addGoodsToShopCart()
			if (add_goods.code !== 1) {
				this.$toast('error', add_goods.msg)
			} else {
				const res_init = await this.initShopCart().catch((err) => err)
				if (res_init.code === 1) {
				} else {
					this.$toast('error', res_init.msg)
				}
			}
			this.loadingPage.loading = false
		},

		async addGoodsToShopCart() {
			const res_accessToken = await this.chkAndGetToken().catch(
				(err) => err
			)
			if (res_accessToken.code === 1) {
				let accessToken = res_accessToken.data['access-token']

				const add_goods = await reqAddShopCart(
					this.userId,
					this.goodData.id,
					this.goodData.count,
					accessToken
				).catch((err) => err)
				return add_goods
				// if(add_goods.code===1){
				//     this.$switchPage({pageName:'ShopCart'})
				// }else{
				//     this.$toast('error',add_goods.msg)
				// }
			} else {
				this.$toast('error', res_accessToken.msg)
			}
		},
        findId(){

        },

		confirm() {
			uni.navigateTo({
				url: '/pages/Login/Login',
			})
		},
		cancel() {
			this.isShowModel = false
		},
	},
	components: {
		comment,
	},
}
</script>

<style lang="scss" scoped>
.detail-container {
	width: 100%;
	height: 100vh;
	background-color: #fff;
	padding-top: 120rpx;
	position: relative;
	// 让.controls-container以父元素为锚点进行fixed
	// transform: scale(1);

	& > .scroll-view-container {
		height: calc(100vh - 120rpx);
		position: relative;
		// border: 1px solid transparent;

		& .nav-custom {
			position: fixed;
			top: 0;
			left: 0;
		}

		& .swiper {
			width: 100vw;
			height: 750rpx;

			& .swiper-img {
				width: 750rpx;
				height: 750rpx;
				will-change: transform;
			}
		}

		& .content-container {
			padding: 15rpx;

			& .title {
				width: 100%;
				color: #000;

				& .title_c {
					font-size: 45rpx;
					line-height: 75rpx;
					margin-top: 15rpx;
					display: block;
					text-align: center;
				}

				& .title_f {
					font-size: 35rpx;
					margin-bottom: 30rpx;
					display: block;
					text-align: center;
				}
			}

			& .select-size {
				width: 100%;
				position: relative;
				padding: 15rpx 0;

				&::after {
					content: '';
					display: block;
					clear: both;
					width: 100%;
					height: 1px;
					background-color: #f0f0f0;
				}

				& > .item {
					float: left;
					padding: 22.5rpx 10rpx;
					background-color: #fff;
					color: #888888;

					&.active {
						background-color: #ffcd20;
						color: #000;
					}

					& > span {
						display: block;
						text-align: center;
					}
				}
			}

			& .price {
				text-align: left;
				font-size: 48rpx;
				color: #000;
				padding: 15rpx 0;
			}

			& .icon {
				margin: 0 10rpx 0 15rpx;
				font-size: 40rpx;
				color: #cbccd7;
			}

			& .size-and-tableware {
				color: #8d8d8d;
				font-size: 24rpx;
				padding: 15rpx 0;
			}

			& .tag-container {
				& .tags {
					font-size: 24rpx;
					padding: 15rpx 0;

					& .icon {
						float: left;
					}

					& .tag {
						color: #000;
						padding: 10rpx 20rpx;
						border: 1px solid #dcdcdc;
						border-radius: 10px;
						margin-left: 10rpx;
						float: left;

						&:nth-of-type(1) {
							margin-left: 0;
						}
					}

					& .clearfix {
						clear: both;
					}
				}
			}

			& .hint {
				color: red;
				font-size: 24rpx;

				& .icon {
					color: red !important;
				}
			}

			::v-deep .hint uni-text,
			::v-deep .tags uni-text,
			::v-deep .size-and-tableware uni-text {
				vertical-align: middle;
			}
		}

		& .introduce {
			font-weight: 400;
			font-size: 24rpx;
			line-height: 40rpx;
			padding: 15rpx 0;
		}

		& .promotion {
			font-size: 24rpx;
			display: flex;
			align-items: center;
			justify-content: space-between;
			color: #8d8d8d;
			padding: 25rpx 0;

			& .promotion-attention {
				padding: 5rpx 15rpx;
				border: 1px solid red;
				border-radius: 15px;
				color: red;
				margin-right: 15rpx;
			}
		}

		& .good-info {
			padding-top: 30rpx;

			& .basic-info {
				& > .basic-info-item {
					display: flex;
					justify-content: space-between;
					align-items: center;
					font-size: 24rpx;

					& > .name {
						color: #8d8d8d;
					}

					// &>.value {}
				}
			}

			& .good-comment {
				& .cmt {
					height: 200rpx;
				}

				& .pagination {
					width: 100%;
					display: flex;
					align-items: center;
					justify-content: center;

					& .pagination-btn {
						height: 50rpx;
						line-height: 50rpx;
						border: 1px solid #8d8d8d;
						background-color: #fff;
						font-size: 15rpx;
						margin-right: 10rpx;

						&.switch {
							width: 100rpx;
						}

						&.num {
							width: 50rpx;
						}

						&:nth-last-of-type(1) {
							margin-right: 0;
						}

						&.active {
							background-color: #ffe32a;
						}
					}
				}
			}

			& .good-detail {
				width: 100%;
			}
		}

		& .detail {
			position: relative;

			&::after {
				content: '';
				display: block;
				width: 100%;
				height: 1rpx;
				background-color: #f0f0f0;
				position: absolute;
				bottom: 0;
				left: 0;
			}
		}

		::v-deep .cur {
			border-color: #ffcd20;
		}

		#bottom {
			height: 110rpx;
			background-color: #fff;
		}
	}

	& .btns-container {
		position: fixed;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: calc(100vw - 25rpx);
		height: 110rpx;
		background-color: #fff;
		// border: 1px solid black;

		& .row {
			height: 100%;

			& .btn {
				height: 90rpx;
				border-radius: 15rpx;
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