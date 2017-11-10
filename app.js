//app.js
var wbs = require('/utils/wbs.js');
var pageHX = require('/utils/vaildpage.js');
var httpreq = require("/utils/httpreq");
var wbs = require('/utils/wbs.js');

App({
  onLaunch: function () {

    var _this = this;

    var openId = wx.getStorageSync('openId') || '';
    if (!openId) {
      setOpenId()
    }
    _this.vaildPage = pageHX.page;
    wx.setKeepScreenOn({
      keepScreenOn: true
    })

    //调用登录接口 获取openId
    function setOpenId(cb) {
      wx.login({
        success: function (ress) {
          if (ress.code) {
            wx.getUserInfo({
              success: function (res) {
                
                var dataArg = {
                  "appId": wbs.appInfo.appId, //---小程序唯一标识
                  "secret": wbs.appInfo.secret, //--小程序的 app secret
                  "jsCode": ress.code, //--登录时获取的 code
                  "iv": res.iv,// ---加密算法的初始向量
                  "encryptedData": res.encryptedData //--包括敏感数据在内的完整用户信息的加密数据
                }
                wx.request({
                  url: wbs.saveInfo,
                  //url:'https://rescue.gacfcasales.com/carOwner/ws/cust/getSessionKey',
                  data: dataArg,
                  method: 'POST',
                  success: function (res) {
                    res = res.data;
                    console.log(res.data)
                    if (res.success) {
                      //openId 存入Storage
                      wx.setStorageSync('openId', res.data.openId);
                      typeof cb == "function" && cb()
                    }
                  }
                })
              }
            });
          }
        }
      });
    }
  },
  getUserInfo: function (cb) {
    var that = this;
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function (ress) {
          if (ress.code) {
            console.log(ress.code, '==code');
            wx.setStorageSync('jscode', ress.code);
          }
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo;
              console.log(res, '=getUserInfo');
              wx.setStorageSync('userArg', res);
              wx.setStorageSync('userInfo', res.userInfo);
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          });
        }
      });
    }
  },
  globalData: {
    userInfo: null,
    systemInfo: null
  }
})