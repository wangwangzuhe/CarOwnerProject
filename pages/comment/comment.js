var app = getApp()
var util = require('../../utils/util')
var httpreq = require('../../utils/httpreq')
var wbs = require('../../utils/wbs')
var enums = require('../../utils/enum')
var session = require('../../utils/session')

app.vaildPage({
  data: {
    respeed: [
      {
        issel: true
      },
      {
        issel: true
      },
      {
        issel: true
      },
      {
        issel: true
      },
      {
        issel: true
      }
    ],
    servattri: [
      {
        issel: true
      },
      {
        issel: true
      },
      {
        issel: true
      },
      {
        issel: true
      },
      {
        issel: true
      }
    ],
    realfun: [
      {
        issel: true
      },
      {
        issel: true
      },
      {
        issel: true
      },
      {
        issel: true
      },
      {
        issel: true
      }
    ],
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
    isloading: false
    //avitor: //用户头像
  },
  printxing(obj, id, cb) {
    var respeed = new Array(5)
    var count = 5
    var respeedfalse = 5 - id
    var num = 0
    obj.forEach(function(item) {
      if (num < respeedfalse) {
        respeed[4 - num] = {
          issel: false
        }
      } else {
        respeed[4 - num] = {
          issel: true
        }
      }
      num++
    })
    cb(respeed)
  },
  bindrespeed(e) {
    var id = parseInt(e.currentTarget.dataset.id)
    this.printxing(
      this.data.respeed,
      id,
      function(respeed) {
        this.setData({
          respeed: respeed,
          respeedxing: id
        })
      }.bind(this)
    )
  },
  bindservattr(e) {
    var id = parseInt(e.currentTarget.dataset.id)
    this.printxing(
      this.data.servattri,
      id,
      function(servattri) {
        this.setData({
          servattri: servattri,
          servattrixing: id
        })
      }.bind(this)
    )
  },
  bindrealfun(e) {
    var id = parseInt(e.currentTarget.dataset.id)

    this.printxing(
      this.data.realfun,
      id,
      function(realfun) {
        this.setData({
          realfun: realfun,
          realfunxing: id
        })
      }.bind(this)
    )
  },
  bindTextAreaBlur(e) {
    this.setData({
      commenttxt: e.detail.value
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
            openId: resolve
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
      httpreq.request(
        {
          url: wbs.addcomment,
          data: {
            orderId: this.data.orderid + '',
            openId: wx.getStorageSync('openId') + '',
            username: this.data.username,
            reliefType: this.data.reliefType + '',
            responseSpeed: this.data.respeedxing + '',
            serviceAttitude: this.data.servattrixing + '',
            practicability: this.data.realfunxing + '',
            comment: this.data.commenttxt,
            createTime: this.data.createTime,
            fileNo: this.data.fileNo
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
