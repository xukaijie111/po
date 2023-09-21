
let props = {

    data: {
        props:{
            name:"xukaijie",
            age:13
        }
    }
   
}

let str = JSON.stringify(props)
let ret = JSON.parse(str);





console.log(`str is`,str);

console.log(`props is `,ret.data.props, typeof ret.data.props)