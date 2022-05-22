import loadjs from "loadjs"
import BadUrlPrefixCache from './bad-url'

export interface ModuleAssets {
    name: string
    loadUrls: string[]
    wrapper?: string;
    ready?: () => void
}

const badUrlPrefixCache = BadUrlPrefixCache.getInstance()

export const resloveCanUseUrl = (moduleAssets: ModuleAssets): string => {
    const allUrls = (moduleAssets || {}).loadUrls || []
    return badUrlPrefixCache.getCanUseUrl(allUrls)
}


const onModuleLoaded = (urls: string[], success: boolean) => {
    if (!success) {
        urls.forEach(url => BadUrlPrefixCache.getInstance().add(url))
        return
    }
    if (badUrlPrefixCache.isEmpty()) {
        return
    }
    urls.forEach(url => badUrlPrefixCache.delete(url))
}

export interface LoadModuleItem {
    url?: string
    moduleAssets?: ModuleAssets
}

export const isModuleAssets = (item: any): item is ModuleAssets => {
    return 'name' in item && 'loadUrls' in item
}

export const moduleRetryLoad = (needLoadItems: LoadModuleItem[]) => {
    return new Promise((resolve, reject) => {
        const startLoad = (urls: string[]) => loadjs(urls, { returnPromise: true }).then(() => {
            onModuleLoaded(urlsToLoad, true)
            resolve('success')
        }).catch((failUrls: string[]) => {
            onModuleLoaded(failUrls, false)
            const retryUrl: string[] = []
            for (let i = 0, len = failUrls.length; i <  len; i++) {
                const failUrl = failUrls[i]
                const failItem = needLoadItems.find(item => item.url === failUrl)
                if (!failItem || !failItem.moduleAssets) {
                    return
                }
                const newUrl = resloveCanUseUrl(failItem.moduleAssets)
                if (!newUrl) {
                    reject(new Error(`Cannot load assets ${failItem.moduleAssets.name} ${newUrl}`))
                    return
                }
                retryUrl.push(newUrl)
            }
            startLoad(retryUrl)
        })

        const urlsToLoad: string[] = needLoadItems.map(x => x.url) as string[]
        startLoad(urlsToLoad)
    })
}