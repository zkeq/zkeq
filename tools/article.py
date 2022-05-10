# coding:utf-8
import requests
import os

url = "https://fcircle.icodeq.com/post?num=10"

data = requests.get(url).json()

article_list = data["article_data"]

# 读取 article.svg 文件
with open(os.path.join("article.svg"), "r", encoding="utf-8") as f:
    svg = f.read()


for i in range(len(article_list)):
    item = article_list[i]["title"]
    if len(item) > 22:
        item = item[:22] + ".."
    svg = svg.replace("{title-%s}" % (i + 1), item)


# 写入 \profile\article.svg
with open(os.path.join("Profile", "article.svg"), "w", encoding="utf-8") as f:
    f.write(svg)

print("完成")
