# 対応関数とLaTeX表記例

| 関数名      | LaTeX表記例                   | 備考                                                                               |
| ----------- | ----------------------------- | ---------------------------------------------------------------------------------- |
| `sqrt()`    | `sqrt(2)`→`\sqrt{2}`          | 平方根を返す                                                                       |
| `log()`     | `log(2)`→`\log_{10}(2)`       | 常用対数(底10)を返す                                                               |
| `ln()`      | `ln(2)`→`\log_{e}2`           | 自然対数を返す                                                                     |
| `exp()`     | `exp(2)`→`e^{2}`              | ネイピア数 e を底とする数値のべき乗を返す                                          |
| `sin()`     | `sin(2)`→`\sin(2°)`           | サイン関数。引数の単位は度[°] (ラジアンではない)。sin2°なので0.034899…を返す       |
| `cos()`     | `cos(2)`→`\cos(2°)`           | コサイン関数。引数の単位は度[°] (ラジアンではない)。cos2°なので0.999390…を返す     |
| `tan()`     | `tan(2)`→`\tan(2°)`           | タンジェント関数。引数の単位は度[°] (ラジアンではない)。tan2°なので0.034920…を返す |
| `dtor()`    | `dtor(2)`→`dtor(2°)`          | 度をラジアンに変換。2°を0.0349065…[rad]に変換して返す                              |
| `rtod()`    | `rtod(2)`→`rtod(2)°`          | ラジアンを度に変換。 2[rad]を114.59155…°に変換して返す                             |
| `asin()`    | `asin(0.5)`→`\sin^{-1}(0.5)°` | アークサイン関数。結果の単位は度[°]。asin(0.5)なので30°を返す                      |
| `acos()`    | `acos(0.5)`→`\cos^{-1}(0.5)°` | アークコサイン関数。結果の単位は度[°]。acos(0.5)なので60°を返す                    |
| `atan()`    | `atan(1)`→`\tan^{-1}(1)°`     | アークタンジェント関数。結果の単位は度[°]。atan(1)なので45°を返す                  |
| `random(,)` | `random(1,10)`                | 第1引数以上、第2引数未満の範囲で乱数(浮動小数点)を生成                             |
| `pi()`      | `\pi`                         | 円周率（3.141592...）を返す。変数として使用。                                      |
| `e()`       | `e`                           | ネイピア数（2.7182818...）を返す。変数として使用。                                 |

# LaTeX変換テストケース

- `atan(2\*[var1]/[var2])`

  - `atan(2\times\frac{[var1]}{[var2]})`
  - `\tan^{-1}(2\times\frac{[var1]}{[var2]})°`

- `(100 + [var_x]) % [var_y]`

  - 下記と同様のため2行目は省略される
  - `(100 + [var_x]) \bmod [var_y]`

- `exp(pi() * [i]) + e()`

  - `exp(\pi \times [i]) + e`
  - `e^{\pi \times [i]} + e`

- `acos([x]/sqrt([x]^2+[y]^2))`

  - `acos(\frac{[x]}{sqrt([x]^2+[y]^2)})`
  - `\cos^{-1}\left(\frac{[x]}{\sqrt{[x]^2+[y]^2}}\right)°`

- `sqrt(log(100*[var1]))`

  - `sqrt(log(100\times[var1]))`
  - `\sqrt{\log_{10}(100\times[var1])}`

- `1 + exp(-sin(30*[var1]))`

  - `1 + exp(-sin(30\times[var1]))`
  - `1 + e^{-\sin(30\times[var1]°)}`

- `random(0, 1) * ([max] - [min]) + [min]`

  - 下記と同様のため2行目は省略される
  - `random(0, 1) \times ([max] - [min]) + [min]`

- `(sin([x]))^2 + (cos([x]))^2`

  - `(sin([x]))^2 + (cos([x]))^2`
  - `(\sin([x]°))^2 + (\cos([x]°))^2`

- `sqrt([a]^2 + [b]^2 - 2*[a]*[b]*cos([c]))`

  - `sqrt([a]^2 + [b]^2 - 2\times[a]\times[b]\times cos([c]))`
  - `\sqrt{[a]^2 + [b]^2 - 2\times[a]\times[b]\times \cos([c]°)}`

- `ln(([var1]+1)/([var1]-1)) / 2`

  - `\frac{ln(\frac{[var1]+1}{[var1]-1})}{2}`
  - `\frac{\log_{e}\left(\frac{[var1]+1}{[var1]-1}\right)}{2}`

- `([x]^2 + [y]^2)^0.5 / (1 + [z]^-2)`

  - 下記と同様のため2行目は省略される
  - `\frac{([x]^2 + [y]^2)^{0.5}}{1 + [z]^{-2}}`

- `atan([y]/[x]) + atan([y2]/[x2])`

  - `atan(\frac{[y]}{[x]}) + atan(\frac{[y2]}{[x2]})`
  - `\tan^{-1}\left(\frac{[y]}{[x]}\right)° + \tan^{-1}\left(\frac{[y2]}{[x2]}\right)°`

- `exp(1) * sin(rtod(pi()/6)) - log(10)`

  - `exp(1) \times sin(rtod(\frac{\pi}{6})) - log(10)`
  - `e^{1} \times \sin(rtod(\frac{\pi}{6})°) - \log_{10}(10)` ※`°`が重複した場合は1つ削除

- `(e()^[var1] - e()^-[var1])/(e()^[var1] + e()^-[var1]) + tan(asin([var2]))`
  - `\frac{e^{[var_a]} - e^{-[var_a]}}{e^{[var_a]} + e^{-[var_a]}} + tan(asin([var_b]))`
  - `\frac{e^{[var_a]} - e^{-[var_a]}}{e^{[var_a]} + e^{-[var_a]}} + \tan(\sin^{-1}([var_b])°)` ※`°`が重複した場合は1つ削除

# プリセットデータ

追って追記
