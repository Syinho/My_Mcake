<template>
	<view class="good-show-container">
		<home-title :goods="goods"></home-title>
		<view class="recommend-products-container">
			<view class="item-container" v-for="(item) in recommandProducts">
				<good-item :good="item" :key="item.id"></good-item>
			</view>
		</view>
	</view>
</template>

<script>
import homeTitle from '@/components/HomeTitle/HomeTitle.vue'
import goodItem from '@/components/GoodItem/GoodItem.vue'
export default {
	name: 'goodShow',
	props: {
		goods: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			recommandProducts: this.goods.recommandProducts || [],
		}
	},
	components: {
		homeTitle,
		goodItem,
	},
}
</script>

<style lang="scss">
.good-show-container {
	width: 100%;
	height: auto;
	padding-bottom: 100rpx;
	position: relative;
	background-color: #fff;

	&::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 1px;
		background-color: #c4c4c4;
		transform: scaleY(0.5);
	}

	& > .recommend-products-container {
		display: flex;
		width: 100%;
		height: auto;
		justify-content: space-evenly;
		flex-wrap: wrap;
		& > .item-container {
			width: 49%;
			height: 510rpx;
			position: relative;
		}
	}
}
</style>
