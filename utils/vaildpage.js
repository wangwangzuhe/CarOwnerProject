var session = require('./session')

var page = function(args) {
  let tmponload = args.onLoad
  let exit = args.exit
  var _this = this
  //合并onLoad方法
  args.onLoad = function(options) {
    wx.setNavigationBarTitle({ title: '广汽菲克道路救援' })
    var info = session.userinfo.getuser()

    if (info) {
      if (info.identity == session.enum_identity.worker && this.__route__ != 'pages/rescuecar/rescuecar') {
        //救援师傅
        wx.redirectTo({
          url: '../rescuecar/rescuecar'
        })
      } else if (info.identity == session.enum_identity.owner && this.__route__ == 'pages/rescuecar/rescuecar') {
        //登录
        // wx.redirectTo({
        //   url: '../loginnew/loginnew'
        // })
      }
    } else {
      //登录
      // wx.redirectTo({
      //   url: '../loginnew/loginnew'
      // })
    }
    if (tmponload) {
      tmponload.call(this, options)
    }
  }
  args.exit = function(e) {
    //用户退出
    session.userinfo.exit()
    if (exit) {
      exit.call(_this)
    }
    wx.redirectTo({
      url: '../login/login'
    })
  }

  return Page(args)
}

exports.page = page
