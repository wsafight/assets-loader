/**
 * Can't use CDN URL
 */

import { getPrefixUrl } from "./utils";

class BadUrlPrefixCache {
    private readonly urlPrefixCache = new Set<string>()
    
    static badUrlPrefixCache: BadUrlPrefixCache | null = null
    
    static getInstance (): BadUrlPrefixCache {
        if (!BadUrlPrefixCache.badUrlPrefixCache) {
            BadUrlPrefixCache.badUrlPrefixCache = new BadUrlPrefixCache()
        }
        return BadUrlPrefixCache.badUrlPrefixCache
    }

    constructor(config = {}) {
        console.log(config)
    }

    add = (url: string) => {
        this.urlPrefixCache.add(getPrefixUrl(url))
    }

    delete = (url: string) => {
        this.urlPrefixCache.delete(getPrefixUrl(url))
    }

    has = (url: string): boolean => {
        return this.urlPrefixCache.has(url)
    }

    isEmpty = (): boolean => {
        return this.urlPrefixCache.size === 0
    }

    getCanUseUrl = (loadUrls: string[]): string => {
        const allUrls =loadUrls || []
        if (this.isEmpty()) {
            return allUrls[0] || ''
        }
        return allUrls.find(url => !this.has(url)) || ''
    }
}

export default BadUrlPrefixCache;