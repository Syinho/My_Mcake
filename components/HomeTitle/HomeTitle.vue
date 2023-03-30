<template>
	<view class="home-container">
		<view class="home-title">
			<view class="title-img">
				<image src="/static/images/fork.png"></image>
			</view>
			<view class="title-info">
				<text><b class="text-black">{{ goods.title_c ? goods.title_c.slice(0, 2) : '' }}</b>{{ goods.title_c ? goods.title_c.slice(2) : '' }}</text>
				<text style="text-transform: capitalize;">{{ goods.title_e }}</text>
			</view>
			<view class="title-more">
				<text v-if="goods.isShowMore">查看更多...</text>
			</view>
		</view>
		<image :src="headerProducts[0].headerImgUrl" v-if="headerProducts.length === 1" class="header-img"></image>
		<scroll-view v-if="headerProducts.length > 1" scroll-x="true" show-scrollbar="true" class="scroll-view-container">
			<view v-for="(item, index) in headerProducts " class="scroll-view-item" :key="index">
				<image :src="item.headerImgUrl" class="scroll-view-item-img" mode="aspectFill"></image>
			</view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	name: "home-title",
	props: {
		goods: {
			type: Object,
			required: true
		}
	},
	data () {
		return {
			headerProducts: this.goods.headerProducts || []
		};
	},
	computed: {},
}
</script>

<style lang="scss" scoped>
.home-container {
	width: 100%;

	.home-title {
		width: 100%;
		height: 256rpx;
		background-color: #fff;
		display: flex;
		justify-content: center;
		align-items: center;
		color: grey;

		&>.title-img {
			width: 170rpx;
			height: 75rpx;

			&>image {
				width: 115rpx;
				height: 75rpx;
			}
		}

		&>.title-info {
			width: 340rpx;
			height: 75rpx;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
		}

		&>.title-more {
			width: 150rpx;
			height: 75rpx;
			line-height: 75rpx;
			font-size: 12rpx;
		}
	}

	&>.header-img {
		width: 100%;
		height: 380rpx;
	}

	.scroll-view-container {
		width: 100%;
		white-space: nowrap;

		.scroll-view-item {
			width: 228rpx;
			height: 290rpx;
			display: inline-block;
			overflow: hidden;

			&:nth-of-type(1) {
				width: 433rpx;
			}

			.scroll-view-item-img {
				width: 100%;
				height: 100%;
			}
		}

		// ::-webkit-scrollbar {
		// 	/*滚动条整体样式*/
		// 	width: 4px !important;
		// 	height: 1px !important;
		// 	overflow: auto !important;
		// 	background: #ccc !important;
		// 	-webkit-appearance: auto !important;
		// 	display: block;
		// }

		// ::-webkit-scrollbar-thumb {
		// 	/*滚动条里面小方块*/
		// 	border-radius: 10px !important;
		// 	box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2) !important;
		// 	background: #7b7979 !important;
		// }

		// ::-webkit-scrollbar-track {
		// 	/*滚动条里面轨道*/
		// 	// box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2) !important;
		// 	// border-radius: 10px !important;
		// 	background: #FFFFFF !important;
		// }
	}
}
</style>
