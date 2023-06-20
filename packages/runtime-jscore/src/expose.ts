

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


import {
    Container
} from './container'


let container = new Container();

export function Component(options:ComponentOptions) {

    container.addComponent(options)

}


Component.prototype.register = container.register



export function Page(options:ComponentOptions) {
    container.addComponent(options)
}

Page.prototype.register = container.register

export function App() {



}