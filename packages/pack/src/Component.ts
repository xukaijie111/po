

export class Component {

        options:Component.options
        scriptFilePath:string
        jsonFilePath:string
        styleFilePath:string
        templateFilePath:string
        constructor(options:Component.options) {
            this.options = options;

            this.parseFiles();

        }


        parseFiles() {


            
        }

}

export namespace Component {

    export type options = {

        basePath:string
    }
}