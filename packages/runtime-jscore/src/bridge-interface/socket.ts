





import {
    MessageDataBase
} from "@po/shared"

import {
    DsBridgeInterface
} from "@po/dsbridge"

//@ts-ignore
import WebSocket from 'ws';

export default class Socket implements DsBridgeInterface {

    server:WebSocket.WebSocketServer
    ws:any

    map:Map<WebSocket.WebSocket,Map<any,any>> = new Map()

    callback:Function

    async send(data: MessageDataBase): Promise<any> {
        
        if (!this.ws) {
            console.warn(`no socket connected`)
            return ;
        }

        this.ws.send(JSON.stringify({
            data
        }));
    }


    async init(data?: any): Promise<any> {
        
        //@ts-ignore
       this.server = new WebSocket.Server({ port : __SOCKET_PORT__ })
        //@ts-ignore
       console.log(`Socket listing on port: ${__SOCKET_PORT__}`)
       this.listenConnetcion();

    }


    listenConnetcion() {
        let { server } = this;
 
        server.on('connection',(ws) => {
            this.ws = ws;
            ws.on('message',(_params:string) => {
              let params = JSON.parse(_params)
              console.log(`###socket 收到message`,params)
                
                let { symbol ,data } = params 
                const reply = function (replyData) {
                    ws.send(JSON.stringify({
                      symbol,
                      // data 传递给客户端，最终 resolve 它
                      data:replyData
                    }))
                  }

                  let res = this.callback(data);

                  if (res !== undefined) {
                    reply(res);
                  }
                  
            })
        })
 
    }


  


    async register(func: Function): Promise<any> {
        this.callback = func;
    }

}


/**
 * 
 * 
 * import { PROTOCOL_CMD } from "@po/shared";

import WebSocket from 'ws';



export type CTX = {
  reply:Function,
  type:PROTOCOL_CMD
}

export class Socket {
   map:Map<WebSocket.WebSocket,Map<any,any>> = new Map()
   server:WebSocket.WebSocketServer


   options:Socket.options
   constructor(options:Socket.options) {
    this.options = options
   }

   
   start() {
    let { port } = this.options
       this.server = new WebSocket.Server({ port  })
       console.log(`Socket listing on port: ${port}`)
       this.listenConnetcion();

   }

   close(){
     this.server.close();
   }

  

   listenConnetcion() {
       let { server } = this;

       server.on('connection',(ws) => {
           console.log(`socket onnected`)

           ws.on('message',(_params:string) => {
             let params = JSON.parse(_params)
             console.log(`###socket 收到message`,params)
               
               let { symbol ,data } = params 
               const reply = function (replyData) {
                   ws.send(JSON.stringify({
                     symbol,
                     // data 传递给客户端，最终 resolve 它
                     data:replyData
                   }))
                 }
                 const ctx = {
                   reply,
                   type: params.type
                 }
                 
                 const cb = this.getCb(ws,data.type)
                 if (typeof cb === 'function') {
                   cb(ctx, params.data)
                 } else {
                   // 没有注册~
                 }
           })
       })

   }

   getCb(ws,type) {

      let useMap = this.map.get(ws)
      if (!useMap) return ;

      return useMap.get(type)
   }

   use (ws:WebSocket.WebSocket,type:string | number, callback:Function) {
       let { map } = this;
       let useMap = map.get(ws)
       if (!useMap){
          useMap = new Map();
          map.set(ws,useMap)
       } 
       useMap.set(type, callback)

   }
}

export namespace Socket {

    export type options = {
        port:number
    }
}
 */