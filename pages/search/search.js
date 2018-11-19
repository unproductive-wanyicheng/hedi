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
      matchList: app.globalData.monitorList
    })
  }
})
