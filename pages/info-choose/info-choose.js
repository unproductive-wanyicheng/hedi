const app = getApp()

Page({
  data: {
    index: 0,
    showList: [],
    monitorList:[]
  },
  onLoad: function (e) {
    this.setData({
      
    })
  },
  onShow: function () {
    this.getData()
  },
  getData: function () {
    const _this = this
    const id = app.globalData.defaultMonitor.Id
    const url = `sk/mobile/getallmonitorpointsinfo/${id}`
    wx.showLoading()
    app.globalData.fetch({
      url: url,
      closeLoading: true,
      cb: (res) => {
        console.log(res)
        if (!res.data || !res.data.Result.length) {
          wx.showToast({
            title: '接口无返回数据',
            icon: 'none',
            duration: 1500
          })
          return false
        }
        const array = []
        for (let i = 0; i < res.data.Result.length; i++) {
          array.push[false]
        }
        _this.setData({
          monitorList: res.data.Result,
          showList: array
        })
      }
    })
  },
  showChoose: function (e) {
    let {currentTarget:{dataset:{index}}} = e
    index = parseInt(index)
    let key = 'showList['+index+']'
    this.setData({
      [key]: !this.data.showList[index]
    })
  },
  goMonitorDetail: function (e) {
    const listIndex = parseInt(e.target.dataset.listindex)
    const index = parseInt(e.target.dataset.index)
    const type = parseInt(e.target.dataset.type)
    const id = parseInt(e.target.dataset.id)
    app.globalData.monitorList = this.data.monitorList[listIndex]
    wx.navigateTo({
      url: `/pages/monitor-detail/monitor-detail?index=${index}&type=${type}&id=${id}`
    })
  }
})
