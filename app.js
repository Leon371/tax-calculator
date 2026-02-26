// app.js
App({
  onLaunch() {
    // 初始化本地存储
    const userData = wx.getStorageSync('userData')
    if (!userData) {
      wx.setStorageSync('userData', {
        city: '上海市',
        cityCode: '310000',
        baseSalary: 0,
        bonus: 0,
        socialSecurity: {
          pension: 0,
          medical: 0,
          unemployment: 0,
          housingFund: 0
        },
        extraDeduction: {
          children: 0,
          continuing: 0,
          housingLoan: 0,
          housingRent: 0,
          elderly: 0,
          medical: 0,
          baby: 0
        },
        monthlyData: []
      })
    }
  }
})
