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
    golbalIndex: 0,
    e: null,
    monitorList: [],
    activeIndex: 0,
    timeActive: 0,
    timeList: ['实时', '1小时', '今天', '一周'],
    dataType: 'other',
    monitorData: null,
    chartData: null,
    socketData: null,
    socketValue: 0,
    gnssData: {
      time: [],
      x: [],
      y: [],
      h: []
    },
    otherData: {
      time: [],
      y: []
    },
    bottomDataList:[],
    ThresholdValue: null
  },
  onLoad: function (e) {
    this.setData({
      e: e,
      golbalIndex: parseInt(e.golbalIndex)
    })
  },
  onShow: function () {
    this.getMonitorData(this.data.golbalIndex)
  },
  onUnload: function () {
    if (app.globalData.socketOpen) {
      wx.closeSocket()
      app.globalData.socketOpen = false
    }
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
    this.setData({
      gnssData: {
        time: [],
        x: [],
        y: [],
        h: []
      },
      otherData: {
        time: [],
        y: []
      },
      bottomDataList: []
    })

    const _this = this
    const type = parseInt(app.globalData.monitorsChooseList[_this.data.golbalIndex].PointType)
    const pointId = parseInt(app.globalData.monitorsChooseList[_this.data.golbalIndex].PointId)
    const id = app.globalData.defaultMonitor.Id
    const chartdatatype = _this.data.timeActive
    const uuid = app.globalData.monitorsChooseList[_this.data.golbalIndex].UuId
    // 1 ：1小时  ； 2： 今天  ；  3： 一周  0: 实时
    if (chartdatatype !== 0) {
      if (app.globalData.socketOpen) {
        wx.closeSocket()
        app.globalData.socketOpen = false
      }
      const url = `reach/mobile/getmonitorpointdata/${id}/pointtype/${type}/pointid/${pointId}/chartdatatype/${chartdatatype}`
      wx.showLoading({title: '加载中...',mask: true})
      app.globalData.fetch({
        url: url,
        closeLoading: true,
        cb: (res) => {
          console.log(res)
          if (res.data && res.data.Result && res.data.Result.length) {
            _this.setData({
              chartData: res.data.Result,
              socketData: null
            })
            //app.globalData.setDetailTitle("监测点", res.data.Result[_this.data.activeIndex].name)
            if (app.globalData.monitorsChooseList[_this.data.golbalIndex].PointType === 14) {
              _this.updateChart({type: params.type, dataType: 'http', chartType: 'gnss'})
            }else{
              _this.updateChart({type: params.type, dataType: 'http', chartType: 'other'})
            }
            //_this.updateChart(params)
          } else {
            wx.showToast({
              title: '图表数据获取失败',
              icon: 'none',
              duration: 1000
            })
          }
        }
      })
    } else {
      if (app.globalData.socketOpen) {
        wx.closeSocket()
        app.globalData.socketOpen = false
      }
      wx.onSocketClose(function(res) {
        console.log('WebSocket 已关闭！')
      })
      const uuid_type = `${uuid}_${type}`
      // const uuid_type = 'b101457e-d4de-45ab-823a-73ef412213c5_14'
      const {showLoading = false} = params
      //showLoading && wx.showLoading({title: '加载中...',mask: true})
      wx.showToast({
        title: '正在等待实时数据返回请稍后……',
        icon: 'none',
        duration: 60000
      })
      wx.connectSocket({
        url: `wss://websocket.aeroiot.cn/Iot`,
        header:{
          'content-type': 'application/json'
        },
        method:"GET",
        success: function () {
          wx.onSocketOpen(function(res) {
            app.globalData.socketOpen = true
            const data = JSON.stringify({
              Action: 'AddGroup',
              Params: [uuid_type]
            })
            wx.sendSocketMessage({
              data: data,
              success: function (res) {
                setTimeout(()=>{
                  if(app.globalData.socketOpen&&(!_this.data.socketValue)){
                    wx.showToast({
                      title: '暂无实时数据',
                      icon: 'none',
                      duration: 2000
                    })
                    wx.hideLoading()
                    app.globalData.socketOpen = false
                    wx.closeSocket()
                  }
                },60*1000)
              }
            })
          })

          wx.onSocketMessage(function (res) {
            wx.showToast({
              title: '数据返回成功',
              icon: 'none',
              duration: 0
            })
            wx.hideLoading()
            const resData = JSON.parse(res.data)
            console.log('onBack:', resData)
            _this.setData({
              socketData: resData
            })
            if (resData.Type === 14 && _this.data.gnssData.time.length) {
              // gnss
              _this.updateChart({type: 'update', dataType: 'socket', chartType: 'gnss'})
            }
            if (resData.Type === 14 && !_this.data.gnssData.time.length) {
              // gnss
              _this.updateChart({type: 'init', dataType: 'socket', chartType: 'gnss'})
            }
            if (resData.Type !== 14 && _this.data.otherData.time.length) {
              // other
              _this.updateChart({type: 'update', dataType: 'socket', chartType: 'other'})
            }
            if (resData.Type !== 14 && !_this.data.otherData.time.length) {
              // other
              _this.updateChart({type: 'init', dataType: 'socket', chartType: 'other'})
            }
          })
        }
      })
    }
  },
  updateChart: function (params) {
    const _this = this
    const { type = 'init', dataType = 'http', chartType = 'singleValue' } = params
    let x_data = []
    let y_data = []
    let x_interval = 0
    let option = null
    let rotate =  this.data.timeActive == 3 ? -30 : 0 
    let margin =  this.data.timeActive == 3 ? 20 : 8 

    if (dataType === 'socket' && chartType === 'gnss') {
      let time_data = _this.data.gnssData.time
      let x = _this.data.gnssData.x
      let y = _this.data.gnssData.y
      let h = _this.data.gnssData.h
      let time = _this.data.socketData.DateTime.split('T')[1].split('.')[0]
      let bottomTime = _this.data.socketData.DateTime.split('.')[0].replace('T', ' ')
      x_interval = Math.floor(time_data.length / 7)
      let bottomName = _this.data.monitorData.ShowText
      //let bottomValue = 'X: ' + _this.data.socketData.X + 'mm ' +'Y: ' +  _this.data.socketData.Y + 'mm ' +'H: ' +  _this.data.socketData.H + 'mm' 
      let bottomValue = [_this.data.socketData.X, _this.data.socketData.Y, _this.data.socketData.H]
      // if (x.length >= 7) {
      //   time_data.shift()
      //   x.shift()
      //   y.shift()
      //   h.shift()
      //   this.data.bottomDataList.pop()
      //   time_data.push(time)
      //   x.push(_this.data.socketData.X)
      //   y.push(_this.data.socketData.Y)
      //   h.push(_this.data.socketData.H)
      //   this.data.bottomDataList.unshift({
      //     time: bottomTime,
      //     name: bottomName,
      //     value: bottomValue
      //   })
      // } else {
        time_data.push(time)
        x.push(_this.data.socketData.X)
        y.push(_this.data.socketData.Y)
        h.push(_this.data.socketData.H)
        this.data.bottomDataList.unshift({
          time: bottomTime,
          name: bottomName,
          value: bottomValue
        })
      // }
      _this.setData({
        [`gnssData.time`]: time_data,
        [`gnssData.x`]: x,
        [`gnssData.y`]: y,
        [`gnssData.h`]: h,
      })

      option = {
        title: {
          text: '实时数据(mm)',
          left: 'center',
          top: 10,
          textStyle: {
            color: "#000",
            fontSize: 12
          }
        },
        legend: {
          top: 30,
          data:['x','y','h']
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
          data: time_data,
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
              return (value.min - value.min/10).toFixed(0)
            },
            max: function(value) {
              return (value.max + value.max/10).toFixed(0)
            },
            // axisLine: {
            //   lineStyle: {
            //     color: "#CBCBCB"
            //   }
            // },
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
        series: [{
          name: 'x',
          type: 'line',
          symbol:'none',
          smooth: true,
          lineStyle: {
            width: 1,
          },
          itemStyle: {
            color: 'red'
          },
          data: x
        },
        {
          name: 'y',
          type: 'line',
          symbol:'none',
          smooth: true,
          lineStyle: {
            width: 1,
          },
          itemStyle: {
            color: 'yellow'
          },
          data: y
        },
        {
          name: 'h',
          type: 'line',
          symbol:'none',
          smooth: true,
          lineStyle: {
            width: 1,
          },
          itemStyle: {
            color: 'blue'
          },
          data: h
        }]
      }

      // _this.setData({
      //   socketValue: 'X: ' + _this.data.socketData.X + 'mm ' +'Y: ' +  _this.data.socketData.Y + 'mm ' +'H: ' +  _this.data.socketData.H + 'mm'
      // })
    }

    if (dataType === 'socket' && chartType === 'other') {
      let ThresholdValue = parseInt(_this.data.monitorData.ThresholdValue.split('mm')[0])
      let time_data = _this.data.otherData.time
      let y = _this.data.otherData.y
      let time = _this.data.socketData.DateTime.split('T')[1].split('.')[0]
      let bottomTime = _this.data.socketData.DateTime.split('.')[0].replace('T', ' ')
      x_interval = Math.floor(time_data.length / 7)
      
      // if (y.length >= 7) {
      //   time_data.shift()
      //   y.shift()
      //   this.data.bottomDataList.shift()
      //   time_data.push(time)
      //   y.push(_this.data.socketData.DataValue)
      //   this.data.bottomDataList.unshift({
      //     time: bottomTime,
      //     value: _this.data.socketData.ShowValue
      //   })
      // } else {
        time_data.push(time)
        y.push(_this.data.socketData.DataValue)
        this.data.bottomDataList.unshift({
          time: bottomTime,
          value: _this.data.socketData.ShowValue
        })
      // }
      _this.setData({
        [`otherData.time`]: time_data,
        [`gnssData.y`]: y
      })

      option = {
        title: {
          text: '实时数据(mm)',
          left: 'center',
          top: 10,
          textStyle: {
            color: "#000",
            fontSize: 12
          }
        },
        itemStyle: {
          color: ''
        },
        // legend: {
        //   top: 30,
        //   data:['x','y','h']
        // },
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
          data: time_data,
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
              return (value.min - value.min/10).toFixed(0)
            },
            max: function(value) {
              return (value.max + value.max/10).toFixed(0)
            },
            // axisLine: {
            //   lineStyle: {
            //     color: "#CBCBCB"
            //   }
            // },
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
        series: [
        {
          name: 'y',
          type: 'line',
          symbol:'none',
          smooth: true,
          lineStyle: {
            width: 1,
            color: 'yellow'
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
          data: y
        }]
      }
      _this.setData({
        socketValue: _this.data.socketData.ShowValue
      })
      if (_this.data.socketData.Type === 24 ||_this.data.socketData.Type === 9) {
        option.series[0].type = 'bar'
        option.xAxis.boundaryGap = true
        option.itemStyle.color = "#0076FF"
      }
    }

    if (dataType === 'http' && chartType === 'gnss') {

      if (!_this.data.chartData.length) {
        return false
      }

      const chart_x_data = _this.data.chartData[0].data
      const chart_y_data = _this.data.chartData[1].data
      const chart_h_data = _this.data.chartData[2].data

      let time_data = []
      let x_data = []
      let y_data = []
      let h_data = []
      
      // let ThresholdValue = parseInt(_this.data.monitorData.ThresholdValue.split('mm')[0])
      chart_x_data.map((item, index) => {
        const time = new Date(item[0])
        // console.log(util.formatTime(time, 'yyyy-MM-dd hh:mm:ss'))
        time_data.push(this.data.timeActive == 3 ? util.formatTime(time, 'MM-dd hh:mm') :  util.formatTime(time, 'hh:mm'))
        //let bottomValue = 'X: ' + item[1] + 'mm ' +'Y: ' +  chart_y_data[index][1] + 'mm ' +'H: ' +  chart_h_data[index][1] + 'mm'
        let bottomValue = [item[1], chart_y_data[index][1], chart_h_data[index][1]]
        let bottomName = _this.data.monitorData.ShowText
        x_data.push(item[1])
        x_interval = Math.floor(chart_x_data.length / 7)
        y_data.push(chart_y_data[index][1])
        h_data.push(chart_h_data[index][1])
        // if (index > 6) {
        //   this.data.bottomDataList.pop()
        // }
        this.data.bottomDataList.unshift({
          time: util.formatTime(time, 'yyyy-MM-dd hh:mm:ss'),
          name: bottomName,
          value: bottomValue
        })
      })

      option = {
        title: {
          text: 'gnss数据(mm)',
          left: 'center',
          top: 10,
          textStyle: {
            color: "#000",
            fontSize: 12
          }
        },
        legend: {
          top: 30,
          data:[{name: 'x'}, {name: 'y'}, {name: 'h'}] 
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
          data: time_data,
          axisLine: {
            lineStyle: {
              color: "#CBCBCB"
            },
          },
          axisLabel: {
            align: 'center',
            interval: x_interval,
            color: '#000',
            fontSize: 10,
            rotate: rotate,
            margin: margin
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
            // axisLine: {
            //   lineStyle: {
            //     color: "#CBCBCB"
            //   }
            // },
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
        series: [{
          name: 'x',
          type: 'line',
          symbol:'none',
          smooth: true,
          lineStyle: {
            width: 1,
          },
          itemStyle: {
            color: 'red'
          },
          data: x_data
        },
        {
          name: 'y',
          type: 'line',
          symbol:'none',
          smooth: true,
          lineStyle: {
            width: 1,
          },
          itemStyle: {
            color: 'yellow'
          },
          data: y_data
        },
        {
          name: 'h',
          type: 'line',
          symbol:'none',
          smooth: true,
          lineStyle: {
            width: 1,
          },
          itemStyle: {
            color: 'blue'
          },
          data: h_data
        }]
      }
    }

    if (dataType === 'http' && chartType === 'other') {

      if (!_this.data.chartData.length) {
        return false
      }
      
      let ThresholdValue = parseInt(_this.data.monitorData.ThresholdValue.split('mm')[0])
      _this.data.chartData[_this.data.activeIndex].data.map((item, index) => {
        const time = new Date(item[0])
        // console.log(util.formatTime(time, 'yyyy-MM-dd hh:mm:ss'))
        x_data.push(this.data.timeActive == 3 ? util.formatTime(time, 'MM-dd hh:mm') :  util.formatTime(time, 'hh:mm'))
        y_data.push(item[1])
        x_interval = Math.floor(_this.data.chartData[_this.data.activeIndex].data.length / 7)
        // if (index > 6) {
        //   this.data.bottomDataList.pop()
        // }
        this.data.bottomDataList.push({
          time: util.formatTime(time, 'yyyy-MM-dd hh:mm:ss'),
          value: item[1] + 'mm'
        })
      })

      option = {
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
        itemStyle: {
          color: ''
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
            fontSize: 10,
            rotate: rotate,
            margin: margin
          }
          // show: false
        },
        yAxis: [
          {
            type: 'value',
            min: function(value) {
              return (value.min - (value.min/10)).toFixed(0)
            },
            max: function(value) {
              return (value.max + (value.max/10)).toFixed(0)
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
      if (_this.data.chartData.Type === 24 || _this.data.chartData.Type === 9 || app.globalData.monitorsChooseList[_this.data.golbalIndex].PointType === 24 || app.globalData.monitorsChooseList[_this.data.golbalIndex].PointType === 9) {
        option.series[0].type = 'bar'
        option.xAxis.boundaryGap = true
        option.itemStyle.color = "#0076FF"
      }
    }
    
    _this.setData({
      bottomDataList: _this.data.bottomDataList
    })

    if (type === 'update') {
      chart && chart.setOption(option)
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
  getMonitorData: function (golbalIndex) {
    const _this = this
    const type = app.globalData.monitorsChooseList[golbalIndex].PointType
    const pointId = app.globalData.monitorsChooseList[golbalIndex].PointId
    const id = app.globalData.defaultMonitor.Id
    const url = `reach/mobile/getmonitorpointinfo/${id}/pointtype/${type}/pointid/${pointId}`
    wx.showLoading({title: '加载中...',mask: true})
    app.globalData.fetch({
      url: url,
      cb: (res) => {
        console.log(res)
        if (res.data && res.data.Result) {
          _this.setData({
            monitorData: res.data.Result,
            ThresholdValue: parseInt(res.data.Result.ThresholdValue.split('mm')[0]),
            dataType: 'other',
          })
          if (res.data.Result.PointType === 14) {
            let array = [parseInt(res.data.Result.ThresholdValue.split(',')[0].split('mm')[0]), parseInt(res.data.Result.ThresholdValue.split(',')[1].split('mm')[0]), parseInt(res.data.Result.ThresholdValue.split(',')[2].split('mm')[0])]
            _this.setData({
              dataType: 'gnss',
              ThresholdValue: array
            })
          }
          app.globalData.setDetailTitle("监测点", res.data.Result.ShowText)
          wx.hideLoading()
          _this.getChartsData({type: 'init'})
        }
      }
    })
  },
  selectMonitor: function (e) {
    const direction = e.currentTarget.dataset.direction
    if (direction === 'pre') {
      if (this.data.golbalIndex === 0) {
        return false
      }
      this.setData({
        golbalIndex: this.data.golbalIndex - 1
      })
      // wx.setNavigationBarTitle({
      //   title:  this.data.chartData[this.data.activeIndex].name
      // })
    } else {
      if (this.data.golbalIndex === app.globalData.monitorsChooseList.length -1) {
        return false
      }
      this.setData({
        golbalIndex: this.data.golbalIndex + 1
      })
      // wx.setNavigationBarTitle({
      //   title:  this.data.chartData[this.data.activeIndex].name
      // })
    }
    this.getMonitorData(this.data.golbalIndex)
  },
  selectTime: function (e) {
    const index = parseInt(e.target.dataset.index)
    this.setData({
      timeActive: index,
      gnssData: {
        time: [],
        x: [],
        y: [],
        h: []
      },
      otherData: {
        time: [],
        y: []
      },
      bottomDataList: []
    })
    //console.log(this.data.socketData)
    this.getChartsData({type: 'init',showLoading: true})
  },
  refreshPage: function () {
    this.getChartsData({type: 'init',showLoading: true})
  }
})
