

import {
    baseParse
} from '../src/index'

let code = `<view po:for="{{items}}"></view>`

let result = baseParse(code);

console.log(result.children[0])