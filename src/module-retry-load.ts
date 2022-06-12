import loadjs from "loadjs"
import BadUrlPrefixCache from './bad-url'

export interface ModuleAssets {
    /** assets name,For caching */
    name: string
    /** multiple load urls for easy switch failure */
    loadUrls: string[]
    /** do something else before getting it */
    ready?: () => void
    status?: 'ready' | 'loading' | 'success' | 'fail'
}

export interface LoadModuleItem {
    // currently loaded url
    url?: string
    // module assets
    moduleAssets: ModuleAssets
}

const badUrlPrefixCache = BadUrlPrefixCache.getInstance({
    strategy: 'localStorage',
})

export const resloveCanUseUrl = (moduleAssets: ModuleAssets): string => {
    const allUrls = (moduleAssets || {}).loadUrls || []
    return badUrlPrefixCache.getCanUseUrl(allUrls)
}

export const isModuleAssets = (item: any): item is ModuleAssets => {
    return 'name' in item && 'loadUrls' in item
}

/**
 * 
 * @param needLoadItems 
 * @returns 
 */
export const moduleRetryLoad = (needLoadItems: LoadModuleItem[]) => {
    return new Promise((resolve, reject) => {
        const startLoad = (urls: string[]) => loadjs(urls, { returnPromise: true }).then(() => {
            // Remove bad urls after success
            urls.forEach(url => badUrlPrefixCache.delete(url))
            resolve('success')
        }).catch((failUrls: string[]) => {
            // add bad urls after failure
            urls.forEach(url => BadUrlPrefixCache.getInstance().add(url))
            
            
            const retryUrls: string[] = []
            for (let i = 0, len = failUrls.length; i <  len; i++) {
                const failUrl = failUrls[i]
                // find module that fail to load and check for alternative urls
                const failItem = needLoadItems.find(item => item.url === failUrl)
                if (!failItem || !failItem.moduleAssets) {
                    return
                }
                const newUrl = resloveCanUseUrl(failItem.moduleAssets)
                // there is no url that can be replaced, and an error is reported directly
                if (!newUrl) {
                    failItem.moduleAssets.status = 'fail'
                    reject(new Error(`Cannot load assets ${failItem.moduleAssets.name} ${newUrl}`))
                    return
                }
                retryUrls.push(newUrl)
            }

            // retry until successful or all urls fail
            startLoad(retryUrls)
        })

        const urlsToLoad: string[] = needLoadItems.map(x => x.url) as string[]
        startLoad(urlsToLoad)
    })
}
