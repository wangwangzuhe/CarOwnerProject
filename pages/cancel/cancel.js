var app = getApp();
var util = require("../../utils/util");
var httpreq = require("../../utils/httpreq");
var wbs = require('../../utils/wbs.js');
var session = require("../../utils/session");

app.vaildPage({
    data: {
        showtxt:"您的订单已完成！"
    },
    onLoad(options) {
        if(options.t==0){
            this.setData({
                showtxt:"您的订单已取消！"
            });
        }else{
            this.checkowner();
        }
    },
    checkowner(){
        httpreq.request({
            url: wbs.owner,
            data: {
                openId: wx.getStorageSync('openId')
            }

        },function(res){
            var res = res.data;
            if (res.code == "finishNoComment") {
               
                wx.redirectTo({
                    url: '../comment/comment'
                });
                
            }
        });
    },
    tapgo:function(){
        wx.redirectTo({
            url: '../record/record'
        });
    }   
});