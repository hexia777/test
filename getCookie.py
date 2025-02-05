import os
import re
import json

# 要扫描的目录
directories = ['components', 'layouts', 'middleware', 'pages', 'plugins', 'static']

# 排除的子目录
exclude_subdir = 'locales'

# 存储getCookie中的key
get_cookie_keys = []

# 正则表达式匹配getCookie中的key
get_cookie_pattern = re.compile(r"getCookie\(['\"](.*?)['\"]\)")

# 遍历目录和文件
for directory in directories:
    for root, dirs, files in os.walk(directory):
        # 排除static/locales目录下的文件
        if exclude_subdir in root:
            continue

        for file in files:
            if file.endswith(('.js', '.vue')):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    matches = get_cookie_pattern.findall(content)
                    get_cookie_keys.extend(matches)

# 去重
get_cookie_keys = list(set(get_cookie_keys))

# 将结果写入getCookie.json文件
with open('getCookie.json', 'w', encoding='utf-8') as f:
    json.dump(get_cookie_keys, f, indent=4)

print("已将所有getCookie的key存储到getCookie.json文件中。")
