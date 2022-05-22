import { isModuleAssets, LoadModuleItem, ModuleAssets, moduleRetryLoad, resloveCanUseUrl } from "./module-retry-load";
import { getWrapperDataFromGlobal, invariant } from "./utils"

export interface JsModule extends ModuleAssets {
    wrapper: string;
    ready?: () => void
}

const cacheJsModules: Record<string, JsModule> = {}

export const addJsModule = (module: JsModule): boolean => {
    invariant(!module, 'module cannot empty')

    const { name, loadUrls, wrapper } = module

    invariant(!name, 'module name cannot empty')
    invariant(!Array.isArray(loadUrls) || !loadUrls.length, 'module loadUrls cannot empty')
    invariant(!wrapper, 'module wrapper cannot empty')

    if (cacheJsModules[name]) {
        return false
    }

    cacheJsModules[name] = module
    return true
}


interface JsLoadModuleItem extends LoadModuleItem {
    result: any
}

export const loadJsModule = (jsAssets: string | string[] | JsModule) => {
    let isAssetsList = true
    if (typeof jsAssets === 'string') {
        jsAssets = [jsAssets]
        isAssetsList = false
    } else if (isModuleAssets(jsAssets)) {
        addJsModule(jsAssets)
        jsAssets = [jsAssets.name]
        isAssetsList = false
    }
    const notFound = jsAssets.find(x => !cacheJsModules[x])

    invariant(!!notFound, `Cannot found assets ${notFound}`)

    const loadItems: JsLoadModuleItem[] = jsAssets.map(name => {
        const assets = cacheJsModules[name]

        const item: JsLoadModuleItem = { result: getWrapperDataFromGlobal(assets.wrapper) }
        if (!item.result) {
            item.url = resloveCanUseUrl(assets)
            item.moduleAssets = assets
        }
        return item
    })

    const needLoadItems = loadItems.filter(item => !item.result)

    if (!needLoadItems.length) {
        return Promise.resolve(isAssetsList ? loadItems.map(item => item.result) : loadItems[0].result)
    }

    return moduleRetryLoad(needLoadItems).then(() => {
        needLoadItems.forEach(item => {
            item.result = getWrapperDataFromGlobal(item.moduleAssets.wrapper!)
            if (!item.moduleAssets.ready) {
                return
            }
            item.moduleAssets.ready.apply(item.moduleAssets)
        })
        const result = isAssetsList ? loadItems.map(item => item.result) : loadItems[0].result
        return result
    })
}
