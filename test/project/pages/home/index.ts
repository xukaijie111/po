Page({

    data:{
        message:"我是po小程序",
        name:"xukaijie"
    },

    onCreated() {
        console.log(`WWWpage on created`)

        setTimeout(() => {

            this.setData({
                isPage:"xxxxxx"
            })
        }, 3000);
    },

    methods:{
        clickMyName(e) {

            console.log(`###e is `,e)
        }

    }
}) 