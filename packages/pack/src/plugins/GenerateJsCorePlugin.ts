import { Compilation, HOOKNAMES } from "../Compilation";

import {
    JsCoreBuild
} from './jsCoreBuild'
export class GenerateJsCorePlugin {

    constructor(private compilation:Compilation) {

    }


    apply() {

        let { compilation } = this;

        compilation.registerHook(HOOKNAMES.AFTEREMIT,async () => {
            await new JsCoreBuild(compilation).run()
        })
    }
}