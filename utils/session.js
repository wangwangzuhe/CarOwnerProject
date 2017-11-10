exports.userinfo = {
    login(identity, orderid) {
        wx.setStorageSync("user", {
            identity: identity,
            orderId: orderid || ''
        });
    }, exit() {
        wx.removeStorageSync('user');
    }, getuser() {
        var userinfo = wx.getStorageSync('user');
        return userinfo;
    }, exitOrderId() {
        wx.removeStorageSync('user.orderId');
    },
    getopenId() {
        return wx.getStorageSync('openId') || '';
    }
}

//枚举身份表示
exports.enum_identity = {
    worker: "worker",
    owner: "owner"
}