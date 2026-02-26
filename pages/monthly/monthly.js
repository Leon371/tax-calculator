// pages/monthly/monthly.js
const config = require('../../utils/config.js')

Page({
  data: {
    year: 2026,
    month: 1,
    monthlyTax: 0,
    cumulativeData: {
      totalIncome: 0,
      totalDeduction: 0,
      totalSocial: 0,
      totalExtra: 0,
      taxableIncome: 0,
      cumulativeTax: 0,
      paidTax: 0
    }
  },

  onLoad() {
    const now = new Date()
    this.setData({
      year: now.getFullYear(),
      month: now.getMonth() + 1
    })
    this.calculate()
  },

  prevMonth() {
    let { year, month } = this.data
    if (month === 1) {
      month = 12
      year--
    } else {
      month--
    }
    this.setData({ year, month })
    this.calculate()
  },

  nextMonth() {
    let { year, month } = this.data
    if (month === 12) {
      month = 1
      year++
    } else {
      month++
    }
    this.setData({ year, month })
    this.calculate()
  },

  calculate() {
    const userData = wx.getStorageSync('userData') || {}
    const { baseSalary, bonus, socialSecurity, extraDeduction } = userData
    
    if (!baseSalary) {
      this.setData({ monthlyTax: 0 })
      return
    }

    const month = this.data.month
    
    // 累计收入（按月计算）
    const totalIncome = baseSalary * month
    
    // 累计减除费用
    const totalDeduction = 5000 * month
    
    // 累计社保公积金
    const totalMonthlySocial = socialSecurity.pension + socialSecurity.medical + 
                               socialSecurity.unemployment + socialSecurity.housingFund
    const totalSocial = totalMonthlySocial * month
    
    // 累计专项附加扣除
    const totalExtraMonthly = extraDeduction.children + extraDeduction.elderly + 
                             extraDeduction.housingLoan + extraDeduction.housingRent + 
                             extraDeduction.continuing + extraDeduction.baby
    const totalExtra = totalExtraMonthly * month
    
    // 累计应税所得
    const taxableIncome = totalIncome - totalDeduction - totalSocial - totalExtra
    
    // 累计应纳税额
    const cumulativeTax = config.calculateTax(taxableIncome)
    
    // 已缴税额（之前月份的累计税额）
    const prevMonth = month - 1
    let paidTax = 0
    if (prevMonth > 0) {
      const prevIncome = baseSalary * prevMonth
      const prevDeduction = 5000 * prevMonth
      const prevSocial = totalMonthlySocial * prevMonth
      const prevExtra = totalExtraMonthly * prevMonth
      const prevTaxable = prevIncome - prevDeduction - prevSocial - prevExtra
      paidTax = config.calculateTax(prevTaxable)
    }
    
    // 当月应缴 = 累计 - 已缴
    const monthlyTax = Math.max(0, cumulativeTax - paidTax)
    
    this.setData({
      monthlyTax: monthlyTax.toFixed(1),
      cumulativeData: {
        totalIncome: totalIncome.toFixed(1),
        totalDeduction: totalDeduction.toFixed(1),
        totalSocial: totalSocial.toFixed(1),
        totalExtra: totalExtra.toFixed(1),
        taxableIncome: taxableIncome.toFixed(1),
        cumulativeTax: cumulativeTax.toFixed(1),
        paidTax: paidTax.toFixed(1)
      }
    })
  }
})
