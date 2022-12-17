# coding:utf-8
import requests
import os
import time

url = "https://fcircle.icodeq.com/post?num=10"

data = requests.get(url).json()

article_list = data["article_data"]


file_list = [
    "article.svg",
    "article_light.svg"
]

for l in file_list:

    # 读取 article.svg 文件
    with open(os.path.join(l), "r", encoding="utf-8") as f:
        svg = f.read()


    # 获取当前时间
    def get_now():
        now = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        return now


    for i in range(len(article_list)):
        item = article_list[i]["title"].replace("&","")
        if len(item) > 15:
            item = item[:15] + ".."
        svg = svg.replace("{title-%s}" % (i + 1), item)
        svg = svg.replace("{time}", get_now())


    # 写入 \profile\article.svg
    with open(os.path.join("Profile", l), "w", encoding="utf-8") as f:
        f.write(svg)

    print("完成")
