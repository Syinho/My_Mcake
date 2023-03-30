// 创建vue.config.js文件
import { fileURLToPath } from 'url'
import { resolve, dirname } from 'path'

// 使用ES6无法直接使用__dirname与__filename的
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default {
    configureWebpack: {
        resolve: {
            extensions: ['.js', '.vue', '.json'], // 可以省略的后缀名
            alias: {
                // 路径别名
                // vue$: 'vue/dist/vue.esm.js', // 表示精准匹配 带vue编辑器
                '@': resolve(__dirname, './'), // 路径别名
                '@components': resolve(__dirname, './components'),
                '@pages': resolve(__dirname, './pages'),
                // '@assets': resolve(__dirname, './src/assets'),
            },
        },
    },
}
