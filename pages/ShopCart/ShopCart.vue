<template>
	<view class="shop-cart-container">
		<!-- 顶部导航 -->
		<nav-custom></nav-custom>
		<!-- 整体滑动容器 -->
		<scroll-view class="scroll-view-container" scroll-y show-scrollbar>
			<!-- 头部容器, 在未登录或者没有购物车数据时显示图片, 有购物车数据`时显示购物车商品 -->
			<view class="header" v-if="cartList.length === 0">
				<!-- 头部图片 -->
				<u--image showLoading showError :src="src" class="header-img" @click="click" mode="aspectFit" height="168rpx" width="552rpx" bgColor="#C2C2C2">
					<template v-slot:loading>
						<u-loading-icon color="#fff"></u-loading-icon>
					</template>
					<view slot="error" style="font-size: 24rpx">加载失败</view>
				</u--image>
				<!-- 图片中的文字信息 -->
				<view class="header-hint">
					<span>您的购物车还是空的,<a @click="goToIndex">赶紧行动吧!</a></span>
				</view>
			</view>
			<!-- 推荐列表容器 -->
			<view class="recommand" v-if="cartList.length === 0">
				<!-- 推荐列表标题 -->
				<u--text text="为您推荐" size="36rpx" bold></u--text>
				<!-- 推荐商品容器 -->
				<view class="goods-container">
					<view class="item-container" v-for="(item, index) in recommand" :key="item.id">
						<GoodItem :good="item"></GoodItem>
					</view>
				</view>
			</view>
			<!-- 购物车容器， 当cartlist数据为0时不显示 -->
			<view class="shop-cart-detail-container" v-if="cartList.length!==0">
				<!-- 滑动项区域 -->
				<u-swipe-action v-if="!isReload">
					<!-- 购物车商品滑动项， 可向左滑动删除 -->
					<u-swipe-action-item :options="options" v-for="(item, index) in cartList" :key="item.id" @click="delGood($event,index)" :name="item.id" class="sai">
						<!-- 购物车单个商品容器 -->
						<view class="swipe-action sa-item-container" @click.stop="chkboxChange(index,item)">
							<!-- 第一行内容， 包括选项框， 商品图片， 商品详细信息 -->
							<view class="first-line">
								<!-- 选项框 -->
								<u-checkbox-group @change="chkboxChange(index,item)" class="chkbox" :class="[item.isChecked ? 'active' : 'inactive']">
									<u-checkbox :key="index" :name="item.id" :checked="Boolean(item.isChecked)"></u-checkbox>
								</u-checkbox-group>
								<!-- 商品图片 -->
								<u--image :showLoading="true" :src="item.img" width="80px" height="80px">
									<template v-slot:loading>
										<u-loading-icon color="#000"></u-loading-icon>
									</template>
								</u--image>
								<!-- 商品详细信息 -->
								<view class="first-line-info">
									<!-- 第一行比较特殊, 商品名和改写图标会在同一行 -->
									<view class="first-line-info-first-line">
										<u--text :text="item.name" :bold="true" size="24rpx"></u--text>
										<!-- 改写图标 -->
										<view class="edit-pen-container" @click.stop="modifyShopCart(item,index)">
											<u-icon name="edit-pen" color="#CACACA" size="28rpx"></u-icon>
										</view>
									</view>
									<u--text :text="item.french" size="24rpx"></u--text>
									<view class="price">
										<span>{{ '¥' + item.price }}</span>
										<span>{{ item.spec}}{{ item.weight | weight}} {{'x'+item.count}}</span>
									</view>
									<view class="fitting" v-if="!(item.fittings===''||(Array.isArray(item.fittings)&&item.fittings.length===0))">
										<span :style="{fontWeight: 'bold',fontSize: '24rpx'}">标配</span>
										<u--text :text="fitting(item)" prefixIcon="bag" size="24rpx"></u--text>
									</view>
								</view>
							</view>
							<!-- 第二行内容, 巧克力生日牌, 蜡烛选择 -->
							<view class="second-line" v-if="item.bcid === 1">
								<!-- 巧克力生日牌选择 -->
								<view class="chocolate-card" v-if="item.birthcard.length > 0">
									<text class="title">巧克力生日牌</text>
									<view @click.stop="handlePopup(index,item)">
										<u--text :text="item.birthCardMsg? item.birthCardMsg: '请选择'" size="24rpx"></u--text>
									</view>
								</view>
								<!-- 蜡烛选择 -->
								<view class="candle">
									<text class="title">蜡烛</text>
									<view @click.stop="choiceCandle(index,item)">{{
										item.candle ? item.candle : '请选择'
									}}</view>
								</view>
							</view>
						</view>
					</u-swipe-action-item>
				</u-swipe-action>
				<view v-if="isReload">
					<shopCartSkeleton v-for="(item,index) in cartList" :key="item.id" :isShowSecondLine="item.bcid===1"></shopCartSkeleton>
				</view>
				<!-- 5.加购配件 -->
				<view class="add-more" v-if="cartList.length>0">
					<u--text text="加购配件" :bold="true" size="35rpx"></u--text>
					<u-scroll-list class="scroll-list-container">
						<view v-for="(item, index) in addMoreList" :key="item.id" class="scroll-list-item-container">
							<view class="item-container">
								<GoodItem :good="item" :imgHeight="'202rpx'"></GoodItem>
							</view>
						</view>
					</u-scroll-list>
				</view>
			</view>
			<!-- 4.点击再逛逛按钮回到首页 -->
			<view class="bottom-container">
				<u-button text="再逛逛" class="btn-style" @click="goToIndex" v-if="cartList.length===0"></u-button>
				<view class="bill" v-if="cartList.length>0">
					<u-checkbox-group @change="chkAll" class="chkbox" :class="[isCheckAll ? 'active' : 'inactive']">
						<u-checkbox :checked="isCheckAll" label="全选"></u-checkbox>
					</u-checkbox-group>
					<view class="total">
						<u--text :text="totalPrice" class="total-text"></u--text>
					</view>
					<view class="btn" @click="settle">
						<u--text :text="`去结算${cartList.length===0?'':'('+cartList.length+')'}`" class="text" :align="'center'"></u--text>
					</view>
				</view>
			</view>

		</scroll-view>
		<!-- toast -->
		<u-toast ref="uToast"></u-toast>
		<!-- 生日牌信息框 -->
		<u-popup :show="isPopupShow" mode="bottom" @close="closePopup" :closeOnClickOverlay="false" closeIconPos="top-right" closeable class="popup-container">
			<view class="popup-content">
				<u-row class="popup-row">
					<u-col span="3">
						<u--text text="自定义"></u--text>
					</u-col>
					<u-col span="6">
						<u--input border="bottom" @change="changeCustomBirthCardMsg" :value="curModifiedGoods===null?'':curModifiedGoods.birthCardMsg"></u--input>
					</u-col>
					<u-col span="2" offset="1">
						<u-button text="提交" class="btn" @click="popupConfirm"></u-button>
					</u-col>
				</u-row>
				<u-row class="popup-row" @click="updateTemplateBirthCardMsg('不需要')">
					<u-col span="12">
						<u--text text="不需要"></u--text>
					</u-col>
				</u-row>
				<view v-if="isPopupShow" class="birth-card-options">
					<!-- 点击生日卡片, 让input显示为当前点击的文字, 但这是一个临时性保存的数据, 因为一旦点击取消按钮, 这些修改操作都会取消 -->
					<u-row v-for="(item, index) in cartList[curGoodIndex].birthcard" :key="index" class="popup-row" @click="updateTemplateBirthCardMsg(item)">
						<u-col span="12">
							<u--text :text="item"></u--text>
						</u-col>
					</u-row>
				</view>
			</view>
		</u-popup>
		<!-- 蜡烛选择器 -->
		<u-picker :show="isPickerShow" :columns="columns" @confirm="confirmPicker" @cancel="cancelPicker"></u-picker>
		<!-- 加载页 -->
		<u-loading-page :loading="isShowLoading" class="shopCartLoadingPage" bgColor="rgba(255, 255, 255, .3)" loading-color="#000000" icon-size="100rpx" :loading-text="loadingText" color="#000"></u-loading-page>
		<!-- 更改商品信息弹出框 -->
		<u-popup :show="isShowShopCartCard" @close="closeShopCartCard" @open="openShopCartCard" mode="center" closeable :closeOnClickOverlay="false" closeIconPos="top-right" round="5">
			<ShopCartCard :good="curModifiedGoods" :type="shopCardType"></ShopCartCard>
		</u-popup>
		<!-- 未登录, 弹出窗口 -->
		<view>
			<u-modal :show="isShowLogin" :title="login.title" :content='login.content' confirmText="立即登录" cancelText="以后再说" :showCancelButton="true" confirmColor="#000" cancelColor="#fff" :zoom="true" @confirm="confirm" @cancel="cancel">
			</u-modal>
		</view>
	</view>
</template>

<script>
import GoodItem from '@/components/GoodItem/GoodItem.vue'
import shopCartSkeleton from '../../components/shopCartSkeleton/shopCartSkeleton.vue'
import { mapState, mapActions, mapMutations } from 'vuex'
import { reqDelShopCartItem, reqModifyShopCartOther } from '../../utils/api'

export default {
	name: 'shopCart',
	computed: {
		...mapState('shopCart', {
			recommand: (state) => state.recommand,
			cartList: (state) => state.cartList,
			addMoreList: (state) => state.addMoreList,
			isShowLoginToast: (state) => state.isShowLoginToast,
		}),
		...mapState('user', {
			userId: (state) => state.userId,
			isLogin: (state) => state.isLogin,
		}),
		isShowLogin() {
			return !this.isLogin
		},
		isCheckAll: {
			get() {
				return this.cartList.every((item) => {
					return item.isChecked
				})
			},
			set(val) {
				this.isShowLoading = true
				let p = []
				this.cartList.forEach((item, index) => {
					if (item.isChecked !== val) {
						this.updateCartListItem({
							index,
							payload: {
								isChecked: val,
							},
						})
						p.push(
							reqModifyShopCartOther({
								userId: this.userId,
								goodsId: item.id,
								isChecked: val,
							})
						)
					}
				})
				Promise.all(p)
					.then((res) => {
						this.isShowLoading = false
					})
					.catch((err) => {
						console.error('shopCart.vue:设置isChecked属性出错')
						this.isShowLoading = false
					})
			},
		},
		totalPrice() {
			let total = 0
			this.cartList.forEach((item, index) => {
				if (item.isChecked) {
					total += item.salePrice * item.count
				}
			})
			return '合计: ¥' + total
		},
	},
	data() {
		return {
			src: 'https://h5.mcake.com/static/images/cart-empty.png', // cartlist无数据时展示的图片
			options: [
				{
					text: '删除',
					style: {
						backgroundColor: '#F0250F',
					},
				},
			], // 左滑显示的按钮信息
			isPopupShow: false, // 标识显示popup, 默认不显示
			isPickerShow: false, // 标识是否显示蜡烛选择器, 默认不显示
			columns: [['不需要', '需要']], // picker的可选项列表
			isShowLoading: false, // 显示loading的加载页面,默认显示
			isShowShopCartCard: false, // 标识是否显示购物车卡片, 默认不显示
			// curGoodBirthCardMsg: '', // 当前正在操作的商品的生日卡信息, 默认空字符串, 它是一个临时性的数据
			curGoodIndex: undefined, // 当前的操作的商品在购物车数据中的index, 点击生日卡, 蜡烛选择器, 重写商品信息按钮都会修改这个数据
			login: {
				title: '温馨提示',
				content: '您需要先登录才能继续您的操作',
			},
			curModifiedGoods: null, // 标识当前正在修改的商品信息
			shopCardType: 'add', // 标识当前的的购物车卡片确定按钮的行为逻辑是新添商品还是重写商品, 默认add
			loadingText: '', // 加载提示文本
			isReload: false,
		}
	},
	async onShow() {
		console.log('shopCart onShow')
		this.isReload = false
		// shopCart页面每次进入都会触发onShow页面, 同时也必须重新初始化cartList数据
	},
	watch: {
		async isLogin(newVal, oldVal) {
			// 如果由非登录状态变为登录状态(比如直接在shopCart刷新整个页面, app.vue中发起登录请求, 但是存在服务器在shopcart页面加载完毕后依才返回登录数据 ), 那么检查cartList数据,
			if (newVal) {
				// 未登录 -> 已登录 ( 大多是当前页面刷新所致 ), 重新初始化整个页面的数据
				const res_initShopCart = await this.initShopCart().catch(
					(err) => err
				)
				if (res_initShopCart.code === 0) {
					if (res_initShopCart.msg !== '未登录') {
						this.$toast('error', res_initShopCart.msg)
					}
				}
			}
		},
	},
	async created() {
		console.log('shopcart created')
		// 1.当cartList长度为0, 进行再次请求购物车数据检测 ( 不检测是否登录, 登录状态检查放在initShopCart里 )
		if (this.cartList.length === 0) {
			// 1.显示loading的加载页面
			this.isShowLoading = true
			this.loadingText = '正在加载购物车...'
			// 2.初始化购物车数据
			const res_initShopCart = await this.initShopCart().catch(
				(err) => err
			)
			// 3.关闭loading页面
			this.isShowLoading = false
			this.loadingText = ''
			if (res_initShopCart.code === 0) {
				if (
					res_initShopCart.msg !== '未登录' &&
					this.isShowLoginToast
				) {
					this.$toast('error', res_initShopCart.msg)
					this.reWriteCartList(false)
				}
			}
		} else {
			if (this.addMoreList.length === 0) {
				const res_addMore = await this.getAddMore().catch((err) => err)
				if (res_addMore.code === 1) {
				} else {
					this.$toast('error', res_addMore.msg)
				}
			}
		}
	},
	mounted() {
		// 监听来自shopcartcard的事件
		// 购物车卡片按下确定按钮向服务器上传数据
		this.$bus.$on('showLoadingPage', () => {
			console.log(
				'%c shopcart.vue:监听到中央总线事件showLoadingPage, 这一事件来自于shopcartcard.vue',
				'color:white;background-color:black;padding:2px 4px;'
			)
			this.isShowLoading = true
		})
		// 购物车卡片处理逻辑完毕接收到服务器的信息, 无论成功与否都关闭购物车卡片; 或者购物车卡片点击了取消按钮
		this.$bus.$on('hiddenShopCartCard', () => {
			console.log(
				'%c shopcart.vue:监听到中央总线事件hiddenShopCartCard, 这一事件来自于shopcartcard.vue',
				'color:white;background-color:black;padding:2px 4px;'
			)
			this.isShowLoading = false
			this.isShowShopCartCard = false
		})
		// 购物车卡片点击确定后修改数据库数据失败
		this.$bus.$on('addShopCartFail', (msg) => {
			console.log(
				'%c shopcart.vue:监听到中央总线事件addShopCartFail, 这一事件来自于shopcartcard.vue, 传入一个msg参数如下',
				'color:white;background-color:black;padding:2px 4px;'
			)
			console.log(msg)
			this.isShowLoading = false
			this.$toast('error', msg)
		})
	},
	async onLoad() {
		console.log('shopCart onLoad')
		// 3.隐藏原生tabbar
		uni.hideTabBar({
			animation: false,
		})
	},
	onHide() {
		console.log('shopCart onHide')
		this.isReload = true
	},

	methods: {
		...mapActions(['chkAndGetToken']),
		...mapActions('shopCart', [
			'getShopCart',
			'getAddMore',
			'getRecommand',
			'initShopCart',
		]),
		...mapMutations('shopCart', [
			'updateRecommand',
			'reWriteCartList',
			'updateCartListItem',
			'deleteCartListItem',
			'reWriteAddMore',
			'reWriteIsShowLoginToast',
		]),
		// 删除购物车指定项
		// 1.显示loading的加载页面
		// 2.获取删除项的uerId,goodId数据, 向服务器发起请求删除
		// 3.从服务器重新获取cartList数据
		// 4.关闭loading页面
		async delGood(e, index) {
			this.isShowLoading = true
			this.loadingText = '正在删除...'
			const res_del = await reqDelShopCartItem(this.userId, e.name).catch(
				(err) => err
			)
			this.isShowLoading = false
			this.loadingText = ''
			// 删除成功,重新初始化购物车数据
			if (res_del.code === 1) {
				this.deleteCartListItem(index)
				// 在cartList数据中删除这个数据

				const res_shopCart = await this.initShopCart().catch(
					(err) => err
				)
				if (res_shopCart.code === 1) {
				} else {
					this.$toast('error', '重新加载购物车数据出错')
				}
			} else {
				this.$toast('error', '删除购物车商品出错')
			}
		},
		// 2.点击"赶紧行动字样"跳转首页
		goToIndex() {
			this.$switchPage({ pageName: 'Index' })
			// uni.switchTab({ url: '/pages/index/index' })
		},

		// 点击chkbox多选框
		async chkboxChange(index, obj) {
			this.isShowLoading = true
			// 直接修改cartList的数据
			this.updateCartListItem({
				index,
				payload: { isChecked: Boolean(obj.isChecked) ? 0 : 1 },
			})
			// 向服务器发起请求修改, 购物车里的数据都很明显的有
			const res_update = await reqModifyShopCartOther({
				userId: this.userId,
				goodsId: obj.id,
				isChecked: obj.isChecked,
			}).catch((err) => err)
			this.isShowLoading = false

			if (res_update.code !== 1) {
				this.$toast('error', '修改服务器数据失败')
			}
		},

		// 点击跳出popup
		// 1.修改curGoodIndex数据
		handlePopup(index, obj) {
			this.curModifiedGoods = Object.create(obj)
			this.curGoodIndex = index
			this.isPopupShow = true
		},
		// popup里的确认按钮
		// 1.点击即确定将curModifyGoods的birthCardMsg数据更新到数据库中(取消, 因为无论输入自定义语句还是点击生成模板语句都会更新vuex的数据, 提交时不必再多此一举)
		// 2.清空生日卡信息, 当前商品序号数据,
		// 2.关闭popup
		async popupConfirm() {
			if (
				!this.curModifiedGoods &&
				typeof this.curModifiedGoods === 'object'
			) {
				return console.error(
					'shopcart.vue:curModifiedGoods数据在更改生日卡片信息时检查为null,请检查逻辑'
				)
			}
			let reg = /^[\u4e00-\u9fa5A-Za-z0-9]+$/
			if (
				reg.test(this.curModifiedGoods.birthCardMsg) &&
				this.curModifiedGoods.birthCardMsg.length <= 9
			) {
				console.log(
					'%c shopcart.vue:生日牌信息格式正确',
					'padding:2px 4px;background-color:green;color:yellow;'
				)
				this.isPopupShow = false
				this.isShowLoading = true

				const res_update = await reqModifyShopCartOther({
					userId: this.userId,
					goodsId: this.curModifiedGoods.id,
					birthCardMsg: this.curModifiedGoods.birthCardMsg,
				})
				if (res_update.code !== 1) {
					this.$toast('error', '修改服务器数据失败')
				} else {
					this.updateCartListItem({
						index: this.curGoodIndex,
						payload: {
							birthCardMsg: this.curModifiedGoods.birthCardMsg,
						},
					})
				}
				this.isShowLoading = false
				this.clearCurGood()
			} else if (!reg.test(this.curModifiedGoods.birthCardMsg)) {
				console.error(
					'shopcart.vue:生日牌信息格式错误:不符合仅限汉字,大小写字母与数字的规定'
				)
				this.$toast('error', '仅限汉字,大小写字母与数字')
			} else if (this.curModifiedGoods.birthCardMsg.length > 9) {
				console.error(
					'shopcart.vue:生日牌信息格式错误:不符合字符长度必须小于等于9位的规定'
				)
				this.$toast('error', '字符长度不得超过9位')
			}
		},
		// 生日卡片框触发change事件
		// 1.将输入框的数据更新到cartList数据中
		changeCustomBirthCardMsg(e) {
			console.log(
				'%c sshopcart.vue:触发u-input的change事件,值为' + e,
				'padding:2px 4px;background-color:green;color:yellow;'
			)
			if (
				typeof this.curModifiedGoods === 'object' &&
				!this.curModifiedGoods
			) {
				return
			}
			// let reg = /^[\u4e00-\u9fa5A-Za-z0-9]+$/
			// if (reg.test(e) && e.length <= 9) {}
			if (
				!Object.prototype.hasOwnProperty.call(
					this.curModifiedGoods,
					'birthCardMsg'
				)
			) {
				Object.defineProperty(this.curModifiedGoods, 'birthCardMsg', {
					configurable: true,
					enumerable: true,
					writable: true,
					value: e,
				})
			} else {
				this.curModifiedGoods.birthCardMsg = e
			}
		},
		// 点击popup的模板字符串, 并更新到服务器中
		async updateTemplateBirthCardMsg(templateValue) {
			this.isShowLoading = true
			// 更新到vuex中
			this.updateCartListItem({
				index: this.curGoodIndex,
				payload: {
					birthCardMsg: templateValue,
				},
			})
			// 更新到数据库中
			const res_update = await reqModifyShopCartOther({
				userId: this.userId,
				goodsId: this.curModifiedGoods.id,
				birthCardMsg: templateValue,
			}).catch((err) => err)
			if (res_update.code !== 1) {
				this.$toast('error', '修改服务器数据失败')
			}
			this.isShowLoading = false
			this.isPopupShow = false
		},
		// popup自带的关闭按钮
		// 点击关闭按钮, 也就是说对cartList数据不作任何改变
		// 2.清空curGoodIndex数据
		// 3.关闭popup
		closePopup() {
			this.clearCurGood()
			console.log(this.curModifiedGoods)
			this.isPopupShow = false
		},
		// 选择蜡烛是否需要
		// 跳出选择器
		// 修改curGoodIndex数据
		choiceCandle(index, obj) {
			this.curModifiedGoods = Object.create(obj)
			this.curGoodIndex = index
			this.isPickerShow = true
		},
		// 点击选择器确定按钮
		// 1.直接修改掉cartList的candle数据
		// 2.关闭picker
		async confirmPicker(e) {
			this.isPickerShow = false
			this.isShowLoading = true
			console.log(e.value[0])
			this.updateCartListItem({
				index: this.curGoodIndex,
				payload: {
					candle: e.value[0],
				},
			})
			const res_update = await reqModifyShopCartOther({
				userId: this.userId,
				goodsId: this.curModifiedGoods.id,
				candle: e.value[0],
			}).catch((err) => err)
			this.clearCurGood()
			this.isShowLoading = false
			if (res_update.code !== 1) {
				this.$toast('error', '修改服务器数据失败')
			}
		},
		// 点击选择器关闭按钮
		// 1.关闭picker
		cancelPicker(e) {
			this.clearCurGood()
			this.isPickerShow = false
		},
		// 点击popup的不需要按钮
		// 2.关闭popup
		// 3.删除当前操作对象的birthCardMsg属性
		dontNeedBirthCard() {
			this.updateCartListItem({
				index: this.curGoodIndex,
				payload: { birthCardMsg: '不需要' },
			})
			this.clearCurGood()
			this.isPopupShow = false
		},
		clearCurGood() {
			this.curModifiedGoods = null
			this.curGoodIndex = undefined
		},
		// 模态框同意登录, 跳转登录页面
		confirm() {
			// 同意跳转登录页面
			this.$switchPage({ pageName: 'Login' })
			// uni.navigateTo({
			// 	url: '/pages/Login/Login',
			// })
		},
		// 模态框取消登录，跳转index页面
		cancel() {
			// 取消即跳转index页面
			// this.show = false
			this.$switchPage({ pageName: 'Index' })
			// uni.switchTab({
			// 	url: '/pages/Index/Index',
			// })
		},
		// 弹出层收起
		closeShopCartCard() {
			this.isShowShopCartCard = false
		},
		// 弹出层打开
		openShopCartCard() {},

		// 点击改写按钮
		// 对商品的处理逻辑格式是修改
		// 修改curModifiedGoods数据, 它被传入购物车卡片
		// 修改curGoodIndex数据, 它被传入数据卡片, 用于通过mutations直接修改cartList数据
		// 修改isShowShopCartCard数据, 令购物卡片显示
		modifyShopCart(good, index) {
			this.shopCardType = 'modify'
			this.curModifiedGoods = Object.create(good)
			this.curGoodIndex = index
			this.isShowShopCartCard = true
		},
		// 购物车的fittings文本
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
		// 选中全部
		chkAll() {
			this.isCheckAll = !this.isCheckAll
		},
		settle() {
			// 1.检查所有bcid===1的商品是否选择了生日牌与蜡烛
			for (let i = 0; i < this.cartList.length; i++) {
				const good = this.cartList[i]
				if (good.isChecked && good.bcid === 1) {
					if (good.birthCardMsg === '') {
						this.$toast('default', '请选择是否需要巧克力生日牌')
						// 跳出, 只要有一个没有就可以停止函数了
						return
					} else if (good.candle === '') {
						this.$toast('default', '请选择是否需要生日蜡烛')
						// 跳出, 只要有一个没有就可以停止函数了
						return
					}
				}
			}
			// 2.跳转订单页
			this.$switchPage({ pageName: 'OrderForm' })
		},
	},
	comonents: {
		GoodItem,
		shopCartSkeleton,
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
.shop-cart-container {
	height: 100vh;
	background-color: #fff;

	& > .scroll-view-container {
		height: calc(100vh - 120rpx);
		// padding-bottom: 150rpx;

		& .header {
			height: 379rpx;
			position: relative;
			background-color: #c2c2c2;

			& > .header-img {
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
			}

			& > .header-hint {
				width: 100%;
				position: absolute;
				bottom: 25rpx;
				text-align: center;

				& > span {
					color: #fff;
					white-space: normal;
					font-size: 28rpx;

					& > a {
						margin-left: 16rpx;
						color: #fff;
						text-decoration: underline;
						padding-right: 20rpx;
					}
				}
			}

			& > .loading-icon {
				height: 100%;
				background-color: #000;
				opacity: 0.5;
			}
		}

		& .recommand {
			padding: 30rpx;
			padding-bottom: 150rpx;

			& > .goods-container {
				width: 100%;
				display: flex;
				justify-content: space-between;
				flex-wrap: wrap;
				& > .item-container {
					width: 49%;
					height: 510rpx;
				}
			}
		}

		& .shop-cart-detail-container {
			padding: 0 20rpx;
			padding-bottom: 150rpx;
			& .sai {
				margin-bottom: 20rpx;
				& ::v-deep .u-swipe-action-item__right {
					border: 1px solid #fff !important;
					overflow: hidden;
				}
			}
			& .sa-item-container {
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				padding: 20rpx;
				padding-left: 50rpx;
				position: relative;
				border-color: #fff !important;
				border-right: 1px solid #f0250f !important;

				// border-right: 1rpx solid red;
				overflow: hidden;

				& > .first-line {
					display: flex;
					justify-content: flex-start;

					& .chkbox {
						position: absolute;
						left: 0;
						top: 50%;
						transform: translateY(-50%);

						&.active {
							::v-deep
								.u-checkbox__icon-wrap.u-checkbox__icon-wrap--square {
								background-color: #ffe32a !important;
								border-color: #ffe32a !important;
							}
						}

						&.inactive {
							::v-deep
								.u-checkbox__icon-wrap.u-checkbox__icon-wrap--square {
								background-color: #b7b7b7 !important;
								border-color: #b7b7b7 !important;
							}
						}
					}

					& > .first-line-info {
						display: flex;
						flex-direction: column;
						justify-content: flex-end;
						flex: 1;
						padding-left: 20rpx;
						& > .first-line-info-first-line {
							width: 100%;
							display: flex;
							justify-content: space-between;
							& > .edit-pen-container {
								width: 40rpx;
								height: 40rpx;
								border-radius: 50%;
								background-color: #e6e6e6;
								display: flex;
								align-items: center;
								justify-content: center;
							}
						}

						& > .price {
							display: flex;
							justify-content: space-between;

							& > span {
								font-size: 24rpx;
							}

							& > span {
								&:nth-of-type(1) {
									font-weight: bold;
								}
							}
						}

						& > .fitting {
							display: flex;
							justify-content: flex-end;
						}
					}
				}

				& > .second-line {
					display: flex;
					justify-content: space-between;
					font-size: 24rpx;
					padding: 15rpx 0;

					& .title {
						font-weight: bold;
						margin-right: 10rpx;
					}

					& > .chocolate-card,
					& > .candle {
						flex: 1;
						display: flex;
					}

					& > .candle {
						display: flex;
						justify-content: flex-end;
					}
				}
			}

			& .add-more {
				padding: 0 20rpx;

				& .scroll-list-item-container {
					margin-right: 20rpx;
					&:nth-last-of-type(1) {
						margin-right: 0;
					}

					& .item-container {
						width: 202rpx;
						height: 350rpx;
					}
				}
			}
		}

		& .bottom-container {
			width: 95%;
			height: 130rpx;
			position: fixed;
			bottom: 0;
			left: 50%;
			transform: translateX(-50%);
			background-color: #fff;
			padding-top: 20rpx;
			z-index: 9; // loading-page的z-index是10070

			& .btn-style {
				width: 100%;
				height: 90rpx;
				background-color: #ffe32a;
			}
			& > .bill {
				width: 100%;
				height: 100%;
				display: flex;
				flex-wrap: nowrap;
				align-items: center;
				justify-content: space-between;
				padding-left: 20rpx;
				position: relative;
				& .chkbox {
					flex: 2;

					&.active {
						::v-deep
							.u-checkbox__icon-wrap.u-checkbox__icon-wrap--square {
							background-color: #ffe32a !important;
							border-color: #ffe32a !important;
						}
					}

					&.inactive {
						::v-deep
							.u-checkbox__icon-wrap.u-checkbox__icon-wrap--square {
							background-color: #b7b7b7 !important;
							border-color: #b7b7b7 !important;
						}
					}
				}

				& .total {
					height: 100%;
					flex: 3;
					display: table;
					& > .total-text {
						display: table-cell;
						vertical-align: middle;
					}
				}

				& .btn {
					flex: 2;
					height: 100%;
					background-color: #ffe32a;
					display: flex;
					& > .text {
						justify-content: center;
						align-items: center;
					}
				}
			}
		}
	}
	& .popup-container {
		.popup-content {
			height: calc(100vh - 120rpx);
			background-color: #fff;
			padding: 60rpx;
			padding-top: 100rpx;

			& > .popup-row {
				height: 100rpx;
				position: relative;
				&{
					@include bottomLine();
				}

				&:nth-of-type(1){
					&::after{
						content: "";
						display: none;
					}
				}

				// &:not(&:nth-of-type(1)) {
				// 	@include bottomLine();
				// }
			}
			& > .birth-card-options {
				& .popup-row {
					height: 100rpx;
					position: relative;
					@include bottomLine();
				}
			}

			& .btn {
				background-color: $mcake-confirm !important;
			}
		}
	}

	&::v-deep .shopCartLoadingPage {
		z-index: 10090;
		background-color: transparent !important;
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

	::v-deep .u-swipe-action-item__content {
		z-index: 9;
	}

	::v-deep .u-toast {
		z-index: 11058 !important;
		position: relative !important;
	}
}
</style>
