//logs.js
import * as echarts from '../../ec-canvas/echarts'
const util = require('../../utils/util.js')
const app = getApp()

let chart_0 = null
let chart_1 = null
let chart_2 = null

Page({
  data: {
    ec_0: {
      lazyLoad: true
    },
    ec_1: {
      lazyLoad: true
    },
    ec_2: {
      lazyLoad: true
    },
    vrData: {}
  },
  onLoad: function (e) {
    this.getData(e.id)
  },
  getData: function (photoid) {
    const _this = this
    const id = app.globalData.defaultMonitor.Id
    const url = `reach/mobile/videophotodetail/${id}/photoid/${photoid}`
    app.globalData.fetch({
      url: url,
      closeLoading: true,
      cb: (res) => {
        console.log(res)
        _this.setData({
          vrData: res.data.Result
        })
        _this.timeFormat()
        app.globalData.setTitle(_this.data.vrData.Note)
        _this.data.vrData.PointMonitorInfos.map((item, index)=>{
          _this.updateChart({
            item: item,
            index: index
          })
        })
      }
    })
  },
  timeFormat: function() {
    this.data.vrData.DateTime = this.data.vrData.DateTime.split('.')[0].replace("T", " ")
    this.setData({
      vrData: this.data.vrData
    })
  },
  updateChart: function(params) {
    const _this = this
    const { type = 'init', item, index } = params

    if (!item.Data[0].data.length) {
      wx.showToast({
        title: item.Data.name + '图表暂无数据',
        icon: 'none',
        duration: 1500
      })
      return false
    }
    const dataList = item.Data[0].data
    const chart_x = []
    const chart_y = []
    let chart_x_interval = 0
    let ThresholdValue = 1000000
    dataList.map((dataItem, dataIndex) => {
      const time = new Date(dataItem[0])
      chart_x.push(util.formatTime(time, 'hh:mm'))
      chart_y.push(dataItem[1])
      chart_x_interval = Math.floor(dataList.length / 7)
    })

    const chart_title = `${item.PointName}数据分析(${item.Unit})`
    const option = {
      title: {
        text: chart_title,
        left: 'left',
        top: 10,
        left: 10,
        textStyle: {
          color: "#fff",
          fontSize: 12
        }
      },
      itemStyle: {
        color: ''
      },
      grid: {
        left: 40,
        right: 40,
        bottom: 30,
        top: 40,
        containLabel: false
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: chart_x,
        axisLine: {
          lineStyle: {
            color: "#CBCBCB"
          },
        },
        axisLabel: {
          align: 'center',
          interval: chart_x_interval,
          color: '#fff',
          fontSize: 10
        }
        // show: false
      },
      yAxis: [
        {
          x: 'center',
          type: 'value',
          min: function(value) {
            return (value.min - value.min/10).toFixed(0)
          },
          max: function(value) {
            return (value.max + value.max/10).toFixed(0)
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
            color: '#fff',
            fontSize: 10
          }
        }
      ],
      series: [{
        name: chart_title,
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
          color: '#0076FF'
        },
        lineStyle: {
          normal: {
            width: 0.5,
            color:'#fff'  
          }
        },
        data: chart_y
      }]
    }

    if (item.PointType === 24) {
      option.series[0].type = 'bar'
      //option.series[0].barWidth = '10%'
      option.xAxis.boundaryGap = true
      option.itemStyle.color = "#0076FF"
    }

    if (item.PointType === 28) {
      delete option.series[0].areaStyle
    }

    let chart = index === 0 ? chart_0 : index === 1 ? chart_1 : chart_2
    const element = "#watchingchar_" + index
    
    if (type === 'update') {
      chart && chart.setOption(option)
      return false
    }

    _this[`echartsComponnet${index}`] = _this.selectComponent(element)
    _this[`echartsComponnet${index}`].init((canvas, width, height) => {
      chart = echarts.init(canvas, null, {
        width: width,
        height: height
      })
      canvas.setChart(chart)
      chart.setOption(option)
      return chart
    })

  }
})
