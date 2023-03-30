<template>
	<view class="map-address-container">
		<nav-custom></nav-custom>
		<scroll-view scroll-y show-scrollbar class="scroll-view-container">
			<view class="map-container">
				<map class="map" :longitude="longitude" :latitude="latitude"></map>
			</view>
			<!-- labelPosition: 表单域提示文字的位置，left-左侧，top-上方 -->
			<u--form class="form-container">
				<u-form-item borderBottom leftIcon="account" :leftIconStyle="leftIconStyle">
					<u--input v-model="address.name" border="none" placeholder="请输入收货人姓名"></u--input>
				</u-form-item>
				<u-form-item borderBottom leftIcon="phone" :leftIconStyle="leftIconStyle">
					<u--input v-model="address.phone" border="none" placeholder="请输入手机号码"></u--input>
				</u-form-item>
				<u-form-item borderBottom leftIcon="map" :leftIconStyle="leftIconStyle">
					<u--text text="上海市" color="#8d8d8d"></u--text>
					<u--text :text="address.area.text" @click="handlePicker"></u--text>
					<u-icon slot="right" name="arrow-right" @click="handlePicker"></u-icon>
				</u-form-item>
				<u-form-item borderBottom leftIcon="map" :leftIconStyle="leftIconStyle" v-show="address.area.text!=='请选择区域'">
					<!-- <u--input v-model="address.home" border="none" placeholder="请输入您的地址"></u--input> -->
					<view @click="showPopup">
						<u--text :text="address.area.detail?address.area.detail:'请输入您的地址'"></u--text>
					</view>
				</u-form-item>
				<u-form-item borderBottom leftIcon="map" :leftIconStyle="leftIconStyle" v-show="address.area.detail">
					<u--input v-model="address.area.houseNum" border="none" placeholder="请输入楼号, 房间号"></u--input>
				</u-form-item>
				<u-form-item>
					<u-checkbox-group @change="handleChkbox">
						<u-checkbox :checked="address.isDefault" shape="circle" label="是否设为默认地址" activeColor="#ffe32a" size="50rpx" inactiveColor="#8d8d8d" labelColor="#8d8d8d"></u-checkbox>
					</u-checkbox-group>

				</u-form-item>
			</u--form>
			<view class="bottom"></view>
			<u-button @click="submit" class="submit-btn">保存并使用</u-button>
		</scroll-view>

		<u-notify ref="uNotify"></u-notify>
		<u-picker :show="address.area.isShowPicker" :columns="columns" keyName="name" @confirm="pickerConfirm" @cancel="pickerCancel" @change="pickerChange"></u-picker>
		<u-popup :show="address.area.isShowPopup" @close="closePopup" closeable>
			<scroll-view scroll-y show-scrollbar class="popup-content scroll-view-container">
				<u--input v-model="searchWord" border="bottom" placeholder="请输入你的地址" prefixIcon="map" @change="debounceSearch" focus></u--input>
				<view class="address-suggest-item" v-for="(item,index) in address.suggestAddress" :key="item.address" @click="pitchOnSuggestAddress(item)">
					<u--text :text="item.title" size="35rpx"></u--text>
					<u--text :text="item.address" size="20rpx"></u--text>
				</view>
				<!-- 没有搜索到任何值 -->
				<view class="no-address" v-if="address.isNoSuggest">
					<u--text text="没有搜索到与之相关的地址" size="30rpx" type="error" align="center"></u--text>
				</view>
				<!-- 不使用建议的地址 -->
				<view class="use-input-address" v-if="address.isAllowUseInputAddress">
					<!-- <u--text text="以上都不是, 以当前输入为准" align="center" size="30rpx" ></u--text> -->
					<u-button :text="btnText" type="primary" plain @click="useCurInputAddress"></u-button>
				</view>
				<view class="popup-bottom"></view>
			</scroll-view>
		</u-popup>
	</view>
</template>

<script>
import {
	reqSearchAddress,
	reqStoreAddress,
	reqGetAllAddress,
	reqModifyAddress,
} from '@/utils/api'
import { mapState, mapMutations, mapActions } from 'vuex'
export default {
	name: 'UniappDemoMapAddress',

	data() {
		return {
			latitude: 31.235929,
			longitude: 121.480539,
			covers: [
				{
					latitude: 39.909,
					longitude: 116.39742,
					// iconPath: '../../../static/location.png'
				},
				{
					latitude: 39.9,
					longitude: 116.39,
					// iconPath: '../../../static/location.png'
				},
			],
			address: {
				name: '',
				phone: '',
				area: {
					isShowPicker: false,
					text: '请选择区域', // 行政区选择
					isShowPopup: false,
					detail: '',
					houseNum: '',
				},
				// home: '',
				isDefault: false,
				suggestAddress: [], // 搜索得到的建议地址
				isNoSuggest: false, // 是否没有搜索到建议地址, 默认false
				isAllowUseInputAddress: false, // 标识是否允许使用用户输入的地址, 需要满足1.用户有输入字符 2.用户的输入值有搜索到建议地址
			},
			leftIconStyle: {
				'font-size': '50rpx',
				color: '#ccc',
			},
			areas: '黄浦区、徐汇区、长宁区、静安区、普陀区、虹口区、杨浦区、浦东新区、闵行区、宝山区、嘉定区、金山区、松江区、青浦区、奉贤区、崇明区',
			searchTimer: null, // 搜索延迟函数
			searchWord: '', // 输入搜索的地址文字
			btnText: '以上都不是, 以当前输入为准',
		}
	},
	computed: {
		...mapState('user', {
			isLogin: (state) => state.isLogin,
			userId: (state) => state.userId,
			modifiedAddress: (state) => state.modifiedAddress,
		}),
		columns() {
			let areasArr = this.areas.split('、')
			let arr = []
			for (let i = 0; i < areasArr.length; i++) {
				arr.push({ name: areasArr[i], index: i })
			}
			return [arr]
		},
	},
	created() {
		console.log('mapAddress created')
		if (JSON.stringify(this.modifiedAddress) !== '{}') {
			this.address.phone = this.modifiedAddress.phone
			this.address.name = this.modifiedAddress.uname
			let reg1 = /^(\S+,\S+),(\S+)$/
			let res = this.modifiedAddress.address.match(reg1)
			this.address.area.detail = res[1]
			this.address.area.houseNum = res[2]
			this.address.isDefault =
				this.modifiedAddress.isDefault === '1' ? true : false
			let reg = /市(\S{2,4}区)/
			let text = this.modifiedAddress.address.match(reg)[1]
			console.log(text)
			this.address.area.text = text
			console.log(this.address)

			// this.$nextTick(() => {
			// 	this.reWriteModifiedAddress({})
			// })
		}
	},
	mounted() {
		uni.hideTabBar({
			animation: false,
		})
	},
	watch: {
		['address.area.detail'](newVal, oldVal) {
			if (newVal === '') {
				this.address.suggestAddress = []
				if (this.searchTimer) {
					clearTimeout(this.searchTimer)
					this.searchTimer = null
				}
			}
		},
	},

	methods: {
		...mapMutations('user', [
			'reWriteAddress',
			'reWriteBeUsedAddress',
			'reWriteModifiedAddress',
			'modifyAddressItem',
		]),
		handlePicker() {
			this.address.area.isShowPicker = true
		},
		pickerConfirm(e) {
			// console.log(e)
			this.address.area.text = e.value[0].name
			this.address.area.isShowPicker = false
		},
		pickerCancel() {
			this.address.area.isShowPicker = false
		},
		pickerChange(e) {
			this.address.area.detail = this.address.area.houseNum = ''
		},
		// 点击提交新地址
		async submit() {
			if (!this.isLogin) {
				return this.$notify('error', '未登录, 你怎么进来这个页面的??')
			}
			if (!this.address.name) {
				return this.$notify('error', '姓名不可为空')
			} else {
				let reg = /^[\w\u4e00-\u9fa5A]{1,11}$/
				if (!reg.test(this.address.name)) {
					return this.$notify('error', '姓名格式错误:1-11个非空字符')
				}
			}
			if (!this.address.phone) {
				return this.$notify('error', '手机号不可为空')
			} else {
				let reg = /^\d{11}$/
				if (!reg.test(this.address.phone)) {
					return this.$notify('error', '手机号格式错误:11个数字')
				}
			}

			if (!this.address.area.text) {
				return this.$notify('error', '请选择城市区域')
			}
			if (!this.address.area.detail) {
				return this.$notify('error', '请填写详细收获地址')
			}
			if (!this.address.area.houseNum) {
				return this.$notify('error', '请填写楼号,门牌号')
			}
			let newAddressData = {
				userId: this.userId,
				uname: this.address.name,
				phone: this.address.phone,
				address:
					this.address.area.detail + ',' + this.address.area.houseNum,
				isDefault: this.address.isDefault ? '1' : '0',
			}
			// 检查modifiedAddress数据是否为空, 不为空代表是修改地址, 那么执行修改逻辑
			if (JSON.stringify(this.modifiedAddress) !== '{}') {
				newAddressData.id = this.modifiedAddress.id
				const res_update = await reqModifyAddress(newAddressData)
				if (res_update.code === 1) {
					// 向服务器请求新数据
					// 重新请求新的地址数据
					const res_select = await reqGetAllAddress(
						this.userId
					).catch((err) => err)
					if (res_select.code === 1) {
						if (res_select.data.length === 0) return
						this.reWriteAddress(res_select.data)
					} else {
						return this.$notify('error', res_select.msg)
					}
					// 将这个地址加入到被使用地址数据中
					this.reWriteBeUsedAddress(newAddressData)
					// 更新成功, 删除modifiedAddress
					this.reWriteModifiedAddress({})

					// 跳转地址页
					// uni.navigateTo({
					// 	url: '/pages/Address/Address',
					// })
					this.$switchPage({ pageName: 'Address' })
				} else {
					this.$notify('error', res_update.msg)
				}
				return
			} else {
				// 检查完毕, 允许向服务器发送请求, 执行添加逻辑
				const res_insert = await reqStoreAddress(newAddressData).catch(
					(err) => err
				)
				if (res_insert.code === 1) {
					console.log('添加地址成功')
					// 重新请求新的地址数据
					const res_select = await reqGetAllAddress(
						this.userId
					).catch((err) => err)
					if (res_select.code === 1) {
						if (res_select.data.length === 0) return
						this.reWriteAddress(res_select.data)
					} else {
						return this.$notify('error', res_select.msg)
					}
					// 将这个地址加入到被使用地址数据中
					Object.assign(newAddressData, { id: res_insert.data.id })
					this.reWriteBeUsedAddress(newAddressData)

					// 跳转订单页
					// uni.navigateTo({
					// 	url: '/pages/OrderForm/OrderForm',
					// })
					this.$switchPage({ pageName: 'OrderForm' })
				} else {
					return console.log(res_insert)
				}
			}
		},
		handleChkbox() {
			this.address.isDefault = !this.address.isDefault
		},
		showPopup() {
			this.address.area.isShowPopup = true
			if (this.address.area.detail) {
				this.searchWord = this.address.area.detail
				this.searchAddress(this.searchWord)
			}
		},
		closePopup() {
			this.address.area.isShowPopup = false
			this.address.suggestAddress = []
			this.isNoSuggest = false
			this.searchWord = ''
		},
		async searchAddress(e) {
			console.log(e)

			if (!this.address.area.isShowPopup) return

			// if (this.searchWord === this.address.area.detail) {
			// 	// 来自于初次点击的修改
			// 	return
			// }
			this.searchWord = e
			let key = 'XBGBZ-FRMRJ-3V5FY-XHGXK-GWGT5-SQBXJ'
			let keyword = e
			if (keyword === '') {
				this.address.suggestAddress = []
				this.address.isAllowUseInputAddress = false
				return
			}
			let region = '上海市' + this.address.area.text
			let region_fix = 1
			let policy = 1
			let page_size = 20
			let page_index = 1

			const res_search = await reqSearchAddress({
				key,
				keyword,
				region,
				region_fix,
				policy,
				page_size,
				page_index,
			})
			console.log(res_search)
			if (res_search.code === 1) {
				if (res_search.data.count === 0) {
					this.address.isAllowUseInputAddress = true
					this.btnText = '使用当前的输入地址'
					this.address.isNoSuggest = true
					this.address.suggestAddress = res_search.data.data
					return
				}
				if (this.address.isNoSuggest) {
					this.address.isNoSuggest = false
				}
				this.btnText = '以上都不是, 以当前输入为准'
				this.address.suggestAddress = res_search.data.data
				this.address.isAllowUseInputAddress = true
			} else {
				console.error('查询失败')
			}
		},
		debounceSearch(e) {
			console.log('debounce')
			if (this.searchTimer) {
				clearTimeout(this.searchTimer)
				this.searchTimer = null
			}
			this.searchTimer = setTimeout(() => {
				this.searchAddress(e)
				this.searchTimer = null
			}, 1500)
		},
		// 选中建议的地址
		pitchOnSuggestAddress(obj) {
			this.address.area.houseNum = ''
			const { title, address } = obj
			this.address.area.detail = address + ',' + title
			this.address.suggestAddress = []
			this.address.isNoSuggest =
				this.address.isAllowUseInputAddress = false
			this.address.area.isShowPopup = false
			this.searchWord = ''
			if (this.searchTimer) {
				clearTimeout(this.searchTimer)
				this.searchTimer = null
			}
		},
		useCurInputAddress() {
			// 清空建议框
			// 将isNoSuggest, isAllowUseInputAddress两个值设为false
			this.address.area.houseNum = ''
			this.address.area.detail = this.searchWord
			this.address.suggestAddress = []
			this.address.isNoSuggest =
				this.address.isAllowUseInputAddress = false
			this.address.area.isShowPopup = false
			this.searchWord = ''
		},
	},
}
</script>

<style lang="scss" scoped>
.map-address-container {
	& .scroll-view-container {
		height: calc(100vh - 120rpx);
		& .bottom {
			height: 130rpx;
			background-color: #f1f1f1;
		}
		.map-container {
			height: 520rpx;
			.map {
				width: 100%;
				height: 520rpx;
			}
		}
		.form-container {
			padding: 20rpx;
			::v-deep .u-checkbox-group {
				margin: 0 auto;
				margin-top: 50rpx;
			}
		}
		.submit-btn {
			position: fixed;
			bottom: 20rpx;
			left: 20rpx;
			right: 20rpx;
			width: auto !important;
			background-color: #ffe32a;
			height: 90rpx;
			font-size: 30rpx;
			border-radius: 15rpx;
		}
	}

	.popup-content {
		padding-top: 80rpx;
		height: calc(100vh - 120rpx);
		& .address-suggest-item {
			width: 90%;
			margin: 0 auto;
			position: relative;
			padding: 20rpx;
			@include bottomLine();
		}
		& .no-address,
		.use-input-address {
			margin: 40rpx;
		}

		// & .use-input-address {
		// 	// border: 1px solid black;
		// 	// height: 80rpx;
		// 	// line-height: 80rpx;
		// 	// border-radius: 15rpx;
		// }
		& .popup-bottom {
			height: 50rpx;
			background-color: #fff;
		}
	}
}
</style>