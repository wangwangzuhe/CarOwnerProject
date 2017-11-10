var app = getApp();
var wbs = require('../../utils/wbs.js');
var httpreq = require("../../utils/httpreq");
var emumstatus = require("../../utils/enum");
var session = require("../../utils/session");

app.vaildPage({
  data: {
    test: 'reset',
  },
  onLoad: function (option) {

    var _this = this;

    httpreq.request({
      url: wbs.owner,
      data: {
        openId: wx.getStorageSync('openId')
      }
    }, function (res) {

      var res = res.data;
      if (res.success) {
        if (res.code == "owner_exist_order") {
          
          wx.redirectTo({
             url: '../rescueing/rescueing'
          });

        }
      }

    });

  },
  bindfaqi() {
    wx.navigateTo({
      url: '../carerescue/carerescue'
    });
  }
  ,
  bindchakan() {
    wx.navigateTo({
      url: '../record/record'
    });
  }
  //   formSubmit: function(e) {
  //       var _this = this;
  //     console.log('form发生了submit事件，携带数据为：', e.detail);
  //      wx.login({
  //         success: function (ress) {

  //           if(ress.code) {
  //               console.log(ress.code,'==code');
  //                wx.setStorageSync('jscode', ress.code);
  //            }
  //            var data = {
  //                 "formId":e.detail.formId,
  //                 "jsCode":ress.code,
  //                 "iv":wx.getStorageSync('userArg')['iv'],
  //                 "encryptedData":wx.getStorageSync('userArg')['encryptedData']
  //             }
  //         wx.request({
  //             url: 'https://dcctraining.jeepsupport.com.cn/carOwner/ws/template/info',
  //             data:data,
  //             method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
  //             // header: {}, // 设置请求的 header
  //             success: function(res){
  //                 // success
  //                 _this.setData({test:JSON.stringify(res.data)})
  //             },
  //             fail: function() {
  //                 // fail
  //             },
  //             complete: function() {
  //             // complete
  //             }
  //         })
  //         }
  //       });

  //   },
  //   formReset: function() {
  //     console.log('form发生了reset事件')
  //   }
})