#!/bin/bash
# GitHub 仓库创建和推送脚本

echo "=========================================="
echo "GitHub 推送脚本"
echo "=========================================="
echo ""

# 检查 gh 是否已认证
if gh auth status >/dev/null 2>&1; then
  echo "✓ GitHub 已认证"
  
  # 创建仓库
  echo "正在创建仓库..."
  gh repo create Leon371/tax-calculator --public --description "个人所得税计算器微信小程序" --source=. --push
  
  echo ""
  echo "✓ 推送完成！"
  echo "仓库地址：https://github.com/Leon371/tax-calculator"
else
  echo "✗ GitHub 未认证"
  echo ""
  echo "请先运行以下命令完成认证："
  echo ""
  echo "  gh auth login"
  echo ""
  echo "认证完成后重新运行此脚本"
fi
