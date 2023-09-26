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




export function serialPageName(path:string) {
    return path.split('/').map((sub) => sub.toLowerCase()).join("")
}



export function isUndef(s: any): boolean {
    return s === undefined;
  }


  export type CompilerComponentOptions = {
    render?: Function,
    name: string,
    templateId:string,
    path:string,
    isPage:boolean
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


export * from './object'

export * from './util'


import _ from "./underscore"

export default _


export enum LifeTimes {

    ONCREATED = "onCreated",

    ONSHOW = "onShow",

    ONREADY = "onReady",

    ONDESTROYED = "onDestroyed"
}

export * from './protocol'

export * from "./const"


export function isComponentCustomEventKey(key:string) {
    return /^(catch|bind)/.test(key);
}

export function isComponentCustomPropKey(key:string) {
    let lists = ["on","class","style","key","catch","bind"]
    return !lists.some((item) => new RegExp(item).test(key))
}


export function isDynamaticExpression(exp:string) {
    return exp.indexOf("_ctx") !== -1
}


export const sleep =  function(time:number) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(null)
            }, time);
        })

}


export function parsePath(path: string): any {
  const segments = path.split('.')
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]]
    }
    return obj
  }
}
