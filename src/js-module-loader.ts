import { 
  isModuleAssets, 
  LoadModuleItem, 
  ModuleAssets, 
  moduleRetryLoad, 
  resloveCanUseUrl 
} from "./module-retry-load";
import { getWrapperDataFromGlobal, createDeferredPromise, invariant } from "./utils"

export interface JsModule extends ModuleAssets {
   
}

const cacheJsModules: Record<string, JsModule> = {}

const deferred = createDeferredPromise()

export const addJsModule = (module: JsModule): boolean => {
    invariant(!module, 'module cannot empty')

    const { name, loadUrls } = module

    invariant(!name, 'module name cannot empty')
    invariant(!Array.isArray(loadUrls) || !loadUrls.length, 'module loadUrls cannot empty')

    if (cacheJsModules[name]) {
        return false
    }
    module.status = 'ready'
    cacheJsModules[name] = module
    return true
}


interface JsLoadModuleItem extends LoadModuleItem {
    result: any
}

export const startLoad = (jsAssets: string[], isAssetsList: boolean, time: number = 1) => {
    const loadItems: JsLoadModuleItem[] = jsAssets.map(name => {
        const assets = cacheJsModules[name]

        const item: JsLoadModuleItem = { 
            moduleAssets: assets,
            result: getWrapperDataFromGlobal(name)
        }
        if (!item.result) {
            item.url = resloveCanUseUrl(assets)
        }
        return item
    })

    const currentNeedLoadItems = loadItems.filter(item => !item.result)

    if (!currentNeedLoadItems.length) {
        deferred.resolve(isAssetsList ? loadItems.map(item => item.result) : loadItems[0].result)
        return
    }

    const errIndex = currentNeedLoadItems.findIndex(item => item.moduleAssets.status === 'fail')

    if (errIndex > -1) {
        deferred.reject(`Cannot load assets ${currentNeedLoadItems[errIndex].moduleAssets.name}`)
        return
    }
   
    const loadingItems = currentNeedLoadItems.filter(item => item.moduleAssets.status === 'loading')

    if (loadingItems.length === currentNeedLoadItems.length) {
        if (time > 10) {
            deferred.reject(`load assets overtime`)
            return
        }
        setTimeout(() => {
            startLoad(jsAssets, isAssetsList, time + 1)
        }, time * 100)
    }

    const needLoadItems = currentNeedLoadItems.filter(item => item.moduleAssets.status !== 'loading')
    
    needLoadItems.forEach(item => item.moduleAssets.status = 'loading')
    
    return moduleRetryLoad(needLoadItems).then(() => {
        needLoadItems.forEach(item => {
            item.moduleAssets.status = 'success'
            if (!item.moduleAssets.ready) {
                item.result = getWrapperDataFromGlobal(item.moduleAssets.name)
                return
            }
            item.moduleAssets.ready.apply(item.moduleAssets)
            item.result = getWrapperDataFromGlobal(item.moduleAssets.name)
        })
        if (loadingItems.length > 0) {
            startLoad(jsAssets, isAssetsList, time + 1)
            return  
        }
        deferred.resolve(isAssetsList ? loadItems.map(item => item.result) : loadItems[0].result)
    })
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
    startLoad(jsAssets, isAssetsList)
    return deferred.currentPromise
}
