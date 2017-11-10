exports.request = function (options, cb) {

    wx.request({
        url: options.url,
        data: options.data ? options.data : null,
        method: options.method ? options.method : 'POST',
        success: function (res) {
            if (cb) {
                cb(res);
            }
        }
    })
}