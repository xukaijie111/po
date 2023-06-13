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

export function serialPageName(path:string) {
    return path.split('/').map((sub) => sub.toLowerCase()).join("")
}

export enum ShapeFlags  {

    ELEMENT = 1,
    COMPONENT = 1 << 1,
    COMMENT = 1 << 2,

    TEXT_CHILDREN = 1 << 3,
    ARRAY_CHILDREN = 1 << 4,
    TEXT = 1 << 5,
    FRAGMENT = 1<< 6
}


export * from './runtimeHelpers'


export * from './random'