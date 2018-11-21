//logs.js
const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
    allList: [],
    matchList: []
  },
  onLoad: function () {
    this.setData({
      allList: app.globalData.monitorList
    })
  },
  inputEnd: function (e) {
    console.log(e)
    const key = e.detail.value || ' '
    const matchList = []
    this.data.allList.map((item, index) => {
      let text = item.Name
      const re = new RegExp(key ,"g")
      if (re.test(text)) {
        matchList.push(item)
      }
    })
    this.setData({
      matchList: matchList
    })
  },
  goIndexPage: function (e) {
    const index = e.currentTarget.dataset.index
    app.globalData.defaultMonitor = app.globalData.monitorList[index]
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})
