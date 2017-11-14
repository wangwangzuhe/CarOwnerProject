var app = getApp();
var util = require("../../utils/util");
var httpreq = require("../../utils/httpreq");
var wbs = require('../../utils/wbs.js');
var session = require("../../utils/session");

app.vaildPage({
    data: {
        windowHeight: 0,
        index: 0,
        date: '2016-09-01',
        isseldate: false,
        isseltme: false,
        time: '',
        vaildisabled: false,
        vaildtxt: "发送验证码",
        rescuetype: '0', //救援类型
        rescue: [{
            id: 1,
            str: "拖车",
            issel: false
        }, {
            id: 2,
            str: "拖吊",
            issel: false
        }, {
            id: 3,
            str: "换胎",
            issel: false
        }, {
            id: 4,
            str: "送油",
            issel: false
        }, {
            id: 6,
            str: "搭电",
            issel: false
        }, {
            id: 5,
            str: "现场修理",
            issel: false
        }],
        name: '',
        phone: '',
        addr: '救援地址  请选择救援地点',
        carno: '',
        carmodel: '',
        vcode: '',
        vaildsaler: '', //经销商
        isselprovince: false, //是否选择省
        isselcity: false, //是否选择市
        province: [],
        province_all: [],
        provinceindex: 0,
        cityindex: 0,
        isshouwzhezhao: false,
        seledcity: [],
        dealerall: [],
        delear: [],
        isseldelear: false,
        delearindex: 0,
        delearname: "请选择经销商",
        locationGPS: "",
        disabledHelp: false,
        isloading: false
    },
    bindDelearChange(e) {

        var that = this;
        this.setData({
            delearindex: e.detail.value,
            delearname: that.data.delear[e.detail.value].name,
            isseldelear: true,
            isshouwzhezhao: false
        });

    },
    bindProvinceChange(e) {
        var that = this;
        var citys = this.data.province_all.filter(function(item) {
            return item.parentcode == that.data.province[e.detail.value].code;
        });
        this.setData({
            provinceindex: e.detail.value,
            isselprovince: true,
            seledcity: citys,
            isselcity: false,
            isseldelear: false
        });
    },
    bindCityChange(e) {
        var that = this;
        var delear = this.data.dealerall.filter(function(item) {
            return item.code == that.data.seledcity[e.detail.value].code;
        });
        this.setData({
            cityindex: e.detail.value,
            isselcity: true,
            delear: delear
        });
    },
    setdatetime() {
        var datetime = util.formatTime(new Date()).split(' ');
        var time = datetime[1];
        var lastindex = time.lastIndexOf(":");

        this.setData({
            date: datetime[0],
            time: time.substr(0, lastindex)
        });
    },
    onLoad(options) {
        this.setdatetime();
        if (options.type) {
            this.setData({
                rescuetype: options.type
            });
        }
        var that = this;
        wx.getSystemInfo({
            success: function(res) {
                that.setData({
                    windowHeight: res.windowHeight
                })

            }
        });
        httpreq.request({
            url: wbs.dealer,
            method: "GET",
            data: {}
        }, function(res) {

            var area = res.data.data.area;
            var result = area.filter(function(item) {
                return item.parentcode == -1;
            });
            that.setData({
                province: result,
                province_all: area,
                dealerall: res.data.data.dealer
            });

        })
    },
    bindDateChange(e) {
        this.setData({
            date: e.detail.value,
            isseldate: true
        })
    },
    bindTimeChange(e) {
        this.setData({
            time: e.detail.value,
            isseltime: true
        })
    },
    bindrescuepub(e) {
        this.setData({
            rescuetype: "0"
        })
    },
    bindrescuemegent(e) {
        this.setData({
            rescuetype: "1"
        })
    },
    bindHelp(e) {
        var _this = this;
        var formid = e.detail.formId;
        if (this.data.name == "") {
            wx.showModal({
                title: '',
                content: '请输入用户名',
                showCancel: false
            })
            return;
        }
        if (!util.phoneNumReg(this.data.phone)) {
            wx.showModal({
                title: '',
                content: '请输入正确的手机号码',
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

        if (this.data.carno.length != 7) {
            wx.showModal({
                title: '',
                content: '请输入正确的车牌号',
                showCancel: false
            })
            return;
        }

        if (this.data.addr == '救援地址  请选择救援地点') {
            wx.showModal({
                title: '',
                content: '请输入正确的救援地址',
                showCancel: false
            })
            return;
        }
        if (this.data.rescuetype == "1") { //是否预约
            if (!this.data.isseldate) {
                wx.showModal({
                    title: '',
                    content: '请选择救援日期',
                    showCancel: false
                })
                return;
            }
            if (!this.data.isseltime) {
                wx.showModal({
                    title: '',
                    content: '请选择救援时间',
                    showCancel: false
                })
                return;
            }
        }
        //取出救援项目
        var selectediAppoint = this.data.rescue.find(function(item) {
            return item.issel == true;
        });
        if (!selectediAppoint) {
            wx.showModal({
                title: '',
                content: '请选择救援项目',
                showCancel: false
            })
            return;
        }
        //测试数据
        // let aa = {
        //         "openId": "o5rMJ0fvQsDx6l63HnqoaqolzuCQ",
        //         "username": "小名",
        //         "phone": "13564262869",
        //         "verifyCode": "3368",
        //         "licenseNumber": "陕F002",
        //         "address": "陕西省汉中市汉台区前进东路",
        //         "reliefType": "1",
        //         "isAppoint": "0",
        //         "branchName": "经销商A",
        //       "branchCode": "CodeAAA", 
        //       "velVIN":"P0002", 
        //       "velColor": "白色", 
        //       "velBrand": "福特", 
        //       "velModel": "SUV",
        //       "locationGPS":"455454.2656,2665.1215"
        //     }
        var openId = wx.getStorageSync('openId');
        _this.setData({
            disabledHelp: true,
            isloading: true
        })
        httpreq.request({
            url: wbs.custapply,
            //data:aa
            data: {
                openId: openId,
                username: this.data.name,
                phone: this.data.phone,
                verifyCode: this.data.vcode,
                licenseNumber: this.data.carno,
                address: this.data.addr,
                reliefType: selectediAppoint.id.toString(), //救援项目
                isAppoint: this.data.rescuetype, //是否预约
                appointTime: this.data.date + " " + this.data.time + ":00", //预约时间
                formId: formid,
                locationGps: this.data.locationGPS,
                velVin: this.data.carmodel,
                branchName: '-',
                branchCode: '-'
            }
        }, function(res) {
            _this.setData({
                disabledHelp: false,
                isloading: false
            });
            if (res.data.success) {
                var userinfo = session.userinfo.getuser();

                session.userinfo.login(userinfo.identity, res.data.data);
                if (_this.data.rescuetype == '1') {
                    wx.showModal({
                        title: '',
                        content: res.data.msg,
                        showCancel: false
                    })
                    return
                }
                wx.navigateTo({
                    url: '../rescueing/rescueing'
                })
            } else {
                wx.showModal({
                    title: '',
                    content: res.data.msg,
                    showCancel: false
                })
            }

        })
    },
    bindrescue(e) {
        //console.log(e.currentTarget.dataset.id);

        var that = this;
        var rescue = this.data.rescue;
        that.setData({
            rescue: []
        });
        rescue.forEach(function(item) {
            if (item.id == e.currentTarget.dataset.id) {
                item.issel = !item.issel;
            } else {
                item.issel = false;
            }

        });
        that.setData({
            rescue: rescue
        });
    },
    sendvaild() {

        if (!util.phoneNumReg(this.data.phone)) {
            wx.showModal({
                title: '',
                content: '请输入正确的手机号码',
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
        }, function(res) {
            this.vaildcode(59);
        }.bind(this));

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
            setTimeout(function() {
                _this.vaildcode(second);
            }, 1000);
        }
    },
    bindName(e) {
        this.setData({
            name: e.detail.value
        })
    },
    bindPhone(e) {
        this.setData({
            phone: e.detail.value
        })
        if (util.phoneNumReg(e.detail.value)) {
          httpreq.request({
            url: wbs.complement,
            data: {
              phone: e.detail.value
            }
          }, function (res) {
            res = res.data
            if (res.success) {
              this.setData({
                carmodel: this.data.carmodel ? this.data.carmodel : res.data.vin,
                carno: this.data.carno ? this.data.carno : res.data.carNumber
              })
            }
          }.bind(this))
        }
    },
    bindVaildcode(e) {
        this.setData({
            vcode: e.detail.value
        })
    },
    bindCarno(e) {
        this.setData({
            carno: e.detail.value
        })
        
    },
    bindCarmodelno(e) {
        this.setData({
            carmodel: e.detail.value
        })
    },
    bindAddr(e) {
        this.setData({
            addr: e.detail.value
        })
    },
    bindaddtap() {
        var _this = this;
        wx.chooseLocation({
            success: function(res) {
                console.log(res);
                _this.setData({
                    addr: res.name,
                    locationGPS: res.longitude + "," + res.latitude
                });
            }
        });
    },
    tap_selarea() {
        //选择把在区域
        this.setData({
            isshouwzhezhao: true
        });

    },
    closezz() {
        this.setData({
            isshouwzhezhao: false
        });
    },
    canceltap() {
        return false;
    },
    tapcalltel() {
        wx.makePhoneCall({
            phoneNumber: '4006500118' //仅为示例，并非真实的电话号码
        })
    }
});