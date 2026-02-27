// pages/result/result.js
Page({
  data: {
    result: {}
  },

  onLoad() {
    const result = wx.getStorageSync('taxResult') || {}
    // 格式化所有数值保留一位小数
    const format = (num) => Math.round(num)
    const formatted = {
      ...result,
      monthlySalary: format(result.monthlySalary),
      bonus: format(result.bonus),
      annualIncome: format(result.annualIncome),
      monthlyTax: format(result.monthlyTax),
      bonusTax: format(result.bonusTax),
      totalTax: format(result.totalTax),
      afterTaxIncome: format(result.afterTaxIncome),
      socialSecurity: format(result.socialSecurity),
      extraDeduction: format(result.extraDeduction),
      taxableIncome: format(result.taxableIncome)
    }
    this.setData({ result: formatted })
  },

  goBack() {
    wx.removeStorageSync('userData')
    wx.removeStorageSync('taxResult')
    wx.navigateBack()
  },

  goToMonthly() {
    wx.navigateTo({ url: '/pages/monthly/monthly' })
  }
})
