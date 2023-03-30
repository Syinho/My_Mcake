<template>
	<view class="good-container">
		<view class="good-img" @click="goDetail">
			<u--image :src="good.img" width="100%" :height="imgHeight" mode="aspectFit" showLoading lazyLoad>
				<template v-slot:loading>
					<u-loading-icon color="black"></u-loading-icon>
				</template>
			</u--image>
		</view>
		<view class="good-info">
			<view class="good-name">
				<text class="good-name-c">
					<text class="good-name-full">{{ good.name }}</text>
					<!-- <span>{{ "\xa0" }}</span> -->
					<text class="good-name-special" v-if="good.tname">{{ good.tname }}</text>
				</text>
				<text class="good-name-e" v-if="good.french">{{ truncate(good.french, { length: 20 }) }}</text>
			</view>
			<!-- 购物车图标 -->
			<view class="shop-cart" @click="showShopCartCard">
				<text class="cuIcon-cart"></text>
			</view>
		</view>
		<text class="good-price">
			¥ {{ good.price }}
		</text>
		<u-popup :show="isShowShopCartCard" @close="close" @open="open" mode="center" closeable :closeOnClickOverlay="false" closeIconPos="top-right" round="5">
			<ShopCartCard :good="good"></ShopCartCard>
		</u-popup>
		<u-toast ref="uToast"></u-toast>
	</view>
</template>

<script>
import { truncate } from 'lodash'
import ShopCartCard from '../ShopCartCard/ShopCartCard.vue'
import { mapState, mapMutations } from 'vuex'
export default {
	name: 'GoodItem',
	props: {
		good: {
			type: Object,
			required: true,
		},
		imgHeight: {
			type: String,
			default: '352.5rpx',
		},
	},
	data() {
		return {
			isShowShopCartCard: false,
		}
	},
	created() {
		// 购物车卡片处理逻辑完毕接收到服务器的信息, 无论成功与否都关闭购物车卡片; 或者购物车卡片点击了取消按钮
		this.$bus.$on('hiddenShopCartCard', () => {
			this.isShowShopCartCard = false
		})
	},
	computed: {
		...mapState({
			isLogin: (state) => state.user.isLogin,
		}),
	},
	methods: {
		...mapMutations(['updatePrevPage']),
		truncate,
		goDetail() {
			this.updatePrevPage(this.$getCurPath())
			// uni.navigateTo({
			// 	url: `/pages/Detail/Detail?id=${this.good.id}`,
			// })
			this.$switchPage({pageName:'Detail',options:`id=${this.good.id}`})
		},
		showShopCartCard() {
			// 检查是否登录
			if (this.isLogin) {
				this.isShowShopCartCard = true
			} else {
				this.$bus.$emit('showToast', {
					type: 'default',
					msg: '您需要先登录再操作',
				})
			}
		},
		open() {},
		close() {
			this.isShowShopCartCard = false
		},
		hiddenShopCartCard() {
			this.isShowShopCartCard = false
		},
		// 添加商品到购物车里
		addShopCartSuccess(msg) {
			this.$toast('success', msg)
		},
		addShopCartFail(msg) {
			this.$toast('error', msg)
		},
	},
	components: {
		ShopCartCard,
	},
}
</script>

<style lang="scss">
.good-container {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	flex-wrap: nowrap;
	justify-content: space-between;

	& > .good-img {
		width: 100%;
		margin-bottom: 10rpx;
		// height: 352.5rpx;
		// height: 70%;
		// display: flex;
		// align-items: center;
		// justify-content: center;

		& > .loadingImg {
			width: 100%;
			height: 100%;
		}

		& > image {
			width: 100%;
			height: 100%;
		}
	}

	& > .good-info {
		width: 100%;
		overflow: hidden;

		&::after {
			content: '';
			display: block;
			clear: both;
		}

		& > .good-name {
			width: 70%;
			height: 100%;
			float: left;

			& > .good-name-c {
				&::after {
					content: '';
					display: block;
					clear: both;
				}

				& .good-name-full {
					font-weight: 700;
					font-size: 20rpx;
					float: left;
				}

				& .good-name-special {
					font-size: 14rpx;
					font-weight: normal;
					background-color: #ffe32a;
					padding: 0 5rpx;
					margin-left: 10rpx;
					float: left;
				}
			}

			& > .good-name-e {
				font-size: 24rpx;
				line-height: 40rpx;
				white-space: nowrap;
			}
		}

		& > .shop-cart {
			width: 60rpx;
			height: 60rpx;
			background-color: #ffe32a;
			border-radius: 50%;
			text-align: center;
			line-height: 60rpx;
			float: right;
		}
	}

	& > .good-price {
		font-weight: normal;
		color: #000;
		font-size: 19rpx;
	}
}
</style>
