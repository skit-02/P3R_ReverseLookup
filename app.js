// タロットの名前のリスト
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

// データのパース関数
const parsePrsn = (line) => {
	const [name, level, arcana, tokusyu] = line.split(" ");
	return {
		name, // 本当はname: name, だけど省略している
		level: Number(level),
		arcana: Number(arcana),
		tokusyu: Number(tokusyu),
	};
};

const parseArcn = (line) => {
	const [a, b, result] = line.split(" ");
	return {
		a: Number(a),
		b: Number(b),
		result: Number(result),
	};
};

// 指定した名前のペルソナを返す関数
function getPrsn(name, PRSNs) {
	return PRSNs.find((prsn) => prsn.name === name);
}
// 全通り求める関数
function CalcAllPaterns(prsn, ARCNs, PRSNs) {
	const ans = []; // 結果を格納する配列
	// prsnのname, level ,arcanaから計算する
	// まずはarcanaから存在するパターンをArcanaPaternListとして配列で取得[[1,2],[0,11],... ]
	const ArcanaPaternList = ARCNs.filter((row) => row.result === prsn.arcana);
	// 作りたいペルソナ = prsnのアルカナと特殊合体ではないペルソナを取得
	// これは合体計算時に作りたいペルソナの上下のレベルが必要になるから
	const B_Prsn = PRSNs.filter(
		(p) => p.arcana === prsn.arcana && p.tokusyu === -1
	);
	// rankはB_Prsnの中でのprsnの位置(上下を指定するためにインデックス番号が必要だから)
	const rank = B_Prsn.findIndex((p) => p.name === prsn.name);
	// 計算する時の最大値と最小値を取得（例外時は-1を返す）
	let max_lv = rank !== 0 ? B_Prsn[rank - 1].level : -1;
	let min_lv = rank !== B_Prsn.length - 1 ? B_Prsn[rank + 1].level : -1;
	// base_lv = 作りたいペルソナ(prsn)の基礎レベル
	let base_lv = prsn.level;

	// ArcanaPaternListを順番に回してチェックする
	ArcanaPaternList.forEach((pattern) => {
		const { a, b } = pattern;
		//合体させる時のペルソナの組み合わせ(a, b)をaPrsn, usePrsnに格納
		let aPrsn = PRSNs.filter((p) => p.arcana === a);
		let usePrsn = PRSNs.filter((p) => p.arcana === b);
		if (a === b && (max_lv !== -1 || min_lv !== -1)) {
			aPrsn.forEach((A_Prsn) => {
				let newB = B_Prsn.filter((p) => p.name !== A_Prsn.name);
				// 合体相手のリストも素材相手は考えなくていい
				let newUse = usePrsn.filter((p) => p.name !== A_Prsn.name);
				let calcResults = same_arcn_calc(A_Prsn, newUse, prsn, newB);
				let mergedResults = calcResults.map((p) => [A_Prsn, p]);

				if (mergedResults.length > 0) ans.push(...mergedResults);
			});
		} else {
			aPrsn.forEach((sozai) => {
				let sozai_lv = sozai.level;
				if (max_lv !== -1 || min_lv !== -1) {
					let start = min_lv * 2 - sozai_lv;
					let end = base_lv * 2 - sozai_lv;

					const search = usePrsn
						.filter((p) => start <= p.level && p.level < end)
						.map((p) => [sozai, p]);

					if (search.length > 0) ans.push(...search);
				}
			});
		}
	});
	return ans;
}
// 合体逆引き計算関数
function calc(prsn, A_Prsn, ARCNs, PRSNs) {
	const errMessage = `${A_Prsn.name}では${prsn.name}は作れません`;

	// arcnList = 合体相手のアルカナ
	const arcnList = ARCNs.filter((row) => row.result === prsn.arcana).flatMap(
		(row) => {
			if (row.a === A_Prsn.arcana) return [row.b];
			if (row.b === A_Prsn.arcana) return [row.a];
			return [];
		}
	);

	if (arcnList.length === 0) return errMessage;

	const ans = [];

	arcnList.forEach((arcana) => {
		const B_Prsn = PRSNs.filter(
			(p) => p.arcana === prsn.arcana && p.tokusyu === -1
		);
		const usePrsn = PRSNs.filter((p) => p.arcana === arcana);
		const rank = B_Prsn.findIndex((p) => p.name === prsn.name);

		let base_lv = prsn.level;
		let A_Prsn_lv = A_Prsn.level;
		let max_lv = rank !== 0 ? B_Prsn[rank - 1].level : -1;
		let min_lv = rank !== B_Prsn.length - 1 ? B_Prsn[rank + 1].level : -1;
		// 出力がないわけじゃないからリストの順番とかがおかしくなってるだけだと思う
		if (arcana === A_Prsn.arcana && (max_lv !== -1 || min_lv !== -1)) {
			let newB = B_Prsn.filter((p) => p.name !== A_Prsn.name);
			// 合体相手のリストも素材相手は考えなくていい
			let newUse = usePrsn.filter((p) => p.name !== A_Prsn.name);
			ans.push(...same_arcn_calc(A_Prsn, newUse, prsn, newB));
		} else if (max_lv !== -1 || min_lv !== -1) {
			let start = min_lv * 2 - A_Prsn_lv;
			let end = base_lv * 2 - A_Prsn_lv;
			const search = usePrsn.filter((p) => start <= p.level && p.level < end);

			if (search.length > 0) ans.push(...search);
		}
	});
	return ans.length === 0 ? errMessage : ans;
}
function same_arcn_calc(
	A_prsn, // 素材に使うペルソナ
	B_prsn_list, //これは（A_prsnを除く）全部のペルソナが入ってる
	C_prsn, // 合体結果のペルソナ
	C_prsn_list // これは特殊じゃなくてかつ素材のペルソナが抜かれている
) {
	let test = [];
	for (let i = 0; i < B_prsn_list.length; i++) {
		//$  ここ切り上げじゃなくて切り捨てでいいけどそうなってない気がする
		let val = Math.floor((A_prsn.level + B_prsn_list[i].level) / 2) + 1;
		// 3つ目の素材相手のBのペルソナと合体結果のCが同じペルソナであることを除外するために追加した
		// ここでC_prsnからB_prsnを取り除く処理を追加する
		let new_C_prsn_list = C_prsn_list.filter(
			(p) => p.name !== B_prsn_list[i].name
		);
		// そしたら3つ目の条件分岐も必要なくなる &&C_prsn.name !== B_prsn_list[i].name
		if (
			val >= new_C_prsn_list[0].level &&
			new_C_prsn_list[0].name === C_prsn.name
		) {
			test.push(B_prsn_list[i]);
		} else {
			for (let k = 0; k < new_C_prsn_list.length - 1; k++) {
				if (
					new_C_prsn_list[k].level >= val &&
					val >= new_C_prsn_list[k + 1].level
				) {
					if (new_C_prsn_list[k + 1].name === C_prsn.name) {
						test.push(B_prsn_list[i]);
					}
				}
			}
		}
	}
	return test;
}
// ページロードアニメーション
document.addEventListener('DOMContentLoaded', () => {
	const elements = document.querySelectorAll('.navbar, h1, .search-section, .input-group, .btn-p3r');
	elements.forEach((el, i) => {
		el.style.opacity = '0';
		el.style.transform = 'translateY(30px)';
	});
});

// ファイルの読み込みと初期化
Promise.all([
	fetch(
		"https://raw.githubusercontent.com/skit-02/P3R_ReverseLookup/main/arcn.txt"
	).then((res) => res.text()),
	fetch(
		"https://raw.githubusercontent.com/skit-02/P3R_ReverseLookup/main/prsn.txt"
	).then((res) => res.text()),
])
	.then(([arcnText, prsnText]) => {
		// 読み込んだファイルを分割代入
		// trim()で前後の空白を削除，split()で改行で分割(=行ごとに分割)，mapで各行にparseを適用
		const ARCNs = arcnText.trim().split("\n").map(parseArcn);
		const PRSNs = prsnText.trim().split("\n").map(parsePrsn);

		// ペルソナの名前だけを取得してソート
		const vocabulary = PRSNs.map((p) => p.name).sort();

		// htmlの表示するための候補一覧の要素を取得
		const nameList = document.getElementById("nameList");

		// ペルソナの名前をoption要素として追加
		vocabulary.forEach((name) => {
			const option = document.createElement("option");
			option.value = name;
			nameList.appendChild(option);
		});

		// 入力されたペルソナの名前を取得
		$("#LookUp").click(function () {
			let prsn = getPrsn($("#prsn").val(), PRSNs);
			let sozai = getPrsn($("#sozai").val(), PRSNs);

			if (!prsn || !sozai) {
				alert(
					"入力されたペルソナは存在しません。正しい名前を入力してください。"
				);
				$("#prsn, #sozai").val("");
				return;
			}
			if (prsn.name === sozai.name) {
				alert("同じペルソナを指定することはできません。");
				$("#prsn, #sozai").val("");
				return;
			}

			const result =
				prsn.tokusyu === 0
					? `${prsn.name}は特殊合体です`
					: calc(prsn, sozai, ARCNs, PRSNs);
			//test
			//console.log(result);

			if (typeof result === "string") {
				$("#resultListUL").append(`<li>${result}</li>`);
			} else {
				$("#fusionFormula").html(`${sozai.name} × ？ = ${prsn.name}`);
				$("#resultListTable").empty();

				result.forEach((res, index) => {
					$("#resultListTable").append(`
						<tr style="animation-delay: ${index * 0.05}s;"><td>${tarots[res.arcana]}</td><td>${res.level}</td><td>${res.name}</td></tr>
					`);
				});
			}

			$("#prsn, #sozai").val("");
		});
		$("#showPatternsBtn").on("click", function () {
			const name = $("#targetPrsnInput").val();
			const prsn = PRSNs.find((p) => p.name === name);
			const resultList = $("#resultList");
			resultList.empty();

			if (!prsn) {
				resultList.append("<li>ペルソナが見つかりません。</li>");
				return;
			}

			const results = CalcAllPaterns(prsn, ARCNs, PRSNs);

			if (!results || results.length === 0) {
				resultList.append(
					"<li>該当する合体パターンは見つかりませんでした。</li>"
				);
				return;
			}
			// resultList は、<div>や<table>を入れられる要素を想定します

			// まずは表のヘッダーだけ作成
			resultList.html(`
  <table class="table table-striped">
    <thead>
      <tr>
        <th colspan="3">素材1</th>
        <th colspan="3">素材2</th>
      </tr>
      <tr>
        <th>アルカナ</th>
        <th>初期レベル</th>
        <th class="table-divider">名前</th>
        <th>アルカナ</th>
        <th>初期レベル</th>
        <th>名前</th>
      </tr>
    </thead>
    <tbody>
      ${results
				.map((ans, index) => {
					const sozai = ans[0];
					const p = ans[1];
					return `
          <tr style="animation-delay: ${index * 0.05}s;">
            <td>${tarots[sozai.arcana] ?? ""}</td>
            <td>${sozai.level ?? ""}</td>
            <td class="table-divider">${sozai.name ?? ""}</td>
            <td>${tarots[p.arcana] ?? ""}</td>
            <td>${p.level ?? ""}</td>
            <td>${p.name ?? ""}</td>
          </tr>
        `;
				})
				.join("")}
    </tbody>
  </table>
`);
		});
	})
	.catch((error) => console.error("Error:", error));
