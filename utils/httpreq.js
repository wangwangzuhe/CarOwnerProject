// var util = require('./util.js')

exports.request = function(options, cb) {
  wx.request({
    url: options.url,
    data: options.data ? options.data : null,
    method: options.method ? options.method : 'POST',
    success: function(res) {
      // if (res.statusCode === 200 && res.data && res.data.success) {
      //   typeof cb === 'function' && cb(res)
      // } else {
      //   util.toast(res.msg)
      // }
      typeof cb === 'function' && cb(res)
    }
  })
}
