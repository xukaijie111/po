

export const RPC_FUNCTION_NAME = "rpcTransformFunc"



export enum PROTOCOL_CMD {

      // c2s
    // 初始化一个component/page
    C2S_INIT_COMPONENT,

    C2S_DOM_ON_CLICK, // 点击DOM事件按钮

    C2S_READY_COMPONENT, // 组件已经amount完成

    C2S_UNMOUNT_COMPONENT, // 组件卸载


    // s2c
    S2C_SET_DATA, // 更新数据
    

    // 创建一个webview
    S2C_CREATE_WEBVIEW


}



export interface MessageDataBase {
    type:PROTOCOL_CMD,
    data:any
}


export type CREATE_COMPONENT_DATA = {
    name:string
    parentId?:string,
    templateId:string,
    props?:Record<string,string> // 组件属性值
    query?:Record<string,string> // 页面的入参 onCreated入参
}

// 
export interface MESSAGE_CREATE_WEBVIEW extends MessageDataBase {

        type:PROTOCOL_CMD.S2C_CREATE_WEBVIEW,
        data: {
            page:string , // 页面
        }

}

export interface MESSAGE_CREATE_COMPONENT_DATA extends MessageDataBase {
    type:PROTOCOL_CMD.C2S_INIT_COMPONENT,
    data:CREATE_COMPONENT_DATA
}

export interface MESSAGE_DOM_ON_CLICK_DATA extends MessageDataBase {
    type:PROTOCOL_CMD.C2S_DOM_ON_CLICK,
    data:{
        componentId:string,
        name:string,
        params:any
    }
}


export interface MESSAGE_COMPONENT_READY_CMD_DATA extends MessageDataBase {

    type:PROTOCOL_CMD.C2S_READY_COMPONENT
    data:{
        componentId:string
    }
}


export interface MESSAGE_COMPONENT_SET_DATA_DATA extends MessageDataBase {

    type:PROTOCOL_CMD.S2C_SET_DATA,
    data:{
        componentId:string,
        data:any
    }
}

export interface MESSAGE_COMPONENT_UNMOUNT_DATA extends MessageDataBase {
    type:PROTOCOL_CMD.C2S_UNMOUNT_COMPONENT,
    data:{
        componentId:string,
    }
}