//定数の宣言
const tarots = [
  "愚者",
  "魔術師",
  "女教皇",
  "女帝",
  "皇帝",
  "法王",
  "恋愛",
  "戦車",
  "正義",
  "隠者",
  "運命",
  "剛毅",
  "刑死者",
  "死神",
  "節制",
  "悪魔",
  "塔",
  "星",
  "月",
  "太陽",
  "審判",
  "永劫",
];

// 合体逆引きの計算用の関数
// sozai * ? = prsn
// 0:name, 1:level, 2:arcana, 3:tokusyu
function calc(prsn, sozai, ARCNs, PRSNs) {
  // エラーメッセージ
  const errMassage = sozai[0] + "では" + prsn[0] + "は作れません";
  // ？のアルカナを求める(arcnListに格納)
  const filterarcn = ARCNs.filter((row) => row[2] == prsn[2]);
  let arcnList = [];
  filterarcn.forEach((row) => {
    if (row[0] == sozai[2]) arcnList.push(row[1]);
    else if (row[1] == sozai[2]) arcnList.push(row[0]);
  });
  if (arcnList.length === 0) return errMassage;
  const ans = [];
  // ？のアルカナごとに計算
  arcnList.forEach((row) => {
    // prsnのアルカナのペルソナ一覧を取得
    const wantPrsn = PRSNs.filter(
      (row2) => row2[2] == prsn[2] && row2[3] == -1
    );
    // ？のアルカナのペルソナ一覧を取得
    const usePrsn = PRSNs.filter((row2) => row2[2] == row);
    // 作りたいprsnがそのアルカナの中で何番目なのかを調べる
    let rank = wantPrsn.findIndex((row1) => row1.includes(prsn[0]));
    // 変数の宣言
    let base_lv = Number(prsn[1]);
    let sozai_lv = Number(sozai[1]);
    let max_lv = -1;
    let min_lv = -1;
    if (rank !== 0) max_lv = Number(wantPrsn[rank - 1][1]);
    if (rank !== wantPrsn.length - 1) min_lv = Number(wantPrsn[rank + 1][1]);

    // 条件分岐
    if ((row == sozai[2] && max_lv !== -1) || min_lv !== -1) {
      let start = (row == sozai[2] ? base_lv : min_lv) * 2 - sozai_lv;
      let end = (row == sozai[2] ? max_lv : base_lv) * 2 - sozai_lv;

      let search = usePrsn
        .filter((row1) => start <= row1[1] && row1[1] < end)
        .map((row1) => [row1[2], row1[1], row1[0]]);

      if (search.length > 0) {
        ans.push(...search);
      }
    }
  });

  if (ans.length == 0) return errMassage;
  return ans;
}

// ペルソナのアルカナを返す関数
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
    const vocabulary = PRSNs.map((row) => row[0]).sort(); // PRSNs の1列目（名前）を取得
    const prsnList = document.getElementById("prsnList");
    const sozaiList = document.getElementById("sozaiList");

    vocabulary.forEach((name) => {
      const option1 = document.createElement("option");
      option1.value = name;
      prsnList.appendChild(option1);

      const option2 = document.createElement("option");
      option2.value = name;
      sozaiList.appendChild(option2);
    });
    // 検索ボタンを押したときの処理
    $("#LookUp").click(function () {
      let prsn = $("#prsn").val();
      let sozai = $("#sozai").val();
      prsn = getPrsn(prsn, PRSNs);
      sozai = getPrsn(sozai, PRSNs);
      // 結果の表示
      const result =
        prsn[3] == 0
          ? `${prsn[0]}は特殊合体です`
          : calc(prsn, sozai, ARCNs, PRSNs);

      if (typeof result === "string") {
        // 特殊合体の場合はそのままリストに追加
        $("#resultListUL").append(`<li>${result}</li>`);
      } else {
        // 合体式を表示
        $("#fusionFormula").html(`${sozai[0]} × ？ = ${prsn[0]}`);
        // テーブルのデータをクリア
        $("#resultListTable").empty();

        // テーブルに結果を追加
        result.forEach((res) => {
          $("#resultListTable").append(`
    <tr>
        <td>${tarots[Number(res[0])]}</td><td>${res[1]}</td><td>${res[2]}</td>
    </tr>
    `);
        });
      }

      
      // 入力欄をリセット
      $("#prsn, #sozai").val("");
    });
  })
  .catch((error) => console.error("Error:", error));
