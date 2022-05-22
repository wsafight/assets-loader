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


export const getPrefixUrl = (url: string): string => url.substring(0, url.indexOf('/', 3) + 1)


export const getWrapperDataFromGlobal = (umdName: string) => {
    return (globalThis as Record<string, any>)[umdName];
}