//思想,让一个ul一直向上移动,达到歌词滚动效果
/*
*解析歌词字符串
* 得到一个歌词对象的数组
* 每个歌词对象:{time:开始时间,words:歌词内容}
* */
function parseLrc() {
    //这里对每一行进行分割
    let lines = lrc.split("\n")
    let result = []//歌词数组
    for (let i = 0; i < lines.length; i++) {
        let str = lines[i]
        //按照]分割
        let parts = str.split("]")
        //进行字符串拦截获取
        let timeStr = parts[0].substring(1)
        let obj = {
            time: parseTime(timeStr),
            words: parts[1]
        }
        //存储所有obj
        result.push(obj)
    }
    return result
}

/***
 * 将一个时间字符串解析为数字
 * @param timeStr 时间字符串
 * @return {number} 转换后的时间(秒数)
 */
function parseTime(timeStr) {
    let parts = timeStr.split(":")
    //这里因为算术运算符会转换数据类型
    return parseInt(parts[0]) * 60 + parseFloat(parts[1])
}

let lrcData = parseLrc()
//获取需要的dom,将所有需要的dom全都封装到一个对象中,后续直接调用对象中的dom即可
let dom = {
    audio: document.querySelector("audio"),
    ul: document.querySelector("ul"),
    container: document.querySelector(".container")
}

/**
 * 计算出,在当前播放器播放到第几秒的情况
 * lrcData数组中,应该高亮显示的歌词下标
 * 如果没有任何一句歌词需要显示,得到-1
 */
function findIndex() {
    //这里就是根据歌词时间找到当前歌词
    //获取当前播放器的时间
    let curTime = dom.audio.currentTime
    for (let i = 0; i < lrcData.length; i++) {
        //查找大于当前时间的播放时间点,然后找当前时间点的前一个元素,哪一个元素就是我们要找的元素
        if (curTime < lrcData[i].time) {
            return i - 1;
        }
    }
    //找遍了都没有找到比当前时间大的歌词(说明播放到最后一句),返回最后一句歌词
    return lrcData.length - 1
}

//界面
/**
 * 创建歌词元素
 */
function createLrcElements() {
    //创建文档片段,用于收集需要添加的元素
    let frag = document.createDocumentFragment()
    //将歌词元素添加到页面中
    for (let i = 0; i < lrcData.length; i++) {
        let li = document.createElement("li")
        li.textContent = lrcData[i].words
        //这里可以节省让dom.ul来添加多次的执行
        //使用文档片段收集即可
        frag.appendChild(li)//改动了dom树
    }
    dom.ul.appendChild(frag)
}

createLrcElements()

let containerHeight = dom.container.clientHeight
let liHeight = dom.ul.children[0].clientHeight
//最大偏移量
let maxOffset = dom.ul.clientHeight - containerHeight

/**
 * 设置ul元素的偏移量
 */
function setOffset() {
    let index = findIndex()
    //计算偏移高度
    let offset = liHeight * index + liHeight / 2 - containerHeight / 2
    if (offset < 0) {
        offset = 0
    }
    if (offset > maxOffset) {
        offset = maxOffset
    }
    dom.ul.style.transform = `translateY(-${offset}px)`
    //在设置样式前,先将之前的样式消除
    //在ul中找到带有.active样式的元素,并将其移除
    let li = dom.ul.querySelector(".active")
    if (li) {
        //找到了就去除样式
        li.classList.remove("active")
    }
    //获取样式列表,将active添加到当前歌词位置
    li = dom.ul.children[index]
    if (li) {//index在一开始可能为-1
        li.classList.add("active")
    }
    console.log(offset)
}

//添加一个实时监听audio播放的事件函数
dom.audio.addEventListener("timeupdate", () => {
    setOffset()
})