module.exports = {
  rescuecarCode: {
    // 救援车状态判断枚举
    worker_exist_order: 1, //救援人员存在未完成订单
    worker_inexistence_order: 0 //救援人员不存在未完成订单
  },
  rescueStaus: {
    //救援状态
    init: '预约中',
    case: '开案',
    send: '派案',
    arrival: '到达',
    rescue: '救援中',
    finish: '完成',
    cancel: '取消'
  },
  //救援类型:
  rescueStyle: ['拖车', '拖吊', '换胎', '送油', '现场救援']
}
