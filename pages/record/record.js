var app = getApp()
var wbs = require('../../utils/wbs.js');
var appEnum = require('../../utils/enum.js');
const OPENID = wx.getStorageSync('openId');

var option = {
  data: {
    loading: false,
    count: '',
    pageIndex: 1,
    comments: [],
    pageSize: 10,
    tipText: '加载中..',
    tabflag: true
  },
  split: function (i) { return i.split(' ')[0] },
  onLoad: function (option) {
    var _this = this;
    _this.getList(wbs.my);
  },
  getList(url) {
    var _this = this;
    if (_this.data.pageIndex > _this.data.pageSize) {
      if (_this.data.count) {
        _this.setData({ tipText: '已显示全部' });
        return
      }
    }
    wx.request({
      url: url,
      data: { openId: OPENID, pageIndex: _this.data.pageIndex + '' },
      method: 'POST',
      success: function (res) {
        // success
        res = res.data;
        console.log(res);
        if (res.success) {
          if (!res.data.count) {
            _this.setData({ tipText: '暂无数据' });
            return
          }
          let comments = _this.data.comments.concat(res.data.comments), commentss = [];
          comments.forEach(function (v, k) {
            v.orderTime = _this.split(v.orderTime);
            commentss.push(v)
          });

          _this.setData({
            pageIndex: _this.data.pageIndex + 1,
            comments: commentss,
            pageSize: res.data.count / 8 < 1 ? 1 : Math.ceil(res.data.count / 8),
            tipText: '加载中..',
            count: res.data.count
          });
          if (res.data.count - 8 <= 0) {
            _this.setData({
              tipText: ''
            });
          }
        }
      }
    })
  },
  scrolltolower() {
    if (this.data.tabflag) {
      this.getList(wbs.my)
      return
    }
    this.getList(wbs.all)
  },
  tapTab(event) {
    var _this = this, time = null
    var type = event.target.dataset.type;
    if (_this.data.tabflag && type == 1) {
      return
    }
    if (!_this.data.tabflag && type == 2) {
      return
    }
    _this.setData({
      tabflag: !_this.data.tabflag
    });
    _this.setData({
      count: '',
      pageIndex: 1,
      comments: [],
      pageSize: 10,
      tipText: '加载中..',
    });
    getMyList();
    function getMyList() {
      time = setTimeout(function () {
        if (_this.data.count == '') {
          if (_this.data.tabflag) {
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


  },
  onReady: function () {

  }, navtourl() {
    wx.navigateTo({
      url: '../launchaid/launchaid'
    })
  }
}
app.vaildPage(option);