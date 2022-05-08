import loadjs from "loadjs"
import { invariant } from "./utils"

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
const badUrlPrefixCache: string[] = []



const onJsLoaded = (urls: string[], success: boolean) => {
    if (success && !badUrlPrefixCache.length) {
        return
    }
    urls.forEach(url => {
        const prefixUrl: string = url.substring(0, url.indexOf('/', 3) + 1)
        if (success) {
            const index = badUrlPrefixCache.findIndex(badUrl => prefixUrl === badUrl)
            if (index > - 1) {
                badUrlPrefixCache.splice(index, 1)
            }
        } else if (badUrlPrefixCache.includes(prefixUrl)) {
            badUrlPrefixCache.push(prefixUrl)
        }
    })
}

const resloveJsUrl = (jsAssets: JsAssets): string => {
    const allUrls = (jsAssets || {}).loadUrls || []
    if (!badUrlPrefixCache.length) {
        return allUrls[0] || ''
    }
    let canUseUrl = ''
    allUrls.some(url => {
        if (badUrlPrefixCache.some(badUrlPrefix => url.startsWith(badUrlPrefix))) {
            return false
        }
        canUseUrl = url
        return true
    })
    return canUseUrl
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
        const urlsToLoad: string[] = needLoadItems.map(x => x.url) as string[]
        loadjs(urlsToLoad, {
            success: () => {
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
            },
            error: (urls: string[]) => {
                onJsLoaded(urls, false)
                reject(new Error('loadJs Error'))
            }
        })
    })

}
