from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options

# 设置 headless 模式
chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")

# 启动 Chrome 浏览器
driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()), options=chrome_options
)

websites = [
    "http://localhost:3000/workspace/?microapp=1",
    "http://localhost:3000/workspace/enhance/?microapp=1",
]

# 依次访问每个网站并执行操作
for website in websites:
    driver.get(website)
    print(f"Visiting {website}, Title: {driver.title}")

# 关闭浏览器
driver.quit()
