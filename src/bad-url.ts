/**
 * Can't use URL
 */
import { getPrefixUrl, getStorage } from "./utils";

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

        // 没有数据项 一定超时
        if (!expiredTime) {
            return true
        }

        // 获取系统当前时间戳
        const currentTime = (new Date()).getTime() / 1000

        // 如果过去的秒数大于当前的超时时间，也返回null让其去服务端取数据
        if (currentTime > expiredTime) {
            // 此代码可以没有，不会出现问题，但是如果有此代码，再次进入该方法就可以减少判断。
            this.urlPrefixCache.delete(prefixUrl)
            return true
        }

        // 不超时
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

export default BadUrlPrefixCache;