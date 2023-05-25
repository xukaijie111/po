
import {
    fileIsExist,
    throwError,
    readFileSync
} from '@po/cjs-utils'


export class Compilation {
    projectDir: string
    appJson: Record<string, string>
    projectConfig:Record<string, string>
    dist:string
    constructor(options: Compilation.options) {
        this.projectDir = options.dir || process.cwd()
        this.dist = options.dist;
    }



    run() {
        this.parseAppJson()
        this.parseProjectConfig();
        this.parseFiles()
    }


    parseFiles() {
        this.parseComponents()
    }

    _parseJson(file: string) {
        if (!fileIsExist(file)) {
            throwError(`File app.json no exsit`)
        }
        let content = readFileSync(file)

        return JSON.parse(content)
    }


    parseAppJson() {
        let file = `${this.projectDir}/app.json`

        this.appJson = this._parseJson(file)

    }


    parseProjectConfig() {

        let file = `${this.projectDir}/project.config.json`
        this.projectConfig = this._parseJson(file)
    }


    parseComponents() {

        let { appJson } = this
        let { pages } = appJson
        

    }

}


export namespace Compilation {

    export type options = {
        dir?: string,
        dist:string
    }
}