//
//  FormulaTabOverviewController.swift
//  myCalc1
//
//  Created by 2dice on 2018/11/12.
//  Copyright © 2018 2dice. All rights reserved.
//

import UIKit
import RealmSwift
import iosMath
import GoogleMobileAds

class FormulaTabOverviewController: UIViewController {
    ///////////////////////広告設定///////////////////////////
    //テスト用広告ユニットID
    //let AdMobId = "ca-app-pub-3940256099942544/2934735716"
    //本番用広告ユニットID
    let AdMobId = "ca-app-pub-1981161772146478/5604676515"
    var admobView = GADBannerView()
    // Your TestDevice ID
    let DEVICE_ID = "3c91ebb2a3134ab35b747cfbe5976385"
    ////////////////////////////////////////////////////////
    let labelOverview: UILabel = UILabel()
    let textOverview: UITextView = UITextView()
    let labelFormula: UILabel = UILabel()
    let labelMathFormula1 = UILabel()
    let labelMathFormula2 = MTMathUILabel()
    let labelMathFormula3 = MTMathUILabel()
    var mathDefaultFontSize: CGFloat = 0.0
    let labelResult: UILabel = UILabel()
    let labelCalcMathResult = MTMathUILabel()
    var ID: Int = 0
    
    required public init(formulaID: Int){
        super.init(nibName: nil, bundle: nil)
        //IDをプロパティに格納
        ID = formulaID
        print("formulaTabOverViewInit")
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view.
        ////////////////////ビューのカラー設定////////////////////
        view.backgroundColor = UIColor.white
        ////////////////////Overviewの部品配置////////////////////
        ////////////////////Label////////////////////
        //ラベルテキストの設定
        labelOverview.text = "Overview"
        //ラベル追加
        self.view.addSubview(labelOverview)
        ////////////////////OverView入力用textView////////////////////
        //realmからoverviewを取得
        let realmData = DataModel()
        let pick = realmData.RealmPick(id: ID)
        textOverview.text = pick.overview
        //TextViewフォント設定
        textOverview.font = UIFont.systemFont(ofSize: 15)
        //TextView色設定
        textOverview.backgroundColor = UIColor.lightGray.withAlphaComponent(0.15)
        //TextViewキーボード表示設定
        //textOverview.returnKeyType = .done//キーボードの改行を完了に
        //TextViewを編集可能に設定
        textOverview.allowsEditingTextAttributes = true
        //デリゲート設定
        textOverview.delegate = self
        //TextView追加
        self.view.addSubview(textOverview)
        ////////////////////数式表示の部品配置////////////////////
        //label////////////////////
        //ラベルテキストの設定
        labelFormula.text = "Formula"
        //ラベル追加
        self.view.addSubview(labelFormula)
        //数式表示ラベル////////////////////
        //ラベル追加
        self.view.addSubview(labelMathFormula1)
        //数式表示iosMath////////////////////
        mathDefaultFontSize = labelMathFormula2.fontSize
        //ラベル追加
        self.view.addSubview(labelMathFormula2)
        self.view.addSubview(labelMathFormula3)
        ////////////////////計算結果の表示部品////////////////////
        //label////////////////////
        //ラベルテキストの設定
        labelResult.text = "Result"
        //ラベル追加
        self.view.addSubview(labelResult)
        //計算結果////////////////////
        //ラベル追加
        self.view.addSubview(labelCalcMathResult)
        ////////////////////////広告////////////////////////
        admobView = GADBannerView(adSize:kGADAdSizeBanner)
        admobView.adUnitID = AdMobId
        admobView.rootViewController = self
        admobView.load(GADRequest())
        //self.view.addSubview(admobView)
    }
    
    override func viewDidAppear(_ animated: Bool) {
        ////////////////////フレームの座標取得////////////////////
        let screenWidth:CGFloat = self.view.frame.size.width
        let screenHeight:CGFloat = self.view.frame.size.height
        //ナビゲーションバーを使ったときのyのオフセット分を取得
        let offsetPoint: CGFloat = (self.navigationController?.navigationBar.frame.size.height ?? 44) + (UIApplication.shared.statusBarFrame.size.height)
        let lowerOffsetPoint: CGFloat = self.tabBarController?.tabBar.frame.size.height ?? 49
        ////////////////////overViewのラベル配置////////////////////
        labelOverview.frame = CGRect(x:10, y:offsetPoint, width:screenWidth-20, height: 30)
        ////////////////////overViewのTextViewの部品配置////////////////////
        textOverview.frame = CGRect(x:20, y:labelOverview.frame.maxY, width:screenWidth-30, height:screenHeight/4)
        ////////////////////数式表示のラベル表示////////////////////
        labelFormula.frame = CGRect(x:10, y:textOverview.frame.maxY+10, width:screenWidth-20, height: 30)
        ////////////////////元の数式表示用ラベル表示////////////////////
        labelMathFormula1.frame = CGRect(x:20, y:labelFormula.frame.maxY, width:screenWidth-30, height: 30)
        //ラベルがはみ出していたらフォントサイズを下げる
        labelMathFormula1.adjustsFontSizeToFitWidth = true
        //値の取得
        labelMathFormula1.text = getFormulaRow()
        ////////////////////iosMath1の数式更新////////////////////
        //latex形式の数式を設定
        labelMathFormula2.latex = getFormulaLatex1()
        ////////////////////iosMath1用表示////////////////////
        //ラベル位置の設定
        labelMathFormula2.frame = CGRect(x:20, y:labelMathFormula1.frame.maxY, width:screenWidth-30, height: 30)
        //縮小した後元に戻らないのでデフォルトサイズを格納
        labelMathFormula2.fontSize = mathDefaultFontSize
        //labelの大きさを自動調整(これがないと分数にしたときに上下が切れる)
        labelMathFormula2.sizeToFit()
        //ラベルがはみ出していたらフォントサイズを下げる
        while labelMathFormula2.frame.maxX > screenWidth{
            labelMathFormula2.fontSize -= 1
            labelMathFormula2.sizeToFit()
            //限界まで下げてもはみ出すならあきらめる
            if labelMathFormula2.fontSize == 1{
                break
            }
        }
        ////////////////////iosMath2の数式更新////////////////////
        //latex形式の数式を設定(関数を使っていた場合のみ)
        let str: String = labelMathFormula2.latex!
        // 関数を1つでも使ってたらラベルを読み出し
        if (str.range(of: "sqrt(") != nil) || (str.range(of: "log(") != nil) || (str.range(of: "ln(") != nil) ||
            (str.range(of: "exp(") != nil) || (str.range(of: "sin(") != nil) || (str.range(of: "asin(") != nil) ||
            (str.range(of: "cos(") != nil) || (str.range(of: "acos(") != nil) || (str.range(of: "tan(") != nil) ||
            (str.range(of: "atan(") != nil) || (str.range(of: "dtor(") != nil) || (str.range(of: "rtod(") != nil){
            labelMathFormula3.latex = getFormulaLatex2(string: str)
        } else {
            labelMathFormula3.latex = " "
        }
        ////////////////////iosMath2用表示////////////////////
        //ラベル位置の設定
        labelMathFormula3.frame = CGRect(x:20, y:labelMathFormula2.frame.maxY, width:screenWidth-30, height: 30)
        //縮小した後元に戻らないのでデフォルトサイズを格納
        labelMathFormula3.fontSize = mathDefaultFontSize
        //labelの大きさを自動調整(これがないと分数にしたときに上下が切れる)
        labelMathFormula3.sizeToFit()
        //ラベルがはみ出していたらフォントサイズを下げる
        while labelMathFormula3.frame.maxX > screenWidth{
            labelMathFormula3.fontSize -= 1
            labelMathFormula3.sizeToFit()
            //限界まで下げてもはみ出すならあきらめる
            if labelMathFormula3.fontSize == 1{
                break
            }
        }
        ////////////////////計算結果用のラベル表示////////////////////
        labelResult.frame = CGRect(x:10, y:labelMathFormula3.frame.maxY+10, width:screenWidth-20, height: 30)
        ////////////////////計算結果のラベル表示////////////////////
        //ラベル位置の設定
        labelCalcMathResult.frame = CGRect(x:20, y:labelResult.frame.maxY, width:screenWidth-30, height: 30)
        //Realmのロード//////////////////////////
        let realmData = DataModel()
        var pick:DataModel
        pick = realmData.RealmPick(id: ID)
        if pick.result != ""{
            let resultString = caretReplacer(string: pick.result)
            labelCalcMathResult.latex = resultString.replacingOccurrences(of: "*", with: "\\times")
        }else{
            labelCalcMathResult.latex = " "
        }
        labelCalcMathResult.sizeToFit()
        ///////////////////////広告設定///////////////////////////
        //safeエリア対応(iphonex)
        if #available(iOS 11.0, *) {
            admobView.frame.origin = CGPoint(x:0, y:self.view.frame.size.height - admobView.frame.height - lowerOffsetPoint)
        }else{
            admobView.frame.origin = CGPoint(x:0, y:self.view.frame.size.height - admobView.frame.height - lowerOffsetPoint)
        }
        admobView.frame.size = CGSize(width:self.view.frame.width, height:admobView.frame.height)
    }
    
    private func getFormulaRow() -> String{
        ////////////////////////Realmのロード//////////////////////////
        let realmData = DataModel()
        var pick:DataModel
        pick = realmData.RealmPick(id: ID)
        var string: String = pick.formula
        //\nを削除
        string = "= " + string.replacingOccurrences(of: "\n", with: "")
        return string
    }
    
    private func getFormulaLatex1() -> String{
        ////////////////////////Realmのロード//////////////////////////
        let realmData = DataModel()
        var pick:DataModel
        pick = realmData.RealmPick(id: ID)
        //数式がエラーだった場合エラーを返す
        if pick.result == "error"{
            return "error"
        }
        //数式が空白だった場合(初期状態等)
        if pick.formula == ""{
            return " "
        }
        //数式に日本語が含まれる場合(iosMathで日本語部分が出ないのでいっそ出さない)
        if pick.formula.matches("[亜-熙ぁ-んァ-ヶ]"){
            print("日本語を含む場合")
            return " "
        }
        ////////////////////formulaをiosMath用に加工////////////////////
        var string: String = pick.formula
        //\nを削除
        string = string.replacingOccurrences(of: "\n", with: "")
        //piをπにする前に事前処理(slashReplacerで\を使うので\\piにできないが括弧も排除しないとうまく行かないので)
        string = string.replacingOccurrences(of: "pi()", with: "pi¥¥")
        //e()をeにする前に事前処理(slashReplacerで\を使うので\\mathrm{e}にできないが括弧も排除しないとうまく行かないので)
        string = string.replacingOccurrences(of: "e()", with: "e¥¥")
        //^を^{}に。^の右に(があれば対応する括弧までを{}でくくる。無ければ演算子までを{}でくくる。
        string = caretReplacer(string: string)
        //xx/xxをfrac{}{}に。/の左右のブロックを{}でくくり、先頭にfrac
        string = slashReplacer(string: string)
        print(string)
        //piをπに
        string = string.replacingOccurrences(of: "pi¥¥", with: "\\pi")
        //e()をeに
        string = string.replacingOccurrences(of: "e¥¥", with: "\\mathrm{e}")
        //*を×に
        string = string.replacingOccurrences(of: "*", with: "\\times")
        //%を表示できる形に
        string = string.replacingOccurrences(of: "%", with: "\\%")
        //[変数]を一括りに表示できる形に
        string = string.replacingOccurrences(of: "[", with: "{[")
        string = string.replacingOccurrences(of: "]", with: "]}")
        return "=" + string
    }
    
    //割り算記号/の前後の数式ブロックを{}でくくり\\fracをつける(括弧がある場合は括弧内を全て含める)
    private func slashReplacer(string: String) -> String{
        var replaceString = string
        var fracSearchingCharacter: Character
        var fracSearchingIndex = replaceString.startIndex
        var fracRange = replaceString.range(of:"")
        var firstBracketIndex = replaceString.startIndex
        var endBracketIndex = replaceString.startIndex
        var bracketCounter: Int = 0
        var whileCounter: Int = 0
        print("startSlashOp")
        //まず/をfrac/}{}に変換
        replaceString = replaceString.replacingOccurrences(of: "/", with: "\\frac{}{}")
        //frac{}のレンジの末尾から後方にループしてブロックを抽出し位置を保持(無限ループ会費のため10回までに制限)
        while (replaceString.range(of: "frac{}") != nil) && (whileCounter <= 10){
            print("whileCounter=\(whileCounter)")
            whileCounter += 1
            bracketCounter = 0
            fracRange = replaceString.range(of: "\\frac{}")
            //frac{}のすぐ前のインデックスを保存(ここが")"かどうか判定)
            endBracketIndex = replaceString.index(fracRange!.lowerBound, offsetBy: -1)
            print("endBracketPosition=\(replaceString[endBracketIndex])")
            print("\(replaceString)")
            ////////////////////スラッシュの前半分の{}処理////////////////////
            // frac{}の前の()を{}で、なければ次の演算子までを{}でくくる
            for i in 1...replaceString[replaceString.startIndex...fracRange!.lowerBound].count{
                print("frac前方のループi=\(i)")
                fracSearchingIndex = replaceString.index(fracRange!.lowerBound, offsetBy: -i+1)
                fracSearchingCharacter = replaceString[fracSearchingIndex]
                print("searchChar=\(fracSearchingCharacter)")
                // frac{}のすぐ前が)だった場合
                if (replaceString[endBracketIndex] == ")") {
                    print("fracの前が )")
                    // (をカウント(多重括弧対策)
                    if (fracSearchingCharacter == ")") {
                        bracketCounter += 1
                    }
                    if(fracSearchingCharacter == "("){
                        bracketCounter -= 1
                    }
                    //frac{}直前の)が閉じられたら
                    if (bracketCounter == 0) && (fracSearchingCharacter == "(") {
                        print("bracketCounter=0 && (閉じ")
                        firstBracketIndex = fracSearchingIndex
                        print("変更前：\(replaceString)")
                        //括弧の外側を{}でくくる
                        replaceString.removeSubrange(fracRange!.lowerBound ..< fracRange!.upperBound) //後ろからやらないとインデックスが狂う
                        replaceString.insert("}", at:replaceString.index(endBracketIndex, offsetBy: 1)) //\\frac{}を消したので末尾の}は入れ直し
                        replaceString.insert("{", at:replaceString.index(firstBracketIndex, offsetBy: 0)) //\\frac{を順番に入れていく
                        // fracを挿入。文字列で入れたかったがnsmutablestringのinsertStringを使わなければいけなそうなので文字で順番に入れる
                        replaceString.insert("c", at:replaceString.index(firstBracketIndex, offsetBy: 0)) //\\frac{を順番に入れていく
                        replaceString.insert("a", at:replaceString.index(firstBracketIndex, offsetBy: 0)) //\\frac{を順番に入れていく
                        replaceString.insert("r", at:replaceString.index(firstBracketIndex, offsetBy: 0)) //\\frac{を順番に入れていく
                        replaceString.insert("f", at:replaceString.index(firstBracketIndex, offsetBy: 0)) //\\frac{を順番に入れていく
                        replaceString.insert("\\", at:replaceString.index(firstBracketIndex, offsetBy: 0)) //\\frac{を順番に入れていく
                        print("変更後：\(replaceString)")
                        break
                    }
                } else {
                    print("fracの前が)じゃない")
                    // (をカウント(多重括弧対策)
                    if (fracSearchingCharacter == ")") {
                        bracketCounter += 1
                    }
                    if(fracSearchingCharacter == "("){
                        bracketCounter -= 1
                    }
                    // frac{}の直前に初めに出てきた演算子でfrac{を挿入
                    if ((bracketCounter == 0) && ((fracSearchingCharacter == "%") || (fracSearchingCharacter == "+") || (fracSearchingCharacter == "-") || (fracSearchingCharacter == "*"))) || (bracketCounter != 0 && fracSearchingCharacter == "("){
                        print("fracの前の数式ブロックが終了(演算子か対応しない閉じ括弧)")
                        print("変更前：\(replaceString)")
                        //frac{}直前の数式ブロックの外側を{}でくくる
                        replaceString.removeSubrange(fracRange!.lowerBound ..< fracRange!.upperBound) //後ろからやらないとインデックスが狂う
                        replaceString.insert("}", at:replaceString.index(endBracketIndex, offsetBy: 1)) //frac{}を消したので末尾の}は入れ直し
                        replaceString.insert("{", at:replaceString.index(fracSearchingIndex, offsetBy: 1))
                        replaceString.insert("c", at:replaceString.index(fracSearchingIndex, offsetBy: 1))
                        replaceString.insert("a", at:replaceString.index(fracSearchingIndex, offsetBy: 1))
                        replaceString.insert("r", at:replaceString.index(fracSearchingIndex, offsetBy: 1))
                        replaceString.insert("f", at:replaceString.index(fracSearchingIndex, offsetBy: 1))
                        replaceString.insert("\\", at:replaceString.index(fracSearchingIndex, offsetBy: 1))
                        print("変更後：\(replaceString)")
                        break
                    }
                    //(xx)^x/xの場合に(の前に\\frac{を入れたい & \fracのネスト対策
                    if ((bracketCounter == 0) && (fracSearchingCharacter == "(")) || ((fracSearchingCharacter == "\\") && (i != 1)){
                        print("fracの前の数式ブロックが終了(対応する閉じ括弧)")
                        //frac{}直前の数式ブロックの外側を{}でくくる
                        print("変更前：\(replaceString)")
                        replaceString.removeSubrange(fracRange!.lowerBound ..< fracRange!.upperBound) //後ろからやらないとインデックスが狂う
                        replaceString.insert("}", at:replaceString.index(endBracketIndex, offsetBy: 1)) //frac{}を消したので末尾の}は入れ直し
                        replaceString.insert("{", at:replaceString.index(fracSearchingIndex, offsetBy: 0))
                        replaceString.insert("c", at:replaceString.index(fracSearchingIndex, offsetBy: 0))
                        replaceString.insert("a", at:replaceString.index(fracSearchingIndex, offsetBy: 0))
                        replaceString.insert("r", at:replaceString.index(fracSearchingIndex, offsetBy: 0))
                        replaceString.insert("f", at:replaceString.index(fracSearchingIndex, offsetBy: 0))
                        replaceString.insert("\\", at:replaceString.index(fracSearchingIndex, offsetBy: 0))
                        print("変更後：\(replaceString)")
                        break
                    }
                    //frac{}数式ブロックが行頭だった場合、数式ブロックの外側を{}でくくる
                    if (fracSearchingIndex == replaceString.startIndex) {
                        print("fracの前の数式ブロックが終了(行頭)")
                        print("変更前：\(replaceString)")
                        replaceString.removeSubrange(fracRange!.lowerBound ..< fracRange!.upperBound) //後ろからやらないとインデックスが狂う
                        replaceString.insert("}", at:replaceString.index(endBracketIndex, offsetBy: 1)) //frac{}を消したので末尾の}は入れ直し
                        replaceString.insert("{", at:replaceString.index(fracSearchingIndex, offsetBy: 0))
                        replaceString.insert("c", at:replaceString.index(fracSearchingIndex, offsetBy: 0))
                        replaceString.insert("a", at:replaceString.index(fracSearchingIndex, offsetBy: 0))
                        replaceString.insert("r", at:replaceString.index(fracSearchingIndex, offsetBy: 0))
                        replaceString.insert("f", at:replaceString.index(fracSearchingIndex, offsetBy: 0))
                        replaceString.insert("\\", at:replaceString.index(fracSearchingIndex, offsetBy: 0))
                        print("変更後：\(replaceString)")
                        break
                    }
                }
            }
            print("/記号の前方処理が終了")
            print(replaceString)
            ////////////////////スラッシュの後ろ半分の{}処理////////////////////
            //frac{}{}のすぐ後ろのインデックスを保存(ここが"("かどうか判定)
            firstBracketIndex = replaceString.index(fracRange!.upperBound, offsetBy: 2)
            print("firstBracketPosition=\(replaceString[firstBracketIndex])")
            bracketCounter = 0
            // frac{}の後ろの()を{}で、なければ次の演算子までを{}でくくる
            for j in replaceString[replaceString.startIndex...fracRange!.upperBound].count+1 ..< replaceString.count{
                print("frac後方のループj=\(j)")
                fracSearchingIndex = replaceString.index(replaceString.startIndex, offsetBy: j)
                fracSearchingCharacter = replaceString[fracSearchingIndex]
                print("searchChar=\(fracSearchingCharacter)")
                // frac{}{}のすぐ後ろが(だった場合
                if (replaceString[firstBracketIndex] == "(") {
                    print("fracの後ろが (")
                    // (をカウント(多重括弧対策)
                    if (fracSearchingCharacter == "(") {
                        bracketCounter += 1
                    }
                    if(fracSearchingCharacter == ")"){
                        bracketCounter -= 1
                    }
                    //frac{}直前の)が閉じられたら
                    if (bracketCounter == 0) && (fracSearchingCharacter == ")") {
                        print("bracketCounter=0 && )閉じ")
                        print("変更前：\(replaceString)")
                        //括弧の外側を{}でくくる
                        replaceString.insert("}", at:replaceString.index(fracSearchingIndex, offsetBy: 1)) //後ろからやらないとインデックスが狂う
                        replaceString.remove(at: replaceString.index(firstBracketIndex, offsetBy: -1))
                        print("変更後：\(replaceString)")
                        break
                    }
                } else {
                    print("fracの後ろが(じゃない")
                    // (をカウント(多重括弧対策)
                    if (fracSearchingCharacter == "(") {
                        bracketCounter += 1
                    }
                    if(fracSearchingCharacter == ")"){
                        bracketCounter -= 1
                    }
                    // frac{xx}{}の直後に初めに出てきた演算子で}を挿入
                    if ((bracketCounter == 0) && ((fracSearchingCharacter == "%") || (fracSearchingCharacter == "+") || (fracSearchingCharacter == "-") || (fracSearchingCharacter == "*") || (fracSearchingCharacter == "\\"))) || (bracketCounter != 0 && fracSearchingCharacter == ")") {
                        print("fracの前の数式ブロックが終了(演算子か対応しない閉じ括弧)")
                        print("変更前：\(replaceString)")
                        //frac{xx}{}直前の数式ブロックの外側を{}でくくる
                        replaceString.insert("}", at:replaceString.index(fracSearchingIndex, offsetBy: 0)) //後ろからやらないとインデックスが狂う
                        replaceString.remove(at: replaceString.index(firstBracketIndex, offsetBy: -1))
                        print("変更後：\(replaceString)")
                        break
                    }
                    //(xx)^x/xの場合に(の前に\\frac{を入れたい
                    if (bracketCounter == 0) && (fracSearchingCharacter == ")") {
                        print("fracの前の数式ブロックが終了(演算子か対応する閉じ括弧)")
                        print("変更前：\(replaceString)")
                        //frac{xx}{}直前の数式ブロックの外側を{}でくくる
                        replaceString.insert("}", at:replaceString.index(fracSearchingIndex, offsetBy: 1)) //後ろからやらないとインデックスが狂う
                        replaceString.remove(at: replaceString.index(firstBracketIndex, offsetBy: -1))
                        print("変更後：\(replaceString)")
                        break
                    }
                    //frac{}{}数式ブロックが行末だった場合、数式ブロックの外側を{}でくくる
                    if (j == replaceString.count-1) {
                        print("fracの前の数式ブロックが終了(行末)")
                        print("変更前：\(replaceString)")
                        //frac{xx}{}直前の数式ブロックの外側を{}でくくる
                        replaceString.insert("}", at:replaceString.endIndex)//後ろからやらないとインデックスが狂う
                        replaceString.remove(at: replaceString.index(firstBracketIndex, offsetBy: -1))
                        print("変更後：\(replaceString)")
                        break
                    }
                }
            }
        }
        return replaceString
    }
    
    //^の後ろの数式ブロックを{}でくくる(括弧がある場合は括弧内を全て含める)
    private func caretReplacer(string: String) -> String{
        var replaceString = string
        var caretSearchingCharacter: Character
        var caretSearchingIndex = replaceString.startIndex
        var bracketSearchingCharacter: Character
        var bracketSearchingIndex = replaceString.startIndex
        var firstBracketIndex = replaceString.startIndex
        var endBracketIndex = replaceString.startIndex
        var bracketCounter: Int = 0
        // ^を^{}に変更し、配列の数を変更後に合わせる
        replaceString = replaceString.replacingOccurrences(of: "^", with: "^{}")
        // ^の後ろを{}でくくる
        for i in 1...replaceString.count{
            caretSearchingIndex = replaceString.index(replaceString.startIndex, offsetBy: i-1)
            caretSearchingCharacter = replaceString[caretSearchingIndex]
            if (caretSearchingCharacter == "^") {
                //^{}のすぐ後ろのインデックスを保存(ここが"("かどうか判定)
                firstBracketIndex = replaceString.index(caretSearchingIndex, offsetBy: 3)
                // ^を見つけたら()、なければ次の演算子までを{}でくくる
                for j in (i+3)...replaceString.count{
                    bracketSearchingIndex = replaceString.index(replaceString.startIndex, offsetBy: j-1)
                    bracketSearchingCharacter = replaceString[bracketSearchingIndex]
                    // ^のすぐ後ろが(だった場合
                    if (replaceString[firstBracketIndex] == "(") {
                        // (をカウント(多重括弧対策)
                        if (bracketSearchingCharacter == "(") {
                            bracketCounter += 1
                        }
                        if(bracketSearchingCharacter == ")"){
                            bracketCounter -= 1
                        }
                        //^直後の(が閉じられたら
                        if (bracketCounter == 0) && (bracketSearchingCharacter == ")") {
                            endBracketIndex = replaceString.index(bracketSearchingIndex, offsetBy: 1)
                            //括弧の外側を{}でくくる
                            replaceString.insert("}", at:endBracketIndex)//後ろからやらないとインデックスが狂う
                            replaceString.remove(at: replaceString.index(firstBracketIndex, offsetBy: -1))
                            break
                        }
                    } else {
                        // ^の後ろに初めに出てきた演算子で}を挿入
                        print(bracketSearchingCharacter)
                        print(j)
                        if (bracketSearchingCharacter == "%") || (bracketSearchingCharacter == "^") || (bracketSearchingCharacter == "+") || (bracketSearchingCharacter == "-" && replaceString.index(replaceString.startIndex, offsetBy: j-1) != firstBracketIndex) || (bracketSearchingCharacter == "*") || (bracketSearchingCharacter == "/") || (bracketSearchingCharacter == ")") || (bracketSearchingCharacter == "}"){
                            //^後の数式ブロックの外側を{}でくくる
                            replaceString.insert("}", at:bracketSearchingIndex)//後ろからやらないとインデックスが狂う
                            replaceString.remove(at: replaceString.index(firstBracketIndex, offsetBy: -1))
                            break
                        }
                        //^後ろの数式ブロックが行末だった場合、数式ブロックの外側を{}でくくる
                        if (j == replaceString.count) {
                            replaceString.insert("}", at:replaceString.endIndex)//後ろからやらないとインデックスが狂う
                            replaceString.remove(at: replaceString.index(firstBracketIndex, offsetBy: -1))
                            break
                        }
                    }
                }
            }
        }
        return replaceString
    }
    

    private func getFormulaLatex2(string: String) -> String{
        var replaceString = string
        replaceString = encloseFormulaBlock(targetString: replaceString,
                                            frontFindString: "sqrt(", frontReplaceString: "\\sqrt{", endReplaceString: "}")
        replaceString = encloseFormulaBlock(targetString: replaceString,
                                            frontFindString: "log(", frontReplaceString: "\\log_{10}{(", endReplaceString: ")}")
        replaceString = encloseFormulaBlock(targetString: replaceString,
                                            frontFindString: "ln(", frontReplaceString: "\\log_e{(", endReplaceString: ")}")
        replaceString = encloseFormulaBlock(targetString: replaceString,
                                            frontFindString: "exp(", frontReplaceString: "\\mathrm{e}^{", endReplaceString: "}")
        replaceString = encloseFormulaBlock(targetString: replaceString,
                                            frontFindString: "asin(", frontReplaceString: "\\sin^{-1}{(", endReplaceString: ")}^\\circ")
        replaceString = encloseFormulaBlock(targetString: replaceString,
                                                frontFindString: "sin(", frontReplaceString: "\\sin{({", endReplaceString: "}^\\circ)}")
        replaceString = encloseFormulaBlock(targetString: replaceString,
                                            frontFindString: "acos(", frontReplaceString: "\\cos^{-1}{(", endReplaceString: ")}^\\circ")
        replaceString = encloseFormulaBlock(targetString: replaceString,
                                            frontFindString: "cos(", frontReplaceString: "\\cos{({", endReplaceString: "}^\\circ)}")
        replaceString = encloseFormulaBlock(targetString: replaceString,
                                            frontFindString: "atan(", frontReplaceString: "\\tan^{-1}{(", endReplaceString: ")}^\\circ")
        replaceString = encloseFormulaBlock(targetString: replaceString,
                                            frontFindString: "tan(", frontReplaceString: "\\tan{({", endReplaceString: "}^\\circ)}")
        replaceString = encloseFormulaBlock(targetString: replaceString,
                                            frontFindString: "dtor(", frontReplaceString: "{\\frac{({", endReplaceString: "}^\\circ)\\times\\pi}{180}}")
        replaceString = encloseFormulaBlock(targetString: replaceString,
                                            frontFindString: "rtod(", frontReplaceString: "{\\frac{({", endReplaceString: "}_{rad})\\times180}{\\pi}}")
        return replaceString
    }
    
    private func encloseFormulaBlock(targetString: String, frontFindString: String, frontReplaceString: String, endReplaceString: String) -> String{
        var replaceString = targetString
        var searchingCharacter: Character
        var searchingIndex = replaceString.startIndex
        var frontReplaceRange = replaceString.range(of:"")
        var bracketCounter: Int = 0
        var whileCounter: Int = 0
        //関数名の前方を置換(whileループ内の加工が終わったら¥を削除しwhileを抜ける)
        replaceString = replaceString.replacingOccurrences(of: frontFindString, with: frontReplaceString+"¥")
        //frontReplaceStringのレンジの末尾から後方にループしてブロックを抽出し位置を保持(無限ループ回避のため10回までに制限)
        while (replaceString.range(of: frontReplaceString+"¥") != nil) && (whileCounter <= 10){
            print("whileCounter=\(whileCounter)")
            whileCounter += 1
            bracketCounter = 1
            frontReplaceRange = replaceString.range(of: frontReplaceString+"¥")
            print(replaceString)
            for i in replaceString[replaceString.startIndex...frontReplaceRange!.upperBound].count-1 ..< replaceString.count{
                print("後方のループ:i=\(i)")
                searchingIndex = replaceString.index(replaceString.startIndex, offsetBy: i)
                searchingCharacter = replaceString[searchingIndex]
                print("searchChar=\(searchingCharacter)")
                // (をカウント(多重括弧対策)
                if (searchingCharacter == "(") {
                    bracketCounter += 1
                }
                if(searchingCharacter == ")"){
                    bracketCounter -= 1
                }
                print("bracketCounter=\(bracketCounter)")
                //)が閉じられたら
                if (bracketCounter == 0) && (searchingCharacter == ")") {
                    print("bracketCounter=0 && )閉じ")
                    print("変更前：\(replaceString)")
                    //括弧が閉じられたらendReplaceStringでくくる
                    replaceString.replaceSubrange((searchingIndex...searchingIndex), with: endReplaceString)//後ろからやらないとインデックスが狂う
                    //whileループ用の¥を消す
                    replaceString.remove(at: replaceString.index(frontReplaceRange!.upperBound, offsetBy: -1))
                    print("変更後：\(replaceString)")
                    break
                }
            }
        }
        return replaceString
    }
    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destination.
        // Pass the selected object to the new view controller.
    }
    */
}

//TextViewのデリゲート
extension FormulaTabOverviewController: UITextViewDelegate {
    //テキストビューの変更時に呼ばれる(入力のたびに呼ばれる)
    func textViewDidChange(_ textView: UITextView) {
        print("textViewDidChange")
    }
    
    //テキストビューにフォーカスがうつったときに呼ばれる
    func textViewShouldBeginEditing(_ textView: UITextView) -> Bool {
        print("textViewShouldBeginEditing")
        ////////////////////キーボードの上にDoneボタンを追加////////////////////
        let editToolbarButton = UIToolbar(frame: CGRect(x:0, y:0, width:320, height:40))
        editToolbarButton.barStyle = UIBarStyle.default
        editToolbarButton.sizeToFit()
        let spacer = UIBarButtonItem(barButtonSystemItem: UIBarButtonItem.SystemItem.flexibleSpace, target: self, action: nil)
        let editDoneButton = UIBarButtonItem(barButtonSystemItem: UIBarButtonItem.SystemItem.done, target: self, action: #selector(self.editDone))
        editToolbarButton.items = [spacer, editDoneButton]
        textOverview.inputAccessoryView = editToolbarButton
        return true
    }
    
    //Doneが押されたときの処理
    @objc func editDone(_ sender: Any){
        print("done")
        overviewEndEditing()
    }
    
    //テキストビューからフォーカスが離れたときに呼ばれる
    func textViewShouldEndEditing(_ textView: UITextView) -> Bool {
        print("textViewShouldEndEditing")
        overviewEndEditing()
        return true
    }
    
    //キーボード以外の画面を押すと、keyboardを閉じる処理
    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        print("tapExit")
        self.view.endEditing(true)
        self.textOverview.resignFirstResponder()
    }
    
    //キーボード格納時の処理
    func overviewEndEditing(){
        self.textOverview.resignFirstResponder()
        print("overviewEndEditing")
        navigationItem.rightBarButtonItem = nil
        ////////////////////Realmデータの更新(overview)////////////////////
        let realmData = DataModel()
        var pick:DataModel
        pick = realmData.RealmPick(id: ID)
        pick.RealmReplaceOverview(data: pick, overview: textOverview.text)
    }
}

//stringの内容が英数字のみか判定
extension String {
    func matches(_ regularExpression: String) -> Bool {
        let regularExpression = try! NSRegularExpression(pattern: regularExpression)
        let match = regularExpression.firstMatch(in: self, range: NSRange(location: 0, length: self.count))
        
        return match != nil
    }
}
