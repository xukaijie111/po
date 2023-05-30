import resolve from "enhanced-resolve"


export type CreateResolveOptions = {
    extensions:string[],
    modules?:Array<string>
    alias?:Record<any,any>
  }
  export function createResolver(options:CreateResolveOptions) {
  
    const myResolve = resolve.create.sync({
      modules:["node_modules"],
      mainFields: ['module', 'main'],
      symlinks: false,
     ...options,
  
    });
  
    return myResolve;
  }
  