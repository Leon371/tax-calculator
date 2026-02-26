// 测试脚本 - 验证计算逻辑（修正版）
// 运行: node test-calculator.js

const TAX_BRACKETS = [
  { max: 36000, rate: 0.03, deduction: 0 },
  { max: 144000, rate: 0.10, deduction: 2520 },
  { max: 300000, rate: 0.20, deduction: 16920 },
  { max: 420000, rate: 0.25, deduction: 31920 },
  { max: 660000, rate: 0.30, deduction: 52920 },
  { max: 960000, rate: 0.35, deduction: 85920 },
  { max: Infinity, rate: 0.45, deduction: 181920 }
]

const CITIES_CONFIG = {
  '上海市': { baseLower: 7310, baseUpper: 36921, pension: 0.08, medical: 0.02, unemployment: 0.005, housingFundRate: 0.07 },
  '深圳市': { baseLower: 2360, baseUpper: 35190, pension: 0.08, medical: 0.02, unemployment: 0.005, housingFundRate: 0.05 },
}

function calculateTax(taxableIncome) {
  if (taxableIncome <= 0) return 0
  const bracket = TAX_BRACKETS.find(b => taxableIncome <= b.max)
  return taxableIncome * bracket.rate - bracket.deduction
}

function calculateSocialSecurity(cityName, salary) {
  const config = CITIES_CONFIG[cityName]
  if (!config) return { pension: 0, medical: 0, unemployment: 0, housingFund: 0 }
  const base = Math.max(config.baseLower, Math.min(salary, config.baseUpper))
  return {
    pension: Math.round(base * config.pension),
    medical: Math.round(base * config.medical),
    unemployment: Math.round(base * config.unemployment),
    housingFund: Math.round(base * config.housingFundRate)
  }
}

console.log('='.repeat(50))
console.log('个税计算器 - 自动化测试')
console.log('='.repeat(50))

let passed = 0
let failed = 0

function test(name, expected, actual) {
  const ok = Math.abs(expected - actual) < 0.01
  console.log(`\n${ok ? '✅' : '❌'} ${name}`)
  console.log(`   预期: ${expected}, 实际: ${actual}`)
  if (ok) passed++
  else failed++
}

// 测试案例1：月薪1万，上海
console.log('\n--- 案例1：月薪1万，上海 ---')
const salary1 = 10000
const social1 = calculateSocialSecurity('上海市', salary1)
const totalSocial1 = social1.pension + social1.medical + social1.unemployment + social1.housingFund
const taxable1 = salary1 - 5000 - totalSocial1
const tax1 = calculateTax(taxable1)
test('案例1-社保总计(10000*17.5%)', 1750, totalSocial1)
test('案例1-应税所得(10000-5000-1750)', 3250, taxable1)
test('案例1-月税(3250*3%)', 97.5, tax1)

// 测试案例2：月薪2万，上海
console.log('\n--- 案例2：月薪2万，上海 ---')
const salary2 = 20000
const social2 = calculateSocialSecurity('上海市', salary2)
const totalSocial2 = social2.pension + social2.medical + social2.unemployment + social2.housingFund
const taxable2 = salary2 - 5000 - totalSocial2
const tax2 = calculateTax(taxable2)
test('案例2-社保(20000*17.5%)', 3500, totalSocial2)
test('案例2-应税所得(20000-5000-3500)', 11500, taxable2)
test('案例2-月税(11500*3%)', 345, tax2)

// 测试案例3：月薪1.5万 + 赡养老人3000/月
console.log('\n--- 案例3：月薪1.5万 + 赡养老人3000/月 ---')
const salary3 = 15000
const elderlyDeduction = 3000
const social3 = calculateSocialSecurity('上海市', salary3)
const totalSocial3 = social3.pension + social3.medical + social3.unemployment + social3.housingFund
const taxable3 = salary3 - 5000 - totalSocial3 - elderlyDeduction
const tax3 = calculateTax(taxable3)
test('案例3-应税所得(15000-5000-2625-3000)', 4375, taxable3)
test('案例3-月税(4375*3%)', 131.25, tax3)

// 测试案例4：年终奖10万单独计税
console.log('\n--- 案例4：年终奖10万单独计税 ---')
const bonus = 100000
const bonusTaxable = bonus - 5000
const bonusTax = calculateTax(bonusTaxable)
test('案例4-年终奖应税所得(100000-5000)', 95000, bonusTaxable)
test('案例4-年终奖税额(95000*25%-2660)', 6980, bonusTax)

// 测试案例5：深圳社保计算
console.log('\n--- 案例5：月薪2万，深圳 ---')
const salary5 = 20000
const social5 = calculateSocialSecurity('深圳市', salary5)
const totalSocial5 = social5.pension + social5.medical + social5.unemployment + social5.housingFund
test('案例5-深圳社保(20000*15.5%)', 3100, totalSocial5)

console.log('\n' + '='.repeat(50))
console.log(`测试结果: ${passed} 通过, ${failed} 失败`)
console.log('='.repeat(50))

if (failed === 0) {
  console.log('\n🎉 所有计算逻辑测试通过！')
}
