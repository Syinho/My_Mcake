<template>
	<!-- 整体容器 -->
	<view class="shop-cart-card-container">
		<!-- 基本信息框, 包括左侧图片, 右侧文字 -->
		<view class="basic-info">
			<!-- 左侧图片 -->
			<u--image :showLoading="true" :src="good.img" width="176rpx" height="176rpx" :lazy-load="true">
				<template v-slot:loading>
					<u-loading-icon mode="semicircle"></u-loading-icon>
				</template>
			</u--image>
			<!-- 右侧文字 -->
			<view class="info-text">
				<u--text :text="good.name" size="20rpx" lineHeight="20rpx"></u--text>
				<u--text :text="good.french" color="#B0B0B0" size="20rpx" v-if="good.french"></u--text>
				<u--text :text="`¥ ${curGoods.salePrice}`" size="20rpx" v-if="curGoods.salePrice"></u--text>
				<u--text size="20rpx" prefixIcon="bag" iconStyle="font-size: 30rpx" :text="fitting" v-if="good.fittings!==''"></u--text>
				<u--text :text="good.goodsTips" v-if="good.goodsTips" size="20rpx" color="#F0250F"></u--text>
			</view>
		</view>
		<!-- 规格选择容器 -->
		<view class="type-info">
			<u--text text="规格选择" size="20rpx" color="#B0B0B0" class="title"></u--text>
			<view class="picker">
				<u--text size="20rpx" color="#B0B0B0" :text=typeChoiceText></u--text>
				<!-- 1.1 -->
				<view @click.stop="showPicker">
					<u--text size="20rpx" color="#B0B0B0" prefixIcon="arrow-down" text="更多规格"></u--text>
				</view>
			</view>
		</view>
		<!-- 数量选择容器 -->
		<view class="count-choice">
			<u--text text="数量选择" size="20rpx" color="#B0B0B0"></u--text>
			<u-number-box :value="curGoods.count" @change="valChange"></u-number-box>
		</view>
		<!-- 确定/取消按钮 -->
		<view class="btn-container">
			<view class="btn" @click.stop="closeCard">
				<u-button text="取消" color="#888888" class="btn"></u-button>
			</view>
			<view class="btn" @click.stop="addShopCart">
				<u-button text="确认" color="#FFE32A" class="btn"></u-button>
			</view>
		</view>
		<!-- 规格选择弹出的选择器 -->
		<u-picker :show="isShowPicker" :columns="columns" @confirm="confirm" keyName="spec" title="规格选择" @close="close" @cancel="close" :defaultIndex="[Number(curGoods.index)]"></u-picker>
		<!-- 加载页 -->
	</view>
</template>

<script>
import { reqAddShopCart, reqModifyShopCartGoods } from '../../utils/api'
import { mapState, mapActions, mapMutations } from 'vuex'

export default {
	name: 'UniappDemoShopCartCard',
	props: {
		good: {
			type: Object,
			required: true,
		},
		type: {
			type: String,
			default: 'add', // 标识触发目的, 是添加新的购物车商品, 还是在原有商品的基础上进行改写, 这个值可以是'add'或者'modify', 默认add.
		},
	},
	data() {
		return {
			isShowPicker: false, // 标识是否显示选择器,默认不显示
			// count: 1, // 该商品的数量, 默认1
			// typeChoice: {}, // 规格选择, 需要经过计算得出
			curGoods: null, // 保存this.good值用于操作
			oldGoodsData: {
				// 保存旧的商品数据
				id: this.good.id,
				count: this.good.count,
			},
		}
	},
	computed: {
		...mapState('user', {
			userId: (state) => state.userId,
		}),
		...mapState('shopCart', {
			addMoreList: (state) => state.addMoreList,
			cartList: (state) => state.cartList,
		}),
		// 规格选择
		columns() {
			if (this.good.list.length > 0) {
				return [this.good.list]
			} else {
				console.log([[this.good]])
				return [[this.good]]
			}
		},
		typeChoiceText() {
			console.log(this.curGoods)
			return `${this.curGoods.spec} ${
				this.curGoods.weight ? this.curGoods.weight : ''
			} ${this.curGoods.edible ? '-' + this.curGoods.edible : ''}`
		},
		// categorys的数据中fitting数据是字符串, 但通过detail获取的商品数据里fittings数据是数组
		fitting() {
			if (this.curGoods.fittings === '') {
				return ''
			} else if (typeof this.curGoods.fittings === 'string') {
				return this.curGoods.fittings
			} else if (
				Array.isArray(this.curGoods.fittings) &&
				this.curGoods.fittings.length === 0
			) {
				return ''
			} else {
				return `含${this.curGoods.fittings[51].num}${this.curGoods.fittings[51].uname}${this.curGoods.fittings[51].name}`
			}
		},
	},
	created() {
		// 将当前商品数据深复制给curGoods数据
		// 1.如果list属性长度为0, 那么直接将this.good数据赋值给curGoods,如果是从shopcart.vue页面获取的,那么这个值会很明显地有candel, birthCardMsg, isChekced数据, 因为它是从服务器中获取的; 否则需要手动添加数据
		// 2.如果list属性长度大于0, 那么迭代查询list数组中哪个对象的id属性与this.good的id数据相等, 为这个list中的数据赋值四个属性

		// 执行添加逻辑时, 传入的商品数据是不带count, isChecked等属性的, 加入到购物车不需要其它的属性,当它们添加到数据库时会自定赋予属性
		// 执行修改逻辑时, 传入的商品是带有count, isChecked等属性的
		this.curGoods = Object.create(this.good)
		if (this.good.count === undefined) {
			console.log(
				'%c shopcartcard.vue:传入的商品数据不携有count属性, 属于添加逻辑',
				'padding:2px 4px;background-color:green;color:yellow;'
			)
			Object.defineProperty(this.curGoods, 'count', {
				configurable: true,
				enumerable: true,
				writable: true,
				value: 1,
			})
		}
	},

	mounted() {},

	methods: {
		...mapMutations('shopCart', ['reWriteCartList', 'updateCartListItem']),
		...mapActions(['chkAndGetToken']),
		...mapActions('shopCart', ['initShopCart', 'getAddMore']),
		// 数量选择器
		valChange(e) {
			console.log(
				'%c shopCartCard.vue:监听到对数量控制器操作, 值为:',
				'color:white;background-color:black;padding:2px 4px;'
			)
			console.log(e.value)
			this.curGoods.count = e.value
		},
		showPicker() {
			this.isShowPicker = true
		},
		close() {
			this.isShowPicker = false
		},
		// picker: 点击确认规格
		confirm(e) {
			// 选择规格
			this.curGoods = Object.create(e.value[0])
			if (this.good.count === undefined) {
				console.log(
					'%c shopcartcard.vue:传入的商品数据不携有count属性, 属于添加逻辑',
					'padding:2px 4px;background-color:green;color:yellow;'
				)
				Object.defineProperty(this.curGoods, 'count', {
					configurable: true,
					enumerable: true,
					writable: true,
					value: 1,
				})
			}
			this.isShowPicker = false
		},
		closeCard() {
			// 点击取消按钮, 在全局事件总线中触发隐藏购物卡片的事件
			this.$bus.$emit('hiddenShopCartCard')
			console.log(
				'%c shopCartCard.vue:触发中央总线事件hiddenShopCartCard',
				'color:white;background-color:black;padding:2px 4px;'
			)
		},
		async addShopCart() {
			// 点击确定按钮, 在全局事件总线中触发
			this.$bus.$emit('showLoadingPage')
			console.log(
				'%c shopCartCard.vue:触发中央总线事件showLoadingPage',
				'color:white;background-color:black;padding:2px 4px;'
			)
			// 1.更新获取accessToken
			const accessTokenObj = await this.chkAndGetToken().catch(
				(err) => err
			)
			let accessToken = ''
			if (accessTokenObj.code === 1) {
				accessToken = accessTokenObj.data['access-token']
			} else {
				return console.error('shopCartCard.vue页面获取access-token失败')
			}
			// 判断是由哪个按钮触发的, 通过categorys.vue的商品列表与加购商品列表的是可以被重新添加不同规格的, 但是通过购物车列表的修改按钮触发的购物卡片是不应该添加新的类型的, 而是删除原有类型, 在数据库, 原有类型的位置修改掉这个数据
			if (this.type === 'modify') {
				console.log(
					'%c shopCartCard.vue:检测到type值为"modify",执行修改逻辑',
					'padding:2px 4px;background-color:green;color:yellow;'
				)
				// 向服务器发起请求修改, 得到修改后的数据
				const res_modify = await reqModifyShopCartGoods(
					this.userId,
					this.oldGoodsData.id,
					this.curGoods.id,
					this.curGoods.count,
					accessToken
				).catch((err) => err)
				if (res_modify.code === 1) {
					// 重写cartList数据
					this.reWriteCartList(res_modify.data)
					this.$bus.$emit('addShopCartSuccess', '修改购物车成功')
					console.log(
						'%c shopCartCard.vue:触发中央总线事件addShopCartSuccess',
						'color:white;background-color:black;padding:2px 4px;'
					)
				} else {
					this.$bus.$emit('showToast', {
						type: 'error',
						msg: res_modify.msg || '修改购物车数据失败',
					})
					console.log(
						'%c shopCartCard.vue:触发中央总线事件showToast',
						'color:white;background-color:black;padding:2px 4px;'
					)
				}
			} else {
				console.log(
					'%c shopCartCard.vue:检测到type值为"add",执行添加逻辑',
					'padding:2px 4px;background-color:green;color:yellow;'
				)
				const res_addShopCart = await reqAddShopCart(
					this.userId,
					this.curGoods.id,
					this.curGoods.count,
					accessToken
				).catch((err) => err)
				if (res_addShopCart.code === 1) {
					console.log(res_addShopCart.data)
					this.reWriteCartList(res_addShopCart.data)
					this.$bus.$emit('addShopCartSuccess', '添加购物车成功')
					console.log(
						'%c shopCartCard.vue:触发中央总线事件addShopCartSuccess',
						'color:white;background-color:black;padding:2px 4px;'
					)
				} else {
					this.$bus.$emit('addShopCartFail', res_addShopCart.msg)
					console.log(
						'%c shopCartCard.vue:触发中央总线事件addShopCartFail',
						'color:white;background-color:black;padding:2px 4px;'
					)
				}
				// 检查加购商品列表是否是空数组, 是的话请求加购商品列表
				if (this.addMoreList.length === 0) {
					const res_addMore = await this.getAddMore().catch(
						(err) => err
					)
					if (res_addMore.code !== 1) {
						this.$bus.$emit('showToast', {
							type: 'error',
							msg: res_addMore.msg,
						})
						console.log(
							'%c shopCartCard.vue:触发中央总线事件showToast',
							'color:white;background-color:black;padding:2px 4px;'
						)
					}
				}
			}

			// 5.触发hiddenShopCartCard自定义事件
			this.$bus.$emit('hiddenShopCartCard')
			console.log(
				'%c shopCartCard.vue:触发中央总线事件hiddenShopCartCard',
				'color:white;background-color:black;padding:2px 4px;'
			)
		},
	},
}
</script>

<style lang="scss" scoped>
@mixin bottomline {
	&::after {
		content: '';
		display: block;
		width: 100%;
		height: 1rpx;
		position: absolute;
		bottom: 0;
		left: 0;
		background-color: #ccc;
	}
}

.shop-cart-card-container {
	width: 90vw;
	min-height: 500rpx;
	min-width: 680rpx;
	// 第一行信息, 包括图片以及文字
	& > .basic-info {
		@include bottomline();
		width: 100%;
		padding: 30rpx 30rpx 0 30rpx;
		display: flex;
		position: relative;
		min-height: 220rpx;
		overflow: hidden;

		& > .info-text {
			min-height: 176rpx;
			display: flex;
			flex-direction: column;
			justify-content: flex-end;
			align-items: flex-start;
			padding-left: 30rpx;

			&::v-deep > .u-text {
				margin: 10rpx 0 !important;
			}
		}
	}
	// 第二行信息, 规格选择
	& > .type-info {
		position: relative;
		@include bottomline();
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex: 1;
		padding: 0 30rpx;
		min-height: 110rpx;

		& > .title {
			flex: 1;
		}

		& > .picker {
			flex: 2;
			height: 100%;
			display: flex;
			justify-content: flex-end;
			align-items: center;

			::v-deep .u-text {
				margin-left: 10rpx !important;
				justify-content: flex-end !important;
			}
		}
	}
	// 第三行信息, 数量选择
	& > .count-choice {
		display: flex;
		justify-content: space-between;
		align-items: center;
		position: relative;
		padding: 0 30rpx;
		flex: 1;
		min-height: 110rpx;

		@include bottomline();
	}

	& > .btn-container {
		display: flex;
		justify-content: space-between;
		flex: 1;
		height: 80rpx;

		.btn {
			width: 50%;
			height: 100%;
			&:nth-of-type(1) {
				::v-deep > .u-button {
					border-top-right-radius: 0 !important;
					border-bottom-right-radius: 0 !important;
				}
			}

			&:nth-of-type(2) {
				::v-deep > .u-button {
					color: #000 !important;
					border-top-left-radius: 0 !important;
					border-bottom-left-radius: 0 !important;
				}
			}
			&::v-deep > .u-button {
				width: 100% !important;
			}
		}
	}

	::v-deep .u-popup {
		flex: 0;
	}
}
</style>

/* 
	1.shopCartCard.vue会触发showLoadingPage,hiddenShopCartCard, addShopCartSuccess, addShopCartFail四种事件
 */