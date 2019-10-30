var app = getApp()
var wbs = require('../../utils/wbs.js')
var httpreq = require('../../utils/httpreq')
var emumstatus = require('../../utils/enum')
var session = require('../../utils/session')
var util = require('../../utils/util')

app.vaildPage({
  data: {
    test: 'reset'
  },
  onLoad: function(option) {
    var _this = this
    util.httpIntercept(wx.getStorageSync('openId')).then(resolve => {
      httpreq.request(
        {
          url: wbs.owner,
          data: {
            openId: resolve[0]
          }
        },
        function(res) {
          var res = res.data
          if (res.success) {
            if (res.code == 'owner_exist_order') {
              wx.redirectTo({
                url: '../rescueing/rescueing'
              })
            }
          }
        }
      )
    })
  },
  bindfaqi() {
    wx.navigateTo({
      url: '../carerescue/carerescue'
    })
  },
  bindchakan() {
    wx.navigateTo({
      url: '../record/record'
    })
  }
  // returnBack() {
  //   wx.navigateBack()
  // }
})
