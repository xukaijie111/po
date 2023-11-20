

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
    Command
} from "./command"

export * from "./node"


let cmd = new Command(application);


// 供android调用
export function nativeCallJsCoreFuncName(_data:string) {
        let data = JSON.parse(_data) as MessageDataBase
      
         return JSON.stringify(cmd.processMessageFromNative(data))
}


export {
    Page,
    Component,
    App,
    cmd
}
