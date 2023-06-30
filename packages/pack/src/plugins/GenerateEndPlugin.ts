import { Compilation, HOOKNAMES } from "../Compilation";


export class GenerateEndPlugin {

    constructor(private compilation:Compilation) {

    }


    apply() {

        let { compilation } = this;

        compilation.registerHook(HOOKNAMES.AFTEREMIT,() => {
            console.log(`compile end`)
        })
    }
}