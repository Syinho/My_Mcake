<template>
	<view class="order-form">
		<nav-custom></nav-custom>
		<scroll-view scroll-y show-scrollbar class="scroll-view-container">
			<view class="address-container">
				<view class="main-address-text" v-if="address.length!==0&&JSON.stringify(mainAddress)!=='{}'">
					<view class="line1">
						<u-text :text="mainAddress.uname+','+mainAddress.phone" bold></u-text>
					</view>
					<view class="line2">
						<u-text :text="mainAddress.address"></u-text>
					</view>
				</view>
				<u--text text="请添加地址" v-else></u--text>
				<view class="icon" @click="goToAddressPage">
					<u-icon name="arrow-right"></u-icon>
				</view>
			</view>
			<view class="select-time">
				<u--text prefixIcon="info-circle" suffixIcon="question-circle" text="配送时间" @click="showModel" bold></u--text>
				<u-text :text="pickerData.text" @click="pickerData.show=true" align="right" bold></u-text>
			</view>
			<view class="goods-container">
				<view class="goods-items" v-for="(goods,index) in orderList" :key="goods.id">
					<view class="goods-item" v-for="(item,_index) in goods.count" :key="_index">
						<view class="first-line">
							<!-- 商品图片 -->
							<u--image :showLoading="true" :src="goods.img" width="225rpx" height="225rpx">
								<template v-slot:loading>
									<u-loading-icon color="#000"></u-loading-icon>
								</template>
							</u--image>
							<!-- 商品详细信息 -->
							<view class="first-line-info">
								<u--text :text="goods.name" bold size="24rpx"></u--text>
								<u--text :text="goods.french" size="24rpx"></u--text>
								<view class="price">
									<text>{{'¥' + goods.price}}</text>
									<text>{{ goods.spec}}{{ goods.weight | weight}} {{'x'+1}}</text>
								</view>
								<view class="fitting" v-if="!(goods.fittings===''||(Array.isArray(goods.fittings)&&goods.fittings.length===0))">
									<text :style="{fontSize:'24rpx',fontWeight:'bold'}">标配</text>
									<u--text :text="fitting(goods)" prefixIcon="bag" size="24rpx"></u--text>
								</view>
							</view>
						</view>
						<view class="second-line">
							<view class="chocolate-card" v-if="goods.birthcard.length > 0">
								<text class="title">巧克力生日牌</text>
								<text>{{goods.birthCardMsg}}</text>
							</view>
							<view class="candle">
								<text class="title">蜡烛</text>
								<text>{{goods.candle}}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="pay-table">
				<view class="pay-table-item">
					<view class="icon-title">
						<text class="cuIcon-pay text-gray"></text>
						<text class="title">现金卡/储值卡/小食卡</text>
					</view>
					<view class="control">
						<text>无可用</text>
						<u-icon name="more-dot-fill" bold></u-icon>
					</view>
				</view>
				<view class="pay-table-item">
					<view class="icon-title">
						<text class="cuIcon-redpacket text-gray"></text>
						<text class="title">优惠券/红包</text>
					</view>
					<view class="control">
						<text>无可用</text>
						<u-icon name="more-dot-fill" bold></u-icon>
					</view>
				</view>
				<view class="pay-table-item">
					<view class="icon-title">
						<text class="cuIcon-recharge text-gray"></text>
						<text class="title">余额</text>
						<text class="cuIcon-question text-gray" @click="showModel('charge')"></text>
					</view>
					<view class="control">
						<text>无可用</text>
					</view>
				</view>
				<view class="pay-table-item">
					<view class="icon-title">
						<text class="cuIcon-recharge text-gray"></text>
						<text class="title">余额</text>
						<text class="cuIcon-question text-gray" @click="showModel('charge')"></text>
					</view>
					<view class="control">
						<text>无可用</text>
					</view>
				</view>
				<view class="pay-table-item">
					<view class="icon-title">
						<text class="cuIcon-present text-gray"></text>
						<text class="title">积分(可用100个)</text>
						<text class="cuIcon-question text-gray" @click="showModel('present')"></text>
					</view>
					<view class="control">
						<checkbox-group>
							<checkbox class="round" :class="chkbox.present.isChecked?'checked':''" :checked="chkbox.present.isChecked?true:false" @click="chkBoxClick('present')"></checkbox>
						</checkbox-group>
					</view>
				</view>

				<view class="pay-table-item">
					<view class="icon-title">
						<text class="cuIcon-recharge text-gray"></text>
						<text class="title">发票</text>
						<text class="cuIcon-question text-gray" @click="showModel('charge')"></text>
					</view>
					<view class="control">
						<text>不开发票</text>
						<u-icon name="more-dot-fill" bold></u-icon>
					</view>
				</view>

				<view class="pay-table-item auto">
					<view :style="{width:'100%'}">
						<view class="line">
							<view class="icon-title">
								<text class="cuIcon-recharge text-gray"></text>
								<text class="title">支付方式</text>
								<text class="cuIcon-question text-gray" @click="showModel('charge')"></text>
							</view>
							<view class="control">
								<text>{{popupData.paywayDetail===''?'请选择':popupData.paywayDetail}}</text>
								<u-icon name="more-dot-fill" bold @click="showPopup('payway')"></u-icon>
							</view>
						</view>
						<view class="line">
							<view class="icon-title">
								<u-icon name='weixin-circle-fill' color="#42B035" size="50rpx"></u-icon>
								<text class="title">微信</text>
							</view>
							<view class="control">
								<checkbox-group>
									<checkbox class="round" :class="popupData.paywayDetail==='微信支付'?'checked':''" :checked="popupData.paywayDetail==='微信支付'?true:false" @click="chkBoxClick('weixin')"></checkbox>
								</checkbox-group>
							</view>
						</view>
						<view class="line">
							<view class="icon-title">
								<u-icon name='zhifubao-circle-fill' color="#01A9ED" size="50rpx"></u-icon>
								<text class="title">支付宝</text>
							</view>
							<view class="control">
								<checkbox-group>
									<checkbox class="round" :class="popupData.paywayDetail==='支付宝'?'checked':''" :checked="popupData.paywayDetail==='支付宝'?true:false" @click="chkBoxClick('zhifubao')"></checkbox>
								</checkbox-group>
							</view>
						</view>
						<view class="line">
							<view class="icon-title"></view>
							<view class="control" @click="showPopup('payway')">
								<u--text text="更多支付方式" decoration="underline" bold size="22rpx"></u--text>
								<u-icon name="more-dot-fill" bold></u-icon>
							</view>
						</view>
					</view>
				</view>

				<view class="pay-table-item auto">
					<view :style="{width:'100%'}">
						<view class="line">
							<text class="title">商品金额</text>
							<text>¥{{totalPrice}}</text>
						</view>
						<view class="line" v-if="chkbox.present.isChecked">
							<text class="title">积分</text>
							<text class="red">- ¥1.00</text>
						</view>
					</view>
				</view>
			</view>

			<view class="bottom"></view>
			<view class="bottom-container">
				<view class="price">
					<text class="symbol">¥</text>
					<text class="num">{{actuallyPay}}</text>
				</view>
				<view class="btn">提交订单</view>
			</view>
		</scroll-view>

		<u-notify ref="uNotify"></u-notify>
		<!-- 模态框 -->
		<u-modal :show="modelData.show" :title="modelData.title" confirmColor="#000" @confirm="modelConfirm">
			<view class="slot-content">
				<rich-text :nodes="modelData.content"></rich-text>
			</view>
		</u-modal>
		<!-- 加载页 -->
		<u-loading-page :loading="loadingPage.show" class="loading-page" color="#000" :bgColor="'rgba(255,255,255,0)'" iconSize="80rpx" loadingColor="#000" loadingText=""></u-loading-page>
		<!-- 选择器 -->
		<u-picker :show="pickerData.show" ref="uPicker1" :columns="columns" @confirm="pickerConfirm" @cancel="pickerCancel" @change="changeHandler" closeOnClickOverlay @close="pickerCancel"></u-picker>
		<u-popup :show="popupData.show" @close="popupData.show=false" class="popup-container">
			<scroll-view scroll-y show-scrollbar class="scroll-view-container">
				<view class="content-container">
					<view class="header">
						<text>支付方式</text>
						<view class="cancel-btn" @click="popupCancel"></view>
					</view>
					<view class="choice-btn" @click="test">
						<view class="online" :class="[popupData.payway==='online'?'active':'inactive']" @click="switchPayWay('online')" :data-type="'online'">
							<view class="iconfont icon-zaixianzhifu"> </view>
							<view class="detail">
								<text>在线支付</text>
								<text>微信|支付宝|网上银行</text>
							</view>
						</view>
						<view class="ccard" :class="[popupData.payway==='ccard'?'active':'inactive']" @click="switchPayWay('ccard')">
							<view class="iconfont icon-shuaka"></view>
							<view class="detail">
								<text>货到付款</text>
								<text>刷银行卡</text>
							</view>
						</view>
						<view class="pos" :class="[popupData.payway==='pos'?'active':'inactive']" @click="switchPayWay('pos')">
							<view class="iconfont icon-yidongPOSzhongduan"></view>
							<view class="detail">
								<text>货到付款</text>
								<text>POS机刷卡|预付费卡</text>
							</view>
						</view>
					</view>
					<view class="payway-container">
						<view class="payway-choice" v-for="(item,index) in popupData.data[popupData.payway]" :key="item.sname">
							<view class="left">
								<u--image :showLoading="true" :src="'https://static.mcake.com/icon/payment/bank/'+item.icon+'.png'" :width="'75rpx'" :height="'75rpx'"></u--image>
								<view class="pay-name">
									<text>{{item.sname}}</text>
									<text>{{item.remark}}</text>
								</view>
							</view>
							<checkbox class="round" :class="item.sname===popupData.paywayDetail?'checked':''" :checked="item.sname===popupData.paywayDetail?true:false" @click="choicePayWay(item.sname)"></checkbox>
						</view>
					</view>
				</view>
			</scroll-view>
		</u-popup>
	</view>
</template>

<script>
// import navCustom from '@components/NavCustom/NavCustom.vue'
// import footerTab from '@components/FooterTab/FooterTab.vue'
import { columns, columnData } from '@/utils/tools'
import { mapState, mapMutations, mapGetters, mapActions } from 'vuex'
import { reqGetAllAddress, reqGetAllPayWay } from '@/utils/api'

export default {
	name: 'UniappDemoOrderForm',

	data() {
		return {
			modelData: {
				title: '',
				content: '',
				show: false,
			},

			pickerData: {
				show: false,
				text: '请选择 ...',
			},
			columns: columns(),
			columnData: columnData(),
			chkbox: {
				present: {
					isChecked: false,
				},
			},
			payData: {
				payWay: '',
			},
			popupData: {
				show: false,
				data: {},
				payway: 'online', // 默认在线支付
				paywayDetail: '',
			},
			loadingPage: {
				show: false,
			},
		}
	},
	beforeUpdate() {
		console.log('beforeUpdate')
	},
	updated() {
		console.log('updated')
	},
	computed: {
		...mapState('user', {
			isLogin: (state) => state.isLogin,
			userId: (state) => state.userId,
			address: (state) => state.address,
			beUsedAddress: (state) => state.beUsedAddress,
		}),
		...mapGetters('shopCart', ['orderList']),
		mainAddress() {
			if (JSON.stringify(this.beUsedAddress) !== '{}') {
				return this.beUsedAddress
			}
			let mainAddress = {}
			this.address.some((item, index) => {
				console.log(item.isDefault)
				if (item.isDefault == 1) {
					mainAddress = item
					return true
				}
			})
			console.log(mainAddress)
			return mainAddress
		},

		totalPrice() {
			let p = 0
			for (let i = 0; i < this.orderList.length; i++) {
				let item = this.orderList[i]
				p += item.price * item.count
			}
			return p.toFixed(2)
		},
		actuallyPay() {
			if (this.chkbox.present.isChecked) {
				return (this.totalPrice - 1).toFixed(2)
			}
			return Number(this.totalPrice).toFixed(2)
		},
	},
	async created() {
		console.log('orderform created')
		const res_select = await reqGetAllAddress(this.userId).catch(
			(err) => err
		)
		if (res_select.code === 1) {
			if (res_select.data.length === 0) return
			this.reWriteAddress(res_select.data)
			for (let i = 0; i < res_select.data.length; i++) {
				const address = res_select.data[i]
				if (address.isDefault === '1') {
					this.reWriteBeUsedAddress(address)
					break
				}
			}
		} else {
			this.$notify('error', res_select.msg)
		}
	},

	mounted() {
		uni.hideTabBar({
			animation: false,
		})
	},
	async onLoad() {
		console.log('orderform onload')
	},

	methods: {
		...mapMutations(['updatePrevPage']),
		...mapMutations('user', ['reWriteAddress', 'reWriteBeUsedAddress']),
		...mapActions(['chkAndGetToken']),
		goToAddressPage() {
			// uni.navigateTo({
			// 	url: '/pages/Address/Address',
			// })
			// this.updatePrevPage('Address')
			this.$switchPage({ pageName: 'Address' })
		},
		showModel(type) {
			if (!type) {
				this.modelData.title = '配送时间说明'
				this.modelData.content =
					'1.配送时间10:00-20:00<br>2.截单时间14:30'
				this.modelData.show = true
			}
			if (type === 'charge') {
				this.modelData.title = '余额使用说明'
				this.modelData.content =
					'1.余额最小使用单位为0.01元.<br>2.余额不可与优惠券,红包叠加使用.<br>3.使用余额抵扣部分不可开具发票.'
				this.modelData.show = true
			}
			if (type === 'present') {
				this.modelData.title = '积分使用规则'
				this.modelData.content =
					'1.消费时1积分可抵0.01元现金使用<br>2.使用积分抵扣部分不可开具发票'
				this.modelData.show = true
			}
		},
		pickerConfirm(e) {
			console.log(e)
			this.pickerData.text = `${e.value[0]}  ${e.value[1]} ...`
			this.pickerData.show = false
		},
		modelConfirm(e) {
			this.modelData.show = false
			this.modelData.title = ''
			this.modelData.content = ''
		},
		pickerCancel() {
			this.pickerData.show = false
		},

		changeHandler(e) {
			console.log('changeHnadler')
			const {
				columnIndex,
				value,
				values, // values为当前变化列的数组内容
				index,
				// 微信小程序无法将picker实例传出来，只能通过ref操作
				picker = this.$refs.uPicker1,
			} = e
			console.log(columnIndex)
			// 当第一列值发生变化时，变化第二列(后一列)对应的选项
			if (columnIndex === 0) {
				// picker为选择器this实例，变化第二列对应的选项
				picker.setColumnValues(1, this.columnData[index])
			}
		},
		fitting(item) {
			if (item.fittings === '') {
				return ''
			} else if (typeof item.fittings === 'string') {
				return this.curGoods.fittings
			} else if (
				Array.isArray(item.fittings) &&
				item.fittings.length === 0
			) {
				return ''
			} else {
				return `含${item.fittings[51].num}${item.fittings[51].uname}${item.fittings[51].name}`
			}
		},
		chkBoxClick(item) {
			if (item === 'present') {
				this.chkbox[item].isChecked = !this.chkbox[item].isChecked
			} else if (item === 'weixin') {
				if (this.popupData.paywayDetail === '微信支付') {
					this.popupData.paywayDetail = ''
				} else {
					this.popupData.paywayDetail = '微信支付'
				}
			} else if (item === 'zhifubao') {
				if (this.popupData.paywayDetail === '支付宝') {
					this.popupData.paywayDetail = ''
				} else {
					this.popupData.paywayDetail = '支付宝'
				}
			}
		},
		async showPopup(key) {
			this.popupData.show = true
			this.loadingPage.show = true
			if (key === 'payway') {
				const res_accesssToken = await this.chkAndGetToken().catch(
					(err) => err
				)
				let accessToken = ''
				if (res_accesssToken.code === 1) {
					accessToken = res_accesssToken.data['access-token']
				} else {
					return this.$notify('error', res_accesssToken.msg)
				}

				const res_payway = await reqGetAllPayWay(accessToken).catch(
					(err) => err
				)
				if (res_payway.code === 1) {
					console.log(res_payway.data)
					this.popupData.data = res_payway.data
				}
				this.loadingPage.show = false
			}
		},
		popupCancel() {
			this.popupData.show = false
		},
		switchPayWay(type) {
			this.loadingPage.show = true
			console.log(type)
			this.popupData.payway = type
			this.$nextTick(() => {
				this.loadingPage.show = false
			})
		},
		choicePayWay(name) {
			this.popupData.paywayDetail = name
			this.popupData.show = false
		},
		test(e) {
			console.log(e)
		},
		// random(id, idx) {
		// 	return Number(id) + Number(idx) + Math.round(Math.random() * 10000)
		// },
	},
	filters: {
		weight(value) {
			if (value) {
				return `(${value})`
			} else {
				return ''
			}
		},
	},
}
</script>

<style lang="scss" scoped>
.order-form {
	& > .scroll-view-container {
		height: calc(100vh - 120rpx);
		background-color: #fff;
		& .address-container {
			height: 155rpx;
			padding: 20rpx;
			display: flex;
			align-items: center;
			justify-content: space-between;
			position: relative;
			@include bottomLine();
			& > .main-address-text {
				flex: 5;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				& > .line1 {
					flex: 1;
				}
				& > .ine2 {
					flex: 1;
					display: flex;
					align-items: flex-end;
				}
			}
			& > .icon {
				flex: 1;
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: flex-end;
			}
		}
		& .select-time {
			padding: 0 20rpx;
			display: flex;
			height: 90rpx;
			align-items: center;
		}

		& .goods-container {
			width: 100%;
			padding: 20rpx;
			padding-top: 0;
			& > .goods-items {
				& > .goods-item {
					padding: 20rpx;
					border: 1rpx solid #ccc;
					border-radius: 5px;
					margin: 10rpx 0;
					width: 100%;
					overflow: hidden;
					& > .first-line {
						display: flex;
						width: 100%;
						& > .first-line-info {
							width: 100%;
							padding-left: 20rpx;
							display: flex;
							flex-direction: column;
							justify-content: space-between;
							& > .price {
								width: 100%;
								display: flex;
								justify-content: space-between;
							}
							& > .fitting {
								width: 100%;
								display: flex;
								justify-content: flex-start;
							}
						}
					}
					& > .second-line {
						width: 100%;
						display: flex;
						justify-content: space-between;
						font-size: 24rpx;
						position: relative;
						padding-top: 10rpx;
						margin-top: 10rpx;
						&::after {
							content: '';
							display: block;
							position: absolute;
							top: 0;
							left: 0;
							width: 100%;
							height: 0;
							border-top: 1px dashed #ccc;
							transform: scaleY(0.5);
						}
						& > .chocolate-card {
							display: flex;
							justify-content: flex-start;
						}
						& > .candle {
							display: flex;
							justify-content: flex-end;
						}

						& .title {
							font-weight: bold;
							margin-right: 10rpx;
						}
					}
				}
			}
		}

		& .pay-table {
			padding: 20rpx;
			& > .pay-table-item {
				display: flex;
				height: 100rpx;
				width: 100%;
				justify-content: space-between;
				align-items: center;
				position: relative;
				overflow: hidden;
				&.auto {
					height: auto;
					padding: 20rpx 0;
				}
				&::after {
					content: '';
					display: block;
					width: 100%;
					height: 1px;
					background-color: #ccc;
					position: absolute;
					bottom: 0;
					left: 0;
					// border-bottom: 1px solid #ccc;
					transform: scaleY(0.5);
				}
				& .icon-title {
					font-size: 26rpx;
					font-weight: bold;
					display: flex;
					align-items: center;

					& > .title {
						// margin-left: 10rpx;
						// margin-right: 10rpx;
						margin: 0 10rpx;
					}
					& .text-gray {
						font-size: 30rpx;
					}
				}
				& .control {
					font-size: 22rpx;
					font-weight: bold;
					display: flex;
					justify-content: flex-end;
					align-items: center;
					column-gap: 20rpx;
					// & > uni-text:nth-of-type(1) {
					// 	margin-right: 20rpx;
					// }
				}

				& .line {
					width: 100%;
					height: 80rpx;
					display: flex;
					justify-content: space-between;
					align-items: center;
					& > uni-text {
						&:nth-of-type(2) {
							font-size: 35rpx;
							font-weight: bold;
							&.red {
								color: red;
							}
						}
					}
				}
			}
		}

		& .bottom {
			height: 120rpx;
		}
		& .bottom-container {
			width: 100%;
			height: 95rpx;
			position: fixed;
			bottom: 0;
			left: 0;
			display: flex;
			justify-content: space-between;
			& > .price {
				padding-left: 20rpx;
				height: 100%;
				flex: 2;
				background-color: #fff;
				display: flex;
				justify-content: flex-start;
				color: red;
				align-items: center;
				& .symbol {
					font-size: 24rpx;
				}
				& .num {
					font-size: 48rpx;
				}
			}
			& > .btn {
				height: 100%;
				flex: 1;
				background-color: #ffe32a;
				display: flex;
				justify-content: center;
				align-items: center;
			}
		}
	}

	& > .popup-container {
		&::v-deep>uni-view {
			&:nth-of-type(1) {
				z-index: 10081 !important;
			}
			&:nth-of-type(2) {
				z-index: 10082 !important;
			}
		}
		& .scroll-view-container {
			transform: scale(1, 1);
			& .content-container {
				height: calc(100vh - 120rpx);
				padding-top: 130rpx;

				& > .header {
					width: 100%;
					height: 130rpx;
					background-color: #fff;
					line-height: 130rpx;
					text-align: center;
					position: fixed;
					top: 0;
					left: 0;
					z-index: 10;
					& > .cancel-btn {
						width: 50rpx;
						height: 50rpx;
						position: absolute;
						right: 40rpx;
						top: 40rpx;
						&::after {
							position: absolute;
							top: 50%;
							left: 0;
							content: '';
							display: block;
							width: 100%;
							height: 2rpx;
							background-color: #000;
							transform-origin: center center;
							transform: rotateZ(45deg) translateY(-50%);
						}
						&::before {
							position: absolute;
							top: 50%;
							left: 0;
							content: '';
							display: block;
							width: 100%;
							height: 2rpx;
							background-color: #000;
							transform-origin: center center;
							transform: rotateZ(-45deg) translateY(-50%);
						}
					}
				}
				& > .choice-btn {
					background-color: #f9f9f9;
					padding: 20rpx;
					width: 100%;
					height: 688rpx;
					display: grid;
					grid-template-rows: repeat(2, 1fr);
					grid-template-columns: repeat(2, 1fr);
					grid-template-areas: 'online ccard' 'pos none';
					row-gap: 20rpx;
					column-gap: 20rpx;

					& > .online {
						grid-area: online;
						position: relative;
					}
					& > .pos {
						grid-area: pos;
						position: relative;
					}
					& > .ccard {
						grid-area: ccard;
						position: relative;
					}
					& > uni-view {
						& > .iconfont {
							font-size: 200rpx;
						}
						display: flex;
						flex-direction: column;
						justify-content: space-around;
						align-items: center;
						border-radius: 10px;
						color: #9e9e9e;
						background-color: #fff;
						& > .detail {
							& > uni-text {
								&:nth-of-type(1) {
									color: #000;
								}
							}
						}

						&.active {
							color: #fff;
							background-color: #ffe32a;
							& > .detail {
								& > uni-text {
									&:nth-of-type(1) {
										color: #fff;
									}
								}
							}
						}

						// &:not(.active) > .detail > uni-text:nth-of-type(1) {
						// 	color: #000;
						// }
						& > .detail {
							width: 100%;
							height: 80rpx;
							text-align: center;
							display: flex;
							flex-direction: column;
							flex-wrap: nowrap;
							justify-content: space-around;
							& > uni-text {
								&:nth-of-type(1) {
									font-size: 30rpx;
								}
								&:nth-of-type(2) {
									font-size: 20rpx;
								}
							}
						}
					}
				}
				& > .payway-container {
					width: 100%;
					padding: 20rpx;
					position: relative;

					& > .payway-choice {
						width: 100%;
						height: 110rpx;
						position: relative;
						display: flex;
						align-items: center;
						justify-content: space-between;
						@include bottomLine();

						&:nth-last-of-type(1) {
							&::after {
								content: '';
								display: none;
							}
						}
						// &:not(&:nth-last-of-type(1)) {
						// 	@include bottomLine();
						// }
						& > .left {
							display: flex;
							flex-wrap: nowrap;
							justify-content: space-between;
							align-items: center;
							& > .pay-name {
								margin-left: 10rpx;
								height: 110rpx;
								display: flex;
								flex-direction: column;
								justify-content: center;
								align-items: flex-start;
								flex-wrap: nowrap;
								& > uni-text {
									&:nth-of-type(2) {
										font-size: 20rpx;
										color: #888;
									}
								}
							}
						}
						::v-deep .uni-checkbox-input {
							background-color: #fff !important;
						}
						::v-deep .uni-checkbox-input-checked {
							background-color: #ffe32a !important;
							border-color: #ffe32a !important;
						}
					}
				}
			}
		}
	}

	::v-deep .u-modal__content {
		justify-content: flex-start;
	}
	::v-deep .u-modal__button-group__wrapper {
		background-color: #ffe32a;
	}
	::v-deep .uni-checkbox-input {
		background-color: #e6e6e6 !important;
		border-color: #e6e6e6 !important;
	}
	::v-deep .uni-checkbox-input-checked {
		background-color: #ffe32a !important;
		border-color: #ffe32a !important;
	}

	::v-deep .loading-page {
		// background-color: rgba(255,255,255,0.8) !important;
		z-index: 11111 !important;
	}
}
</style>