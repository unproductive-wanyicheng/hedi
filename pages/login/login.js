const app = getApp()
Page({
  data: {
  	account: '',
  	password: ''
  },
  onLoad: function () {
    if (app.globalData.debug) {
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
  },
  setAccount: function (e) {
  	const data = e.detail.value
  	this.setData({
  		account: data
  	})
  },
  setPassword: function (e) {
  	const data = e.detail.value
  	this.setData({
  		password: data
  	})
  },
  doLogin: function () {
    const _this = this
  	if (!_this.data.account.length) {
  		wx.showToast({
		  title: '请输入账号',
      icon: 'none',
		  duration: 1000
		})
		return false
  	}
  	if (!_this.data.password.length) {
  		wx.showToast({
		  title: '请输入密码',
      icon: 'none',
		  duration: 1000
		})
		return false
  	}
    wx.showLoading()
    app.globalData.doLogin({
      account: _this.data.account,
      password: _this.data.password,
      cb: (res) => {
        app.globalData.userInfo = res.data.Result
        wx.switchTab({
          url: '/pages/index/index'
        })
      }
    })
  }
})
