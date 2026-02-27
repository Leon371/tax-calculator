// pages/index/index.js
const config = require('../../utils/config.js')

Page({
  data: {
    userData: {},
    cityRates: {
      pension: '8%',
      medical: '2%',
      unemployment: '0.5%',
      housingFund: '7%'
    }
  },

  onLoad() {
    this.loadUserData()
    this.updateCityRates()
  },

  onShow() {
    this.loadUserData()
    setTimeout(() => {
      this.updateCityRates()
    }, 100)
  },

  updateCityRates() {
    const city = this.data.userData.city
    const cityConfig = config.getCityConfig(city)
    if (cityConfig) {
      this.setData({
        cityRates: {
          pension: (cityConfig.pension * 100).toFixed(0) + '%',
          medical: (cityConfig.medical * 100).toFixed(0) + '%',
          unemployment: (cityConfig.unemployment * 100).toFixed(1) + '%',
          housingFund: (cityConfig.housingFundRate * 100).toFixed(0) + '%'
        }
      })
    }
  },

  loadUserData() {
    let userData = wx.getStorageSync('userData')
    if (!userData) {
      userData = {
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
      }
      wx.setStorageSync('userData', userData)
    }
    this.setData({ userData })
  },

  // 城市选择
  goToCitySelect() {
    wx.navigateTo({ url: '/pages/city-select/city-select' })
  },

  // 输入事件处理
  onSalaryInput(e) {
    this.updateData('baseSalary', parseFloat(e.detail.value) || 0)
  },

  onBonusInput(e) {
    this.updateData('bonus', parseFloat(e.detail.value) || 0)
  },

  onPensionInput(e) {
    this.updateSocial('pension', parseFloat(e.detail.value) || 0)
  },

  onMedicalInput(e) {
    this.updateSocial('medical', parseFloat(e.detail.value) || 0)
  },

  onUnemploymentInput(e) {
    this.updateSocial('unemployment', parseFloat(e.detail.value) || 0)
  },

  onHousingInput(e) {
    this.updateSocial('housingFund', parseFloat(e.detail.value) || 0)
  },

  onChildrenInput(e) {
    this.updateExtra('children', parseFloat(e.detail.value) || 0)
  },

  onElderlyInput(e) {
    this.updateExtra('elderly', parseFloat(e.detail.value) || 0)
  },

  onHousingLoanInput(e) {
    this.updateExtra('housingLoan', parseFloat(e.detail.value) || 0)
  },

  onHousingRentInput(e) {
    this.updateExtra('housingRent', parseFloat(e.detail.value) || 0)
  },

  onContinuingInput(e) {
    this.updateExtra('continuing', parseFloat(e.detail.value) || 0)
  },

  onBabyInput(e) {
    this.updateExtra('baby', parseFloat(e.detail.value) || 0)
  },

  onMedicalDeductionInput(e) {
    this.updateExtra('medical', parseFloat(e.detail.value) || 0)
  },

  updateData(key, value) {
    const userData = this.data.userData
    userData[key] = value
    this.setData({ userData })
    wx.setStorageSync('userData', userData)
  },

  updateSocial(key, value) {
    const userData = this.data.userData
    userData.socialSecurity[key] = value
    this.setData({ userData })
    wx.setStorageSync('userData', userData)
  },

  updateExtra(key, value) {
    const userData = this.data.userData
    userData.extraDeduction[key] = value
    this.setData({ userData })
    wx.setStorageSync('userData', userData)
  },

  // 自动计算社保公积金
  autoCalculateSocial() {
    const { city, baseSalary } = this.data.userData
    if (!baseSalary) {
      wx.showToast({ title: '请先输入月薪', icon: 'none' })
      return
    }

    const social = config.calculateSocialSecurity(city, baseSalary)
    const userData = this.data.userData
    userData.socialSecurity = social
    this.setData({ userData })
    wx.setStorageSync('userData', userData)
    
    wx.showToast({ title: '已自动计算', icon: 'success' })
  },

  // 计算个税
  calculateTax() {
    const { city, baseSalary, bonus, socialSecurity, extraDeduction } = this.data.userData
    
    if (!baseSalary) {
      wx.showToast({ title: '请输入月薪', icon: 'none' })
      return
    }

    const monthlyDeduction = 5000 // 每月减除费用
    const totalMonthlySocial = socialSecurity.pension + socialSecurity.medical + 
                               socialSecurity.unemployment + socialSecurity.housingFund
    const totalExtraMonthly = extraDeduction.children + extraDeduction.elderly + 
                             extraDeduction.housingLoan + extraDeduction.housingRent + 
                             extraDeduction.continuing + extraDeduction.baby
    const medicalYearly = extraDeduction.medical / 12 // 大病医疗分摊到每月

    // 月薪应纳税所得额（年度）
    const taxableIncome = (baseSalary - monthlyDeduction - totalMonthlySocial - totalExtraMonthly - medicalYearly) * 12
    
    // 计算年度税额
    const yearlyTax = config.calculateTax(taxableIncome)
    const monthlyTax = yearlyTax / 12
    
    // 年终奖计算（单独计税）
    let bonusTax = 0
    if (bonus > 0) {
      const bonusTaxable = bonus - 5000
      bonusTax = config.calculateTax(bonusTaxable)
    }

    const totalTax = yearlyTax + bonusTax
    const annualIncome = baseSalary * 12 + bonus
    const afterTaxIncome = annualIncome - totalTax

    // 存储计算结果
    const result = {
      city,
      monthlySalary: baseSalary,
      bonus,
      annualIncome,
      monthlyTax: Math.round(monthlyTax),
      bonusTax,
      totalTax: Math.round(totalTax),
      afterTaxIncome: Math.round(afterTaxIncome),
      socialSecurity: totalMonthlySocial,
      extraDeduction: totalExtraMonthly + medicalYearly,
      taxableIncome: taxableIncome / 12
    }

    wx.setStorageSync('taxResult', result)
    wx.navigateTo({ url: '/pages/result/result' })
  },

  // 跳转税率表
  goToTaxTable() {
    wx.navigateTo({ url: '/pages/tax-table/tax-table' })
  }
})
