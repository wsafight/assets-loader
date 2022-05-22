/**
 * 检测错误并抛出
 * @param condition 是否抛出错误
 * @param errorMsg
 */
 export const invariant = (condition: boolean, errorMsg: string) => {
    if (condition) {
        throw new Error(errorMsg);
    }
}

/**
 * Get the website information of CDN
 * '//cdn.bootcdn.net/ajax/libs/vue/3.2.33/vue.runtime.esm-browser.js' => 'cdn.bootcdn.net'
 * @param url 
 * @returns 
 */
export const getPrefixUrl = (url: string): string => url.substring(0, url.indexOf('/', 3) + 1)

/**
 * Gets the object on the global variable
 * vue => window.Vue
 * @param umdName 
 * @returns 
 */
export const getWrapperDataFromGlobal = (umdName: string) => {
    if (!umdName) {
        return undefined;
    }
    return (globalThis as Record<string, any>)[umdName];
}