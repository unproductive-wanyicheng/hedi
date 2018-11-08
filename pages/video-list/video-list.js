const app = getApp()
Page({
  data: {
    videoList: []
  },
  onLoad: function () {
    const _this = this
    const id = app.globalData.defaultMonitor.Id
    const url = `sk/mobile/videoinfolist/${id}`
    wx.showLoading()
    app.globalData.fetch({
      url: url,
      closeLoading: true,
      cb: (res) => {
        console.log(res)
        if (res.data.Result && res.data.Result.length) {
          _this.setData({
            videoList: res.data.Result
          })
        }
      }
    })
  },
  goFullScreen: function (e) {
    const index = parseInt(e.currentTarget.dataset.index)
    wx.navigateTo({
      url: '/pages/video-detail/video-detail?title=' + this.data.videoList[index].title
    })
  }
})
