export const NO = () => false

export const NOOP = () => { }




export function isNil(value: any) {
    return value === undefined || value === null
}


export const delimiters = ['{{', '}}']


// 去掉头尾双括号
export function deleteBrackets(value: any) {
    if (isNil(value)) return null;
    //@ts-ignore
    return value.replace(/^\s*{{\s*(((?!}}).)+)\s*}}\s*$/, ($0, $1) => $1); //去除开头结尾首位的空格
}


export const isString = (val: unknown): val is string => typeof val === 'string'


let toString = Object.prototype.toString
export const isPlainObject = (val: unknown): val is object =>
    toString.call(val) === '[object Object]' || toString.call(val) === '[object Array]'


export const isObject = (value: any) => {
    if (value === null || toString.call(value) !== '[object Object]') return false
    return true
}


export * from './runtimeHelpers'


export * from './random'