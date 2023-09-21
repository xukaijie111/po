


import {
    Application
} from './Application'



export type ComponentOptions = {

    data?:Record<string,any>
    methods?:Record<string,Function>
    props:Record<string,any>
    observers?:Record<string,Function>

    onCreated?:Function,
    onShow?:Function,
    onReady?:Function
    onDestroyed?:Function

}




let application = new Application();

export function Component(options:ComponentOptions) {

    application.addComponent(options)

}


Component.register = application.register



export function Page(options:ComponentOptions) {
    application.addComponent(options)
}

Page.register = application.register

export function App() {

    console.log(`App Start`)

}

export {
    application,
    Application
}



export * from './Page'

export * from './Component'