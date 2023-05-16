

export type JsonResult = {
    component:boolean,
    components:Array<{ name :string,path:string }>
}

/**
 * 
 * @param code 
 * 
 * 
 */

export function parseJson(code:string) {

    let res:Record<string,any>

    try {
        res = JSON.parse(code)
    } catch (error) {
        throw new Error(error)
    }

    let parsed:JsonResult = {
        component:false,
        components:[]
    }

    parsed.component = !!res.component;

    let usingComponents = res.usingComponents || {}

    for (let name in usingComponents) {
        parsed.components.push({
            name,
            path:usingComponents[name]
        })
    }

    return parsed

}