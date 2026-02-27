// 税率配置
const TAX_BRACKETS = [
  { max: 36000, rate: 0.03, deduction: 0 },
  { max: 144000, rate: 0.10, deduction: 2520 },
  { max: 300000, rate: 0.20, deduction: 16920 },
  { max: 420000, rate: 0.25, deduction: 31920 },
  { max: 660000, rate: 0.30, deduction: 52920 },
  { max: 960000, rate: 0.35, deduction: 85920 },
  { max: Infinity, rate: 0.45, deduction: 181920 }
]

// 城市社保配置
const CITIES_CONFIG = [
  {
    cityCode: '310000',
    cityName: '上海市',
    province: '上海市',
    baseLower: 7310,
    baseUpper: 36921,
    pension: 0.08,
    medical: 0.02,
    unemployment: 0.005,
    housingFundRate: 0.07,
    housingFundLower: 2500,
    housingFundUpper: 35000
  },
  {
    cityCode: '440300',
    cityName: '深圳市',
    province: '广东省',
    baseLower: 2360,
    baseUpper: 35190,
    pension: 0.08,
    medical: 0.02,
    unemployment: 0.005,
    housingFundRate: 0.05,
    housingFundLower: 2200,
    housingFundUpper: 35190
  },
  {
    cityCode: '110000',
    cityName: '北京市',
    province: '北京市',
    baseLower: 5869,
    baseUpper: 31884,
    pension: 0.08,
    medical: 0.02,
    unemployment: 0.005,
    housingFundRate: 0.12,
    housingFundLower: 2500,
    housingFundUpper: 31884
  },
  {
    cityCode: '330100',
    cityName: '杭州市',
    province: '浙江省',
    baseLower: 3957,
    baseUpper: 19783,
    pension: 0.08,
    medical: 0.02,
    unemployment: 0.005,
    housingFundRate: 0.12,
    housingFundLower: 2280,
    housingFundUpper: 19783
  },
  {
    cityCode: '440100',
    cityName: '广州市',
    province: '广东省',
    baseLower: 2360,
    baseUpper: 31599,
    pension: 0.08,
    medical: 0.02,
    unemployment: 0.005,
    housingFundRate: 0.10,
    housingFundLower: 2100,
    housingFundUpper: 31599
  },
  {
    cityCode: '510100',
    cityName: '成都市',
    province: '四川省',
    baseLower: 4071,
    baseUpper: 20350,
    pension: 0.08,
    medical: 0.02,
    unemployment: 0.005,
    housingFundRate: 0.12,
    housingFundLower: 1500,
    housingFundUpper: 20350
  },
  {
    cityCode: '320500',
    cityName: '苏州市',
    province: '江苏省',
    baseLower: 4494,
    baseUpper: 28062,
    pension: 0.08,
    medical: 0.02,
    unemployment: 0.005,
    housingFundRate: 0.10,
    housingFundLower: 2280,
    housingFundUpper: 28062
  },
  {
    cityCode: '320100',
    cityName: '南京市',
    province: '江苏省',
    baseLower: 4494,
    baseUpper: 28443,
    pension: 0.08,
    medical: 0.02,
    unemployment: 0.005,
    housingFundRate: 0.12,
    housingFundLower: 2280,
    housingFundUpper: 28443
  },
  {
    cityCode: '370200',
    cityName: '青岛市',
    province: '山东省',
    baseLower: 4073,
    baseUpper: 24651,
    pension: 0.08,
    medical: 0.02,
    unemployment: 0.005,
    housingFundRate: 0.12,
    housingFundLower: 2100,
    housingFundUpper: 24651
  },
  {
    cityCode: '610100',
    cityName: '西安市',
    province: '陕西省',
    baseLower: 4013,
    baseUpper: 21728,
    pension: 0.08,
    medical: 0.02,
    unemployment: 0.005,
    housingFundRate: 0.10,
    housingFundLower: 1800,
    housingFundUpper: 21728
  }
]

// 专项附加扣除标准
const EXTRA_DEDUCTION_STANDARD = {
  children: 2000,        // 子女教育每个每月
  continuing: 400,       // 继续教育每月
  housingLoan: 1000,     // 住房贷款利息每月
  housingRent: 800,      // 住房租金每月（直辖市、省会）
  elderly: 3000,        // 赡养老人独生子女每月
  medical: 15000,       // 大病医疗年度
  baby: 2000            // 婴幼儿照护每个每月
}

// 计算个税
function calculateTax(taxableIncome) {
  if (taxableIncome <= 0) return 0
  
  const bracket = TAX_BRACKETS.find(b => taxableIncome <= b.max)
  return Math.round((taxableIncome * bracket.rate - bracket.deduction) * 10) / 10
}

// 累计预扣法计算当月税额
function calculateMonthlyTax(month, totalIncome, totalDeduction, totalSocial, totalExtra, paidTax) {
  // 累计应税所得
  const taxableIncome = totalIncome - totalDeduction - totalSocial - totalExtra
  
  if (taxableIncome <= 0) return 0
  
  // 累计应纳税额
  const cumulativeTax = calculateTax(taxableIncome)
  
  // 当月应缴 = 累计税额 - 已缴税额
  return Math.max(0, cumulativeTax - paidTax)
}

// 获取城市配置
function getCityConfig(cityName) {
  return CITIES_CONFIG.find(c => c.cityName === cityName)
}

// 计算社保公积金
function calculateSocialSecurity(cityName, salary) {
  const config = getCityConfig(cityName)
  if (!config) {
    return { pension: 0, medical: 0, unemployment: 0, housingFund: 0 }
  }
  
  const base = Math.max(config.baseLower, Math.min(salary, config.baseUpper))
  const baseInt = Math.round(base) // 确保基数是整数
  
  return {
    pension: Math.round(baseInt * config.pension),
    medical: Math.round(baseInt * config.medical),
    unemployment: Math.round(baseInt * config.unemployment),
    housingFund: Math.round(baseInt * config.housingFundRate)
  }
}

module.exports = {
  TAX_BRACKETS,
  CITIES_CONFIG,
  EXTRA_DEDUCTION_STANDARD,
  calculateTax,
  calculateMonthlyTax,
  getCityConfig,
  calculateSocialSecurity
}
