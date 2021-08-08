var app = getApp()
var util = require('../../utils/util')
var httpreq = require('../../utils/httpreq')
var wbs = require('../../utils/wbs')
var enums = require('../../utils/enum')
var session = require('../../utils/session')

app.vaildPage({
  data: {
    respeed: [true, true, true, true, true],
    servattri: [true, true, true, true, true],
    realfun: [true, true, true, true, true],
    orderid: '',
    fileNo: '',
    respeedxing: '5',
    servattrixing: '5',
    realfunxing: '5',
    commenttxt: '',
    username: '',
    reliefType: '',
    reliefTypetxt: '',
    createTime: '',
    isloading: false,
    isCommentAnonymously: true
    //avitor: //用户头像
  },
  printxing(index, arr, cb) {
    for (let i = 0; i < 5; i++) {
      if (i <= index) {
        !arr[i] && (arr[i] = true)
      } else {
        arr[i] = false
      }
    }
    typeof cb === 'function' && cb()
  },
  bindrespeed(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    const respeed = this.data.respeed
    this.printxing(index, respeed, () => {
      this.setData({
        respeed: respeed,
        respeedxing: index + 1
      })
    })
  },
  bindservattr(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    const servattri = this.data.servattri
    this.printxing(index, servattri, () => {
      this.setData({
        servattri: servattri,
        servattrixing: index + 1
      })
    })
  },
  bindrealfun(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    const realfun = this.data.realfun
    this.printxing(index, realfun, () => {
      this.setData({
        realfun: realfun,
        realfunxing: index + 1
      })
    })
  },
  bindTextAreaBlur(e) {
    this.setData({
      commenttxt: e.detail.value
    })
  },
  switchCommentAnonymously() {
    this.setData({
      isCommentAnonymously: !this.data.isCommentAnonymously
    })
  },
  onLoad(options) {
    var _this = this
    //订单编号
    util.httpIntercept(wx.getStorageSync('openId')).then(resolve => {
      httpreq.request(
        {
          url: wbs.owner,
          data: {
            openId: resolve[0]
          }
        },
        function(res) {
          var res1 = res.data

          if (res1.success) {
            _this.setData({
              orderid: res1.data.oderId + '',
              fileNo: res1.data.fileNo
            })
            var userinfo = session.userinfo.getuser()
            httpreq.request(
              {
                url: wbs.commentbasic,
                data: {
                  orderId: res1.data.oderId + ''
                }
              },
              function(res) {
                if (res.data.success) {
                  _this.setData({
                    username: res.data.data.username,
                    reliefType: res.data.data.reliefType,
                    reliefTypetxt: enums.rescueStyle[parseInt(res.data.data.reliefType) - 1],
                    avitor: res.data.data.avatarUrl || _this.data.avitor,
                    createTime: res.data.data.createTime
                  })
                }
              }
            )
          }
        }
      )
    })
  },
  submitComment() {
    var _this = this
    this.setData({
      isloading: true
    })
    util.httpIntercept(wx.getStorageSync('openId')).then(resolve => {
      const { orderid, isCommentAnonymously, username, reliefType, respeedxing, servattrixing, realfunxing, commenttxt, createTime, fileNo } = this.data
      httpreq.request(
        {
          url: wbs.addcomment,
          data: {
            orderId: orderid + '',
            openId: resolve[0],
            username: isCommentAnonymously ? '匿名' : username,
            reliefType: reliefType + '',
            responseSpeed: respeedxing + '',
            serviceAttitude: servattrixing + '',
            practicability: realfunxing + '',
            comment: commenttxt,
            createTime: createTime,
            fileNo
          }
        },
        function(res) {
          _this.setData({
            isloading: false
          })
          session.userinfo.exitOrderId()
          if (res.data.success) {
            wx.showModal({
              title: '操作成功',
              content: '感谢您的评价',
              showCancel: false,
              complete(res) {
                // orderid删掉了
                // session.userinfo.getuser().exitOrderId();
                wx.redirectTo({ url: '../cancel/cancel' })
              }
            })
          } else {
            wx.showModal({
              title: '操作失败',
              content: '操作失败请重新提交',
              showCancel: false,
              complete(res) {
                // orderid删掉了
                // session.userinfo.getuser().exitOrderId();
              }
            })
          }
        }
      )
    })
  }
})
