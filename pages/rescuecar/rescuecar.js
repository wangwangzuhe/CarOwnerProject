//index.js
//获取应用实例
var app = getApp()
var wbs = require( '../../utils/wbs.js');
var appEnum = require( '../../utils/enum.js' );
const OPENID= wx.getStorageSync('openId');
var time  = null;var time2  = null;
var homeData={
   data:{ 
      serverUrl:wbs.url,
      loading:true,
      loadingMsg:'加载中..',
      apply:{},
      phone:'',
      timeStep:{},
      status:'',
      orderId:'',
      code:0,
      rescueStyle:appEnum.rescueStyle,
      rescueStaus:appEnum.rescueStaus,
      btnflag:2,
      exit:true
  },
  onLoad: function (option) {
    var _this = this;
    _this.getWork();
  },
  onReady: function() {
    // 页面渲染完成时
    var _this = this;
      getCarPosition();
    function getCarPosition(){
      if(_this.data.btnflag>2||_this.data.code==0){
          clearTimeout(time);
          return
      }
    //获取经纬度
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude+'';
        var longitude = res.longitude+'';
        var data = {
            "orderId": _this.data.orderId+'', 
            "openId": OPENID, 
            "latitude": latitude,
            "longitude": longitude
          } 
        wx.request({
          url: wbs.save,
          data:data,
          method: 'POST',
          success: function(res){
            // success
             time = setTimeout(getCarPosition,30000);
            console.log(res,'.......')
          }
        })
      }
    })
    
    }
  },
  getWork(){
    var _this = this;
    wx.request({
      url: wbs.worker,
      data: {openId:OPENID},
      method: 'POST',
      success: function(res){
        res = res.data;
        if(res.success){
          _this.setData({
            loading:false
          })
         let codeKey = Object.keys(appEnum.rescuecarCode);
         codeKey.forEach(function(v,k){
            if(v == res.code){
              _this.setData({
                code:appEnum.rescuecarCode[res.code]
              })
            }
         });
        if(res.data){
            var temp = {
              "caseTime": "",
              "arrivalTime": "",
              "sendTime": "",
              "rescueTime": "",
              'finishTime':'',
               'stepStatus':Object.keys(res.data.timeStep).length
            }
            var timeStep = Object.assign({},temp,res.data.timeStep)
            _this.setData({
                    apply:res.data.apply,
                    phone:res.data.phone,
                    timeStep:timeStep,
                    status:res.data.status,
                    orderId:res.data.orderId,
                    btnflag:Object.keys(res.data.timeStep).length<3?2:Object.keys(res.data.timeStep).length
              });
          }
        }
      }
    })
  },
  toOwner(){
    var _this =this;
    wx.makePhoneCall({
      phoneNumber: _this.data.phone
    })
  },
  tapUpdate(e){
      var _this = this;
      
      let  myType = e.target.dataset.type+'';
      console.log(myType);
      if(_this.data.timeStep.stepStatus<3 && myType==2){
          wx.showToast({
            title: '您还未到达吧？',
            icon: 'loading',
            duration: 10000
          })
          setTimeout(function(){
            wx.hideToast()
          },2000)
          return
      }
       if(_this.data.timeStep.stepStatus<3 && myType==3){
             wx.showToast({
              title: '您还未到达吧？',
              icon: 'loading',
              duration: 10000
            })
            setTimeout(function(){
              wx.hideToast()
            },2000)
            return
      }
      if(_this.data.timeStep.stepStatus<4 && myType==3){
             wx.showToast({
              title: '救援中？',
              icon: 'loading',
              duration: 10000
            })
            setTimeout(function(){
              wx.hideToast()
            },2000)
            return
      }
      var data = {
          "handleType": myType,
          "orderId":_this.data.orderId+''
      }
      wx.request({
        url: wbs.update,
        data: data,
        method: 'POST',
        success: function(res){
            res = res.data;
            if(res.success){
                if(myType == '1'){
                   _this.setData({
                    "timeStep.arrivalTime":res.data.time,
                    "timeStep.stepStatus":3,
                     btnflag:3
                  });
                }
                if(myType == '2'){
                    _this.setData({
                    "timeStep.rescueTime":res.data.time,
                     "timeStep.stepStatus":4,
                     btnflag:4
                  });
                }
                if(myType == '3'){
                  _this.setData({
                    "timeStep.finishTime.":res.data.time,
                     "timeStep.stepStatus":5,
                     btnflag:5
                  });
                   wx.redirectTo({
                      url: '../rescuecar/rescuecar'
                  });
                }
            }
        }
      })
  },
  exit:function(){
    clearTimeout(time);
  }
  // onShareAppMessage: function () {
  //   return {
  //     title: 'Jeep车型询价',
  //     path: '/pages/home/home'
  //   }
  // },
  //  toDealerPage: function( e ) {
  //   var id = e.currentTarget.dataset.id;
  //   var pname=e.currentTarget.dataset.pname;
  //   console.log(pname);
  //   wx.navigateTo( {
  //     url: '../dealer/dealer?id=' + id+"&pname="+pname
  //   });
  // }
};
// Page(homeData)
app.vaildPage(homeData);

