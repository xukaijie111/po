

let {
    Compilation
} = require('../packages/pack/dist/pack.cjs.js')

let Path = require('path')

let comp = new Compilation({
    dir:__dirname,
    dist:Path.resolve(__dirname,'./dist')
});


comp.run()
.then(() => {})

