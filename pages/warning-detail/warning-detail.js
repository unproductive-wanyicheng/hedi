import * as echarts from '../../ec-canvas/echarts'
const app = getApp()
const util = require('../../utils/util.js')

let chart_1 = null
let chart_2 = null
let chart_3 = null

Page({
  data: {
    id: null,
    ec_1: {
      lazyLoad: true
    },
    ec_2: {
      lazyLoad: true
    },
    ec_3: {
      lazyLoad: true
    },
    gnssTypeList: [
      {name: '位移', value: '位移'},
      {name: '速率', value: '速率'},
      {name: '加速度', value: '加速度'}
    ],
    gnssTypeIndex: 0,
    warningInfo: null,
    gnssData: null,
    anData: null
  },
  onLoad: function (e) {
    this.setData({
      id: e.id
    })
  },
  closeLoading: function () {
    if (this.data.asycDownNums === this.data.asycMaxNums) {
      wx.hideLoading()
    }
  },
  onShow: function () {
    this.getMainInfo()
  },
  getMainInfo: function () {
    const _this = this
    const monitorId = app.globalData.defaultMonitor.Id
    const id = _this.data.id
    app.globalData.fetch({
      url: `reach/mobile/getwarningdetailinfo/${monitorId}/warninid/${id}`,
      closeLoading: true,
      cb: (res) => {
        console.log(res)
        _this.setData({
          warningInfo: res.data.Result.WarniBaseInfo,
          gnssData: res.data.Result.GnssData,
          anData: res.data.Result.AnData,
        })
        if (_this.data.warningInfo) {
          _this.data.warningInfo.DateTime = _this.data.warningInfo.DateTime.replace('T', ' ')
          _this.setData({
            warningInfo: res.data.Result.WarniBaseInfo
          })
        }

        wx.setNavigationBarTitle({
          title: res.data.Result.WarniBaseInfo.PointName
        })
        _this.updateChart()
      }
    })
  },
  takeWarning: function () {
    const id = this.data.id
    app.globalData.choosenUserList = []
    wx.navigateTo({
      url: '/pages/take-warning/take-warning?id='+id
    })
  },
  back: function () {
    wx.navigateBack()
  },
  updateChart: function () {
    const _this = this
    if (this.data.gnssData) {
      let data = JSON.parse(this.data.gnssData.ResultDataJsons)[this.data.gnssTypeIndex]
      let gnss_x = data[0].data
      let gnss_y = data[1].data

      let gnss_x_x_data = []
      let gnss_x_y_data = []
      let gnss_x_x_interval = 0

      let gnss_y_x_data = []
      let gnss_y_y_data = []
      let gnss_y_x_interval = 0
      gnss_x.map((item, index) => {
        const time = new Date(item[0])
        // console.log(util.formatTime(time, 'yyyy-MM-dd hh:mm:ss'))
        gnss_x_x_data.push(util.formatTime(time, 'hh:mm'))
        gnss_x_y_data.push(item[1])
        gnss_x_x_interval = Math.floor(gnss_x.length / 7)
      })
      gnss_y.map((item, index) => {
        const time = new Date(item[0])
        // console.log(util.formatTime(time, 'yyyy-MM-dd hh:mm:ss'))
        gnss_y_x_data.push(util.formatTime(time, 'hh:mm'))
        gnss_y_y_data.push(item[1])
        gnss_y_x_interval = Math.floor(gnss_y.length / 7)
      })

      const option_1 = {
        title: {
          text: '水平位移(mm)',
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
          data: gnss_x_x_data,
          axisLine: {
            lineStyle: {
              color: "#CBCBCB"
            },
          },
          axisLabel: {
            align: 'center',
            interval: gnss_x_x_interval,
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
          // markLine: {
          //   symbol: ['none', 'none'],
          //   label: {
          //     show: false
          //   },
          //   lineStyle: {
          //       color: '#FF9900',
          //       type: 'solid'
          //   },  
          //   data: [
          //     {
          //       type: 'max',
          //       name: '阈值',
          //       yAxis: ThresholdValue
          //     },
          //   ]
          // },
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
          data: gnss_x_y_data
        }]
      }

      const option_2 = {
        title: {
          text: '垂直位移(mm)',
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
          data: gnss_y_x_data,
          axisLine: {
            lineStyle: {
              color: "#CBCBCB"
            },
          },
          axisLabel: {
            align: 'center',
            interval: gnss_y_x_interval,
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
          name: '垂直位移(mm)',
          type: 'line',
          symbol:'none',
          smooth: true,
          // markLine: {
          //   symbol: ['none', 'none'],
          //   label: {
          //     show: false
          //   },
          //   lineStyle: {
          //       color: '#FF9900',
          //       type: 'solid'
          //   },  
          //   data: [
          //     {
          //       type: 'max',
          //       name: '阈值',
          //       yAxis: ThresholdValue
          //     },
          //   ]
          // },
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
          data: gnss_y_y_data
        }]
      }
    
      _this.echartsComponnet1 = _this.selectComponent('#mychart-dom-bar-1')
      _this.echartsComponnet1.init((canvas, width, height) => {
        chart_1 = echarts.init(canvas, null, {
          width: width,
          height: height
        })
        canvas.setChart(chart_1)
        chart_1.setOption(option_1)
        return chart_1
      })

      _this.echartsComponnet2 = _this.selectComponent('#mychart-dom-bar-2')
      _this.echartsComponnet2.init((canvas, width, height) => {
        chart_2 = echarts.init(canvas, null, {
          width: width,
          height: height
        })
        canvas.setChart(chart_2)
        chart_2.setOption(option_2)
        return chart_2
      })
    }
    if (this.data.anData) {
      let data = this.data.anData.Data.data

      let x_data = []
      let y_data = []
      let x_interval = 0

      data.map((item, index) => {
        const time = new Date(item[0])
        // console.log(util.formatTime(time, 'yyyy-MM-dd hh:mm:ss'))
        x_data.push(util.formatTime(time, 'hh:mm'))
        y_data.push(item[1])
        x_interval = Math.floor(data.length / 7)
      })

      const option_3 = {
        title: {
          text: '历史数据分析(mm)',
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
          // markLine: {
          //   symbol: ['none', 'none'],
          //   label: {
          //     show: false
          //   },
          //   lineStyle: {
          //       color: '#FF9900',
          //       type: 'solid'
          //   },  
          //   data: [
          //     {
          //       type: 'max',
          //       name: '阈值',
          //       yAxis: ThresholdValue
          //     },
          //   ]
          // },
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

      _this.echartsComponnet3 = _this.selectComponent('#mychart-dom-bar-3')
      _this.echartsComponnet3.init((canvas, width, height) => {
        chart_3 = echarts.init(canvas, null, {
          width: width,
          height: height
        })
        canvas.setChart(chart_3)
        chart_3.setOption(option_3)
        return chart_3
      })
    }
  },
  radioChange: function(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    this.setData({
      gnssTypeIndex: index
    })
    this.updateChart()
  }
})
