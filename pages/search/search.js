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
    this.setData({
      matchList: []
    })
    const key = e.detail.value || ''
    if (!key.length) {
      return false
    }
    const matchList = []
    const listData = JSON.parse(JSON.stringify(this.data.allList))
    listData.map((item, index) => {
      let text = item.Name
      const re = new RegExp(key ,"g")
      if (re.test(text)) {
        const highLightText = `<span style="color: blue;">${key}</span>`
        item.Name = text.replace(re, highLightText)
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
