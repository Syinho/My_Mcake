<template>
    <view class="footer-tab">
        <view class="tab-item" v-for="(item, index) in tabArr" :key="index" :class="{ active: index === curIdx }" @click="handleSwitchTab(item)">
            <view class="content" :class="{ last: index === tabArr.length - 1 }">
                <u--image :src="item.id === curIdx ? item.activeIcon : item.icon" width="60rpx" height="36rpx" :lazy-load="true" mode="aspectFit">
                </u--image>
                <text>{{ item.name }}</text>
                <view class="num" v-if="index === 2 && cartList.length > 0">{{ cartList.length }}</view>
            </view>
        </view>
    </view>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
export default {
    name: 'UniappDemoFooterTab',
    props: {
        curIdx: {
            type: Number,
            required: true
        }
    },
    computed: {
        ...mapState('shopCart', {
            cartList: state => state.cartList
        })
    },
    data () {
        return {
            // curIdx: 0, // 标识当前展示页面,默认为0
            tabArr: [
                {
                    id: 0,
                    name: '首页',
                    icon: '/static/images/home.png',
                    activeIcon: '/static/images/home_active.png',
                    path: 'Index',
                },
                {
                    id: 1,
                    name: '分类',
                    icon: '/static/images/cake.png',
                    activeIcon: '/static/images/cake_active.png',
                    path: 'Categorys'
                },
                {
                    id: 2,
                    name: '购物车',
                    icon: '/static/images/shop-cart.png',
                    activeIcon: '/static/images/shop-cart_active.png',
                    path: 'ShopCart'
                },
                {
                    id: 3,
                    name: '我的',
                    icon: '/static/images/menu.png',
                    activeIcon: '/static/images/menu_active.png',
                    path: 'Profile'
                }
            ]
        }
    },
    onLoad () {

    },
    onShow () {

    },


    mounted () { },

    methods: {
        // ...mapMutations(['updatePrevPage']),
        handleSwitchTab (item) {
            // let routes = getCurrentPages() // 获取当前路由数组
            // let curRoute = String(routes[routes.length - 1].route)
            // let path = curRoute.slice(curRoute.lastIndexOf('/') + 1)
            // console.log('%c footerTab.vue:检测到上一个路由地址为:'+path,'color:white;background-color:black;padding:2px 4px;')
            // this.updatePrevPage(path)
            // uni.switchTab({
            //     url: item.path,
            //     fail (err) {
            //         console.log(err)
            //     }
            // })

            this.$switchPage({pageName:item.path})
        }
    }
}
</script>

<style lang="scss" scoped>
.footer-tab {
    width: 100%;
    height: 113.5rpx;
    display: flex;
    position: absolute;
    bottom: 0;
    left: 0;


    &>.tab-item {
        flex: 1;
        color: #bebebe;

        &.active {
            color: #000;

            &>.content {
                border-bottom-color: #ffe32a;

            }
        }

        &>.content {
            width: 100%;
            height: 100%;
            background-color: #fff;
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            align-items: center;
            border-top: 10rpx solid #fff;
            border-bottom: 10rpx solid #fff;
            position: relative;

            & .num {
                width: 35rpx;
                height: 35rpx;
                border-radius: 50%;
                background-color: #FFE32A;
                position: absolute;
                z-index: 10;
                top: 0;
                left: 50%;
                transform: translateX(15rpx);
                color: #000;
                text-align: center;
                line-height: 35rpx;
            }

            &:not(.last)::after {
                content: '';
                position: absolute;
                top: 0;
                right: 0;
                width: 1px;
                height: 100%;
                background-color: #c4c4c4;
                transform: scaleX(0.5);
            }
        }
    }
}
</style>
