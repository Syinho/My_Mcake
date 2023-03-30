<template>
	<view class="container">
		<view class="first-line">
			<view class="profile-img">
				<u-skeleton rows="1" :title="false" loading rowsHeight="160rpx"></u-skeleton>
			</view>
			<view class="first-line-info">
				<view class="title">
					<u-skeleton rows="1" :title="false" loading rowsHeight="30rpx"></u-skeleton>
				</view>
				<view class="line1">
					<u-skeleton rows="1" :title="false" loading rowsHeight="30rpx"></u-skeleton>
				</view>
				<view class="line2">
					<u-skeleton rows="1" :title="false" loading rowsHeight="30rpx"></u-skeleton>
				</view>
			</view>

		</view>
		<view class="second-line" v-if="isShowSecondLine">
			<view class="part1">
				<u-skeleton rows="1" :title="false" loading rowsHeight="40rpx"></u-skeleton>
			</view>
			<view class="part2">
				<u-skeleton rows="1" :title="false" loading rowsHeight="40rpx"></u-skeleton>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'UniappDemoShopCartSkeleton',
	props: {
		isShowSecondLine: {
			type: Boolean,
			default: true,
		},
	},
	data() {
		return {}
	},

	mounted() {},

	methods: {},
}
</script>

<style lang="scss" scoped>
.container {
	display: flex;
	padding: 20rpx 0;
	padding-left: 30rpx;
	flex-direction: column;
	justify-content: space-between;
	position: relative;
	border-color: #fff !important;
	margin-bottom: 50rpx;

	& > .first-line {
		display: flex;
		justify-content: flex-start;

		& > .profile-img {
			width: 160rpx;
			height: 160rpx;

			::v-deep .u-skeleton__wrapper__content__rows {
				width: 100% !important;
			}
		}

		& > .first-line-info {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			flex: 1;
			padding-left: 20rpx;

			& > .title {
				width: 250rpx;
				height: 30rpx;
			}

			& > .line1,
			.line2 {
				height: 30rpx;
			}
		}
	}
	& > .second-line {
		height: 60rpx;
		padding-top: 20rpx;
		display: flex;
		justify-content: space-between;
		& > .part1 {
			width: 40%;
		}

		& > .part2 {
			width: 40%;
		}
	}
	::v-deep .u-skeleton__wrapper__content__rows {
		width: 100% !important;
	}
}
</style>