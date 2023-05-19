import { CompileResult } from "./parse-sfc";

export type GenerateContext = {

    compileResult:CompileResult,
    code:string
    push: (p: any) => any,
    nextline: (num?: number) => void,
}


function createContext(compileResult:CompileResult):GenerateContext {

        let context =  {
            compileResult,
            code:"",
            push(str: string) {
                context.code += str
            },
    
            nextline(num: number = 1) {
                while (num) {
                    context.push('\n')
                    num--
                }
            }

        }


        return context;

}



export function generate(input:CompileResult):string {

    let context = createContext(input)

    generateTemplate(context)
    generateStyle(context)

    return context.code;

}



function generateTemplate(context:GenerateContext) {

}


function generateStyle(context:GenerateContext) {

}


