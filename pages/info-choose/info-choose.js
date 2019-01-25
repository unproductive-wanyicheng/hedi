const app = getApp()

Page({
  data: {
    index: 0,
    showList: [],
    monitorList:[{
      WhiteIcon: 'http://shuiku.aeroiot.cn/content/img/icons/typeicons-w/pointtype-w-14.png',
      ShowText: '水位',
      PointCount: 2,
      OnlinePointCount: 1
    }]
  },
  onLoad: function (e) {
    
  },
  onShow: function () {
    this.getData()
    app.globalData.setTitle()
  },
  getData: function () {
    const _this = this
    const id = app.globalData.defaultMonitor.Id
    const url = `reach/mobile/getallmonitorpointsinfo/${id}`
    wx.showLoading({title: '加载中...',mask: true})
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
        
        let golbalIndex = 0;
        for(var i=0;i<res.data.Result.length;i++){
          for(var j=0;j<res.data.Result[i].Points.length;j++){
            res.data.Result[i].Points[j].golbalIndex = golbalIndex;
            app.globalData.monitorsChooseList.push(res.data.Result[i].Points[j])
            golbalIndex++;
          }
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
    const golbalIndex = parseInt(e.target.dataset.golbalindex)
    //app.globalData.monitorList = this.data.monitorList[listIndex]
    if (type !== 32) {
      app.globalData.videoPointId = null
      wx.navigateTo({
        //url: `/pages/monitor-detail/monitor-detail?index=${index}&type=${type}&id=${id}`
        url: `/pages/monitor-detail/monitor-detail?golbalIndex=${golbalIndex}`
      })
    }else{
      app.globalData.videoPointId = type
      wx.switchTab({
        url: `/pages/watching-list/watching-list`
      })
    }
  }
})
