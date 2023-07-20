

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

        let { props : parentProps } = initData

        let { props = {} } = runOptions

        let values = {}

        for (let key in props) {
            values[key] = hasOwn(parentProps, key) ? parentProps[key] : props[key]
        }

        Object.assign(this.data,diffAndClone(values, {}).clone)

        console.log(`###values this data  is`,values,this.data)
    }



    
}