var app = getApp();
var util = require("../../utils/util");
var httpreq = require("../../utils/httpreq");
var wbs = require('../../utils/wbs.js');
var session = require("../../utils/session");

app.vaildPage({
    tapgo:function(){
        wx.redirectTo({
            url: '../record/record'
        });
    }
});