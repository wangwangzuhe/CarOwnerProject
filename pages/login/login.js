var session = require('../../utils/session')
var httpreq = require('../../utils/httpreq')
var wbs = require('../../utils/wbs.js')
var util = require('../../utils/util')
var app = getApp()

Page({
  data: {
    isSendSmsBtnDisabled: false,
    sendSmsBtnContent: '发送验证码',
    vcode: '',
    phone: '',
    isWechatLogin: true,
    loginBtnContent: '微信一键登录道路救援',
    canIUse: wx.canIUse('button.open-type.getPhoneNumber')
  },
  makePhoneCall() {
    wx.makePhoneCall({
      phoneNumber: '4006500118'
    })
  },
  switchLoginMode() {
    const isWechatLogin = !this.data.isWechatLogin
    this.setData({
      isWechatLogin,
      loginBtnContent: isWechatLogin ? '微信一键登录道路救援' : '登录'
    })
  },
  onLoad(options) {
    // 查看是否授权
    wx.getSetting({
      success(res) {
        const authSettings = res.authSetting
        if (!authSettings['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success() {},
            fail() {
              wx.showModal({
                title: '提示',
                content: '您将无法成功救援!请长按小程序删除 从新搜索小程序，再次授权',
                success(res) {}
              })
            }
          })
        }
        // if (!authSettings['scope.userInfo']) {
        //   wx.authorize({
        //     scope: 'scope.userInfo',
        //     success: function(res) {
        //       var userInfo = res.userInfo
        //       // var nickName = userInfo.nickName
        //       // var avatarUrl = userInfo.avatarUrl
        //       // var gender = userInfo.gender //性别 0：未知、1：男、2：女
        //       // var province = userInfo.province
        //       // var city = userInfo.city
        //       // var country = userInfo.country
        //       console.log(userInfo,'userInfo')
        //     },
        //     fail() {
        //       console.log('您将无法成功救援!请长按小程序删除');
        //       wx.showModal({
        //         title: '提示',
        //         content: '您将无法成功救援!请长按小程序删除 从新搜索小程序，再次授权',
        //         success(res) {}
        //       })
        //     }
        //   })
        // }
        // if (res.authSetting['scope.userInfo']) {
        //   // 已经授权，可以直接调用 getUserInfo 获取头像昵称
        //   wx.getUserInfo({
        //     success: function(res) {
        //       console.log(res.userInfo,'111111')
        //     }
        //   })
        // }
      }
    })
    this.tapwxlogo(1, options.fileNo)
  },
  getPhoneNumber(e) {
    const { iv, encryptedData } = e.detail
    if (!iv) {
      return
    }
    this.getUsrInfo(iv, encryptedData)
  },
  getUsrInfo(iv, encryptedData) {
    wx.showLoading({
      title: '登录中',
      mask: true
    })
    const _this = this
    wx.request({
      url: wbs.compByWechat,
      data: {
        iv,
        encryptedData,
        sessionKey: wx.getStorageSync('sessionKey')
      },
      method: 'POST',
      success(res) {
        if (res.code != 'session_key_invalid') {
          wx.setStorageSync('carOwnerInfo', res.data.data)
          setTimeout(() => {
            _this.goToLogin()
          })
          return
        }
        util.httpIntercept().then(res => {
          _this.getUsrInfo(iv, encryptedData)
        })
      },
      complete() {
        wx.hideLoading()
      }
    })
  },
  bindInputphoneNo(e) {
    this.setData({
      phone: e.detail.value
    })
  },
  bindInputSmsCode(e) {
    this.setData({
      vcode: e.detail.value
    })
  },
  sendSmsCode() {
    if (!util.phoneNumReg(this.data.phone)) {
      util.toast('请输入正确的手机号')
      return
    }
    //发送验证码
    this.setData({
      isSendSmsBtnDisabled: true
    })
    httpreq.request(
      {
        url: wbs.sendSms,
        data: {
          phoneNumber: this.data.phone
        }
      },
      function(res) {
        this.vaildcode(59)
      }.bind(this)
    )
  },
  vaildcode(second) {
    var _this = this
    second--
    _this.setData({
      sendSmsBtnContent: second + 's后重试'
    })
    if (second == 0) {
      this.setData({
        isSendSmsBtnDisabled: false,
        sendSmsBtnContent: '发送验证码'
      })
    } else {
      setTimeout(function() {
        _this.vaildcode(second)
      }, 1000)
    }
  },
  tapwxlogo() {
    var _this = this
    const args = [].slice.call(arguments)
    //微信登录
    util.httpIntercept(wx.getStorageSync('openId')).then(resolve => {
      const carOwnerInfo = wx.getStorageSync('carOwnerInfo')
      const phone = Object.prototype.toString.call(carOwnerInfo).toLocaleLowerCase() === '[object Object]'.toLocaleLowerCase() ? carOwnerInfo.phone : carOwnerInfo
      httpreq.request(
        {
          url: wbs.login,
          data: {
            identityType: session.enum_identity.owner,
            openId: Object.prototype.toString.call(resolve).toLocaleLowerCase() === '[object Object]'.toLocaleLowerCase() ? resolve.openId : resolve,
            phone
          }
        },
        function(res) {
          session.userinfo.login(session.enum_identity.owner, res.data.data)
          if (typeof args[0] == 'object') {
            _this.topage()
            return
          }
          _this.topage(...args)
        }
      )
    })
  },
  topage() {
    const args = [].slice.call(arguments)
    //从模板跳转过来走这个跳转逻辑
    if (args[1]) {
      util.httpIntercept(wx.getStorageSync('openId')).then(resolve => {
        httpreq.request(
          {
            url: wbs.fileStatus,
            data: {
              fileNo: args[1],
              openId: resolve
            }
          },
          function(ress) {
            if (!ress.data.success) {
              wx.showModal({
                title: '',
                content: ress.data.msg,
                showCancel: false
              })
              return
            }
            var resss = ~~ress.data.data
            switch (resss) {
              case 5:
                wx.redirectTo({
                  url: '../comment/comment'
                })
                break
              case 6:
                wx.redirectTo({
                  url: '../cancel/cancel'
                })
                break
              case 7:
                wx.redirectTo({
                  url: '../cancel/cancel?t=0'
                })
                break
              default:
                wx.redirectTo({
                  url: '../rescueing/rescueing'
                })
            }
          }
        )
      })
    } else {
      // 正常打开走以下跳转逻辑
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
            var userinfo = session.userinfo.getuser()
            if (!userinfo.orderId) {
              res.data && session.userinfo.login(userinfo.identity, res.data.oderId)
              !res.data && session.userinfo.login(userinfo.identity, '')
            }
            if (res.code == 'owner_inexistence_order' || res.code == 'owner_null_apply') {
              if (!args.length) {
                wx.redirectTo({
                  url: '../carerescue/carerescue'
                })
              }
            } else if (res.code == 'owner_exist_order' && res.data.status == 'finish') {
              wx.redirectTo({
                url: '../comment/comment'
              })
            } else if (res.code == 'owner_exist_apply') {
              //有一个预约申请
              if (!args.length) {
                wx.redirectTo({
                  url: '../carerescue/carerescue'
                })
              }
            } else {
              wx.redirectTo({
                url: '../rescueing/rescueing'
              })
            }
          }
        )
      })
    }
  },
  goToLogin() {
    if (this.data.isWechatLogin) {
      this.tapwxlogo()
    } else {
      this.carlogin()
    }
  },
  setlogin(identityType, cb) {
    var _this = this
    util.httpIntercept(wx.getStorageSync('openId')).then(resolve => {
      console.log(resolve)
      httpreq.request(
        {
          url: wbs.login,
          data: {
            identityType: identityType,
            openId: Object.prototype.toString.call(resolve).toLocaleLowerCase() === '[Object Object]'.toLocaleLowerCase() ? resolve.openId : resolve,
            phone: _this.data.phone,
            code: _this.data.vcode
          }
        },
        function(res) {
          cb(res)
        }
      )
    })
  },
  carlogin() {
    var _this = this
    if (!util.phoneNumReg(this.data.phone)) {
      util.toast('请输入正确的手机号')
      return
    }

    if (this.data.vcode.length != 4) {
      util.toast('请输入正确的手机验证码')
      return
    }
    //车主登录
    this.setlogin(session.enum_identity.owner, function(res) {
      session.userinfo.login(session.enum_identity.owner, res.data.data) //设置登录
      if (res.data.success) {
        wx.redirectTo({
          url: '../launchaid/launchaid'
        })
      } else {
        if (res.data.code == 'owner_get_location') {
          wx.getLocation({
            type: 'gcj02',
            success: function(res1) {
              var latitude = res1.latitude
              var longitude = res1.longitude
              util.httpIntercept(wx.getStorageSync('openId')).then(resolve => {
                httpreq.request(
                  {
                    url: wbs.location,
                    data: {
                      fileNo: res.data.data,
                      openId: resolve,
                      latitude: latitude + '',
                      longitude: longitude + ''
                    }
                  },
                  function(res2) {
                    if (res2.data.success) {
                      _this.topage()
                    } else {
                      wx.showModal({
                        title: '',
                        content: '登录失败，重新登录',
                        showCancel: false
                      })
                    }
                  }
                )
              })
            }
          })
        } else {
          wx.showModal({
            title: '',
            content: res.data.msg,
            showCancel: false
          })
        }
      }
    })
  }
  // viewInstructions() {}
})
