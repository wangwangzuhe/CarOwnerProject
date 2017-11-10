var session = require("../../utils/session");
var httpreq = require("../../utils/httpreq");
var wbs = require('../../utils/wbs.js');
var util = require("../../utils/util");
var app = getApp();

Page({
    data: {
        vaildisabled: false,
        vaildtxt: "发送验证码",
        vcode: "",
        phone: '',
        isloading:false
    }, tapsendvcode() {

        if (!util.phoneNumReg(this.data.phone)) {
            wx.showModal({
                title: '',
                content: '请输入正确的手机号',
                showCancel: false
            })
            return;
        }

        //发送验证码
        this.setData({
            vaildisabled: true
        });
        httpreq.request({
            url: wbs.sendSms,
            data: {
                phoneNumber: this.data.phone
            }
        }, function (res) {
            this.vaildcode(59);
        }.bind(this));


    },
    bindphone(e) {
        this.setData({
            phone: e.detail.value
        })
    },
    bindvcode(e) {
        this.setData({
            vcode: e.detail.value
        })
    },
    vaildcode(second) {
        var _this = this;
        second--;
        _this.setData({
            vaildtxt: second + "s后重试"
        });
        if (second == 0) {
            this.setData({
                vaildisabled: false,
                vaildtxt: "发送验证码"
            });
        } else {
            setTimeout(function () {
                _this.vaildcode(second);
            }, 1000);
        }
    }, tapwxlogo() {
        var _this = this;
        //微信登录
        httpreq.request({
            url: wbs.login,
            data: {
                identityType: session.enum_identity.owner,
                openId: wx.getStorageSync('openId')
            }
        }, function (res) {

            //var userinfo = session.userinfo.getuser();
            session.userinfo.login(session.enum_identity.owner, res.data.data);
           
            _this.topage();
        });

    },
    topage() {
        httpreq.request({
            url: wbs.owner,
            data: {
                openId: wx.getStorageSync('openId')
            }

        }, function (res) {
            var res = res.data;

            // if (res.success) {

                var userinfo = session.userinfo.getuser();
                
                if (!userinfo.orderId) {
                    res.data&&session.userinfo.login(userinfo.identity, res.data.oderId);
                    !res.data&&session.userinfo.login(userinfo.identity, "");
                }

                if (res.code == "owner_inexistence_order" || res.code =='owner_null_apply') {
                    wx.redirectTo({
                        url: '../launchaid/launchaid'
                    });
                }
                else if (res.code == "owner_exist_order" && res.data.status == 'finish') {

                    wx.redirectTo({
                        url: '../comment/comment'
                    });

                } else if (res.code == "owner_exist_apply"){
                    wx.redirectTo({
                      url: '../rescueing/rescueing'
                  });
                } else {
                    wx.redirectTo({
                        url: '../rescueing/rescueing'
                    });
                }

            // }
        });
    },
    setlogin(identityType, cb) {
        httpreq.request({
            url: wbs.login,
            data: {
                identityType: identityType,
                openId: wx.getStorageSync('openId'),
                phone: this.data.phone,
                code: this.data.vcode
            }
        }, function (res) {
            cb(res);
        });
    },
    carlogin() {
        var _this = this;
        if (!util.phoneNumReg(this.data.phone)) {
            wx.showModal({
                title: '',
                content: '请输入用户名',
                showCancel: false
            })
            return;
        }
        if (this.data.vcode.length != 4) {
            wx.showModal({
                title: '',
                content: '请输入正确的手机验证码',
                showCancel: false
            })
            return;
        }
         this.setData({isloading:true})
        //车主登录
        this.setlogin(session.enum_identity.owner, function (res) {
            session.userinfo.login(session.enum_identity.owner, res.data.data);//设置登录
            
            if (res.data.success) {
              _this.setData({ isloading: false })
                wx.redirectTo({
                    url: '../launchaid/launchaid'
                });
            } else {
              if (res.data.code =='owner_get_location'){
                wx.getLocation({
                  type: 'gcj02',
                  success: function (res1) {
                      var latitude = res1.latitude;
                        var longitude = res1.longitude;
                        httpreq.request({
                          url: wbs.location,
                          data: {
                            fileNo: res.data.data,
                            openId: wx.getStorageSync('openId'),
                            latitude: latitude+'',
                            longitude: longitude+''
                          }
                        }, function (res2) {
                          _this.setData({ isloading: false });
                          if (res2.data.success){
                            _this.topage()
                            }else{
                              wx.showModal({
                                title: '',
                                content: '登录失败，重新登录',
                                showCancel: false
                              })
                            }
                        });
                      }
                    });
              }else{
                _this.setData({ isloading: false })
                wx.showModal({
                  title: '',
                  content: res.data.msg,
                  showCancel: false
                })
              }
            }
        });

    },
    workerlogin() {
        if (!util.phoneNumReg(this.data.phone)) {
            wx.showModal({
                title: '',
                content: '请输入正确的手机号',
                showCancel: false
            })
            return;
        }
        if (this.data.vcode.length != 4) {
            wx.showModal({
                title: '',
                content: '请输入正确的手机验证码',
                showCancel: false
            })
            return;
        }
        //救援师傅登录
        this.setlogin(session.enum_identity.worker, function (res) {

            session.userinfo.login(session.enum_identity.worker);
            //登录成功，跳转至师傅接单页面
            if (res.data.success) {
                wx.redirectTo({
                    url: '../rescuecar/rescuecar'
                });
            } else {
                wx.showModal({
                    title: '登录失败',
                    content: '您当前没有救援任务',
                    showCancel: false
                })
            }
        });
    }
});