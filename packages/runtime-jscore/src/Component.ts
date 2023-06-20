

import { BaseInstance } from './Instance';

import {
    diffAndClone,
    hasOwn
} from '@po/shared'
export class ComponentInstance extends BaseInstance {


    init(): void {
        this.initProps()
        super.init();
    }


    initProps() {

        let { runOptions, initData } = this.options

        let { props = {} } = runOptions

        let values = {}

        for (let key in props) {
            values[key] = hasOwn(initData, key) ? initData[key] : props[key]
        }

        Object.assign(this.data,diffAndClone(values, {}).clone)
    }
}