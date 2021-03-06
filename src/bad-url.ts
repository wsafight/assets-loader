/**
 * Can't use URL
 */
import { getPrefixUrl, getStorage } from "./utils"

interface BadUrlPrefixOptions {
    storageKey?: string
    strategy: 'memory' | 'localStorage' | 'sessionStorage'
    maxAge?: number
}

const DEFAULT_MAX_AGE = 8 * (60 * 60)

const STORAGE_KEY = 'balUrlPrefix'

const DEFAULT_OPTIONS: BadUrlPrefixOptions = {
    storageKey: STORAGE_KEY,
    strategy: 'memory',
    maxAge: DEFAULT_MAX_AGE
}

class BadUrlPrefixCache {
    /**
     * Cache problematic URLs
     */
    private readonly urlPrefixCache = new Map<string, number>()

    private readonly config: BadUrlPrefixOptions
    
    static badUrlPrefixCache: BadUrlPrefixCache | null = null

    
    static getInstance (config: BadUrlPrefixOptions): BadUrlPrefixCache {
        if (!BadUrlPrefixCache.badUrlPrefixCache) {
            BadUrlPrefixCache.badUrlPrefixCache = new BadUrlPrefixCache(config)
        }
        return BadUrlPrefixCache.badUrlPrefixCache
    }

    static resetInstance = (config: BadUrlPrefixOptions) => {
        BadUrlPrefixCache.badUrlPrefixCache = null
        BadUrlPrefixCache.getInstance(config)
    }

    constructor(config: BadUrlPrefixOptions) {
        this.config = Object.assign({}, DEFAULT_OPTIONS, config)
        if (this.config.strategy !== 'memory') {
            return
        }

        const urlPrefixCacheObj = this.getCacheFromStorage()
        Object.keys(urlPrefixCacheObj).map((url) => {
            this.urlPrefixCache.set(url, urlPrefixCacheObj[url])
        })
    }

    

    private getCacheFromStorage = (): Record<string, number> => {
        const json: string | null | undefined = getStorage(this.config.strategy || '')?.getItem(this.config.storageKey || STORAGE_KEY)
        if (!json) {
            return {}
        }
        try {
            return JSON.parse(json)
        }catch(error) {
            return {}
        }  
    }

    private setStorageForCache () {
        const storageObj: Record<string, number> = {}
        this.urlPrefixCache.forEach((value: number, key: string) => {
            storageObj[key] = value
        })
        getStorage(this.config.storageKey || '')?.setItem(this.config.storageKey || STORAGE_KEY, JSON.stringify(storageObj))
    }

    add = (url: string) => {
        const prefixUrl: string = getPrefixUrl(url)
        if (this.has(prefixUrl)) {
            return
        }

        const expiredTime = ((new Date()).getTime() / 1000) + DEFAULT_MAX_AGE
        this.urlPrefixCache.set(prefixUrl, expiredTime)
        this.setStorageForCache()
        return this
    }

    delete = (url: string) => {
        if (this.isEmpty()) {
            return
        }
        this.urlPrefixCache.delete(getPrefixUrl(url))
        this.setStorageForCache()
        return this
    }

    isOverTime = (prefixUrl: string) => {

        const expiredTime: number = this.urlPrefixCache.get(prefixUrl) || 0

        // ??????????????? ????????????
        if (!expiredTime) {
            return true
        }

        // ???????????????????????????
        const currentTime = (new Date()).getTime() / 1000

        // ????????????????????????????????????????????????????????????null???????????????????????????
        if (currentTime > expiredTime) {
            // ?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
            this.urlPrefixCache.delete(prefixUrl)
            return true
        }

        // ?????????
        return false
    }

    has = (url: string): boolean => {
        const prefixUrl: string = getPrefixUrl(url)
        return !this.isOverTime(prefixUrl)
    }

    isEmpty = (): boolean => {
        return this.urlPrefixCache.size === 0
    }

    getCanUseUrl = (loadUrls: string[]): string => {
        const allUrls = loadUrls || []
        if (this.isEmpty()) {
            return allUrls[0] || ''
        }
        return allUrls.find(url => !this.has(url)) || ''
    }
}


export const setBadUrlPrefixCacheOptions = (options: BadUrlPrefixOptions) => {
    BadUrlPrefixCache.resetInstance(options)
}

export default BadUrlPrefixCache