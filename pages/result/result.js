// pages/result/result.js
Page({
  data: {
    result: {}
  },

  onLoad() {
    const result = wx.getStorageSync('taxResult') || {}
    // 格式化所有数值取整
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
      taxableIncome: format(result.taxableIncome),
      // 预先算好年度值，避免wxml里运算产生小数
      yearlySalary: format(result.monthlySalary * 12),
      yearlySocial: format(result.socialSecurity * 12),
      yearlyExtra: format(result.extraDeduction * 12),
      yearlyTaxable: format(result.taxableIncome * 12)
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
