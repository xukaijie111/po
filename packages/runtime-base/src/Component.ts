
import {
    LIFEKEYS
} from './types'

export class BaseComponent {

    id:string
    data:Record<string,any>
    props:Record<string,any>
    methods:Record<string,Function>
    lifeTimes:Map<LIFEKEYS,Function>
    constructor() {
        this.data = {}
        this.methods = {}
        this.lifeTimes = new Map();
    }


    init() {
        

    }


    callMethod(name:string) {


    }

    callLifeTimes(name:string) {


    }

}