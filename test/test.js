

let {
    Compilation
} = require('../packages/pack/dist/pack.cjs.js')

let Path = require('path')

let comp = new Compilation({
    dir:__dirname,
    dist:Path.resolve(__dirname,'./dist'),
    alias:{
        "@po/runtime-jscore":Path.resolve(__dirname,'../packages/runtime-jscore/src/index.ts'),
        "@po/runtime-webview":Path.resolve(__dirname,'../packages/runtime-webview/src/index.ts'),
        "@po/shared":Path.resolve(__dirname,'../packages/shared/src/index.ts')
    }
});


comp.run()
.then(() => {

    

})

