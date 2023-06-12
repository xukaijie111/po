
import {
    BridgeClient
} from '../../client/index'

import {
    BridgeDataBase,
    RPC_FUNCTION_NAME
} from '../../base/protocol'


import {
    Client as WebSocket
} from 'rpc-websockets'


export class RpcClient {

    ws:WebSocket
    client:BridgeClient
    constructor(client:BridgeClient) {
        this.client = client
    }

    init() {
        this.createConnect()
        
    }

    createConnect() {
        let { host, port } = this.client.getHostAndPort();
        this.ws = new WebSocket(`wx://${host}:${port}`);
        this.ws.on('open',() => {
            console.log(`rpc connect success`)
        })
    }

    uninit() {

    }


    async send(data:BridgeDataBase) {
        return await this.ws.call(RPC_FUNCTION_NAME,data)
    }
}