

import {
    BridgeDataBase
} from '@po/shared'
export class Socket {
    ws:WebSocket
    options:Socket.options
    httpMap = new Map()
    socketMap =  new Map()
    constructor(options:Socket.options) {

        this.options = options
    }

    use (type, callback) {
        let { socketMap } = this;
        socketMap.set(type, callback)
    }


    init() {
        return new Promise((resolve) => {
            this.ws = new WebSocket(`ws://${this.options.host}:${this.options.port}`)

            this.ws.onopen = (e) => {
                console.log("connected");

                this.startServerListen()
                resolve(null);
            };
        })
    }


    startServerListen() {

        this.ws.onmessage = (params) => {

            let { data } = params;

            data = JSON.parse(data);
            let { symbol,type } = data;

            if (symbol) this.processHttpRequest(data)
            else if (type !== undefined) this.processSocketRequest(data)
        }
    }


    processSocketRequest(params:BridgeDataBase) {
        let {  type} = params;
        let cb = this.socketMap.get(type)
        cb(params)
    }


    processHttpRequest(params) {
        let { httpMap } = this;
        const cb = httpMap.get(params.symbol)
        if (typeof cb === 'function') {
            httpMap.delete(params.symbol)
            let { data } = params
          cb(data)
        }
    }


    send(data:BridgeDataBase) {

        let { type } = data;
        let { httpMap } = this;
        const symbol = Date.now() + type
        return new Promise(resolve => {
            httpMap.set(symbol, data => {
                resolve(data)
            })

            this.ws.send(JSON.stringify({
                symbol,
                data
            }))
        })
    }





}


export namespace Socket {
    export type options = {
        host:string,
        port:number


    }
}