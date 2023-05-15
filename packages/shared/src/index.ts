export const NO = () => false

export const NOOP = () => {}




export function isNil(value: any) {
    return value === undefined || value === null
}


export const delimiters = ['{{','}}']