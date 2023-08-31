


import {
    MessageDataBase
} from "@po/shared"

export interface DsBridgeInterface {

    send(data:MessageDataBase):unknown

    init(data?:any):unknown

    register(func:Function):unknown
}
