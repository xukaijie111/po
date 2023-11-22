

let { cmd } = require("./dist/jsCore/index")


cmd.cmdCreateComponent({
    data: {
        templateId:"pages/home/index",
        name:"pages/home/index",
    }

})

let instances = cmd.getInstances()

console.log(`instance is `, instances)

