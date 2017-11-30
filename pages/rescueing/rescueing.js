var app = getApp()
var wbs = require('../../utils/wbs.js');
var util = require("../../utils/util.js");
var httpreq = require("../../utils/httpreq");
var emumstatus = require("../../utils/enum");
var session = require("../../utils/session");

app.vaildPage({
    data: {
        markers: [
        ],
        latitude: 0,
        longitude: 0,
        includepoints: [
        ],
        circlesd: [],
        distace: 0,
        remainmin: 0,
        times: {
            caseTime: "",
            sendTime: "",
            arrivalTime: "",
            rescueTime: "",
            finishTime: ""
        },
        status: "",
        statustxt: "",
        syncUrgeServiceParam:{
          "fileNo": "",
          "openId": wx.getStorageSync('openId')
        },
        isloading:false
    },
    onLoad(options) {
        this.initlocation();
        wx.setNavigationBarTitle({ title: '广汽菲克道路救援' })
    }, getcasestatus(callback) {
        var _this = this;
        httpreq.request({
            url: wbs.owner,
            data: {
                openId: wx.getStorageSync('openId')
            }

        }, function (res) {
            var res = res.data;
            
            if (res.success) {
              var userinfo = session.userinfo.getuser();
              if (!userinfo.orderId) {
                session.userinfo.login(userinfo.identity, res.data.oderId);
              //  wx.setStorageSync("user.orderId", res.data.oderId)
                //session.userinfo.getuser().orderId = res.data.oderId
              }
              if (!_this.data.syncUrgeServiceParam.fileNo){
                  _this.data.syncUrgeServiceParam.fileNo = res.data.fileNo
              }
                if (res.code == "owner_exist_order") {
                    switch (res.data.status) {
                        case "case":
                            _this.setData({
                                "times.caseTime": res.data.timeStep.caseTime
                            });
                            _this.whilestatus();
                            break;
                        case "send":
                            _this.setData({
                                "times.caseTime": res.data.timeStep.caseTime,
                                "times.sendTime": res.data.timeStep.sendTime
                            });
                           
                            //有位置信息
                            if (res.data.positions.latitude) {
                                _this.setrealoption(res.data.positions.latitude, res.data.positions.longitude);
                            }

                            //计算距离
                            if (callback) {
                                callback();
                            }
                            _this.whilestatus();//实实取最新状态
                            break;
                        case "arrival":
                        
                            _this.setData({
                                "times.caseTime": res.data.timeStep.caseTime,
                                "times.sendTime": res.data.timeStep.sendTime,
                                "times.arrivalTime": res.data.timeStep.arrivalTime
                            });
                            //有位置信息
                            if (res.data.positions.latitude) {
                                _this.setrealoption(res.data.positions.latitude, res.data.positions.longitude);
                            }
                            //计算距离
                            if (callback) {
                                callback();
                            }
                            _this.whilestatus();//实实取最新状态
                            break;
                        case "rescue":
                            _this.setData({
                                "times.caseTime": res.data.timeStep.caseTime,
                                "times.sendTime": res.data.timeStep.sendTime,
                                "times.arrivalTime": res.data.timeStep.arrivalTime,
                                "times.rescueTime": res.data.timeStep.rescueTime
                            });

                            //有位置信息
                            if (res.data.positions.latitude) {
                              _this.setrealoption(res.data.positions.latitude, res.data.positions.longitude);
                            }
                            
                            //计算距离
                            if (callback) {
                                callback();
                            }
                            _this.whilestatus();//实实取最新状态
                            break;
                        case "finish":
                        case "cancel":
                            _this.setData({
                                "times.caseTime": res.data.timeStep.caseTime,
                                "times.sendTime": res.data.timeStep.sendTime,
                                "times.arrivalTime": res.data.timeStep.arrivalTime,
                                "times.rescueTime": res.data.timeStep.rescueTime,
                                "times.finishTime": res.data.timeStep.finishTime
                            });
                            break;
                    }

                    if (res.data.status == "finish" || (res.data.status == "cancel")) {
                        _this.setData({
                            status:  "finish"
                        });

                        //todo 已经把orderid删掉了  评论页怎么带过去orderid
                        //session.userinfo.getuser().exitOrderId();
                        wx.redirectTo({
                          url: '../comment/comment?orderid=' + session.userinfo.getuser().orderId
                        });

                    } else {
                        _this.setData({
                            status: res.data.status,
                            statustxt: emumstatus.rescueStaus[res.data.status]
                        });
                    }

                }

            }
        });
    },
    whilestatus() {
        var _this = this;
        setTimeout(function () {
            _this.getcasestatus(_this.realtimedistace);
        }, 10000);  
    },
    calcmin() {
        var km = 0.59;//一分钟0.59公里;
        var min = 0;
        if (this.data.distace < 1 || (this.data.distace / km) < 3) {
            min = 0;
        } else {
            min = parseInt(this.data.distace / km);
        }
        this.setData({
            remainmin: min
        });
    },
    bindcancel() {
        var _this = this;
        wx.showModal({
            title: '取消操作',
            content: '您确定取消本次操作吗？',
            success: function (res) {
                if (res.confirm) {
                    _this.updatacancel(_this,function () {
                        // wx.showModal({
                        //     title: '帮助',
                        //     content: '请拨打客服电话：4006500118',
                        //     showCancel: false,
                        //     success: function () {
                      wx.redirectTo({
                                    url: '../launchaid/launchaid'
                                });
                        //     }
                        // });
                    });
                }
            }
        })
    },
    updatacancel(_this,cb) {
         _this.setData({
              isloading:true
            });
        httpreq.request({
            url: wbs.syncCancelAssistance,
            data: {
                fileNo:_this.data.syncUrgeServiceParam.fileNo
            }
        }, function (res) {
             _this.setData({
              isloading:false
            });
            if (res.data.success) {
                session.userinfo.exitOrderId();
                cb();
            }
        });
    },
    initlocation() {
        var _this = this;
        //获取当前路径
        wx.getLocation({
            type: 'gcj02',
            success: function (res) {
                var latitude = res.latitude;
                var longitude = res.longitude;

                var markers = [];
                var includepoints = [];
                var circles = [];
                markers.push({
                    iconPath: "/images/posi.png",
                    id: 0,
                    latitude: latitude,
                    longitude: longitude,
                    width:20.8,
                    height:28
                });

                includepoints.push({
                    longitude: longitude,
                    latitude: latitude,
                });

                _this.setData({
                    longitude: longitude,
                    latitude: latitude,
                    markers: markers,
                    includepoints: includepoints
                });

                _this.getcasestatus();


            }, fail(e) {
                console.log("接口调用失败");

            }
        })
    }, realtimedistace() {
        var _this = this;
        /*_this.setData({
            markers: markers,
            includepoints: includepoints,
        });*/
        if (_this.data.markers.length < 2) return;
        var distace = util.getFlatternDistance(_this.data.markers[0].latitude, _this.data.markers[0].longitude,
            _this.data.markers[1].latitude, _this.data.markers[1].longitude
        );

        _this.setData({
            distace: parseInt(distace / 1000)
        });
        _this.calcmin();//计算剩余分钟数

    }, setrealoption(latitude, longitude) {

        var markers = this.data.markers;
        var includepoints = this.data.includepoints;

        if (this.data.markers.length < 2) {

            markers.push({
                iconPath: "/images/car.png",
                id: 1,
                latitude: latitude,
                longitude: longitude,
                width: 30,
                height: 15
            });

            includepoints.push({
                latitude: latitude,
                longitude: longitude
            });

        } else {
            markers[1].latitude = latitude;
            markers[1].longitude = longitude;
            includepoints[1].latitude = latitude;
            includepoints[1].longitude = longitude;
        }

        this.setData({
            markers: markers,
            includepoints: includepoints,
        });

    },
    hastenHandel(){ //催办 
    var _this = this;
    this.setData({
              isloading:true
        });
      httpreq.request({
        url: wbs.syncUrgeService,
        data: this.data.syncUrgeServiceParam
      }, function (res) {
         _this.setData({
              isloading:false
            });
        wx.showModal({
          title: '',
          content: res.data.msg,
          showCancel: false
        })
      });
    }
});