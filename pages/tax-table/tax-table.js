// pages/tax-table/tax-table.js
const config = require('../../utils/config.js')

Page({
  data: {
    taxBrackets: []
  },

  onLoad() {
    const brackets = config.TAX_BRACKETS.slice(0, -1).map((item, index) => {
      const prevMax = index === 0 ? 0 : config.TAX_BRACKETS[index - 1].max
      return {
        range: `${prevMax + 1} - ${item.max}`,
        rate: (item.rate * 100).toFixed(0) + '%',
        deduction: item.deduction
      }
    })
    
    // 添加最后一级
    brackets.push({
      range: `${config.TAX_BRACKETS[config.TAX_BRACKETS.length - 2].max}以上`,
      rate: '45%',
      deduction: 181920
    })
    
    this.setData({ taxBrackets: brackets })
  }
})
