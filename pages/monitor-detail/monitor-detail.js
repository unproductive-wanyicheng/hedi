import * as echarts from '../../ec-canvas/echarts'
const util = require('../../utils/util.js')
let socketOpen = false
let socketMsgQueue = []

let chart = null

const app = getApp()

Page({
  data: {
    ec_1: {
      lazyLoad: true
      // onInit: initChart
    },
    e: null,
    monitorList: [],
    activeIndex: 0,
    timeActive: 0,
    timeList: ['实时', '1小时', '今天', '一周'],
    monitorData: null,
    chartData: null
  },
  onLoad: function (e) {
    this.getMonitorData(e)
    wx.onSocketMessage(function (res) {
      console.log(res)
    })
  },
  onShow: function (e) {
    
  },
  closeLoading: function () {
    if (this.data.asycDownNums === this.data.asycMaxNums) {
      wx.hideLoading()
      this.setData({
        asycDownNums: 0
      })
    }
  },
  getChartsData: function (params) {
    const _this = this
    const type = parseInt(_this.data.e.type)
    const pointId = parseInt(_this.data.e.id)
    const id = app.globalData.defaultMonitor.Id
    const chartdatatype = _this.data.timeActive
    const uuid = _this.data.monitorData.Uuid
    // 1 ：1小时  ； 2： 今天  ；  3： 一周  0: 实时
    if (chartdatatype !== 0) {
      const url = `sk/mobile/getmonitorpointdata/${id}/pointtype/${type}/pointid/${pointId}/chartdatatype/${chartdatatype}`
      wx.showLoading()
      app.globalData.fetch({
        url: url,
        closeLoading: true,
        cb: (res) => {
          console.log(res)
          if (res.data && res.data.Result) {
            _this.setData({
              chartData: res.data.Result
            })
            wx.setNavigationBarTitle({
              title: res.data.Result[_this.data.activeIndex].name
            })
            _this.updateChart(params)
          }
        }
      })
    } else {
      wx.connectSocket({
        url: `wss://websocket.aeroiot.cn/Iot?uuid=${uuid}_${pointId}`,
        header:{
          'content-type': 'application/json'
        },
        method:"GET",
        success: function () {
          wx.onSocketOpen(function(res) {
            console.log(res)
            socketOpen = true
            // wx.sendSocketMessage({
            //   data: `...`,
            //   success: function (res) {
            //     console.log(res)

            //   }
            // })
            
          })
        }
      })
      
    }
  },
  updateChart: function (params) {
    const _this = this
    if (!_this.data.chartData.length) {
      return false
    }

    let x_data = []
    let y_data = []
    let x_interval = 0
    let ThresholdValue = parseInt(_this.data.monitorData.ThresholdValue.split('mm')[0])
    _this.data.chartData[_this.data.activeIndex].data.map((item, index) => {
      const time = new Date(item[0])
      // console.log(util.formatTime(time, 'yyyy-MM-dd hh:mm:ss'))
      x_data.push(util.formatTime(time, 'hh:mm'))
      y_data.push(item[1])
      x_interval = Math.floor(_this.data.chartData[_this.data.activeIndex].data.length / 7)
    })

    const option = {
      title: {
        text: '实时数据(mm)',
        left: 'center',
        top: 10,
        textStyle: {
          color: "#000",
          fontSize: 12
        }
      },
      grid: {
        left: 40,
        right: 40,
        bottom: 40,
        top: 60,
        containLabel: false
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: x_data,
        axisLine: {
          lineStyle: {
            color: "#CBCBCB"
          },
        },
        axisLabel: {
          align: 'center',
          interval: x_interval,
          color: '#000',
          fontSize: 10
        }
        // show: false
      },
      yAxis: [
        {
          x: 'center',
          type: 'value',
          min: function(value) {
            return value.min
          },
          max: function(value) {
            return value.max
          },
          axisLine: {
            lineStyle: {
              color: "#CBCBCB"
            }
          },
          splitLine: {
            lineStyle: {
              type: 'dashed'
            },
            show: false
          },
          minInterval: 1,
          axisLabel: {
            color: '#000',
            fontSize: 10
          }
        }
      ],
      // visualMap: {
      //     show: false,
      //     type: 'continuous',
      //     max: 30,
      //     inRange: {
      //       color: ['red'],
      //       symbolSize: [20, 30]
      //     }
      //     // pieces: [
      //     // {
      //     //     min: 30,
      //     //     color: '#0071FF'
      //     // },
      //     // {
      //     //     max: 30,
      //     //     color: '#FF5890'
      //     // }]
      // },
      series: [{
        name: '水平位移(mm)',
        type: 'line',
        symbol:'none',
        smooth: true,
        markLine: {
          symbol: ['none', 'none'],
          label: {
            show: false
          },
          lineStyle: {
              color: '#FF9900',
              type: 'solid'
          },  
          data: [
            {
              type: 'max',
              name: '阈值',
              yAxis: ThresholdValue
            },
          ]
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                  offset: 0, color: '#C68874' // 0% 处的颜色
              }, {
                  offset: 1, color: '#C76D89' // 100% 处的颜色
            }],
          }
        },
        lineStyle: {
          normal: {
            width: 1,
          }
        },
        data: y_data
      }]
    }

    if (chart && params && params.type !== 'init') {
      chart.setOption(option)
      return false
    }

    _this.echartsComponnet1 = _this.selectComponent('#mychart-dom-bar-1')
    _this.echartsComponnet1.init((canvas, width, height) => {
      chart = echarts.init(canvas, null, {
        width: width,
        height: height
      })
      canvas.setChart(chart)
      chart.setOption(option)
      return chart
    })
  },
  getMonitorData: function (e) {
    const _this = this
    _this.setData({
      e: e
    })
    const type = parseInt(e.type)
    const pointId = parseInt(e.id)
    const id = app.globalData.defaultMonitor.Id
    const url = `sk/mobile/getmonitorpointinfo/${id}/pointtype/${type}/pointid/${pointId}`
    wx.showLoading()
    app.globalData.fetch({
      url: url,
      cb: (res) => {
        console.log(res)
        if (res.data && res.data.Result) {
          _this.setData({
            monitorData: res.data.Result
          })
          app.globalData.setTitle(res.data.Result.Name)
          _this.getChartsData({e: e, type: 'init'})
        }
      }
    })
  },
  selectMonitor: function (e) {
    const direction = e.currentTarget.dataset.direction
    if (direction === 'pre') {
      if (this.data.activeIndex === 0) {
        return false
      }
      this.setData({
        activeIndex: this.data.activeIndex - 1
      })
      wx.setNavigationBarTitle({
        title:  this.data.chartData[this.data.activeIndex].name
      })
    } else {
      if (this.data.activeIndex === this.data.chartData.length -1) {
        return false
      }
      this.setData({
        activeIndex: this.data.activeIndex + 1
      })
      wx.setNavigationBarTitle({
        title:  this.data.chartData[this.data.activeIndex].name
      })
    }
    this.updateChart()
  },
  selectTime: function (e) {
    const index = parseInt(e.target.dataset.index)
    this.setData({
      timeActive: index
    })
    this.getChartsData({type: 'update'})
  },
  refreshPage: function () {
    if (!this.data.timeActive) {
      return false
    }
    this.getChartsData({type: 'update'})
  }
})
