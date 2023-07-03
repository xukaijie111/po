import { createResolver, readFileSync } from "@po/cjs-utils";
import { Base } from "./base";


export type JsonResult = {
    code:string,
    component:boolean,
    components:Array<{ name :string,path:string }>
}


export class JsonModule extends Base {

    result:JsonResult

    init(): void {
        let { compilation } = this;

        if (this.isComponentFile) {
            this.shareInfo = this.compilation.getComponentShareInfo(this.src);

        }

        let alias = compilation.getAlias();

        this.resolver = createResolver({
            extensions:['.pxml'],
            alias
        })


    }

    shouldBeEmit(): boolean {
        return false
    }

    async load(): Promise<void> {
        let code = readFileSync(this.src)
        let res:Record<any,any>;
        try {
            res = JSON.parse(code)
        } catch (error) {
            throw new Error(error)
        }
    
        let parsed:JsonResult = {
            code,
            component:false,
            components:[]
        }

    
        parsed.component = !!res.component;

        this.shareInfo.isPage = !parsed.component
    
        let usingComponents = res.usingComponents || {}
    
        for (let name in usingComponents) {
            let path = usingComponents[name];
            let target = this.resolver(this.context,path) as string;
    
            parsed.components.push({
                name,
                path:target
            })


        }
    
        this.result = parsed
        parsed.components.forEach(({path}) => {
            this.compilation.createModule(path)
        })

    }


    getParsedResult(){
        return this.result
    }
}