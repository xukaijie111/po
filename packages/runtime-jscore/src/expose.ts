


import {
    Container
} from './Container'



export type ComponentOptions = {

    data?:Record<string,any>
    methods?:Record<string,Function>
    props:Record<string,any>
    observers?:Record<string,Function>

    onCreated?:Function,
    onShow?:Function,
    onReady?:Function

}




let container = new Container();

export function Component(options:ComponentOptions) {

    container.addComponent(options)

}


Component.register = container.register



export function Page(options:ComponentOptions) {
    container.addComponent(options)
}

Page.register = container.register

export function App() {

    console.log(`App Start`)

}

export {
    container,
    Container
}



export * from './Page'

export * from './Component'