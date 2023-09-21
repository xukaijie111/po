

import {
    MessageDataBase,
    PROTOCOL_CMD,
    MESSAGE_CREATE_COMPONENT_DATA,
    MESSAGE_DOM_ON_CLICK_DATA,
    MESSAGE_COMPONENT_READY_CMD_DATA,
    isSpecialKey,
    isDynamaticExpression
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

import {
    DsBridge
} from "@po/dsbridge"

//@ts-ignore
import Interface  from "@po/bridge-interface-jscore"

type Instance = PageInstance | ComponentInstance

export class Container {

    application:Application
    components:Map<string,Instance>

    bridge: DsBridge
    constructor( application:Application) {
        this.components = new Map();
        this.application = application;
        this.bridge = new DsBridge({
            interface:new Interface()
        })

        // android/ios平台下，该行无实际作用
        this.bridge.register(this.processMessageFromNative);
    }


    removeComponent(id:string) {
       this.components.delete(id);

}

    processMessageFromNative = (data:MessageDataBase) => {

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
        let { name ,componentId ,props  ,parentId } = data;
    
        let parent = this.getComponentById(parentId);
        let properties = { }
        


        for (let key in props) {
            let exp = props[key];
            if (isDynamaticExpression(key,exp)) {
                properties[key] = parent.getPropsDataByExpression(exp);
            }else {
                properties[key] = exp;
            }
        }


        let initData = { ...data , props:properties}
        let component  = application.createComponent(initData);

        component.container = this;

        component.callHookCreate();

        this.components.set(componentId,component)

        component.addHook("onDestroyed", () => {
            this.removeComponent(componentId)
        })
        if (parentId) {
            component.setParent(parent)
            parent.addChild(component , {
                props
            });
        }

        let userData = component.getUserData();

        return userData

       
      
    }

    cmdDomOnClick = (params:MESSAGE_DOM_ON_CLICK_DATA) => {

        let { data } = params;
        let { componentId ,name ,params:eventParams} = data

        let component = this.components.get(componentId)

        try {
            component.callMethod(name,eventParams);
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


    send(data:MessageDataBase) {
        this.bridge.send(data);
    }
    

}