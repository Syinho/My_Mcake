<template>
	<view class="address-card-container">
		<view class="line1">
			<checkbox-group>
				<checkbox class='round' :class="isChecked?'checked':''" value="A" @click="handle" :checked="isChecked?true:false">
				</checkbox>
			</checkbox-group>

			<view class="info">
				<u-text :text="curAddress.uname+', '+curAddress.phone" size="28rpx" bold :style="{marginBottom:'10rpx'}"></u-text>
				<u-text :text="curAddress.address" size="24rpx" color="#a2a2a2"></u-text>
			</view>
			<view class="edit-pen-container" @click="editAddress">
				<u-icon name="edit-pen" color="#CACACA" size="40rpx"></u-icon>
			</view>

		</view>
		<view class="line2">
			<view class="edit" @click="setDefault">
				<u-icon name="edit-pen" color="#CACACA" size="28rpx"></u-icon>
				<text>{{curAddress.isDefault==='1'?'默认地址':'设为默认'}}</text>
			</view>
			<u-line direction="col" length="100%"></u-line>
			<view class="delete" @click="deleteAddress">
				<view class="cuIcon-delete" :style="{fontSize:'28rpx',color:'#CACACA'}"></view>
				<text>删除</text>
			</view>
		</view>
		<view class="default-icon" v-if="curAddress.isDefault==='1'">
			<text>默</text>
		</view>

	</view>
</template>

<script>
import { reqModifyAddress, delAddress } from '@/utils/api'
import { mapState, mapMutations } from 'vuex'
export default {
	props: {
		curAddress: {
			type: Object,
			required: true,
		},
	},
	name: 'UniappDemoAddressCard',
	computed: {
		...mapState('user', {
			beUsedAddress: (state) => state.beUsedAddress,
			address: (state) => state.address,
			userId: (state) => state.userId,
		}),
		isChecked: {
			set(val) {
				// 如果新设置值为false, 那么代表的是当前由选中到取消选中的逻辑
				// 如果新设置值为true, 那么代表的是当前由未选中到选中的逻辑
				if (val) {
					this.reWriteBeUsedAddress(this.curAddress)
				} else {
					this.reWriteBeUsedAddress({})
				}
			},
			get() {
				// 当前address.id与被使用的地址id一致时, 标记选中
				return this.curAddress.id === this.beUsedAddress.id
			},
		},
	},

	data() {
		return {}
	},

	mounted() {},

	methods: {
		...mapMutations('user', [
			'reWriteBeUsedAddress',
			'modifyAddressItem',
			'delAddressItem',
			'reWriteModifiedAddress',
		]),
		handle() {
			this.isChecked = !this.isChecked
		},
		// 设置为默认
		async setDefault() {
			// 当前的地址的isDefault为1, 那么不执行逻辑
			if (this.curAddress.isDefault === '1') {
				return
			}
			this.$bus.$emit('showLoadingPage')
			// 1.更改当前的数据
			console.log(this.address)
			let p = []
			// 遍历所有地址
			// 1.如果该地址的isDefault值为1, 那么把这个值设为0
			// 2.如果遍历到当前的数据, 那么将其isDefault值设为1, 并且向服务器发起请求进行更改
			for (let i = 0; i < this.address.length; i++) {
				let item = this.address[i]
				console.log(i)
				if (item.isDefault === '1') {
					this.modifyAddressItem({
						index: i,
						payload: { isDefault: '0' },
					})
				}
				if (item.id === this.curAddress.id) {
					// 更改本地的所有address的isDefault为0
					console.log('修改id为' + item.id + '的isDefault为1')
					this.modifyAddressItem({
						index: i,
						payload: { isDefault: '1' },
					})
					let data = {
						id: this.curAddress.id,
						userId: this.userId,
						isDefault: '1',
					}
					p.push(reqModifyAddress(data))
				}
			}
			Promise.all(p)
				.then((result) => {
					console.log(result)
					this.$bus.$emit('hiddenLoadingPage')
				})
				.catch((err) => {
					console.log(err)
					this.$bus.$emit('hiddenLoadingPage')
				})
		},
		// 删除某个当前地址
		async deleteAddress() {
			this.$bus.$emit('showLoadingPage')
			const { id } = this.curAddress
			// 先从数据上删除
			this.delAddressItem(this.curAddress)

			const res_del = await delAddress(id).catch((err) => err)
			if (res_del.code !== 1) {
				this.$bus.$emit('showNotify', 'error', res_del.msg)
			}
			this.$bus.$emit('hiddenLoadingPage')
		},
		editAddress() {
			this.reWriteModifiedAddress(this.curAddress)
            this.$switchPage({pageName:'MapAddress'})
            // uni.navigateTo({
            //     url:'/pages/MapAddress/MapAddress'
            // })
		},
	},
}
</script>

<style lang="scss" scoped>
.address-card-container {
	background-color: #fff;
	position: relative;
	margin-bottom: 20rpx;
	border: 1px solid #eee;
	border-radius: 5px;
	& > .line1 {
		display: flex;
		flex-wrap: nowrap;
		justify-content: flex-start;
		align-items: center;
		padding: 20rpx;

		position: relative;
		& > .info {
			padding-left: 20rpx;
			padding-right: 80rpx;
		}
		& > .edit-pen-container {
			width: 60rpx;
			height: 60rpx;
			border-radius: 50%;
			background-color: #e6e6e6;
			display: flex;
			align-items: center;
			justify-content: center;
			position: absolute;
			top: 40rpx;
			right: 20rpx;
		}
	}

	& > .line2 {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		height: 80rpx;
		padding: 20rpx;
		font-size: 24rpx;
		& > .edit,
		& > .delete {
			width: 50%;
			display: flex;
			justify-content: center;
			align-items: center;
			& > uni-text {
				margin-left: 20rpx;
			}
		}
	}

	& > .default-icon {
		position: absolute;
		right: 0;
		top: 0;
		width: 50rpx;
		height: 50rpx;
		border-bottom: 25rpx solid transparent;
		border-left: 25rpx solid transparent;
		border-right: 25rpx solid #ffcd20;
		border-top: 25rpx solid #ffcd20;
		& > uni-text {
			font-size: 6rpx;
			position: absolute;
			top: 0;
			right: 0;
			transform: translate(25rpx, -25rpx) rotateZ(45deg);
		}
	}

	& ::v-deep .uni-checkbox-input {
		background-color: #fff !important;
	}
	& ::v-deep .uni-checkbox-input-checked {
		background-color: #ffe32a !important;
		border-color: #ffe32a !important;
	}
}
</style>