data = [
    ["シュウ", 86, "x"],
    ["シヴァ", 82, "o"],
    ["マサカド", 79, "o"],
    ["マーラ", 75, "o"],
    ["セイテンタイセイ", 67, "x"],
    ["ビシャモンテン", 60, "x"],
    ["クー・フーリン", 40, "x"],
    ["エリゴール", 31, "x"],
]

level = [row[1] for row in data]
sorted_data = sorted(data, key=lambda x: x[1])


def calc_combination(data):
    # 0-7まで順番に確認する
    for i in range(7, 8):
        # iの相手を1-7まで順番に確認する
        for j in range(8):
            val = (data[i][1] + data[j][1] + 1) // 2
            # print(f"{data[i][1] + data[j][1]} -> val: {val}")
            for k in range(7):
                if level[k] >= val >= level[k + 1]:
                    while k + 1 < len(data) and data[k + 1][2] == "o":
                        k += 1

                    while k < 7 and (
                        data[i][0] == data[k + 1][0] or data[j][0] == data[k + 1][0]
                    ):
                        k += 1
                    if k == 7:
                        print(f"合体不可能: by {data[i][0]}, {data[j][0]}")
                    else:
                        print(f"{data[k + 1][0]} by {data[i][0]}, {data[j][0]}")
                    break


def calc_rank(data):
    for i in range(2, 3):
        for j in range(8):
            val = (i + j) // 2 + 1
            while data[val][2] == "o":
                val += 1  # 数を小さくした結果素材のペルソナと被ってしまう場合がある
            while data[i][0] == data[val][0] or data[j][0] == data[val][0]:
                val += 1
            print(f"{data[val][0]} by {data[i][0]}, {data[j][0]}")


def calc_rank_notReverse(data):
    for i in range(5, 6):
        for j in range(8):
            val = (i + j) / 2 - (1 if ((i + j) % 2 == 0) else 0.5)
            val = int(val)
            while data[val][2] == "o":
                val -= 1  # 数を小さくした結果素材のペルソナと被ってしまう場合がある
            while data[i][0] == data[val][0] or data[j][0] == data[val][0]:
                val -= 1
            print(f"{data[val][0]} by {data[i][0]}, {data[j][0]}")


print("calc by level")
calc_combination(data)

# print("\n calc by rank")
# calc_rank_notReverse(sorted_data)

# print("\n calc by rank")
# calc_rank(data)
# プログラムだけだと同じ組み合わせは弾けないから入力の時に例外処理しておく
