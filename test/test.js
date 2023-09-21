

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

let appJson =  resolve('./project/app.json')

let platformMap = {

    "android" :{
        alias:{
            "@po/bridge-interface-webview":Path.resolve(__dirname,'../packages/runtime-webview/src/bridge-interface/android.ts'),
            "@po/bridge-interface-jscore":Path.resolve(__dirname,'../packages/runtime-jscore/src/bridge-interface/android.ts'),
        }
      
        
    },

    "node" :{
        alias:{
            "@po/bridge-interface-webview":Path.resolve(__dirname,'../packages/runtime-webview/src/bridge-interface/socket.ts'),
            "@po/bridge-interface-jscore":Path.resolve(__dirname,'../packages/runtime-jscore/src/bridge-interface/socket.ts'),
        },
        replacement:{
            __PLATFORM_NODE__:true
        }
      
     

    }
}


let currentPlatform = "node"

let currentMap = platformMap[currentPlatform]

rm(dist,() => {

    let Path = require('path')

    let comp = new Compilation({
        projectRootPath:resolve("project"),
        appJson,
        dist,
        alias:{
            "@po/runtime-jscore":Path.resolve(__dirname,'../packages/runtime-jscore/src/index.ts'),
            "@po/runtime-webview":Path.resolve(__dirname,'../packages/runtime-webview/src/index.ts'),
            "@po/shared":Path.resolve(__dirname,'../packages/shared/src/index.ts'),
            "@po/dsbridge":Path.resolve(__dirname,'../packages/dsbridge/src/index.ts'),
            ...currentMap["alias"]
        },
        replacement:{
            ...(currentMap.replacement || {})
        },
        targetPlatform:currentPlatform,
        externals:[
            "ws"
        ]
    });
    
    
    comp.run()
    .then(() => {
    
        let webviewDist = comp.getWebViewDistPath();
        let jscoreDist = comp.getJsCoreDistPath();
    
        let app = new Application({
            webviewPath:webviewDist,
            jsCorePath:jscoreDist,
            targetPlatform:currentPlatform
        })

        app.run()
    
    })
})


