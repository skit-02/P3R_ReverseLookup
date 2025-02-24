function calc(prsn, sozai) {
  const ans = 1;
  return ans;
}

// ファイルの読み込み
fetch(
  "https://raw.githubusercontent.com/skit-02/P3R_ReverseLookup/blob/main/prsn.txt"
)
  .then((response) => response.text()) // テキストとして取得
  .then((text) => console.log(text)) // コンソールに表示
  .catch((error) => console.error("Error:", error));

$("#LookUp").click(function () {
  const prsn = $("#prsn").val();
  const sozai = $("#sozai").val();
  // calcを呼び出して結果を入れる
  const ans = calc(prsn, sozai);
  $("#prsnList").append("<li>" + ans + "</li>");
  $("#prsn").val("");
  $("#sozai").val("");
});
