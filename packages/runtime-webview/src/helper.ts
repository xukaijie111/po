

import {
    isSpecialKey
}from '@po/shared'
export function getCustomPropKeys(properties:Record<string,any>) {

    let keys = Object.keys(properties);

    return keys.filter((key) => {
        return !isSpecialKey(key)
    })
}