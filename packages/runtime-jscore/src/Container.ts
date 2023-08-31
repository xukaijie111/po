

import {
    MessageDataBase,
    PROTOCOL_CMD,
    MESSAGE_CREATE_COMPONENT_DATA,
    MESSAGE_DOM_ON_CLICK_DATA,
    MESSAGE_COMPONENT_READY_CMD_DATA
} from "@po/shared"

import {
    ComponentInstance
} from "./Component"

import {
    PageInstance
} from "./Page"
import {
    Application
} from "./Application"

type Instance = PageInstance | ComponentInstance

export class Container {

    application:Application
    components:Map<string,Instance>
    constructor( application:Application) {
        this.application = application;
    }

    processMessageFromNative(data:MessageDataBase) {


        let { type } = data;

        switch(type) {


            case PROTOCOL_CMD.C2S_INIT_COMPONENT:

                return this.cmdCreateComponent(data as MESSAGE_CREATE_COMPONENT_DATA)

            case PROTOCOL_CMD.C2S_DOM_ON_CLICK:
                this.cmdDomOnClick(data as MESSAGE_DOM_ON_CLICK_DATA)
                break;

            case PROTOCOL_CMD.C2S_READY_COMPONENT:
                this.cmdComponentReady(data as MESSAGE_COMPONENT_READY_CMD_DATA)
                break;

        }

    }


    getComponentById(id:string) {
        return this.components.get(id)
    }



    cmdCreateComponent = (params:MESSAGE_CREATE_COMPONENT_DATA) =>  {

        let { application } = this
        let { data } = params;
        let { name ,componentId ,propKeys = [] ,parentId } = data;
    
        let parant = this.getComponentById(parentId);
        let props = { }

        propKeys.forEach((key) => {
            props[key] = parant.data[key]
        })
        let initData = { ...data , props}
        let component  = application.createComponent(initData);

        component.webview = this;



        component.callHookCreate();

        this.components.set(componentId,component)
        if (parentId) {
            let parent = this.components.get(parentId)
            parent.addChild(component);
        }

        let userData = component.getUserData();

        console.log(`###user data is`,userData)
        return userData

       
      
    }

    cmdDomOnClick = (params:MESSAGE_DOM_ON_CLICK_DATA) => {

        let { data } = params;
        let { componentId ,name ,params:eventParams} = data

        let component = this.components.get(componentId)

        try {
            component[name](eventParams)
        } catch (error) {
            console.log(error)
        }

    }


    cmdComponentReady = (params:MESSAGE_COMPONENT_READY_CMD_DATA) => {
        let { data } = params

        let { componentId } = data

        let component = this.components.get(componentId)

        component.callHookReady()

    }
    

}