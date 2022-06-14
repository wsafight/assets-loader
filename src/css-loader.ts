import { moduleRetryLoad, ModuleAssets, LoadModuleItem, resloveCanUseUrl } from './module-retry-load'
import { invariant } from './utils'


export interface CssModule extends ModuleAssets {
}

const cacheCssModules: Record<string, CssModule> = {}

export const addCssModule = (module: CssModule): boolean => {
    invariant(!module, 'module cannot empty')

    const { name, loadUrls } = module

    invariant(!name, 'module name cannot empty')
    invariant(!Array.isArray(loadUrls) || !loadUrls.length, 'module loadUrls cannot empty')

    if (cacheCssModules[name]) {
        return false
    }
    module.status = 'ready'
    cacheCssModules[name] = module
    return true
}

interface CssLoadModuleItem extends LoadModuleItem {
}

const startLoad = (cssAssets: string[]) => {
    const loadItems: CssLoadModuleItem[] = cssAssets.map(name => {
        const assets = cacheCssModules[name]
        return { 
            moduleAssets: assets,
            url: resloveCanUseUrl(assets)
        }
    })

    const needLoadItems = loadItems.filter(item => ['loading', 'success'].includes(item.moduleAssets.status!))
    
    needLoadItems.forEach(item => item.moduleAssets.status = 'loading')
    
    return moduleRetryLoad(needLoadItems).then(() => {
        needLoadItems.forEach(item => {
            item.moduleAssets.status = 'success'
        })
    })
}  

/**
 * 
 * @param cssAssets 
 * @returns 
 */
export const loadCssAssets = (cssAssets: string[]) => {
    const notFound = cssAssets.find(x => !cacheCssModules[x])
    invariant(!!notFound, `Cannot found assets ${notFound}`)
    startLoad(cssAssets)
}
