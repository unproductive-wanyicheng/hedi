//logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    logs: [],
    timeActive: 0,
    timeList: ['今天', '一周', '一月'],
    showPicker: false,
    date: '2018/05/06',
    startDate: '2018/05/05',
    endDate: '2018/05/06',
    typeActive: 'start'
  },
  onLoad: function () {
    
  },
  goWarningDetail: function () {
    wx.navigateTo({
      url: '/pages/warning-detail/warning-detail'
    })
  },
  selectTime: function (e) {
    const index = parseInt(e.target.dataset.index)
    this.setData({
      timeActive: index
    })
  },
  togglePicker: function (e) {
    const type = e.target.dataset.type
    this.setData({
      showPicker: !this.data.showPicker,
      typeActive: type
    })
  },
  bindcancel: function () {
    this.setData({
      showPicker: !this.data.showPicker
    })
  },
  bindDateChange: function (e) {
    console.log(e)
    let date = e.detail.value
    let subStr= new RegExp('-', 'g');//创建正则表达式对象
    let result = date.replace(subStr,"/");//把'is'替换为空字符串
    if(this.data.typeActive === 'start') {
      this.setData({
        startDate: result,
        date: result
      })
    }else{
      this.setData({
        endDate: result,
        date: result
      })
    }
    this.setData({
      showPicker: !this.data.showPicker,
    })
  }
})
