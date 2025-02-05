import sys
import os

args = sys.argv[1:]  # 使用 [1:] 来忽略脚本名
print("子应用的最新版本是：", args[0])

file_path = "/usr/src/app/micro_publish_ts/ts.txt"
os.makedirs(file_path, exist_ok=True)

try:
    with open(file_path, "w", encoding="utf-8") as file:
        file.write(args[0])
    print("子应用的版本号更新成功")
except FileNotFoundError:
    print(f"子应用的版本号更新失败，错误：指定的文件路径 {file_path} 不存在。")
except PermissionError:
    print(f"子应用的版本号更新失败，错误：没有权限写入文件 {file_path}。")
except IOError as e:
    print(f"子应用的版本号更新失败，错误：发生了I/O异常：{e}")
except Exception as e:
    print(f"子应用的版本号更新失败，发生了一个未知错误：{e}")
