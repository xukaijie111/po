

import {
   PROTOCOL_CMD,
   BRIDGE_COMPONENT_SET_DATA_DATA,
} from '@po/shared'

import {
    Socket
} from './ws/index'
import {
    serialPageName
} from '@po/shared'

import {
    Component
} from './Component'


import {
    CompilerComponentOptions
} from '@po/shared'


// 统一管理一个webview
export class Webview {

    bridge: Socket
    pageOptions: CompilerComponentOptions
    // 根虚拟节点
    rootComponent: Component
    pages:any
    constructor(pages) {
        this.pages = pages;
        //@ts-ignore
        window.webview = this;
    }


    send(params) {
       return  this.bridge.send(params)
    }

    async start(options:Webview.startOptions) {

        this.bridge = new Socket({
            host:"localhost",
            port:8080
        });

        await this.bridge.init();

        let { page } = options
        let name = serialPageName(page)

        let pageOptions = this.pageOptions =  this.pages[name]

        if (!pageOptions) {
            throw new Error(`No Find Page ${page}`)
        }

        let rootComponent = this.rootComponent = new Component(pageOptions,{})

        await rootComponent.init();

        rootComponent.amount(document.getElementById('app'))

        this.listenDataUpdate()
    }


    listenDataUpdate(){
        this.bridge.use(PROTOCOL_CMD.S2C_SET_DATA,(params:BRIDGE_COMPONENT_SET_DATA_DATA) => {

            let { data } = params
            let { componentId ,data:res } = data

            let component = this.findComponent(componentId,this.rootComponent)

            if (!component) {
                console.error(`not find current componentId: ${componentId} ?`)
            }
            component.update(res)
        })
    }






    findComponent(componentId:string,rootComponent:Component) {

        if(rootComponent.id === componentId) return rootComponent

        let { children } = rootComponent

        for (let i = 0; i < children.length;i++) {
                let child = children[i]

                let ret = this.findComponent(componentId,child)
                if (ret) return ret
        }

    }


}

export namespace Webview {

    export type startOptions = {
        page:string,
        port?:number
    }
}