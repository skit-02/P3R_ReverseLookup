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
	const wantPrsn = PRSNs.filter(
		(p) => p.arcana === prsn.arcana && p.tokusyu === -1
	);
	const rank = wantPrsn.findIndex((p) => p.name === prsn.name);
	let max_lv = rank !== 0 ? wantPrsn[rank - 1].level : -1;
	let min_lv = rank !== wantPrsn.length - 1 ? wantPrsn[rank + 1].level : -1;
	let base_lv = prsn.level;
	// ArcanaPaternListを順番に回してチェックする
	ArcanaPaternList.forEach((pattern) => {
		const { a, b } = pattern;
		let aPrsn = PRSNs.filter((p) => p.arcana === a);
		let usePrsn = PRSNs.filter((p) => p.arcana === b);

		aPrsn.forEach((sozai) => {
			let sozai_lv = sozai.level;
			//ここのarcanaは引数なので書き換える
			if ((b === sozai.arcana && max_lv !== -1) || min_lv !== -1) {
				let start = (b === sozai.arcana ? base_lv : min_lv) * 2 - sozai_lv;
				let end = (b === sozai.arcana ? max_lv : base_lv) * 2 - sozai_lv;

				const search = usePrsn
					.filter((p) => start <= p.level && p.level < end)
					.map((p) => [sozai.name, p.name]);

				if (search.length > 0) ans.push(...search);
			}
		});
	});
	return ans;
}

// 合体逆引き計算関数
function calc(prsn, sozai, ARCNs, PRSNs) {
	const errMassage = `${sozai.name}では${prsn.name}は作れません`;

	const arcnList = ARCNs.filter((row) => row.result === prsn.arcana).flatMap(
		(row) => {
			if (row.a === sozai.arcana) return [row.b];
			if (row.b === sozai.arcana) return [row.a];
			return [];
		}
	);

	if (arcnList.length === 0) return errMassage;

	const ans = [];

	arcnList.forEach((arcana) => {
		const wantPrsn = PRSNs.filter(
			(p) => p.arcana === prsn.arcana && p.tokusyu === -1
		);
		const usePrsn = PRSNs.filter((p) => p.arcana === arcana);
		const rank = wantPrsn.findIndex((p) => p.name === prsn.name);

		let base_lv = prsn.level;
		let sozai_lv = sozai.level;
		let max_lv = rank !== 0 ? wantPrsn[rank - 1].level : -1;
		let min_lv = rank !== wantPrsn.length - 1 ? wantPrsn[rank + 1].level : -1;

		if ((arcana === sozai.arcana && max_lv !== -1) || min_lv !== -1) {
			let start = (arcana === sozai.arcana ? base_lv : min_lv) * 2 - sozai_lv;
			let end = (arcana === sozai.arcana ? max_lv : base_lv) * 2 - sozai_lv;

			const search = usePrsn
				.filter((p) => start <= p.level && p.level < end)
				.map((p) => [p.arcana, p.level, p.name]);

			if (search.length > 0) ans.push(...search);
		}
	});

	return ans.length === 0 ? errMassage : ans;
}

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

			const result =
				prsn.tokusyu === 0
					? `${prsn.name}は特殊合体です`
					: calc(prsn, sozai, ARCNs, PRSNs);

			if (typeof result === "string") {
				$("#resultListUL").append(`<li>${result}</li>`);
			} else {
				$("#fusionFormula").html(`${sozai.name} × ？ = ${prsn.name}`);
				$("#resultListTable").empty();

				result.forEach((res) => {
					$("#resultListTable").append(`
						<tr><td>${tarots[res[0]]}</td><td>${res[1]}</td><td>${res[2]}</td></tr>
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

			results.forEach((ans) => {
				resultList.append(`<li>${ans}</li>`);
			});
		});
	})
	.catch((error) => console.error("Error:", error));
