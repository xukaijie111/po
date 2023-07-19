

import WebSocket from 'ws';
import { 
    PROTOCOL_CMD,
    BRIDGE_CREATE_COMPONENT_DATA,
    BRIDGE_DOM_ON_CLICK_DATA,
    BRIDGE_COMPONENT_READY_CMD_DATA
} from '@po/shared';

import {
    JsCoreExport,
    BridgeServerConnect
} from './index'


import { CTX } from './socket'

import {
    PageInstance,
    ComponentInstance
} from '@po/runtime-jscore'

type Instance = PageInstance | ComponentInstance

export class Webview {
    options:Webview.options
    jsCore:JsCoreExport
    components:Map<string,Instance>
    constructor(options:Webview.options) {
        this.options = options
        this.jsCore = this.options.bridgeServerConnect.jsCore
        this.components = new Map()
        this.init();
    }



    getComponentById(id:string) {
        return this.components.get(id)
    }

    init(){

        let { bridgeServerConnect ,ws} = this.options


        bridgeServerConnect.registerCallback(ws,PROTOCOL_CMD.C2S_INIT_COMPONENT,this.cmdCreateComponent)

        bridgeServerConnect.registerCallback(ws,PROTOCOL_CMD.C2S_DOM_ON_CLICK,this.cmdDomOnClick)

        bridgeServerConnect.registerCallback(ws,PROTOCOL_CMD.C2S_READY_COMPONENT,this.cmdComponentReady)

    }





    cmdCreateComponent = (ctx:CTX,params:BRIDGE_CREATE_COMPONENT_DATA) =>  {
        let { jsCore } = this;
        let { container } = jsCore
        let { data } = params;
        let { name ,componentId ,propKeys = [] ,parentId } = data;
    
        let parant = this.getComponentById(parentId);
        let props = { }

        propKeys.forEach((key) => {
            props[key] = parant.data[key]
        })
        let initData = { ...data , props}
        let component  = container.createComponent(initData);

        component.webview = this;



        component.callHookCreate();

        let userData = component.getUserData();

        ctx.reply(userData)

        this.components.set(componentId,component)
        if (parentId) {
            let parent = this.components.get(parentId)
            parent.addChild(component);
        }
      
    }

    cmdDomOnClick = (ctx:CTX,params:BRIDGE_DOM_ON_CLICK_DATA) => {

        let { data } = params;
        let { componentId ,name ,params:eventParams} = data

        let component = this.components.get(componentId)

        try {
            component[name](eventParams)
        } catch (error) {
            console.log(error)
        }

    }


    cmdComponentReady = (ctx:CTX,params:BRIDGE_COMPONENT_READY_CMD_DATA) => {
        let { data } = params

        let { componentId } = data

        let component = this.components.get(componentId)

        component.callHookReady()

    }
    


}


export namespace Webview {

    export type options = {
        ws:WebSocket.WebSocket,
        bridgeServerConnect:BridgeServerConnect
    }
}