import { addJsModule, loadJsModule } from 'static-assets-loader';

addJsModule({
    name: 'echarts',
    loadUrls: [
        '//unpkg.com/browse/echarts@5.3.2/dist/echarts.min.js',
        '//cdnjs.cloudflare.com/ajax/libs/echarts/5.3.2/echarts.min.js',
    ],
    wrapper: 'echarts',
})

addJsModule({
    name: 'flowchart',
    loadUrls: [
        '//cdnjs.cloudflare.com/ajax/libs/flowchart/1.17.1/flowchart.min.js'
    ],
    wrapper: 'flowchart'
})

loadJsModule(['flowchart']).then(res => {
    console.log(res);
})


loadJsModule(['flowchart']).then(res => {
    console.log(res);
})