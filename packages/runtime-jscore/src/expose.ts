

type PropValue = {
    type:any,
    value:any
}
export type ComponentOptions = {

    data?:Record<string,any>
    methods?:Record<string,Function>
    props:Record<string,PropValue>
    observers?:Record<string,Function>

    onCreated?:Function,
    onShow?:Function,
    onReady?:Function

}


export function Component(options:ComponentOptions) {

        

}