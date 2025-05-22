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
data0 = [
    ["オルフェウス改", 91, "o"],
    ["スサノオ", 77, "o"],
    ["ロキ", 69, "x"],
    ["デカラビア", 54, "x"],
    ["オセ", 41, "x"],
    ["ジャアクフロスト", 37, "o"],
    ["レギオン", 26, "x"],
    ["スライム", 12, "x"],
    ["オルフェウス", 1, "x"],
]

sorted_data = sorted(data, key=lambda x: x[1])

# 素材に使ってるペルソナが合体結果になってしまったのと特殊合体をスキップするより最初からそれらを含まない配列を用意しておくのがまるそう
x_base_list = [entry for entry in data if entry[2] == "x"]
level = [row[1] for row in x_base_list]
# print(x_base_list)
# print(level)
# levelってこれx_base_listのレベルのリスト使ってるだけだからもっと簡素にできるというかワンちゃんいらない


def calc_combination(data):
    # 0-7まで順番に確認する
    for i in range(len(data)):
        # iの相手を1-7まで順番に確認する
        for j in range(len(data)):
            val = (data[i][1] + data[j][1]) // 2 + 1
            exclude_names = {data[i][0], data[j][0]}
            exclude_levels = {data[i][1], data[j][1]}
            # ループ内で必要なときに除外する
            x_list = [entry for entry in x_base_list if entry[0] not in exclude_names]
            y_list = [entry for entry in level if entry not in exclude_levels]
            if val < y_list[-1]:
                print(f"合体不可能: by {data[i][0]}, {data[j][0]}")
            # break多すぎるから関数を分けてループさせてここはreturnにしてもいいかもしれない
            elif val >= y_list[0]:
                print(f"{x_list[0][0]}: by {data[i][0]}, {data[j][0]}")
            else:

                # print(f"{data[i][1] + data[j][1]} -> val: {val}")
                for k in range(len(y_list) - 1):
                    if y_list[k] >= val >= y_list[k + 1]:
                        print(f"{x_list[k + 1][0]} by {data[i][0]}, {data[j][0]}")
                        break


def test(data):
    level = [row[1] for row in data]
    for i in range(len(data)):
        for j in range(len(data)):
            val = (data[i][1] + data[j][1] + 1) // 2 + 1
            for k in range(len(data) - 1):
                if level[k] >= val >= level[k + 1]:
                    # k + 1 が範囲外に行かないよう安全確認
                    while (k + 1 < len(data)) and data[k + 1][2] == "o":
                        k += 1
                        if k + 1 >= len(data):
                            break

                    while (k + 1 < len(data)) and (
                        data[i][0] == data[k + 1][0] or data[j][0] == data[k + 1][0]
                    ):
                        k += 1
                        if k + 1 >= len(data):
                            break

                    if k + 1 >= len(data):
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
# test(data0)
calc_combination(data)

# print("\n calc by rank")
# calc_rank_notReverse(sorted_data)

# print("\n calc by rank")
# calc_rank(data)
# プログラムだけだと同じ組み合わせは弾けないから入力の時に例外処理しておく
