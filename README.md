# NetLearner

> 考纲驱动 · AI 动态出题 — CCNA/CCNP 开源备考平台

基于 Cisco 官方 Exam Topics，AI 实时生成试题。零版权风险，纯前端，本地优先。

## 🚀 快速开始

```bash
# 1. 启动
node server.js

# 2. PC 端打开
http://localhost:8080

# 3. 手机端打开（同一 WiFi）
# 查电脑 IP → 手机浏览器访问 http://<IP>:8080
```

## 📖 使用教程

完整教程见 [`使用教程.md`](使用教程.md)，包含：
- PC 端/手机端使用说明
- 同一 WiFi 手机连接方法
- 防火墙设置
- 常见问题 FAQ

## ✨ 功能

| 功能 | 说明 |
|---|---|
| 水平测试 | 10 题摸底 → 等级评定 → 学习计划 |
| 模拟考试 | CCNA 60题 / CCNP 60题，120分钟全真模考 |
| 错题本 | 自动收录，筛选，掌握度标记，错题重练 |
| 学习计划 | 12/8/4 周按等级生成 |
| 数据管理 | 导出/导入 JSON 备份 |

## 📦 项目结构

```
NetLearner/
├── server.js                # 服务器（唯一入口）
├── index.html               # 主页面
├── assets/css/main.css      # 样式
├── assets/js/               # JS 模块
│   ├── app.js               # 主逻辑
│   ├── router.js            # 路由
│   ├── storage.js           # 存储层
│   ├── exam-engine.js       # 考试引擎
│   ├── wrong-answer-service.js  # 错题本
│   └── planner-generator.js     # 学习计划
├── questions/generated/     # 题库 JSON
├── 使用教程.md              # 完整使用指南
├── 项目说明.md              # 项目概述
├── 项目计划书.md            # 项目计划
└── 项目开发日志.md          # 开发记录
```

## 🔒 隐私

所有数据存储在浏览器 localStorage 中，不发送到任何服务器。
支持导出 JSON 备份，数据完全归用户所有。

## 📄 License

MIT
