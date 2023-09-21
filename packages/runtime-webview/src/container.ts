import {
    Component
} from "./Component"



import {
    DsBridge
} from "@po/dsbridge"

//@ts-ignore
import Interface  from "@po/bridge-interface-webview"

import {
    MessageDataBase,
    PROTOCOL_CMD,
    serialPageName,
    sleep
} from "@po/shared"



export class Container {

    components:Array<Component>

    bride:DsBridge

    compilerPageOptions:Record<any,any>

    constructor( compilerPageOptions:Record<any,any>) {
        this.compilerPageOptions = compilerPageOptions
        this.components = [];
        this.init();
    }


    init() {
        this.bride = new DsBridge({ interface : new Interface() })
        this.bride.register(this.registerBridgeCallback);
    }

    async send(data:MessageDataBase) {
        return this.bride.send(data)
    }

    async checkBridgeIsOk() {
        let count = 5;
       while(!this.bride.checkConnectStatus() && count > 0) {
            await sleep(1000)
            count--;
       }
        if (count < 0) {
            throw new Error(`bridge connect status error`)
        }

    }

   async  start(path:string) {

       
        await this.checkBridgeIsOk();

        let serialPath = serialPageName(path);
        let options = this.compilerPageOptions[serialPath];
        if (!options) {
            throw new Error(`cant not find page ${path}`)
        }



        let rootComponent = new Component(options, { }, this)

        await rootComponent.init();


        rootComponent.amount(document.getElementById('app'))
    }


    addComponent(component:Component) {
        this.components.push(component)
    }


    registerBridgeCallback = (value:MessageDataBase) => {
            let { data } = value;
            let { componentId } = data;
            for (let i = 0; i < this.components.length;i++) {
                let page = this.components[i]
                if (page.id === componentId) {
                    this.handleEventFromJsCore(value,page)
                    return ;
                }
            }

            throw new Error(`cant find component for ${value}`)
    }

    handleEventFromJsCore(value: MessageDataBase,rootComponent:Component) {

        let { data, type } = value;

        let { componentId } = data;
        let component = this.findComponent(componentId, rootComponent)

        switch (type) {

            case PROTOCOL_CMD.S2C_SET_DATA:
                let {data: res } = data
                if (!component) {
                    console.error(`not find current componentId: ${componentId} ?`)
                }
                component.update(res)

                break;
            
            

        }

    }


    findComponent(componentId: string, rootComponent: Component) {

        if (rootComponent.id === componentId) return rootComponent

        let { children } = rootComponent

        for (let i = 0; i < children.length; i++) {
            let child = children[i]

            let ret = this.findComponent(componentId, child)
            if (ret) return ret
        }

    }

}