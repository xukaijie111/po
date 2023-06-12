
import  {  Server  as WebSocketServer }  from 'rpc-websockets'
import { BridgeServer } from '../../server'

import {
    RPC_FUNCTION_NAME
} from '../../base/protocol'
export class RpcServer {

    server:WebSocketServer
    callback:Function
    constructor(private hub:BridgeServer) {


    }


    init() {
        this.createRpc()
    }


    createRpc() {
        let { host , port } = this.hub.getHostAndPort();
        this.server = new WebSocketServer({
            port,
            host
        })


        this.server.register(RPC_FUNCTION_NAME,(params) => {
            return this.callback(params)
        })
    }

    register(func:Function) {
        this.callback = func;
    }

}