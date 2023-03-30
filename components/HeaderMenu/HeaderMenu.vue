<template>
    <view class="header-menu">
        <ul class="header-menu-content">
            <li class="menu-item">
                <!-- <img src="../../static/images/header_menu_cake.png" alt=""> -->
                <u--image src="../../static/images/header_menu_cake.png" width="80rpx" height="83.2rpx"></u--image>
                <span>最新活动</span>
            </li>
            <li class="menu-item" @click="goToProfile">
                <!-- <img src="../../static/images/header_menu_profile.png" alt=""> -->
                 <u--image src="../../static/images/header_menu_profile.png" width="80rpx" height="83.2rpx"></u--image>
                <span>个人中心</span>
            </li>
            <li class="menu-item">
                <!-- <img src="../../static/images/header_menu_about us.png" alt=""> -->
                 <u--image src="../../static/images/header_menu_about us.png" width="80rpx" height="83.2rpx"></u--image>
                <span>关于我们</span>
            </li>
            <li class="menu-item">
                <!-- <img src="../../static/images/header_menuaddress.png" alt=""> -->
                 <u--image src="../../static/images/header_menuaddress.png" width="80rpx" height="83.2rpx"></u--image>
                <span>配送范围</span>
            </li>
        </ul>
    </view>


</template>

<script>
export default {
    name: 'UniappDemoHeaderMenu',
    data () {
        return {
        };
    },

    mounted () {

    },

    methods: {
        goToProfile(){
            this.$switchPage('Profile')
        }
    },
};
</script>

<style lang="scss" scoped>
.header-menu {
    width: 100%;
    height: 213rpx;

    background-color: #FAFAFA;
    position: absolute;
    top: 0;
    left: 0;
    position: relative;
    z-index: 10071;

    &>.header-menu-content {
        display: flex;
        height: 100%;
        align-items: center;
        position: relative;
        z-index: 20001;


        &>.menu-item {
            flex: 1;
            width: 186rpx;
            height: 150rpx;
            background-color: transparent;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            position: relative;
            &::after{
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 1rpx;
                height: 100%;
                background-color: #E9E9E9;
            }

            &:nth-of-type(1)::after{
                content:"";
                display: none;
            }

            // &:not(&:nth-of-type(1))::after {
            //     content: '';
            //     position: absolute;
            //     top: 0;
            //     left: 0;
            //     width: 1rpx;
            //     height: 100%;
            //     background-color: #E9E9E9;
            // }


        }
    }
}
</style>