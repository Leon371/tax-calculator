// pages/result/result.js
Page({
  data: {
    result: {},
    showMonthlyDrawer: false,
    monthlyData: {
      year: 2026,
      month: 1,
      monthlyTax: 0,
      monthlyIncome: 0,
      cumulativeData: {
        totalIncome: 0,
        totalDeduction: 0,
        totalSocial: 0,
        totalExtra: 0,
        taxableIncome: 0,
        cumulativeTax: 0,
        paidTax: 0
      }
    }
  },

  onLoad() {
    const result = wx.getStorageSync('taxResult') || {}
    const format = (num) => Math.round(Number(num) || 0)
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
    this.calculateMonthlyData()
    this.setData({ showMonthlyDrawer: true })
  },

  closeMonthlyDrawer() {
    this.setData({ showMonthlyDrawer: false })
  },

  prevMonth() {
    let { month } = this.data.monthlyData
    if (month === 1) {
      month = 12
    } else {
      month--
    }
    this.setData({ 'monthlyData.month': month })
    this.calculateMonthlyData()
  },

  nextMonth() {
    let { month } = this.data.monthlyData
    if (month === 12) {
      month = 1
    } else {
      month++
    }
    this.setData({ 'monthlyData.month': month })
    this.calculateMonthlyData()
  },

  calculateMonthlyData() {
    const userData = wx.getStorageSync('userData') || {}
    const { baseSalary, socialSecurity, extraDeduction } = userData
    
    if (!baseSalary) {
      return
    }

    const month = this.data.monthlyData.month
    const base = Number(baseSalary) || 0
    const social = {
      pension: Number(socialSecurity.pension) || 0,
      medical: Number(socialSecurity.medical) || 0,
      unemployment: Number(socialSecurity.unemployment) || 0,
      housingFund: Number(socialSecurity.housingFund) || 0
    }
    const extra = {
      children: Number(extraDeduction.children) || 0,
      elderly: Number(extraDeduction.elderly) || 0,
      housingLoan: Number(extraDeduction.housingLoan) || 0,
      housingRent: Number(extraDeduction.housingRent) || 0,
      continuing: Number(extraDeduction.continuing) || 0,
      baby: Number(extraDeduction.baby) || 0,
      medical: Number(extraDeduction.medical) || 0
    }
    
    const totalMonthlySocial = social.pension + social.medical + social.unemployment + social.housingFund
    const totalExtraMonthly = extra.children + extra.elderly + extra.housingLoan + extra.housingRent + extra.continuing + extra.baby
    
    const totalIncome = base * month
    const totalDeduction = 5000 * month
    const totalSocial = totalMonthlySocial * month
    const totalExtra = totalExtraMonthly * month
    const taxableIncome = totalIncome - totalDeduction - totalSocial - totalExtra
    
    const cumulativeTax = this.calculateTax(taxableIncome)
    
    const prevMonth = month - 1
    let paidTax = 0
    if (prevMonth > 0) {
      const prevIncome = base * prevMonth
      const prevDeduction = 5000 * prevMonth
      const prevSocial = totalMonthlySocial * prevMonth
      const prevExtra = totalExtraMonthly * prevMonth
      const prevTaxable = prevIncome - prevDeduction - prevSocial - prevExtra
      paidTax = this.calculateTax(prevTaxable)
    }
    
    if (month === 1) {
      paidTax = 0
    }
    
    const monthlyTax = Math.max(0, cumulativeTax - paidTax)
    const monthlyIncome = base - totalMonthlySocial - totalExtraMonthly - monthlyTax
    
    this.setData({
      monthlyData: {
        ...this.data.monthlyData,
        monthlyTax: Math.round(monthlyTax),
        monthlyIncome: Math.round(monthlyIncome),
        cumulativeData: {
          totalIncome: Math.round(totalIncome),
          totalDeduction: Math.round(totalDeduction),
          totalSocial: Math.round(totalSocial),
          totalExtra: Math.round(totalExtra),
          taxableIncome: Math.round(taxableIncome),
          cumulativeTax: Math.round(cumulativeTax),
          paidTax: Math.round(paidTax)
        }
      }
    })
  },

  calculateTax(taxableIncome) {
    if (taxableIncome <= 0) return 0
    const brackets = [
      { max: 36000, rate: 0.03, deduction: 0 },
      { max: 144000, rate: 0.10, deduction: 2520 },
      { max: 300000, rate: 0.20, deduction: 16920 },
      { max: 420000, rate: 0.25, deduction: 31920 },
      { max: 660000, rate: 0.30, deduction: 52920 },
      { max: 960000, rate: 0.35, deduction: 85920 },
      { max: Infinity, rate: 0.45, deduction: 181920 }
    ]
    const bracket = brackets.find(b => taxableIncome <= b.max)
    return Math.round((taxableIncome * bracket.rate - bracket.deduction) * 10) / 10
  }
})
