/**
 * Can't use URL
 */
import { getPrefixUrl } from "./utils";

/**
 * TODO: Add another strategy
 */

class BadUrlPrefixCache {
    /**
     * Cache problematic URLs
     */
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
        if (this.isEmpty()) {
            return
        }
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