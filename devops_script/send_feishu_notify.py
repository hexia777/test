#!/usr/bin/env python3
import requests
import json
import sys


def usage():
    file_name = sys.argv[0]
    print("python %s 状态 分支 项目 git信息" % file_name)


try:
    status = sys.argv[1]
    branch = sys.argv[2]
    project = sys.argv[3]
    git_log = sys.argv[4]
    group = "VanceAI网站项目发布通知群"  # 推送群名
except Exception as e:
    print(e)
    usage()
    exit(5)


def feishu_notify(card_body, to_group=""):
    card_type = "normal_card"
    url = "http://101.200.210.72:8010/api/send-msg"
    data = {
        "token": "t-2eb9d3549b46e19dacbaa3ea92c88ff0",
        "from_user": "任务发布系统",
        "msg_type": "interactive",
        "card_title": "发布通知",
        "card_type": "normal_card",
        "card_body": card_body,
    }
    if not to_group == "":
        data["to_group"] = group
        requests.post(url, json.dumps(data))
    return None


feishu_notify(
    {"发布状态": status, "发布分支": branch, "发布工程": project, "更新内容": git_log},
    group,
)
