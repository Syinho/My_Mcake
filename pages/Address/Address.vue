<template>
	<view class="address-container">
		<nav-custom></nav-custom>
		<u--input placeholder="请输入收货人姓名, 手机号, 地址关键词" :customStyle="inputStyle" @change="search" v-model="searchWord">
			<template slot="suffix">
				<u-button @click="search" text="搜索" color="#FFE32A"></u-button>
			</template>
		</u--input>
		<scroll-view class="scroll-view-container" scroll-y show-scrollbar>
			<view class="addresses" v-if="searchWord===''">
				<address-card v-for="(item,index) in address" :key="item.id" :curAddress="item"></address-card>
			</view>
			<view class="addresses" v-else>
				<address-card v-for="(item,index) in filterAddresses" :key="item.id" :curAddress="item"></address-card>
			</view>
			<view class="add-address" v-if="searchWord==''">
				<view class="icon-container" @click="addAddress">
					<u-icon name="plus" size="50rpx" color="#fff"></u-icon>
				</view>
				<view style="color:#8d8d8d;font-size:30rpx;">新增地址</view>
			</view>
			<view class="bottom"></view>
		</scroll-view>
		<u-loading-page :loading="loadingPage.loading" :color="loading.color" :bgColor="loading.bgColor" :iconSize="loading.iconSize" :loadingColor="loading.loadingColor" :loadingText="loading.loadingText"></u-loading-page>
		<u-notify :show="notify.show" :message="notify.message" :type="notify.type"></u-notify>
	</view>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import AddressCard from '@/components/addressCard/addressCard.vue'
export default {
	name: 'UniappDemoAddress',

	data() {
		return {
			inputStyle: {
				border: '2px solid #ccc !important',
				backgroundColor: '#fff',
				height: '100rpx',
			},
			loadingPage: {
				loading: false,
				color: '#000',
				bgColor: 'rgab(255,255,255,0.1)',
				iconSize: '80rpx',
				loadingColor: '#000',
				loadingText: '',
			},
			notify: {
				show: false,
				message: '',
				type: 'error',
			},
			searchWord: '',
		}
	},
	computed: {
		...mapState('user', {
			address: (state) => state.address,
			filterAddresses: (state) => state.filterAddresses,
		}),
	},
	created() {
		console.log('address created')
		// 1.监听showLoadingPage, hiddenLoadingPage, showNiotify的总线事件, 分别用于显示加载页, 隐藏加载页, 显示提示
		this.$bus.$on('showLoadingPage', () => {
			console.log('%c Address.vue:showLodingPage')
			this.loadingPage.loading = true
		})
		this.$bus.$on('hiddenLoadingPage', () => {
			this.loadingPage.loading = false
		})
		this.$bus.$on('showNotify', (type, message) => {
			let obj = { type, message, show: true }
			this.notify = obj
			setTimeout(() => {
				this.notify = { type: 'error', message: '', show: false }
			}, 3000)
		})
	},
	mounted() {
		uni.hideTabBar({
			animation: false,
		})
	},

	methods: {
		...mapActions('user', ['searchAddress']),
		...mapMutations('user', ['rewriteFilterAddress']),
		addAddress() {
			this.$switchPage({ pageName: 'MapAddress' })
		},
		search(keyword) {
			if (keyword === '') {
				this.rewriteFilterAddress([])
			} else {
				this.$debounce(this.searchAddress).call(this, keyword, 1500)
			}
		},
	},
	components: {
		AddressCard,
	},
	watch: {},
}
</script>

<style lang="scss" scoped>
.address-container {
	background-color: #fff;
	& > .scroll-view-container {
		height: calc(100vh - 220rpx);
		& .addresses {
			padding: 20rpx;
		}
		& .add-address {
			height: 150rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: space-between;
			& > .icon-container {
				width: 85rpx;
				height: 85rpx;
				background-color: #ffe32a;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}
		& .bottom {
			height: 50rpx;
		}
	}
}
</style>