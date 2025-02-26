// 素材のペルソナがからの場合は全組み合わせを表示するようにでもするか
// 作成に必要なペルソナとレベルの組み合わせを計算する
// PRSNsと照らし合わせて合体相手の(名前とアルカナ)を返す

function calc(prsn, sozai, ARCNs, PRSNs) {
  // prsnもsozaiも一次元配列(getPrsnのやつ)
  // ARCNsとPRSNsは二次元配列
  const errMassage = sozai[0] + "では" + prsn[0] + "は作れません";
  const filterarcn = ARCNs.filter((row) => row[2] == prsn[2]);
  let arcnList = [];
  filterarcn.forEach((row) => {
    if (row[0] == sozai[2]) arcnList.push(row[1]);
    else if (row[1] == sozai[2]) arcnList.push(row[0]);
  });
  if (arcnList.length === 0) return errMassage;
  const ans = [];
  // 合体相手のアルカナを一つずつチェック
  console.log(arcnList);
  arcnList.forEach((row) => {
    // 作りたいアルカナのペルソナ一覧を取得
    const wantPrsn = PRSNs.filter(
      (row2) => row2[2] == prsn[2] && row2[3] == -1
    );
    console.log(wantPrsn);
    // 使いたい（求めたい）アルカナのペルソナ一覧を取得
    const usePrsn = PRSNs.filter((row2) => row2[2] == row);
    // もしsozai == ansArcn ならアルカナ合体時にレベルが下のものを作る
    // ! ひとまずここだけできたら終わり！！！
    // $レベルが低すぎて合体不可になる時の例外処理
    // 作りたいprsnがそのアルカナの中で何番目なのかを調べる
    // 0:name, 1:level, 2:arcana, 3:tokusyu
    let rank = wantPrsn.findIndex((row1) => row1.includes(prsn[0]));
    console.log(rank)
    // [1]がアクセスできない感じ多分リストが変？
    let base_lv = Number(prsn[1]);
    let sozai_lv = Number(sozai[1]);
    let max_lv = -1;
    let min_lv = -1;
    if (rank !== 0) max_lv = Number(wantPrsn[rank - 1][1]);
    if (rank !== wantPrsn.length - 1) min_lv = Number(wantPrsn[rank + 1][1]);
    //　この時下と上も知りたい．
    // 特殊合体は無視するのでそれのfilterもいる
    // 下がない場合は-1を保存上も同様
    // その状態で同アルカナ合体の時の条件分岐(-1でも大丈夫な場合がある)
    // minとmaxのレベルがわかった状態で特殊合体も加味して適合するペルソナをansにpushする
    if (row == sozai[2] && max_lv !== -1) {
      // (1.lv + x )/2= 3.lv(同じ時はこれが 3.lv ~ max.lv-1)
      // ここ多分一個下って計算だから求めたいやつと同レベルでも問題ないと思うけど
      // テストしときたい
      let start = base_lv * 2 - sozai_lv;
      let end = max_lv * 2 - sozai_lv;
      let search = usePrsn.filter((row1) => start <= row1[1] < end);
      ans.push(search);
    } else if (min_lv !== -1) {
      // (1.lv + x )/2= 3.lv(違う時はこれが min.lv ~ 3.1.lv-1)
      let start = min_lv * 2 - sozai_lv;
      let end = base_lv * 2 - sozai_lv;
      let search = usePrsn.filter((row1) => start <= row1[1] < end);
      ans.push(search);
    }
  });
  if (ans.length == 0) return errMassage;
  return ans;
  // それ以外は足し合わせて上のペルソナを作る(これはアルカナが複数ある場合があるのでansArcn内のでループする)
}
// ペルソナのアルカナを返す
function getPrsn(prsn, PRSNs) {
  // 入力したペルソナの["名前", "レベル", "アルカナ番号", "特殊合体の有無(0,-1)"]を返す
  return PRSNs.find((row) => row.includes(prsn));
}

// ファイルの読み込み
Promise.all([
  fetch(
    "https://raw.githubusercontent.com/skit-02/P3R_ReverseLookup/main/arcn.txt"
  ).then((res) => res.text()),
  fetch(
    "https://raw.githubusercontent.com/skit-02/P3R_ReverseLookup/main/prsn.txt"
  ).then((res) => res.text()),
])
  .then(([arcnText, prsnText]) => {
    const ARCNs = arcnText.split("\n").map((line) => line.split(" "));
    const PRSNs = prsnText.split("\n").map((line) => line.split(" "));

    $("#LookUp").click(function () {
      let prsn = $("#prsn").val();
      let sozai = $("#sozai").val();
      prsn = getPrsn(prsn, PRSNs);
      sozai = getPrsn(sozai, PRSNs);

      if (prsn[3] == 0) {
        console.log(prsn[0] + "は特殊合体です");
        return;
      }
      // $elseにして元の入力をからにするやつはどっちの場合でも実行できるようにしたい

      const ans = calc(prsn, sozai, ARCNs, PRSNs);
      $("#prsnList").append("<li>" + ans + "</li>");
      $("#prsn").val("");
      $("#sozai").val("");
    });
  })
  .catch((error) => console.error("Error:", error));
