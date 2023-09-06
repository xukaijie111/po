

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
        console.log(`###data is `,_data,JSON.stringify(container.processMessageFromNative(data)))
      // return JSON.stringify(container.processMessageFromNative(data))
      return "bajie"
}


export {
    Page,
    Component,
    App,
    container
}
