import { addJsModule, loadJsModule, loadCssAssets } from 'static-assets-loader';

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

// 只会加载在一次而不是多次,返回数组
loadJsModule(['flowchart']).then(res => {
    console.log(res);
})

// 只会加载在一次而不是多次，返回单个数据
loadJsModule('flowchart').then(res => {
    console.log(res);
})

// 如果可以，也可以直接传递 module，但是 flowchart 已经加载过了，也不回家中
loadJsModule({
    name: 'flowchart',
    loadUrls: [
        '//cdnjs.cloudflare.com/ajax/libs/flowchart/1.17.1/flowchart.min.js'
    ],
}).then(res => {
    console.log(res);
})


addJsModule({
    name: 'React',
    loadUrls: [
        'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0-next-6e2f38f3a-20220519/umd/react.production.min.js'
    ],
})

addJsModule({
    // 错误，无法解析
    // name: 'ReactDom',
    name: 'ReactDOM',
    loadUrls: [
        '//cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0-next-6e2f38f3a-20220519/umd/react-dom.production.min.js'
    ],
})

const ReactBundle = ['React', 'ReactDom'];

loadJsModule(ReactBundle).then(res => {
    console.log(res);
})
