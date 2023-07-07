


export * from './fs'

export * from './babel'

export * from './error'

export * from './resolve'

import _ from "lodash"

export function serialComponentTageName(name:string) {
        return _.camelCase(name)
}