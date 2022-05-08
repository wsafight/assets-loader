import loadjs from "loadjs"
import { getPrefixUrl, invariant } from "./utils"

export interface JsAssets {
    name: string
    loadUrls: string[]
    wrapper: () => any
    ready?: () => void
}


const cacheJsAssets: Record<string, JsAssets> = {}

export const addJsAssets = (assets: JsAssets): boolean => {
    invariant(!assets, 'assets cannot empty')

    const { name, loadUrls, wrapper } = assets

    invariant(!name, 'assets name cannot empty')
    invariant(!Array.isArray(loadUrls) || !loadUrls.length, 'assets loadUrls cannot empty')
    invariant(!wrapper, 'assets wrapper cannot empty')

    if (cacheJsAssets[name]) {
        return false
    }

    cacheJsAssets[name] = assets
    return true
}

/**
 * Can't use CDN URL
 */
const badUrlPrefixCache: Set<string> = new Set();

const onJsLoaded = (urls: string[], success: boolean) => {
    if (!success) {
        urls.forEach(url => badUrlPrefixCache.add(getPrefixUrl(url)))
        return
    }
    if (!badUrlPrefixCache.size) {
        return
    }
    urls.forEach(url => badUrlPrefixCache.delete(getPrefixUrl(url)))
}

const resloveJsUrl = (jsAssets: JsAssets): string => {
    const allUrls = (jsAssets || {}).loadUrls || []
    if (!badUrlPrefixCache.size) {
        return allUrls[0] || ''
    }
    return allUrls.find(url => !badUrlPrefixCache.has(getPrefixUrl(url))) || ''
}

export const isJsAssets = (item: any): item is JsAssets => {
    return 'name' in item
}

interface LoadAssetsItem {
    url?: string
    jsAssets?: JsAssets
    result: any
}

export const loadJs = (jsAssets: string | string[] | JsAssets) => {
    let isAssetsList = true
    if (typeof jsAssets === 'string') {
        jsAssets = [jsAssets]
        isAssetsList = false
    } else if (isJsAssets(jsAssets)) {
        addJsAssets(jsAssets)
        jsAssets = [jsAssets.name]
        isAssetsList = false
    }
    const notFound = jsAssets.find(x => !cacheJsAssets[x])

    invariant(!!notFound, `Cannot found assets ${notFound}`)

    const loadItems: LoadAssetsItem[] = jsAssets.map(name => {
        const assets = cacheJsAssets[name]
        const item: LoadAssetsItem = { result: assets.wrapper() }
        if (!item.result) {
            item.url = resloveJsUrl(assets)
            item.jsAssets = assets
        }
        return item
    })

    const needLoadItems = loadItems.filter(item => !item.result)

    if (!needLoadItems.length) {
        return Promise.resolve(isAssetsList ? loadItems.map(item => item.result) : loadItems[0].result)
    }

    return new Promise((resolve, reject) => {
        const startLoad = (urls: string[]) => loadjs(urls, { returnPromise: true }).then(() => {
            needLoadItems.forEach(item => {
                if (!item.jsAssets?.ready) {
                    return
                }
                item.jsAssets.ready.apply(item.jsAssets)
                item.result = item.jsAssets.wrapper()
            })
            const result = isAssetsList ? loadItems.map(item => item.result) : loadItems[0].result
            resolve(result)
            onJsLoaded(urlsToLoad, true)
        }).catch((failUrls: string[]) => {
            onJsLoaded(failUrls, false)
            const retryUrl: string[] = []
            for (let i = 0, len = failUrls.length; i <  len; i++) {
                const failUrl = failUrls[i]
                const failItem = needLoadItems.find(item => item.url === failUrl)
                if (!failItem || !failItem.jsAssets) {
                    return
                }
                const newUrl = resloveJsUrl(failItem.jsAssets)
                if (!newUrl) {
                    reject(new Error(`Cannot load assets ${failItem.jsAssets.name} ${newUrl}`))
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
