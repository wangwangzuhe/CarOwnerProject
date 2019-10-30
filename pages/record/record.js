var app = getApp()
var wbs = require('../../utils/wbs.js')
const OPENID = wx.getStorageSync('openId')
var util = require('../../utils/util')

var option = {
  data: {
    loading: false,
    totalRescueCount: '',
    pageIndex: 1,
    comments: [],
    pageSize: 10,
    loadingTipText: '加载中..',
    isShowMyRescueRecords: true
  },
  split: function(i) {
    return i.split(' ')[0]
  },
  onLoad: function(option) {
    var _this = this
    _this.getList(wbs.my)
  },
  getList(url) {
    var _this = this
    if (_this.data.pageIndex > _this.data.pageSize) {
      if (_this.data.totalRescueCount) {
        _this.setData({ loadingTipText: '已显示全部' })
        return
      }
    }
    util.httpIntercept(OPENID).then(resolve => {
      wx.request({
        url: url,
        data: { openId: resolve[0], pageIndex: _this.data.pageIndex + '' },
        method: 'POST',
        success: function(res) {
          res = res.data
          if (res.success) {
            const totalRescueCount = res.data.count
            if (!totalRescueCount) {
              _this.setData({ loadingTipText: '暂无数据' })
              return
            }
            let comments = _this.data.comments.concat(res.data.comments),
              commentss = []
            comments.forEach(function(v, k) {
              v.orderTime = _this.split(v.orderTime)
              commentss.push(v)
            })

            _this.setData({
              pageIndex: _this.data.pageIndex + 1,
              comments: commentss,
              pageSize: totalRescueCount / 8 < 1 ? 1 : Math.ceil(totalRescueCount / 8),
              loadingTipText: '加载中..',
              totalRescueCount
            })
            if (totalRescueCount <= 8) {
              _this.setData({
                loadingTipText: ''
              })
            }
          }
        }
      })
    })
  },
  onReachBottom() {
    if (this.data.isShowMyRescueRecords) {
      this.getList(wbs.my)
      return
    }
    this.getList(wbs.all)
  },
  switchTabItem(event) {
    var _this = this,
      time = null
    var type = event.target.dataset.type
    if (_this.data.isShowMyRescueRecords && type == 1) {
      return
    }
    if (!_this.data.isShowMyRescueRecords && type == 2) {
      return
    }
    _this.setData({
      isShowMyRescueRecords: !_this.data.isShowMyRescueRecords
    })
    _this.setData({
      totalRescueCount: '',
      pageIndex: 1,
      comments: [],
      pageSize: 10,
      loadingTipText: '加载中..'
    })
    getMyList()
    function getMyList() {
      time = setTimeout(function() {
        if (_this.data.totalRescueCount == '') {
          if (_this.data.isShowMyRescueRecords) {
            _this.getList(wbs.my)
          } else {
            _this.getList(wbs.all)
          }
          clearTimeout(time)
        } else {
          getMyList()
        }
      }, 100)
    }
  }
}
app.vaildPage(option)
