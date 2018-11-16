//logs.js
const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
    monitorList: [],
    allCount: 0,
    badCount: 0
  },
  onLoad: function () {
    
  },
  onShow: function () {
    this.fetchData()
  },
  fetchData: function () {
    const _this = this
    const { USER_INFO_ID } = app.globalData.getUserInfo()
    const url = `reach/mobile/monitorobjects/getall/${USER_INFO_ID}`
    app.globalData.fetch({
      url: url,
      closeLoading: true,
      cb: (res) => {
        console.log(res)
        if (res.data.Result && res.data.Result.length) {
          _this.setData({
            monitorList: res.data.Result
          })
          app.globalData.monitorList = res.data.Result
          _this.getCounts()
        } else {
          wx.showToast({
            title: '暂无监测列表数据',
            icon: 'none',
            duration: 1500
          })
        }
      }
    })
  },
  getCounts: function () {
    let allCount = 0
    let badCount = 0
    this.data.monitorList.map((item, index) => {
     ++allCount
     if(!item.WarningStatus) {
      ++badCount
     }
    })
    this.setData({
      allCount: allCount,
      badCount: badCount
    })
  }
})
