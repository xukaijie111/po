
import {
    goods as GlobalGoods
} from "./data"

Page({

    data: {
        store: {
            name: "聚合庄烤肉"
        },
        tags: [
            {
                name: "部分商品满15减2"
            },
            {
                name: "部分商品第二份半价"
            },

        ],


        categories: [
            {
                name: "推荐",
            },
            {
                name: "爆款"
            },
            {
                name: "饮料"
            },
            {
                name: "肉肉天下"
            },


        ],

        currentSelectedCategoryIndex:0
    },

    onCreated() {
        this.setGoods();
    },

    methods: {



        setGoods() {

            let { currentSelectedCategoryIndex } = this.data

            let goods:Array<any> = [];

            for (let i = 0 ; i < GlobalGoods.length;i++){
                if (GlobalGoods[i].categoryIndex === currentSelectedCategoryIndex) {
                    goods.push(GlobalGoods[i])
                }
            }

            this.setData({ goods })
        }
    }
}) 