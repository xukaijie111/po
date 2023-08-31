

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



export function nativeCallJsCoreFuncName(data:MessageDataBase) {
       return container.processMessageFromNative(data)
}


export {
    Page,
    Component,
    App,
    container
}
