import os
import re
import json

# 要扫描的目录
directories = ['components', 'layouts', 'middleware', 'pages', 'plugins', 'static']

# 排除的子目录
exclude_subdir = 'locales'

# 存储 setCookie 中的 key
set_cookie_keys = []

# 正则表达式匹配 setCookie 中的 key
set_cookie_pattern = re.compile(r"setCookie\(['\"](.*?)['\"]")

# 遍历目录和文件
for directory in directories:
    for root, dirs, files in os.walk(directory):
        # 排除 static/locales 目录下的文件
        if exclude_subdir in root:
            continue

        for file in files:
            if file.endswith(('.js', '.vue')):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    matches = set_cookie_pattern.findall(content)
                    set_cookie_keys.extend(matches)

# 去重
set_cookie_keys = list(set(set_cookie_keys))

# 将结果写入 getCookie.json 文件
with open('getCookie.json', 'w', encoding='utf-8') as f:
    json.dump(set_cookie_keys, f, indent=4)

print("已将所有 setCookie 的 key 存储到 getCookie.json 文件中。")
