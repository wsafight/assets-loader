/**
 * 检测错误并抛出
 * @param condition 是否抛出错误
 * @param errorMsg
 */
 export const invariant = (condition: boolean, errorMsg: string) => {
    if (condition) {
        throw new Error(errorMsg)
    }
}

/**
 * Get the website information of CDN
 * '//cdn.bootcdn.net/ajax/libs/vue/3.2.33/vue.runtime.esm-browser.js' => 'cdn.bootcdn.net'
 * @param url 
 * @returns 
 */
export const getPrefixUrl = (url: string): string => {
    if (!url) {
        return ''
    }
    // https:// => 8
    // http:// => 7
    // // => 2
    const removePrefixIndex = url.indexOf('//') + 2
    // get all strings between the current index and the first following / as path
    return url.substring(removePrefixIndex, url.indexOf('/', removePrefixIndex))
}

/**
 * Gets the object on the global variable
 * vue => window.Vue
 * @param umdName 
 * @returns 
 */
export const getWrapperDataFromGlobal = (umdName: string) => {
    if (!umdName || typeof umdName !== 'string') {
        return null
    }
    return (globalThis as Record<string, any>)[umdName]
}

interface CreateDeferredPromiseResult<T> {
    currentPromise: Promise<T>
    resolve: (value: T | PromiseLike<T>) => void
    reject: (reason?: any) => void
}


type CreateDeferredPromise = <TValue>() => CreateDeferredPromiseResult<TValue>

/**
 * 获取一个resolve 和reject在外面的promise对象
 * @returns {Promise<unknown>}
 */
export const createDeferredPromise: CreateDeferredPromise = <T>() => {
    let resolve!: (value: T | PromiseLike<T>) => void
    let reject!: (reason?: any) => void

    const promise = new Promise<T>((res, rej) => {
        resolve = res
        reject = rej
    })

    return {
        currentPromise: promise,
        resolve,
        reject
    }
}

export const getStorage = (strategy: string): Storage | null  => {
    if (strategy === 'sessionStorage') {
        return sessionStorage
    }

    if (strategy === 'localStorage') {
        return localStorage
    }
    return null
}