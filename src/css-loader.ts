import { moduleRetryLoad } from './module-retry-load'

export interface CssModule {
    name: string
    loadUrls: string[]
}

export const loadCssAssets = (cssAssets: string | string[]) => {
    if (typeof cssAssets === 'string') {
        cssAssets = [cssAssets]
    }

    cssAssets.map(item => item.startsWith('css!') ? item : `css!${item}`)
    return moduleRetryLoad(cssAssets.map(url => {
        return {
            url,
            moduleAssets: {
                name: '',
                loadUrls: [url],
            }
        }
    }))
}
