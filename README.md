# NetLearner

> **双厂商认证刷题平台 · 大池加权抽题 · 多题型引擎**
> Cisco CCNA/CCNP + Huawei HCIA/HCIP · 纯前端 · 数据本地私有

---

## 特点

### 1. 大池加权随机抽题

不依赖任何静态试卷。维护一个大题库池，每道题标注知识域和题型。考试时按**官方考试权重**从池中动态抽题——每次模考题都不同，但配比始终对标真实考试。

- CCNA 池：**759 题**（单选/多选/拖拽排序/拖拽匹配/填空/场景题）
- CCNP 池：310 题
- HCIA 池：472 题
- HCIP 池：521 题

### 2. 四种考试模式

| 模式 | 说明 |
|------|------|
| **水平测试** | 16 题快速摸底，仅单选+多选，适合新手评估当前水平 |
| **模拟考试** | 103 题全真模考，覆盖所有题型，120 分钟限时 |
| **错题本** | 自动收录错题，可标记掌握度，针对性重练 |
| **学习计划** | 根据水平测试结果生成 4/8/12 周专属计划，按薄弱域调整 |

### 3. 完整的题型支持

- 单选题、多选题（自动判分）
- 拖拽排序题（拖拽或上下按钮排序）
- 拖拽匹配题（下拉选择匹配）
- 填空题
- 场景题（阅读场景后回答多个子题）

### 4. 纯前端 · 数据归你

- 无需注册、无需后端、数据存浏览器本地
- 支持导出/导入，换设备不丢进度
- 部署即用（GitHub Pages / 本地 node server.js）

### 5. 双厂商统一引擎

Cisco（CCNA 200-301 / CCNP ENCOR 350-401）和 Huawei（HCIA-Datacom / HCIP-Datacom）使用同一套抽题引擎，支持按厂商筛选。

---

## 快速体验

**在线地址：** https://stevenjoe619.github.io/NetLearner/

**本地运行：**
```bash
git clone https://github.com/StevenJoe619/NetLearner.git
cd NetLearner
node server.js
# 浏览器打开 http://localhost:8080
```

---

## 技术栈

- 纯前端：HTML5 + CSS3 + JavaScript (ES6)
- 存储：localStorage
- 题库：JSON（题型/权重/域标记）
- 无需任何依赖

---

## 关于作者

一个正在备考思科认证的网络工程师，业余时间做了这个工具。

如果 NetLearner 帮到了你，欢迎点亮 ⭐，也欢迎提 Issue 或 PR。

---

## 联系方式

- **GitHub：** https://github.com/StevenJoe619
- **Gitee：** https://gitee.com/stevenjoe619
- **小红书：** [请填写你的小红书链接/ID]

---

MIT © StevenJoe619
