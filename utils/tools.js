// 检查当前时间是否在14:30之前
export const chkTimeBefore1430 = function (h, m) {
    // 当h大于等于15, 或者h等于14但m大于等于30时返回false, 否则返回true
    if (h >= 15 || (h === 14 && m >= 30)) {
        console.log('在14:30之后')
        return false
    } else {
        console.log('在14:30之前')
        return true
    }
}

// 获得未来30天的日期,以数组形式显示
// 直接传入第一个日期的年月日
// export const getFuture30Date = function (y, m, d) {
//     // let y=date.getFullYear() // 年
//     // let m=date.getMonth()+1 // 月
//     // let d=date.getDate() // 日
//     // 12月3日需要进行特别计算
//     // 判断闰年/平年
//     let bigMonth = [1, 3, 5, 7, 8, 10, 12]
//     let smallMonth = [4, 6, 9, 11]
//     let date = []
//     let lastIndex = 0
//     if (y % 4 === 0 && y % 400 === 0) {
//         // 闰年,2月29天
//         for (let i = 0; i < 30; i++) {
//             if (bigMonth.includes(m)) {
//                 if (d + i <= 31) {
//                     let dateStr = `${m}月${d + i}日`
//                     date.push(dateStr)
//                     lastIndex = i
//                 } else {
//                     let dateStr = ''
//                     if (m === 12) {
//                         dateStr = `1月${i - lastIndex}日`
//                     }
//                     dateStr = `${m + 1}月${i - lastIndex}日`
//                     date.push(dateStr)
//                 }
//             } else if (smallMonth.includes(m)) {
//                 if (d + i <= 30) {
//                     let dateStr = `${m}月${d + i}日`
//                     date.push(dateStr)
//                     lastIndex = i
//                 } else {
//                     let dateStr = `${m + 1}月${i - lastIndex}日`
//                     date.push(dateStr)
//                 }
//             } else if (m === 2) {
//                 if (d + i <= 29) {
//                     let dateStr = `${m}月${d + i}日`
//                     date.push(dateStr)
//                     lastIndex = i
//                 } else {
//                     let dateStr = `${m + 1}月${i - lastIndex}日`
//                     date.push(dateStr)
//                 }
//             }
//         }
//     } else {
//         // 平年,2月28天
//         for (let i = 0; i < 30; i++) {
//             if (bigMonth.includes(m)) {
//                 if (d + i <= 31) {
//                     let dateStr = `${m}月${d + i}日`
//                     date.push(dateStr)
//                     lastIndex = i
//                 } else {
//                     let dateStr = ''
//                     if (m === 12) {
//                         dateStr = `1月${i - lastIndex}日`
//                     }
//                     dateStr = `${m + 1}月${i - lastIndex}日`
//                     date.push(dateStr)
//                 }
//             } else if (smallMonth.includes(m)) {
//                 if (d + i <= 30) {
//                     let dateStr = `${m}月${d + i}日`
//                     date.push(dateStr)
//                     lastIndex = i
//                 } else {
//                     let dateStr = `${m + 1}月${i - lastIndex}日`
//                     date.push(dateStr)
//                 }
//             } else if (m === 2) {
//                 if (d + i <= 28) {
//                     let dateStr = `${m}月${d + i}日`
//                     date.push(dateStr)
//                     lastIndex = i
//                 } else {
//                     let dateStr = `${m + 1}月${i - lastIndex}日`
//                     date.push(dateStr)
//                 }
//             }
//         }
//     }
//     return date
// }

export const getFuture30Date = function (y, m, d) {
    let now = Date.parse(new Date(`${y}/${m}/${d}`))
    let arr = []
    for (let i = 0; i < 30; i++) {
        let newDay = new Date(now + i * (1000 * 60 * 60 * 24))
        arr.push(`${newDay.getMonth() + 1}月${newDay.getDate()}日`)
    }
    console.log(arr)

    return arr
}

// 获取当天的剩下的时间段
// 时间段为10:00-20:00
// 比如传入h,m为11:35(h必须小于15,如果h等于14,那么m必须小于30)
// 可选时间段必须在之后5个小时
// 比如13:30只能选择18:00-19:00
export const getTodayLastTime = function (h, m) {
    let arr = []
    // 当前在14:30之前
    let latestH = h + 5
    if (latestH < 10) {
        latestH = 10
    }
    for (let i = 0; i < 19 - latestH; i++) {
        if (latestH + i === 12) {
            continue
        }
        let str = `${latestH + i}:00-${latestH + i + 1}:00`
        arr.push(str)
    }

    return arr
}

export const getFullLastTime = function () {
    let startH = 10
    let arr = []
    for (let i = 0; i < 19 - 10; i++) {
        if (startH + i === 12) {
            continue
        }
        let str = `${startH + i}:00-${startH + i + 1}:00`
        arr.push(str)
    }
    return arr
}

export const columns = function () {
    // 获取当前的时间
    let now = new Date(),
        h = now.getHours(),
        m = now.getMinutes(),
        arr = []
    if (chkTimeBefore1430(h, m)) {
        let y = now.getFullYear(),
            mon = now.getMonth() + 1,
            d = now.getDate()
        arr.push(getFuture30Date(y, mon, d))
        arr.push(getTodayLastTime(h, m))
    } else {
        let now = new Date(Date.now() + 1000 * 60 * 60 * 24)
        let y = now.getFullYear(),
            mon = now.getMonth()+1,
            d = now.getDate()
        arr.push(getFuture30Date(y, mon, d))
        arr.push(getFullLastTime())
    }
    return arr
}

export const columnData = function () {
    let now = new Date(),
        h = now.getHours(),
        m = now.getMinutes(),
        arr = []
    if (chkTimeBefore1430(h, m)) {
        arr.push(getTodayLastTime(h, m))
    } else {
        arr.push(getFullLastTime())
    }
    for (let i = 0; i < 29; i++) {
        arr.push(getFullLastTime())
    }
    return arr
}
