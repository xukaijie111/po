

import {
    MessageDataBase
} from "@po/shared"

import {
    application,
    Page,
    Component,
    App
} from "./expose"


import {
    Container
} from "./container"


let container = new Container(application);


// 供android调用
export function nativeCallJsCoreFuncName(_data:string) {
        let data = JSON.parse(_data) as MessageDataBase
      
         return JSON.stringify(container.processMessageFromNative(data))
     
}


export {
    Page,
    Component,
    App,
    container
}
