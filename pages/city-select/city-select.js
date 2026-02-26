// pages/city-select/city-select.js
const config = require('../../utils/config.js')

Page({
  data: {
    cities: [],
    filteredCities: [],
    searchKey: '',
    currentCity: '上海市',
    selectedCity: ''
  },

  onLoad() {
    const userData = wx.getStorageSync('userData') || {}
    this.setData({
      cities: config.CITIES_CONFIG,
      filteredCities: config.CITIES_CONFIG,
      selectedCity: userData.city || '上海市'
    })
    
    this.getLocation()
  },

  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        // 简单处理：直接用上海
        this.setData({ currentCity: '上海市' })
      },
      fail: () => {
        // 定位失败用默认
      }
    })
  },

  onSearch(e) {
    const key = e.detail.value
    const filtered = this.data.cities.filter(city => 
      city.cityName.includes(key) || city.province.includes(key)
    )
    this.setData({
      searchKey: key,
      filteredCities: filtered
    })
  },

  selectCity(e) {
    const cityName = e.currentTarget.dataset.city
    const userData = wx.getStorageSync('userData') || {}
    userData.city = cityName
    
    const cityConfig = config.getCityConfig(cityName)
    if (cityConfig) {
      userData.cityCode = cityConfig.cityCode
      // 自动计算社保公积金（使用用户输入的月薪，如果没有则用城市最低基数）
      const salary = userData.baseSalary || cityConfig.baseLower
      const social = config.calculateSocialSecurity(cityName, salary)
      userData.socialSecurity = social
    }
    
    wx.setStorageSync('userData', userData)
    
    wx.showToast({ title: '已选择 ' + cityName, icon: 'success' })
    
    setTimeout(() => {
      wx.navigateBack()
    }, 1000)
  }
})
