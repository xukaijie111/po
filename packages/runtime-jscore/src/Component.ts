

import { BaseInstance } from './Instance';

import {
    observe
} from "@nx-js/observer-util"

import {
    hasOwn
} from '@po/shared'

import {
    queuePostFlushCb
 } from "./scheduler"
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

        this.propKeys = Object.keys(props);

        Object.assign(this.data,values); // 属性和父亲的数据共享数据
    }




    // 父组件通知哪些属性改变了

    notifyPropChange(key:string,value:any) {

        console.log(`###notify listen is `,key,value);
        this.listenPropSet[key] = value;

       queuePostFlushCb(this.updatePropChange)
    }



    updatePropChange = () => {
        for (let key in this.listenPropSet) {
            this.data[key] = this.listenPropSet[key];
        }
        queuePostFlushCb(this.doRender);

    }
    
}