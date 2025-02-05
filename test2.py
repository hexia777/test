import os
import json

# 文件路径
src_file_path = "src.json"
locales_dir_path = "static/locales/en/"
dist_file_path = "dist.json"

# 读取 JSON 文件
def read_json(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)

# 获取 src.json 中的键
src_data = read_json(src_file_path)
src_keys = set(src_data.keys())

# 获取 static/locales/en/ 目录下所有 JSON 文件中的键
locales_keys = set()
for file_name in os.listdir(locales_dir_path):
    if file_name.endswith(".json"):
        file_path = os.path.join(locales_dir_path, file_name)
        locales_data = read_json(file_path)
        locales_keys.update(locales_data.keys())

# 找到 src.json 中独有的键
unique_keys = src_keys - locales_keys

# 将这些键写入 dist.json 文件
dist_data = {key: "" for key in unique_keys}
with open(dist_file_path, "w", encoding="utf-8") as dist_file:
    json.dump(dist_data, dist_file, ensure_ascii=False, indent=4)

print(f"提取的键已经写入 {dist_file_path} 文件中。")
