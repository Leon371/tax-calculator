// pages/result/result.js
Page({
  data: {
    result: {}
  },

  onLoad() {
    const result = wx.getStorageSync('taxResult') || {}
    // 格式化所有数值取整
    const format = (num) => Math.round(Number(num) || 0)
    
    // 专项扣除已经是年度值
    const extraYearly = format(result.extraDeduction)
    
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
      extraDeduction: extraYearly,
      taxableIncome: format(result.taxableIncome),
      // 年度值直接用
      yearlySalary: format(result.monthlySalary * 12),
      yearlySocial: format(result.socialSecurity * 12),
      yearlyExtra: extraYearly,
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
