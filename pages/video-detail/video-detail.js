Page({
  data: {
    auto: true
  },
  onLoad: function (e) {
    wx.setNavigationBarTitle({
      title: e.title
    })
  }
})
