import { ComponentOptions } from "./expose";


import {
    LifeTimes
} from '@po/shared'
import { Container } from "./container";
import { INIT_COMPONENT_DATA } from "@po/bridge-client";

export class BaseInstance {

    data:Record<string,any>
    methods:Map<string,Function>
    observers:Map<string,Function>
    liftimes:Map<LifeTimes,Function>
    isPage:boolean
    options:BaseInstance.options
    constructor(options:BaseInstance.options) {
        this.options = options
        this.init();
    }


    init() {
        this.initData();
        this.initLifTimes();
        this.initMethods();

    }


    initObservers() {


    }

    initLifTimes() {

    }


    initData() {


    }


    initMethods() {

    }


    initRender() {


    }


}


export namespace BaseInstance {

    export type options = {
        initData:INIT_COMPONENT_DATA,
        runOptions:ComponentOptions,
        container:Container

    }
}