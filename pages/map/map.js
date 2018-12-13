//logs.js
const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
    monitorList: [],
    allCount: 0,
    badCount: 0,
    mapParams: {
      averageLongitude: 0,
      averageLatitude: 0,
      markers: [],
      scale: 15
    }
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
          _this.updateMap()
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
  },
  updateMap: function () {
    let array = []
    let aveLon = 0
    let aveLau = 0
    const L = this.data.monitorList.length
    if (!L) {
      return false
    }
    this.data.monitorList.map((item, index) => {
      const params = {
        iconPath: '../../assets/imgs/map-location.png',
        id: index,
        latitude: parseFloat(item.GpsY),
        longitude: parseFloat(item.GpsX),
        width: 15,
        height: 20,
        callout: {
          content: item.Name,
          bgColor: '#000',
          color: '#fff',
          display: 'ALWAYS',
          textAlign: 'center',
          padding: 5
        }
      }
      aveLon += parseFloat(item.GpsX) / L
      aveLau += parseFloat(item.GpsY) / L
      array.push(params)
    })
    this.setData({
      ['mapParams.markers']: array,
      ['mapParams.averageLatitude']: aveLau,
      ['mapParams.averageLongitude']: aveLon
    })
  },
  goSearchPage: function () {
    if (!this.data.monitorList.length) {
      return false
    }
    wx.navigateTo({
      url: '/pages/search/search'
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
