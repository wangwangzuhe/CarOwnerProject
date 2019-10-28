var wbs = require('./wbs.js')

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

var trim = function(string) {
  return string.replace(/(^\s*)|(\s*$)/g, '')
}
var phoneNumReg = function(str) {
  var reg = /^(((13[0-9]{1})|(14[0-9]{1})|(17[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/
  if (reg.test(str)) {
    return true
  }
  return false
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
var checksum = function(chars) {
  var sum = 0
  for (var i = 0; i < chars.length; i++) {
    var c = chars.charCodeAt(i)
    if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
      sum++
    } else {
      sum += 2
    }
  }
  return sum
}

/*计算汉字*/
var checksumCn = function(chars) {
  var sum = 0
  for (var i = 0; i < chars.length; i++) {
    var c = chars.charCodeAt(i)
    if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
      sum++
    } else {
      sum += 2
    }
  }
  return sum
}
var subString = function(str, len, allcheck, dot) {
  if (!str) return ''
  if (!dot) {
    dot = '.'
  }
  var char_length = 0
  var str_len = checksumCn(str)
  if (str_len <= len) {
    return str
  }
  if (allcheck && len + 2 == str_len) {
    return str
  }
  for (var i = 0; i < str.length; i++) {
    var son_str = str.charAt(i)
    encodeURI(son_str).length > 2 ? (char_length += 2) : (char_length += 1)
    if (char_length >= len) {
      var sub_len = char_length == len ? i + 1 : i
      return str.substr(0, sub_len) + '..'
      break
    }
  }
}
var EARTH_RADIUS = 6378137.0 //单位M
var PI = Math.PI

function getRad(d) {
  return (d * PI) / 180.0
}

//计算距离
function getFlatternDistance(lat1, lng1, lat2, lng2) {
  var f = getRad((lat1 + lat2) / 2)
  var g = getRad((lat1 - lat2) / 2)
  var l = getRad((lng1 - lng2) / 2)

  var sg = Math.sin(g)
  var sl = Math.sin(l)
  var sf = Math.sin(f)

  var s, c, w, r, d, h1, h2
  var a = EARTH_RADIUS
  var fl = 1 / 298.257

  sg = sg * sg
  sl = sl * sl
  sf = sf * sf

  s = sg * (1 - sl) + (1 - sf) * sl
  c = (1 - sg) * (1 - sl) + sf * sl

  w = Math.atan(Math.sqrt(s / c))
  r = Math.sqrt(s * c) / w
  d = 2 * w * a
  h1 = (3 * r - 1) / 2 / c
  h2 = (3 * r + 1) / 2 / s

  return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg))
}

/**
 * 拦截openid为空的情况
 * @return Promise
 */
function httpIntercept(openid) {
  var httpInterceptPromise = new Promise(function(resolve, reject) {
    if (!openid) {
      setOpenId(resolve)
    } else {
      resolve(openid)
    }
  })
  return httpInterceptPromise
}
//调用登录接口 获取openId
function setOpenId(cb) {
  wx.login({
    success: function(ress) {
      if (ress.code) {
        const dataArg = {
          appId: wbs.appInfo.appId, //---小程序唯一标识
          secret: wbs.appInfo.secret, //--小程序的 app secret
          jsCode: ress.code //--登录时获取的 code
          // iv: res.iv, // ---加密算法的初始向量
          // encryptedData: res.encryptedData //--包括敏感数据在内的完整用户信息的加密数据
        }
        wx.request({
          url: wbs.saveInfo,
          data: dataArg,
          method: 'POST',
          success(res) {
            res = res.data
            if (res.success) {
              const { openId, sessionKey } = res.data
              wx.setStorageSync('sessionKey', sessionKey)
              wx.setStorageSync('openId', openId)
              typeof cb == 'function' && cb(openId)
            } else {
              setOpenId(cb)
            }
          }
        })
      }
    }
  })
}

const toast = (title, image, icon = 'none', duration = 1500) => {
  if (title && title.trim()) {
    wx.showToast({
      title,
      image,
      icon,
      duration
    })
  }
}

module.exports = {
  formatTime: formatTime,
  trim: trim,
  phoneNumReg: phoneNumReg,
  checksum: checksum,
  numberWithCommas,
  subString,
  getFlatternDistance: getFlatternDistance,
  httpIntercept: httpIntercept,
  setOpenId,
  toast
}
