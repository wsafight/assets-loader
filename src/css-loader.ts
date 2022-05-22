import { moduleRetryLoad } from './module-retry-load'

/**
 * TODO: check if css resource is loaded
 */
export const cssIsExist = () => {

}

export interface CssModule {
    name: string
    loadUrls: string[]
}

/**
 * 
 * @param cssAssets 
 * @returns 
 */
export const loadCssAssets = (cssAssets: string | string[]) => {
    if (typeof cssAssets === 'string') {
        cssAssets = [cssAssets]
    }
    // cast to css assets
    cssAssets = cssAssets.map(item => item.startsWith('css!') ? item : `css!${item}`)
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
