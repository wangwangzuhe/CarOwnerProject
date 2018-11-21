//app.js
// var wbs = require('/utils/wbs.js')
var pageHX = require('/utils/vaildpage.js')
const util = require('./utils/util')

App({
  onLaunch: function() {
    var _this = this

    var openId = wx.getStorageSync('openId') || ''
    if (!openId) {
      util.setOpenId()
    }
    _this.vaildPage = pageHX.page
    wx.setKeepScreenOn({
      keepScreenOn: true
    })
  },
  globalData: {
    userInfo: null,
    systemInfo: null
  }
})
