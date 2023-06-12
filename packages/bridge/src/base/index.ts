

export class Base {

    options:Base.options
    constructor(options:Base.options) {
        this.options = this.mergeOptions(options)
    }
    
    mergeOptions(options:Base.options) {
        if (!options.host) options.host = "locahost"
        return options;
    }


    getHostAndPort() {
        return {
            host:this.options.host,
            port:this.options.port
        }
    }
}


export namespace Base {

    export type options = {
        host?:string,
        port:number
    }
}