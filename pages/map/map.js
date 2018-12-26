//logs.js
const util = require('../../utils/util.js')
const app = getApp()
import * as echarts from '../../ec-canvas/echarts'
let chart_4 = null

Page({
  data: {
    monitorData: null,
    monitorList: [],
    allCount: 0,
    badCount: 0,
    mapParams: {
      averageLongitude: 0,
      averageLatitude: 0,
      markers: [],
      scale: 15
    },
    mainMonitorInfo: {
      GoodCount: 1,
      BadGoodCount: 9,
      AllPointCount: 10
    },
    ec_4: {
      lazyLoad: true
    }
  },
  onLoad: function () {
    
  },
  onShow: function () {
    this.fetchData()
    // chart
    //const ratio = parseFloat(this.data.mainMonitorInfo.GoodCount/this.data.mainMonitorInfo.AllPointCount).toFixed(2)*100
    //this.initChart_4(ratio)
  },
  fetchData: function () {
    const _this = this
    const { USER_INFO_ID } = app.globalData.getUserInfo()
    const url = `reach/mobile/monitorobjects/getallstaticinfo/${USER_INFO_ID}`
    app.globalData.fetch({
      url: url,
      closeLoading: true,
      cb: (res) => {
        console.log(res)
        if (res.data.Result) {
          _this.setData({
            monitorData: res.data.Result,
          })
          app.globalData.monitorList = res.data.Result.MonitorList
          //_this.getCounts()
          _this.updateMap()
          _this.initChart_4(res.data.Result.Rate)
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
    const L = this.data.monitorData.MonitorList.length
    if (!L) {
      return false
    }
    this.data.monitorData.MonitorList.map((item, index) => {
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
    if (!this.data.monitorData.MonitorList.length) {
      return false
    }
    wx.navigateTo({
      url: '/pages/search/search'
    })
  },
  goIndexPage: function (e) {
    const index = e.currentTarget.dataset.index
    app.globalData.defaultMonitor = app.globalData.monitorList[index]
    app.globalData.refreshPage = true
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  initChart_4: function (ratio) {
    const _this = this
    _this.echartsComponnet4 = _this.selectComponent('#mychart-dom-bar-4')
    _this.echartsComponnet4.init((canvas, width, height) => {
      chart_4 = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      canvas.setChart(chart_4);

      var option = {
        color:['#FF9900', '#0076FF'],
        series: [{
          name: '成功率',
          type: 'pie',
          center: ['50%', '50%'], // 饼图的圆心坐标
          radius: ['80%', '100%'],
          avoidLabelOverlap: false,
          hoverAnimation: false,
          legendHoverLink: false,
          avoidLabelOverlap: false,
          silent: true,
          label: { //  饼图图形上的文本标签
              normal: { // normal 是图形在默认状态下的样式
                  show: false,
                  position: 'center',
                  color: '#000',
                  fontSize: 16,
                  fontWeight: 'bold',
                  formatter: `${ratio}%` // {b}:数据名； {c}：数据值； {d}：百分比
              }
          },
          data: [
              {
                  value: 100 - ratio,
                  name: 1,
                  label: {
                      normal: {
                          show: true
                      }
                  }
              },
              {
                  value: ratio,
                  name: 2,
                  label: {

                      normal: {
                      show: false
                      }
                  }
              }
            ]
        }]
      };

      chart_4.setOption(option)
      return chart_4
    })
  }
})
