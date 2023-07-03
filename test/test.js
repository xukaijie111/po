

let {
    Compilation
} = require('../packages/pack/dist/pack.cjs.js')

let rm = require('rimraf')

let {
    Application
} = require('../packages/server/dist/server.cjs.js')

let Path = require('path')

const resolve = (value) => Path.resolve(__dirname,value)

let dist = Path.resolve(__dirname,'./dist')

let appJson =  resolve('app.json')
console.log(`appjson is`,appJson)
rm(dist,() => {

    let Path = require('path')

    let comp = new Compilation({
        rootPath:__dirname,
        appJson,
        dist,
        alias:{
            "@po/runtime-jscore":Path.resolve(__dirname,'../packages/runtime-jscore/src/index.ts'),
            "@po/runtime-webview":Path.resolve(__dirname,'../packages/runtime-webview/src/index.ts'),
            "@po/shared":Path.resolve(__dirname,'../packages/shared/src/index.ts')
        }
    });
    
    
    comp.run()
    .then(() => {
    
        let webviewDist = comp.getWebViewDistPath();
        let jscoreDist = comp.getJsCoreDistPath();
    
        let app = new Application({
            webviewPath:webviewDist,
            jsCorePath:jscoreDist
        })

        app.run()
    
    })
})


