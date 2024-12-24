# coding:utf-8
import requests
import os
import time
import xml.etree.ElementTree as ET

# 从feed.xml获取数据
def get_articles():
    url = "https://icodeq.com/feed.xml"
    response = requests.get(url)
    
    # 解析XML
    root = ET.fromstring(response.content)
    
    # 定义XML命名空间
    ns = {'atom': 'http://www.w3.org/2005/Atom'}
    
    # 获取所有文章条目
    entries = root.findall('atom:entry', ns)
    
    article_list = []
    for entry in entries:
        title = entry.find('atom:title', ns).text
        link = entry.find('atom:link', ns).attrib['href']
        published = entry.find('atom:published', ns).text
        
        article_list.append({
            "title": title,
            "link": link,
            "published": published
        })
    
    return article_list

file_list = [
    "article.svg",
    "article_light.svg"
]

article_list = get_articles()

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
