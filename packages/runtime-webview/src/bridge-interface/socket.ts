import {
    DsBridgeInterface
} from "@po/dsbridge"

import {
    MessageDataBase,
    SOCKET_SERVER_HOST,
    SOCKET_SERVER_PORT
} from "@po/shared"




export default class  Socket implements DsBridgeInterface {


    httpMap = new Map()
    socketMap =  new Map()
    ws:WebSocket

    callback:Function


    checkConnectStatus() {

        return this.ws && this.ws.readyState === 1
    }

    async send(data:MessageDataBase) {

        if (!this.ws) {
            throw new Error(`no socket connected`)
        }
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
            this.ws = new WebSocket(`ws://${SOCKET_SERVER_HOST}:${SOCKET_SERVER_PORT}`)

            this.ws.onopen = (e) => {
                console.log(`connect ws success`)
                this.startServerListen()
                resolve(null);
            };


            this.ws.onerror = (err) => {
                throw new Error(`ws connect error ${err}`);
            }


            resolve(null);
        })
    }


    startServerListen() {

        this.ws.onmessage = (params) => {

            console.log(`######onmessage params is `,params)
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