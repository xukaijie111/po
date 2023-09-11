import {
    DsBridgeInterface
} from "@po/dsbridge"

import {
    MessageDataBase
} from "@po/shared"




export default class  Socket implements DsBridgeInterface {


    httpMap = new Map()
    socketMap =  new Map()
    ws:WebSocket

    callback:Function

    async send(data:MessageDataBase) {
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


    async init(): Promise<any> {
        return new Promise((resolve) => {
            //@ts-ignore
            this.ws = new WebSocket(`ws://${__SOCKET_HOST__}:${__SOCKET_PORT__}`)

            this.ws.onopen = (e) => {
                this.startServerListen()
                resolve(null);
            };
            resolve(null);
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


    processSocketRequest(params:MessageDataBase) {
       this.callback(params);
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



    async register(func: Function): Promise<any> {
        this.callback = func;
    }


}