

import {
    isSpecialKey
}from '@po/shared'
export function getCustomProp(properties:Record<string,any>) {

    let props = {}

    for (let key in properties) {
        if (!isSpecialKey(key)) {

            props[key] = properties[key]
        }
    }

    return props;
}