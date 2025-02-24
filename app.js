// ファイルの読み込み
fetch(
  "https://raw.githubusercontent.com/skit-02/P3R_ReverseLookup/main/arcn.txt"
)
  .then((response) => response.text()) // テキストとして取得
  .then((text) => {
    let lines = text.split("\n");
    const ARCNs = lines.map((line) => line.split(" "));
  })
  .catch((error) => console.error("Error:", error));
fetch(
  "https://raw.githubusercontent.com/skit-02/P3R_ReverseLookup/main/prsn.txt"
)
  .then((response) => response.text()) // テキストとして取得
  .then((text) => {
    let lines = text.split("\n");
    const PRSNs = lines.map((line) => line.split(" "));
  })
  .catch((error) => console.error("Error:", error));

// 素材のペルソナがからの場合は全組み合わせを表示するようにでもするか
// 作成に必要なペルソナとレベルの組み合わせを計算する
// PRSNsと照らし合わせて合体相手の(名前とアルカナ)を返す
// やっぱアルカナの合体表ちょっと変えたほうがいいかもしれない普通にコンビで22C2のやつ
function calc(prsn, sozai, ARCNs, PRSNs) {
  // prsnもsozaiも一次元配列(getPrsnのやつ)
  // ARCNsとPRSNsは二次元配列
  // 相手のアルカナを探す
  let ansArcn = ARCNs[sozai[2]].reduce((indexes, value, index) => {
    if (value === prsn[2]) {
      indexes.push(index);
    }
    return indexes;
  }, []);
  errMassage = sozai[0] + "では" + prsn[0] + "は作れません";
  if (ansArcn[0] == -1) return errMassage;
  // もしsozai == ansArcn ならどうアルカナ合体用にレベルが下のものを作る
  // それ以外は足し合わせて上のペルソナを作る(これはアルカナが複数ある場合があるのでansArcn内のでループする)
  
}
// ペルソナのアルカナを返す
function getPrsn(prsn, PRSNs) {
  // 入力したペルソナの["名前", "レベル", "アルカナ番号", "特殊合体の有無(0,-1)"]を返す
  let arcn = PRSNs.filter((row) => row.includes(prsn));
  return arcn;
}

$("#LookUp").click(function () {
  let prsn = $("#prsn").val();
  let sozai = $("#sozai").val();
  prsn = getPrsn(prsn, PRSNs);
  sozai = getPrsn(sozai, PRSNs);
  // calcを呼び出して結果を入れる
  const ans = calc(prsn, sozai, ARCNs, PRSNs);
  $("#prsnList").append("<li>" + ans + "</li>");
  $("#prsn").val("");
  $("#sozai").val("");
});
