

export const RPC_FUNCTION_NAME = "rpcTransformFunc"



export enum PROTOCOL_CMD {

      // c2s
    // 创建一个页面/组件
    C2S_INIT_COMPONENT,

    C2S_DOM_ON_CLICK, // 点击DOM事件按钮

    C2S_READY_COMPONENT, // 组件已经amount完成

    // s2c
    S2C_SET_DATA, // 更新数据

}



export interface BridgeDataBase {
    type:PROTOCOL_CMD,
    data:any
}


export interface BRIDGE_CREATE_COMPONENT_DATA extends BridgeDataBase {
    type:PROTOCOL_CMD.C2S_INIT_COMPONENT,
    data:{
        componentId:string,
        parentId:string,
        name:string,
        props?:Record<any,any>
    }, 
}

export interface BRIDGE_DOM_ON_CLICK_DATA extends BridgeDataBase {
    type:PROTOCOL_CMD.C2S_DOM_ON_CLICK,
    data:{
        componentId:string,
        name:string,
        params:any
    }
}


export interface BRIDGE_COMPONENT_READY_CMD_DATA extends BridgeDataBase {

    type:PROTOCOL_CMD.C2S_READY_COMPONENT
    data:{
        componentId:string
    }
}


export interface BRIDGE_COMPONENT_SET_DATA_DATA extends BridgeDataBase {

    type:PROTOCOL_CMD.S2C_SET_DATA,
    data:{
        componentId:string,
        data:any
    }
}