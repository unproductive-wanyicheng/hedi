//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')

import * as echarts from '../../ec-canvas/echarts'

let chart_1 = null
let chart_2 = null
let chart_3 = null
let chart_4 = null

function initChart(canvas, width, height) {
  
}

function initChart_2(canvas, width, height) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(chart);

  var option = {
    title: {
      text: '高程位移(mm)',
      left: 'center',
      textStyle: {
        color: "#fff",
        fontSize: 12
      }
    },
    grid: {
      left: 40,
      right: 40,
      bottom: 40,
      top: 40,
      containLabel: false
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['22:00', '23:00', '5月6日', '01:00', '02:00', '03:00', '04:00'],
      axisLine: {
        lineStyle: {
          color: "#fff"
        },
      },
      axisLabel: {
        align: 'center',
        interval: 0
      }
      // show: false
    },
    yAxis: [
      {
        x: 'center',
        type: 'value',
        min: function(value) {
          return value.min - 10
        },
        max: function(value) {
          return value.max + 30
        },
        axisLine: {
          lineStyle: {
            color: "#fff"
          }
        },
        splitLine: {
          lineStyle: {
            type: 'dashed'
          },
          show: false
        },
        minInterval: 1
      }
    ],
    series: [{
      name: '高程位移(mm)',
      type: 'line',
      symbol:'none',
      smooth: true,
      areaStyle: {
        color: "#417ab8",
        opacity: 1
      },
      lineStyle: {
        normal: {
          width: 0
        }
      },
      data: [20, 50, 60, 70, 60, 50, 40]
    }]
  };

  chart.setOption(option);
  return chart;
}

function initChart_3(canvas, width, height) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(chart);

  var option = {
    title: {
      text: '水平位移(mm)',
      left: 'center',
      textStyle: {
        color: "#fff",
        fontSize: 12
      }
    },
    grid: {
      left: 40,
      right: 40,
      bottom: 40,
      top: 40,
      containLabel: false
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['22:00', '23:00', '5月6日', '01:00', '02:00', '03:00', '04:00'],
      axisLine: {
        lineStyle: {
          color: "#fff"
        },
      },
      axisLabel: {
        align: 'center',
        interval: 0
      }
      // show: false
    },
    yAxis: [
      {
        x: 'center',
        type: 'value',
        min: function(value) {
          return value.min - 10
        },
        max: function(value) {
          return value.max + 30
        },
        axisLine: {
          lineStyle: {
            color: "#fff"
          }
        },
        splitLine: {
          lineStyle: {
            type: 'dashed'
          },
          show: false
        },
        minInterval: 1
      }
    ],
    series: [{
      name: '水平位移(mm)',
      type: 'line',
      symbol:'none',
      smooth: true,
      areaStyle: {
        color: "#417ab8",
        opacity: 1
      },
      lineStyle: {
        normal: {
          width: 0
        }
      },
      data: [20, 50, 60, 70, 60, 50, 40]
    }]
  };

  chart.setOption(option);
  return chart;
}

function initChart_4(canvas, width, height) {
  
}

Page({
  data: {
    showPage: false,
    monitorInfo: null,
    mainMonitorInfo: {
      Status: 0,
      BadGoodCount: 1,
      AllPointCount: 100,
      GoodCount: 1,
      GoodRatio: 80,
      WindowPointTypeOverviewRealContent: []
    },
    mapParams: [
      { points: [
          {
            longitude: 0,
            latitude: 0
          }
        ]
      },
      { points: [
          {
            longitude: 0,
            latitude: 0
          }
        ]
      }
    ],
    showModal: false,
    ec_1: {
      lazyLoad: true
      // onInit: initChart
    },
    ec_2: {
      onInit: initChart_2
    },
    ec_3: {
      onInit: initChart_3
    },
    ec_4: {
      lazyLoad: true
      // onInit: initChart_4
    },
    rainleveldata: [],
    waterleveldata: [],
    asycDownNums: 0,
    asycMaxNums: 2,
    allPage: 1,
    nowPage: 1,
    warningInfo: null,
    baseCard: null,
    mapParams: {
      averageLongitude: 0,
      averageLatitude: 0,
      markers: [],
      polyline: [],
      scale: 15
    },
    ratio: 0,
    timeCaller: null
  },
  onShow: function () {
    console.log('app started:')
    app.globalData.setTitle()
    // this.getAllMonitors()
    this.getMainInfo()
    this.getWarningInfo()
  },
  onHide: function () {
    console.log('hide')
    if (this.data.timeCaller) {
      clearTimeout(this.data.timeCaller)
      this.setData({
        timeCaller: null
      })
    }
  },
  onUnload: function () {
    console.log('hide')
    if (this.data.timeCaller) {
      clearTimeout(this.data.timeCaller)
      this.setData({
        timeCaller: null
      })
    }
  },
  getMainInfo: function (params) {
    const id = app.globalData.defaultMonitor.Id
    const _this = this
    app.globalData.fetch({
      url: 'sk/mobile/getmonitorobjectinfo/' + id,
      noLoading: params ? params.noLoading ? params.noLoading : false : false,
      closeLoading: params ? true : false,
      cb: (res) => {
        console.log(res)
        const ratio = parseFloat(res.data.Result.SensorStatus.GoodCount/res.data.Result.SensorStatus.AllPointCount).toFixed(2)*100
        _this.setData({
          monitorInfo: res.data.Result,
          'mainMonitorInfo.Status': res.data.Result.Warning.Status,
          'mainMonitorInfo.BadGoodCount': res.data.Result.SensorStatus.BadGoodCount,
          'mainMonitorInfo.AllPointCount': res.data.Result.SensorStatus.AllPointCount,
          'mainMonitorInfo.GoodCount': res.data.Result.SensorStatus.GoodCount,
          'mainMonitorInfo.GoodRatio': ratio,
          ratio: ratio,
          'mainMonitorInfo.WindowPointTypeOverviewRealContent': res.data.Result.WindowPointTypeOverviewRealContent
        })
        !_this.data.showModal && _this.initChart_4(ratio)
        _this.setData({
          asycDownNums: ++_this.data.asycDownNums
        })
        _this.closeLoading()
        const timeCaller = setTimeout(()=>{
          _this.getMainInfo({noLoading: true, closeLoading: true})
        }, 60000)
        _this.setData({
          timeCaller: timeCaller
        })
      }
    })
  },
  getWarningInfo: function (params) {
    const id = app.globalData.defaultMonitor.Id
    const _this = this
    const warningtype = 0
    const nowPage = params ? params.nowPage : _this.data.nowPage
    const pageCount = 1
    const url = `reach/mobile/getwarninginfobypagecount/${id}/warningtype/${warningtype}/nowPage/${nowPage}/pageCount/${pageCount}`
    wx.showLoading()
    app.globalData.fetch({
      url: url,
      closeLoading: params ? true : false,
      cb: (res) => {
        console.log(res)
        const data = res.data.Result
        _this.setData({
          allPage: data.AllCount,
          nowPage: data.NowPage,
          warningInfo: data.DataList[0]
        })
        _this.setData({
          asycDownNums: ++_this.data.asycDownNums
        })
        _this.closeLoading()
      }
    })
  },
  setMap: function () {
    const data = app.globalData.defaultMonitor
    let points = []
    data.MapRangeData.map((value, index) => {
      points.push({
        longitude: value[0],
        latitude: value[1]
      })
    })
    const mapParams = [{
      points: points
    }]
    this.setData({
      mapParams: mapParams
    })
    console.log(this.data.mapParams)
  },
  updateWarningInfo: function (e) {
    console.log(e)
    const type = e.currentTarget.dataset.type
    let nowPage = this.data.nowPage
    if (type === 'next') {
      nowPage += 1
    } else {
      nowPage -= 1
    }
    this.getWarningInfo({
      nowPage: nowPage
    })
  },
  closeLoading: function () {
    if (this.data.asycDownNums === this.data.asycMaxNums) {
      wx.hideLoading()
      this.setData({
        asycDownNums: 0
      })
    }
  },
  getAllMonitors: function () {
    const _this = this
    const url = 'reach/mobile/monitorobjects/getall'
    wx.showLoading()
    app.globalData.fetch({
      url: url,
      cb: (res) => {
        console.log(res)
        const result = res.data.Result
        if (result.length) {
          app.globalData.monitorList = result
          if (!app.globalData.defaultMonitor) {
            app.globalData.defaultMonitor = result[0]
          }
          app.globalData.setTitle()
          // _this.setMap()
          const params = app.globalData.defaultMonitor
          _this.getMonitorInfo(params)
          _this.getwaterleveldata(params)
          _this.getrainleveldata(params)
          _this.getmonitorgnssData(params)
          _this.getmonitorobjectbaseinfo(params)
          _this.setData({
            showPage: true
          })
        }
      }
    })
  },
  getmonitorobjectbaseinfo: function (params) {
    const id = params.Id
    const _this = this
    app.globalData.fetch({
      url: `sk/mobile/getmonitorobjectbaseinfo/${id}`,
      cb: (res) => {
        console.log(res)
        
        _this.setData({
          asycDownNums: ++_this.data.asycDownNums
        })
        _this.closeLoading()
      }
    })
  },
  getmonitorgnssData: function (params) {
    const id = params.Id
    const _this = this
    app.globalData.fetch({
      url: `sk/mobile/getmonitorgnssData/${id}/pointtype/14/pointid/5/chartdatatype/0`,
      cb: (res) => {
        console.log(res)
        const result =  res.data.Result[0].data
        // _this.setData({
        //   rainleveldata: result
        // })
        // _this.updateRainAndWaterData()
        _this.setData({
          asycDownNums: ++_this.data.asycDownNums
        })
        _this.closeLoading()
      }
    })
  },
  getrainleveldata: function (params) {
    const id = params.Id
    const _this = this
    app.globalData.fetch({
      url: `sk/mobile/getrainleveldata/${id}/pointtype/24/pointid/6`,
      cb: (res) => {
        console.log(res)
        const result =  res.data.Result[0].data
        _this.setData({
          rainleveldata: result
        })
        _this.updateRainAndWaterData({type: 'init'})
        _this.setData({
          asycDownNums: ++_this.data.asycDownNums
        })
        _this.closeLoading()
      }
    })
  },
  getwaterleveldata: function (params) {
    const id = params.Id
    const _this = this
    app.globalData.fetch({
      url: `sk/mobile/getwaterleveldata/${id}/pointtype/23/pointid/3`,
      cb: (res) => {
        console.log(res)
        const result =  res.data.Result[0].data
        _this.setData({
          waterleveldata: result
        })
        _this.updateRainAndWaterData({type: 'init'})
        _this.setData({
          asycDownNums: ++_this.data.asycDownNums
        })
        _this.closeLoading()
      }
    })
  },
  updateRainAndWaterData: function (params) {
    const _this = this
    if (!_this.data.rainleveldata.length || !_this.data.waterleveldata.length) {
      return false
    }

    let x_data = []
    let water_data = []
    let rain_data = []
    let x_interval = 0
    _this.data.rainleveldata.map((item, index) => {
      const time = new Date(item[0])
      // console.log(util.formatTime(time, 'yyyy-MM-dd hh:mm:ss'))
      x_data.push(util.formatTime(time, 'hh:mm'))
      rain_data.push(item[1])
      water_data.push(_this.data.waterleveldata[index][1])
      x_interval = Math.floor(_this.data.waterleveldata.length / 7)
    })

    const option = {
      color: ['#0076FF', '#FF9900'],
      legend: {
        data: [{name: '降水量(mm/h)', icon: 'circle'}, {name: '水位(m)', icon: 'circle'}],
        textStyle: {
          color: '#fff'
        }
      },
      grid: {
        left: 40,
        right: 40,
        bottom: 40,
        top: 40,
        containLabel: false
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: x_data,
        axisLine: {
          lineStyle: {
            color: "#fff"
          },
        },
        axisLabel: {
          align: 'center',
          interval: x_interval
        }
        // show: false
      },
      yAxis: [
        {
          x: 'center',
          type: 'value',
          min: function(value) {
            return value.min - 10
          },
          max: function(value) {
            return value.max + 30
          },
          axisLine: {
            lineStyle: {
              color: "#fff"
            }
          },
          splitLine: {
            lineStyle: {
              type: 'dashed'
            },
            show: false
          },
          minInterval: 1
        },
        {
          x: 'center',
          type: 'value',
          min: function(value) {
            return value.min - 1
          },
          max: function(value) {
            return value.max + 10
          },
          axisLine: {

          },
          minInterval: 1,
          axisLine: {
            lineStyle: {
              color: "#fff"
            }
          },
          splitLine: {
            lineStyle: {
              type: 'dashed'
            },
            show: false
          }
        },
      ],
      series: [{
        name: '降水量(mm/h)',
        type: 'line',
        symbol:'none',
        smooth: true,
        areaStyle: {
          color: "#417ab8",
          opacity: 1
        },
        lineStyle: {
          normal: {
            width: 0
          }
        },
        data: rain_data
      },
      {
        name: '水位(m)',
        symbol:'none',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        areaStyle: {
          color: "#e1931b",
          opacity: 1
        },
        lineStyle: {
          normal: {
            width: 0
          }
        }, 
        data: water_data,
      }]
    }

    if (chart_1 && params && params.type !== 'init') {
      chart_1.setOption(option)
      return false
    }

    _this.echartsComponnet1 = _this.selectComponent('#mychart-dom-bar-1')
    _this.echartsComponnet1.init((canvas, width, height) => {
      chart_1 = echarts.init(canvas, null, {
        width: width,
        height: height
      })
      canvas.setChart(chart_1)
      chart_1.setOption(option)
      return chart_1
    })
  },
  getMonitorInfo: function (params) {
    const id = params.Id
    const _this = this
    app.globalData.fetch({
      url: 'sk/mobile/getmonitorobjectinfo/' + id,
      cb: (res) => {
        console.log(res)
        const ratio = parseFloat(res.data.Result.SensorStatus.GoodCount/res.data.Result.SensorStatus.AllPointCount).toFixed(2)*100
        _this.setData({
          monitorInfo: res.data.Result,
          'mainMonitorInfo.Status': res.data.Result.Warning.Status,
          'mainMonitorInfo.BadGoodCount': res.data.Result.SensorStatus.BadGoodCount,
          'mainMonitorInfo.AllPointCount': res.data.Result.SensorStatus.AllPointCount,
          'mainMonitorInfo.GoodCount': res.data.Result.SensorStatus.GoodCount,
          'mainMonitorInfo.GoodRatio': ratio,
        })
        _this.initChart_4(ratio)
        _this.setData({
          asycDownNums: ++_this.data.asycDownNums
        })
        _this.closeLoading()
      }
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
          label: { //  饼图图形上的文本标签
              normal: { // normal 是图形在默认状态下的样式
                  show: true,
                  position: 'center',
                  color: '#fff',
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
  },
  showModal: function () {
  	// console.log('...')
  	this.setData({
  		showModal: !this.data.showModal
  	})
    if (!this.data.showModal) {
      this.initChart_4(this.data.ratio)
    }
    if (!this.data.showModal) {
      return false
    }
    const id = app.globalData.defaultMonitor.Id
    const _this = this
    const url = `reach/mobile/getmonitorobjectbaseinfo/${id}`
    wx.showLoading()
    app.globalData.fetch({
      url: url,
      closeLoading: true,
      cb: (res) => {
        console.log(res)
        const data = res.data.Result
        _this.setData({
          baseCard: data
        })
        _this.updateMap()
      }
    })
  },
  updateMap: function () {
    let array = []
    let aveLon = 0
    let aveLau = 0
    const rangeL = this.data.baseCard.MapRangeData.length
    const pointL = this.data.baseCard.Points.length
    if (!rangeL || !pointL) {
      return false
    }
    this.data.baseCard.Points.map((item, index) => {
      const params = {
        iconPath: '../../assets/imgs/map-location.png',
        id: index,
        latitude: parseFloat(item.MapY),
        longitude: parseFloat(item.MapX),
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
      array.push(params)
    })

    const pointLineArray = []
    this.data.baseCard.MapRangeData.map((item, index) => {
      aveLon += parseFloat(item[0]) / rangeL
      aveLau += parseFloat(item[1]) / rangeL
      pointLineArray.push({
        longitude: item[0],
        latitude: item[1]
      })
    })

    this.setData({
      ['mapParams.markers']: array,
      ['mapParams.averageLatitude']: aveLau,
      ['mapParams.averageLongitude']: aveLon,
      ['mapParams.polyline']: [{
        points: pointLineArray,
        color:"#FF0000DD",
        width: 2,
        dottedLine: true
      }]
    })
  },
  goSpDetail: function (e) {
    wx.switchTab({
      url: '/pages/info-choose/info-choose'
    })
  },
  selectMonitor: function (e) {
    wx.navigateTo({
      url: '/pages/monitor/monitor'
    })
  },
  onShareAppMessage: function (res) {
    var pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    return {
      title: '这真的是一个很不错的小程序，快来看看吧',
      path: currentPage.route ,
    }
  }
})
