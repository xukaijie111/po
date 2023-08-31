
//@ts-nocheck

let JsCallNativeFuncName = "dsBridgeWebviewMessage"
let nativeCallJsFuncName = "dsBridgeJsCall"


import {
    MessageDataBase
} from "@po/shared"

import {
    DsBridgeInterface
} from "@po/dsbridge"

export class Android implements DsBridgeInterface {


    callback:Function

    send(data:MessageDataBase) {

        let arg = { data };

        let param = JSON.stringify(arg);

        if(window._dsbridge){
            ret=  _dsbridge.call(JsCallNativeFuncName, arg)
         }else if(window._dswk||navigator.userAgent.indexOf("_dsbridge")!=-1){
            ret = prompt("_dsbridge=" + JsCallNativeFuncName, arg);
         }

         return  JSON.parse(ret||'{}').data
    }


    init() {

        this._register(this.registerCallback)

    }

    register(func:Function) {
        this.callback = func

    }


    registerCallback = (data:any) => {

        console.log(`###data is `,data);

        if (this.callback) {
            this.callback(data)
        }

    }

    _register(func:Function) {

        let asyn = true
        var q = asyn ? window._dsaf : window._dsf
        if (!window._dsInit) {
            window._dsInit = true;
            //notify native that js apis register successfully on next event loop
            setTimeout(function () {
                bridge.call("_dsb.dsinit");
            }, 0)
        }
        if (typeof fun == "object") {
            q._obs[nativeCallJsFuncName] = func;
        } else {
            q[nativeCallJsFuncName] = func
        }
    }

}