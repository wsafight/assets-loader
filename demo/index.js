import { addJsModule, loadJsModule } from 'static-assets-loader';

// 添加需要动态加载的 js 模块,通常是一个完整的 js
addJsModule({
    // 模块名称（有特殊含义）
    // 此类库加载后会在 window 下存在 echarts,这里 name 作为验证是否存在,存在则不进行加载
    // 同时 promise 返回时候提供 window.echarts 作为参数使用
    // 这里可能会和 name 不一致，例如 
    name: 'echarts',
    // 多个加载 url，会在一个 url 失败后去请求另外的 url,全部失败则结束
    loadUrls: [
        '//cdnjs.cloudflare.com/ajax/libs/echarts/5.3.2/echarts.min.js',
        '//unpkg.com/echarts@5.3.2/dist/echarts.min.js',
    ],
})


addJsModule({
    name: 'flowchart',
    loadUrls: [
        '//cdnjs.cloudflare.com/ajax/libs/flowchart/1.17.1/flowchart.min.js'
    ],
})

// 只会加载在一次而不是多次，返回单个数据
console.time('load flowchart')
loadJsModule('flowchart').then(res => {
    console.timeEnd('load flowchart')
    const current = document.createElement('div')
    current.innerHTML = `flowchart 加载完成,80 ms 左右`
    document.body.appendChild(current) 
})

loadJsModule(['flowchart']).then(res => {
    console.timeEnd('load flowchart3')
    const current = document.createElement('div')
    current.innerHTML = 'flowchart 多次加载完成'
    document.body.appendChild(current)
})

// 只会加载在一次而不是多次,返回数组,这里是异步的，没做状态处理。同一时间判断数据会产生多次请求
// TODO 添加内部状态，以便即使同一时间加载也不会产生多次请求
setTimeout(() => {
    console.time('load flowchart2')
    loadJsModule(['flowchart']).then(res => {
        console.timeEnd('load flowchart2')
        const current = document.createElement('div')
        current.innerHTML = 'flowchart 再次加载完成， 0.07 ms -> 0.2 ms'
        document.body.appendChild(current)
    })
}, 1000)



setTimeout(() => {
    // 如果可以，也可以直接传递 module，但是 flowchart 已经加载过了，也不会继续加载
    // TODO 研究会根据版本进行卸载从新开始加载
    loadJsModule({
        name: 'flowchart',
        loadUrls: [
            '//cdnjs.cloudflare.com/ajax/libs/flowchart/1.17.1/flowchart.min.js'
        ],
    }).then(res => {
        console.log(res);
    })
}, 2000)




addJsModule({
    name: 'React',
    loadUrls: [
        // 如果当前请求失败，会认为整个 CDN 已经损坏 cdnjs.cloudflare.com 均不会请求，后续 ReactDOM 直接失败。
        '//cdnjs.cloudflare.com/ajax/libs/react/18.2.0-next-6e2f38f3a-20220519/umd/react.production.min.js'
    ],
})

addJsModule({
    // 错误，无法解析，因为加载完成后也获取不到 window['ReactDom']
    // name: 'ReactDom',
    name: 'ReactDOM',
    loadUrls: [
        '//cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0-next-6e2f38f3a-20220519/umd/react-dom.production.min.js'
    ],
})

const ReactBundle = ['React', 'ReactDOM'];

console.time('load ReactBundle')
loadJsModule(ReactBundle).then(res => {
    console.log(res);
    console.timeEnd('load ReactBundle')
    const current = document.createElement('div')
    current.innerHTML = 'React 全家桶 加载完成, 80 ms 左右'
    document.body.appendChild(current)
})
