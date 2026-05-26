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

- 初回起動時にプリセットデータをロードする。
- ユーザーがトップページの編集でリストを全て削除した場合にプリセットデータを再度ロードする。

### sample1

- 要素名: "sample1"
- Overviewタブ(Formula,Resultは自動計算し表示)
  - Overview

```
自由落下の落下時間から落下距離を算出する。
g:重力加速度[m/s^2]
t:落下時間[sec]
result:落下距離[m]
```

- Variablesタブ(Resultは自動計算し表示)
  - Variable1
    - name: "g"
    - value: "9.80665"
  - Variable2
    - name: "t"
    - value: "5"
- Formulaタブ(Resultは自動計算し表示)
  - Formula: "1/2*[g]*[t]^2"

### sample2

- 要素名: "sample2"
- Overviewタブ(Formula,Resultは自動計算し表示)
  - Overview

```
標高と気温から気圧を算出する。
h:標高[m]
T:気温[℃]
P0:海面気圧[hPa]
result:気圧[hPa]
```

- Variablesタブ(Resultは自動計算し表示)
  - Variable1
    - name: "h"
    - value: "1000"
  - Variable2
    - name: "T"
    - value: "5"
  - Variable3
    - name: "P0"
    - value: "1013.25"
- Formulaタブ(Resultは自動計算し表示)
  - Formula: "[P0]_(1-((0.0065_[h])/([T]+0.0065\*[h]+273.15)))^5.257"

### sample3

- 要素名: "sample3"
- Overviewタブ(Formula,Resultは自動計算し表示)
  - Overview

```
二等辺三角形の底辺と高さから底角を算出する。
h:高さ
a:底辺の長さ
result:底角[°]
```

- Variablesタブ(Resultは自動計算し表示)
  - Variable1
    - name: "h"
    - value: "1"
  - Variable2
    - name: "a"
    - value: "2"
- Formulaタブ(Resultは自動計算し表示)
  - Formula: "atan(2\*[h]/[a])"

### sample4

- 要素名: "sample4"
- Overviewタブ(Formula,Resultは自動計算し表示)
  - Overview

```
インダクタとキャパシタの値からLCローパスフィルタのカットオフ周波数を算出。
L:インダクタンス[H]
C:キャパシタンス[F]
result:カットオフ周波数[Hz]
```

- Variablesタブ(Resultは自動計算し表示)
  - Variable1
    - name: "L"
    - value: "1\*10^(-6)"
  - Variable2
    - name: "C"
    - value: "12\*10^(-12)"
- Formulaタブ(Resultは自動計算し表示)
  - Formula: "1/(2*pi()*sqrt([L]\*[C]))"

### sample5

- 要素名: "sample5"
- Overviewタブ(Formula,Resultは自動計算し表示)
  - Overview

```
距離の変化から音圧の減衰量を算出する。
pointA:音圧が既知である点の音源からの距離[m]
pointB:音圧を算出したい点の音源からの距離[m]
volumeA:pointAの音圧[dB]
result:pointBの音圧[dB]
```

- Variablesタブ(Resultは自動計算し表示)
  - Variable1
    - name: "pointA"
    - value: "1"
  - Variable2
    - name: "pointB"
    - value: "10"
  - Variable3
    - name: "volumeA"
    - value: "100"
- Formulaタブ(Resultは自動計算し表示)
  - Formula: "[volumeA]-20\*log([pointB]/[pointA])"
