const app = getApp()

Page({
  data: {
    monitorList: []
  },
  onLoad: function () {
    const monitorList = app.globalData.monitorList
    this.setData({
      monitorList: monitorList
    })
  },
  chooseMonitor: function (e) {
  	const index = parseInt(e.target.dataset.index)
  	app.globalData.defaultMonitor = app.globalData.monitorList[index]
  	wx.switchTab({
	   url: '/pages/index/index'
  	})
  }
})
