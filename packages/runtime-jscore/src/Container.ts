


import {
    ExposeComponentOptions
} from '@po/shared'

export class Container {


    currentComponentOptions:ExposeComponentOptions | null

    constructor() {
        this.currentComponentOptions = null;

    }


    register(options:ExposeComponentOptions) {
        this.currentComponentOptions = options
    }

    addComponent() {



    }
}