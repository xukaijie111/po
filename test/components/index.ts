Component({


    props:{
        name : {
            type:String,
            value:"bajie"
        }
    },
    onCreated() {

        console.log(`component this data is`,this.data)
    }
}) 