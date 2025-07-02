export function formatWithSIPrefix(value: number): string {
  if (value === 0) return '0.00'

  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''

  // 10の何乗かを計算
  const exponent = Math.floor(Math.log10(absValue))

  // 3の倍数に調整（SI接頭語: -12, -9, -6, -3, 0, 3, 6, 9, 12...）
  let siExponent = Math.floor(exponent / 3) * 3

  // 仮数部を1以上1000未満に調整
  let mantissa = absValue / Math.pow(10, siExponent)

  // 1000以上の場合は次の3の倍数へ
  if (mantissa >= 1000) {
    mantissa /= 1000
    siExponent += 3
  }

  // 小数点以下2桁で切り捨て
  const formatted = Math.floor(mantissa * 100) / 100

  if (siExponent === 0) {
    return `${sign}${formatted.toFixed(2)}`
  }

  return `${sign}${formatted.toFixed(2)}×10^${siExponent}`
}
