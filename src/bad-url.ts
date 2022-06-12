/**
 * Can't use URL
 */
import { getPrefixUrl } from "./utils";

interface BadUrlPrefixOptions {
    strategy?: 'memory' | 'localStorage'
    maxAge?: number
}

const DEFAULT_MAX_AGE = 8 * (60 * 60) * 1000;

const DEFAULT_OPTIONS: BadUrlPrefixOptions = {
    strategy: 'memory',
    maxAge: DEFAULT_MAX_AGE
}

class BadUrlPrefixCache {
    /**
     * Cache problematic URLs
     */
    private readonly urlPrefixCache = new Set<string>()

    private readonly config: BadUrlPrefixOptions
    
    static badUrlPrefixCache: BadUrlPrefixCache | null = null
    
    static getInstance (config: BadUrlPrefixOptions = {}): BadUrlPrefixCache {
        if (!BadUrlPrefixCache.badUrlPrefixCache) {
            BadUrlPrefixCache.badUrlPrefixCache = new BadUrlPrefixCache(config)
        }
        return BadUrlPrefixCache.badUrlPrefixCache
    }

    constructor(config: BadUrlPrefixOptions = {}) {
        this.config = Object.assign({}, DEFAULT_OPTIONS, config);
        console.log(this.config)
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