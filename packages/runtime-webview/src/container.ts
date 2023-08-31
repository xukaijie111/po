import {
    Component
} from "./Component"



import {
    DsBridge
} from "@po/dsbridge"

import {
    Android
} from "./android"

import {
    MessageDataBase,
    PROTOCOL_CMD
} from "@po/shared"

export class Container {

    pages:Array<Component>

    bride:DsBridge

    compilerPageOptions:Record<any,any>

    constructor( compilerPageOptions:Record<any,any>) {
        this.compilerPageOptions = compilerPageOptions
        this.init();
    }


    init() {
        this.bride = new DsBridge({ interface : new Android() })
        this.bride.register(this.registerBridgeCallback);
    }

    async send(data:MessageDataBase) {
        return this.bride.send(data)
    }

   async  start(path:string) {

        let options = this.compilerPageOptions[path];
        if (!options) {
            throw new Error(`cant not find page ${path}`)
        }

        let rootComponent = new Component(options, {})

        await rootComponent.init();

        this.pages.push(rootComponent);

        rootComponent.amount(document.getElementById('app'))
    }


    registerBridgeCallback = (value:MessageDataBase) => {
            let { data } = value;
            let { componentId } = data;
            for (let i = 0; i < this.pages.length;i++) {
                let page = this.pages[i]
                if (page.id === componentId) {
                    this.handleEventFromJsCore(value,page)
                    return ;
                }
            }

            throw new Error(`cant find component for ${value}`)
    }

    handleEventFromJsCore(value: MessageDataBase,rootComponent:Component) {

        let { data, type } = value;

        switch (type) {

            case PROTOCOL_CMD.S2C_SET_DATA:

                let { componentId, data: res } = data

                let component = this.findComponent(componentId, rootComponent)

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