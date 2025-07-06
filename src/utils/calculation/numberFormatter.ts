// SI接頭語計算の共通ロジック
function calculateSIPrefix(absValue: number): {
  mantissa: number
  siExponent: number
} {
  // 10の何乗かを計算
  const exponent = Math.floor(Math.log10(absValue))

  // 3の倍数に調整（SI接頭語）
  let siExponent = Math.floor(exponent / 3) * 3

  // 仮数部を計算
  let mantissa = absValue / Math.pow(10, siExponent)

  // 1未満の場合は前の3の倍数へ
  if (mantissa < 1) {
    mantissa *= 1000
    siExponent -= 3
  }

  // 1000以上の場合は次の3の倍数へ
  if (mantissa >= 1000) {
    mantissa /= 1000
    siExponent += 3
  }

  return { mantissa, siExponent }
}

export function formatWithSIPrefix(value: number): string {
  if (value === 0) return '0.00'

  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''

  const { mantissa, siExponent } = calculateSIPrefix(absValue)

  // 小数点以下2桁で四捨五入（floorからroundに変更）
  const formatted = Math.round((mantissa + Number.EPSILON) * 100) / 100

  if (siExponent === 0) {
    return `${sign}${formatted.toFixed(2)}`
  }

  return `${sign}${formatted.toFixed(2)} × 10^${siExponent}`
}

export function formatForFormula(value: number): string {
  if (value === 0) return '0.' + '0'.repeat(15)

  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''

  const { mantissa, siExponent } = calculateSIPrefix(absValue)
  const formatted = mantissa.toFixed(15)

  if (siExponent === 0) {
    return `${sign}${formatted}`
  }

  return `${sign}${formatted} × 10^${siExponent}`
}
