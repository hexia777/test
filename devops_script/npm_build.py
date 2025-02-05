import subprocess
import json
import os
import sys
import datetime as dt
# 获取当前时间
now_time = dt.datetime.now().strftime("%Y-%m-%d-%H-%M-%S")

project_path = sys.argv[1]  # 工程目录路径"E:\git\dvdfab_web" #
last_project_file_path = sys.argv[2] # 上一个版本的工程文件（node_modules|package.json）路径"E:\code\last_test" #
branch_name = sys.argv[3] if len(sys.argv) > 3 else "master" # 拉取代码的分支名称 #
location = sys.argv[4] if len(sys.argv) > 4 else ""

npm_install = "npm install"
npm_build = "npm run build_online"
# 文件比较
def check_json_file_diff(file1,file2):
    # 读取第一个JSON文件内容
    with open(file1, 'r') as f1:
        json1 = json.load(f1)
    # 读取第二个JSON文件内容
    with open(file2, 'r') as f2:
        json2 = json.load(f2)
    if json1 == json2:
        return True
    else:
        return False

#判断node_modules是否存在，复制过来
node_modules_exist = os.path.exists("%s/node_modules" % last_project_file_path)
print("上一个版本的 %s/node_modules 是否存在" % last_project_file_path)
print(node_modules_exist)
if node_modules_exist:
    # 保存上次的node_modules
    print("shutil.move %s/node_modules 是否存在" % last_project_file_path)
    print("to  %s/" % project_path)
    mv_re = subprocess.check_call('mv %s/node_modules  %s/ ' % (last_project_file_path,project_path) , shell=True)
    if mv_re:
        exit(3)
    # mv_re = shutil.move(" %s/node_modules" % last_project_file_path, project_path)
    print(mv_re)
# 判断 package.json 是否一致
package_exist = os.path.exists("%s/package.json" % last_project_file_path)
the_same = check_json_file_diff("%s/package.json" % project_path,"%s/package.json" % last_project_file_path) if package_exist else False
# 不一致或者没有node_modules 文件夹，安装
if not the_same or not os.path.exists("%s/node_modules" % project_path):
    try:
        print('cd %s &&  npm install' % project_path)
        in_re = subprocess.check_call('cd %s &&  npm install' % project_path, shell=True)
        if in_re:
            print('npm install error')
            exit(3)
        if not the_same:
            cd_re = subprocess.check_call('cp %s/package.json  %s ' % (project_path,last_project_file_path) , shell=True)
            if cd_re:
                exit(3)
    except Exception as e:
        print("npm_install 失败: %s" % e)
        exit(1)

try:
  # 打包构建
    # dvdfab 测试域需要加这句 export LOCATION=分支名 NODE_OPTIONS=--max_old_space_size=4096 
    # 其他项目根据实际情况处理
    # subprocess.check_call('top -b -n 1', shell=True)
    if location:
        print('cd %s && export LOCATION=%s NODE_OPTIONS=--max_old_space_size=9016 && npm run build_test' % (project_path,location))
        build_re = subprocess.check_call('cd %s && export LOCATION=%s NODE_OPTIONS=--max_old_space_size=9016 && npm run build_test' % (project_path,location), shell=True)
    else:
        print('cd %s && npm run build_online' % project_path)
        build_re = subprocess.check_call('cd %s && npm run build_online' % project_path, shell=True)
    
    # subprocess.check_call('top -b -n 1', shell=True)/
    if not build_re: # 这里需要准确判断
        #print('cd %s/.nuxt/dist/client && ls -lR . | grep "^-" | wc -l' % project_path)
        #ls_re = subprocess.check_call('cd %s/.nuxt/dist/client && ls -lR . | grep "^-" | wc -l' % project_path, shell=True)
        exit(0)
    else:
        print('npm run build_online error')
        exit(3)
except Exception as e:
  print("npm_build 失败: %s" % e)
  exit(2)
