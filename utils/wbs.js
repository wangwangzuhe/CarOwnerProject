//const URL = 'https://rescue.gacfcasales.com/carOwner/';
const URL = 'https://dcctraining.jeepsupport.com.cn/carOwner/';

const appInfo= {
    appId:'wx734cf64670c67342',
    secret:'7855c56933761f4cc4d47d4e2a864f62'
}

// const appInfo = {
//   appId: 'wxc7da24927fc41c85',
//   secret: '16859f5c7b652b8e4084abc1fb824644'
// }

module.exports = {
  appInfo,
  url:URL,
  saveInfo:`${URL}ws/cust/saveInfo`, // 获取openid
  login:`${URL}ws/cust/login`, // 登录接口
  owner:`${URL}ws/cust/owner`,//获取车主当前订单信息
  worker:`${URL}ws/cust/worker`,//获取救援师傅当前任务信息
  save:`${URL}ws/position/save`,//保存救援人员信息
  info:`${URL}ws/position/info`,//获取救援人员位置
  custapply:`${URL}ws/cust/apply`,//救援申请
  login:`${URL}ws/cust/login`,//登录
  info:`${URL}ws/position/info`,//获取救援人员位置
  update:`${URL}ws/cust/update`,//修改订单状态
  my:`${URL}ws/comment/my`,//获取我的评论
  all:`${URL}ws/comment/all`,//获取所有评论
  addcomment:`${URL}ws/comment/save`,//获取所有评论
  commentbasic:`${URL}ws/cust/basic`,//评论获取用户基本信息
  sendSms:`${URL}ws/sms/sendSms`,//发送短信验证码
  verifyCode:`${URL}ws/sms/verifyCode`,//校验短信验证码
  syncUrgeService:`${URL}ws/assistance/syncUrgeService`, //催办
  dealer:`${URL}ws/dealer/pc`,//经销商
  syncCancelAssistance:`${URL}ws/assistance/syncCancelAssistance`,//取消
  confimApply:`${URL}ws/cust/confimApply`,
  location:`${URL}ws/cust/location`,
   complement:`${URL}ws/cust/complement` //调取车架及车牌
}
