


import {
    MessageDataBase
} from "@po/shared"

export interface DsBridgeInterface {

     send(data:MessageDataBase):Promise<any>

     init(data?:any):Promise<any>

     register(func:Function):Promise<any>

     checkConnectStatus():boolean
}
