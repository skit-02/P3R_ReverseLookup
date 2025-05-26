// 合体逆引き計算関数
function calc(prsn, A_Prsn, ARCNs, PRSNs) {
	const errMassage = `${A_Prsn.name}では${prsn.name}は作れません`;

	const arcnList = ARCNs.filter((row) => row.result === prsn.arcana).flatMap(
		(row) => {
			if (row.a === A_Prsn.arcana) return [row.b];
			if (row.b === A_Prsn.arcana) return [row.a];
			return [];
		}
	);

	if (arcnList.length === 0) return errMassage;

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
		if (arcana === A_Prsn.arcana && (max_lv !== -1 || min_lv !== -1)) {
			// A_Prsnとその組み合わせによって出る計算結果を全て照合する(これでも8通りくらいだから計算量的には問題ない)
			for (let i = 0; i < B_Prsn.length; i++) {
				//B_Prsnは特殊を覗いているからその例外処理はいらない．合体結果がA_Prsnと同じ場合だけずらす
				// javascriptの切り上げわかんない
				let val = (B_Prsn[i].level + A_Prsn.level + 1) / 2;
				for (let j = 0; j < B_Prsn.length - 1; j++) {
					if (B_Prsn[j].level <= val <= B_Prsn[j + 1].level) {
						while (j < B_Prsn.length && B_Prsn[j].name === prsn.name) j++;
						if (prsn.name === B_Prsn[j].name)
							ans.push([B_Prsn[i].arcana, B_Prsn[i].level, B_Prsn[i].name]);
					}
				}
			}
		} else if (max_lv !== -1 || min_lv !== -1) {
			let start = min_lv * 2 - A_Prsn_lv;
			let end = base_lv * 2 - A_Prsn_lv;
			const search = usePrsn
				.filter((p) => start <= p.level && p.level < end)
				.map((p) => [p.arcana, p.level, p.name]);

			if (search.length > 0) ans.push(...search);
		}
	});

	return ans.length === 0 ? errMassage : ans;
}
