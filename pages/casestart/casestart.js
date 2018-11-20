var app = getApp()
var util = require('../../utils/util')
var httpreq = require('../../utils/httpreq')
var wbs = require('../../utils/wbs')
var session = require('../../utils/session')

app.vaildPage({
  data: {
    casetime: '',
    fileNo: '',
    isloading: false
  },
  onLoad(options) {
    if (options.s) {
      this.isconfimApply()
    } else {
      this.getcasestatus()
    }
  },
  getcasestatus() {
    var _this = this
    util.httpIntercept(wx.getStorageSync('openId')).then(resolve => {
      httpreq.request(
        {
          url: wbs.owner,
          data: {
            openId: resolve
          }
        },
        function(res) {
          var res = res.data

          if (res.success) {
            _this.setData({
              fileNo: res.data.fileNo
            })
            if (res.code == 'owner_inexistence_order') {
              wx.redirectTo({
                url: '../launchaid/launchaid'
              })
            } else if (res.code == 'owner_exist_order' && res.data.status == 'case') {
              _this.whilestatus()
              _this.setData({
                casetime: res.data.timeStep.caseTime
              })
            } else {
              wx.navigateTo({
                url: '../rescueing/rescueing'
              })
            }
          }
        }
      )
    })
  },
  whilestatus() {
    var _this = this
    setTimeout(function() {
      _this.getcasestatus()
    }, 10000)
  },
  isconfimApply() {
    //是否是从预约过来的订单；
    var _this = this
    this.setData({
      isloading: true
    })
    util.httpIntercept(wx.getStorageSync('openId')).then(resolve => {
      httpreq.request(
        {
          url: wbs.confimApply,
          data: {
            openId: resolve
          }
        },
        function(res) {
          _this.setData({
            isloading: false
          })
          var res = res.data
          if (res.code == 'owner_inexistence_order') {
            wx.redirectTo({
              url: '../launchaid/launchaid'
            })
          } else {
            _this.getcasestatus()
          }
        }
      )
    })
  },
  tapcancelservice() {
    var _this = this
    this.setData({
      isloading: true
    })
    httpreq.request(
      {
        url: wbs.syncCancelAssistance,
        data: {
          fileNo: this.data.fileNo
        }
      },
      function(res) {
        _this.setData({
          isloading: false
        })
        if (res.data.success) {
          session.userinfo.exitOrderId()
          wx.showToast({
            title: '您已取消预约',
            icon: 'success',
            duration: 2000
          })
          setTimeout(function() {
            wx.redirectTo({
              url: '../launchaid/launchaid'
            })
          }, 2000)
        } else {
          wx.showToast({
            title: '取消失败',
            icon: 'success',
            duration: 2000
          })
        }
      }
    )
  }
})
