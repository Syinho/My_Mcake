<template>
    <view class="container">
        <view class="comment-content">
            <u-skeleton rows="2" :loading="loading" :animate="true">
                <view class="first-line">
                    <view class="left-area">
                        <view class="user-profile">
                            <image :src="comment.uhead" class="profile">
                            </image>
                            <view class="vip-flag" v-if="!loading">v{{ comment.rid }}</view>
                        </view>
                        <text class="name">{{ '会员:' +comment.uname }}</text>
                    </view>
                    <view class="right-area">
                        <text>{{ comment.ctime }}</text>
                    </view>
                </view>
                <view class="second-line">
                    <text>{{ comment.content }}</text>
                </view>
                <view class="third-line" v-if="comment.img && comment.img.length > 0">
                    <image v-for="(item, index) in comment.img" :src="item.src" :key="index" class="cmt-img" mode="aspectFill">
                    </image>
                </view>
            </u-skeleton>
        </view>
    </view>
</template>

<script>
export default {
    name: 'UniappDemoComment',
    props: {
        comment: {
            type: Object,
            required: true
        },
        loading: {
            type: Boolean,
            required: true
        }
    },
    data () {
        return {
        };
    },
    onload () {
        console.log(this.comment)
    },
    mounted () {

    },

    methods: {

    },
};
</script>

<style lang="scss" scoped>
.container {
    background-color: #F9F9F9;
    margin-bottom: 20rpx;
    font-size: 25rpx;
    color: #888888;
    overflow: hidden;
    width: 100%;

    .comment-content {
        padding: 15rpx;

        & .first-line {
            width: 100%;
            height: 60rpx;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 20rpx;


            & .left-area {
                flex: 1 40rpx;
                display: flex;
                align-items: flex-start;
                justify-content: flex-start;



                & .user-profile {
                    position: relative;
                    width: 52rpx;
                    height: 52rpx;

                    & .profile {
                        width: 100%;
                        height: 100%;
                        border-radius: 50%;
                        overflow: hidden;
                    }

                    & .vip-flag {
                        width: 30rpx;
                        height: 30rpx;
                        position: absolute;
                        right: 0;
                        bottom: 0;
                        transform: translate(50%, 50%);
                        border-radius: 50%;
                        background-color: #FFE32A;
                    }


                }

                & .name {
                    margin-left: 15rpx;
                }


            }

            & .right-area {
                flex: 1 40rpx;
                display: flex;
                align-items: flex-start;
                justify-content: flex-end;
            }
        }

        & .second-line {
            width: 100%;
        }

        & .third-line {
            & .cmt-img {
                width: 120rpx;
                height: 120rpx;
                margin-right: 15rpx;
            }
        }
    }
}
</style>