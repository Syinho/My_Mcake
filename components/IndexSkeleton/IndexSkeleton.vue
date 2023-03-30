<template>
	<view class="index-skeleton">
		<view class="title">标题加载中...</view>
		<view class="header">
			<u-skeleton :title="false" rows="1" rowsHeight="380rpx"></u-skeleton>
		</view>
		<view class="goods-container">
			<view class="goods-item" v-for="(item,index) in 8">
				<u-skeleton :title="false" rows="1" rowsHeight="510rpx"></u-skeleton>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'UniappDemoIndexSkeleton',
	data() {
		return {}
	},

	mounted() {},

	methods: {},
}
</script>

<style lang="scss" scoped>
.index-skeleton {
	width: 100%;
	margin-bottom: 50rpx;
	& > .title {
		height: 256rpx;
		background-color: #fff;
		line-height: 256rpx;
		text-align: center;
	}

	& .header {
		width: 100%;
		height: 380rpx;
		margin-bottom: 20rpx;
		overflow: hidden;
	}
	& .goods-container {
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;
		& > .goods-item {
			width: 48%;
			height: 510rpx;
			margin-bottom: 20rpx;
		}
	}
	::v-deep .u-skeleton__wrapper__content__rows {
		width: 100% !important;
	}
}
</style>