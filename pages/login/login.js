const app = getApp()
Page({
  data: {
  	account: 'admin',
  	password: 'htjc8888'
  },
  onLoad: function () {
    const userInfo = wx.getStorageSync('__HEDI_USER_INFO__')
    if (app.globalData.debug && userInfo) {
      wx.redirectTo({
        url: '/pages/map/map'
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
    app.globalData.doLogin({
      account: _this.data.account,
      password: _this.data.password,
      cb: (res) => {
        app.globalData.userInfo = res.data.Result
        wx.setStorageSync('__HEDI_USER_INFO__', res.data.Result)
        setTimeout(()=>{
          wx.navigateTo({
            url: '/pages/map/map'
          })
        }, 2000)
      }
    })
  }
})
