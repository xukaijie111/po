

import { BaseInstance } from './Instance';


export class ComponentInstance extends BaseInstance {


    init(): void {
        this.initProps()
        super.init();
    }


    initProps() {
        let { createOptions } = this.options

        let { props  = { }} = createOptions;
        let values = {}
        for (let key in props) {
            values[key] = props[key]
        }

        this.propKeys = Object.keys(props);

        Object.assign(this.data,values); // 属性和父亲的数据共享数据
    }
    
}