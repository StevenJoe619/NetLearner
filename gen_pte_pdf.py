#!/usr/bin/env python3
"""Generate PTE 4-week plan PDF from the DOCX data + weasyprint with embedded Chinese fonts."""
import weasyprint
import os

# Get Chinese font path
def find_chinese_font():
    candidates = [
        "C:/Windows/Fonts/msyh.ttc",      # 微软雅黑
        "C:/Windows/Fonts/msyhbd.ttc",     # 微软雅黑 Bold
        "C:/Windows/Fonts/simsun.ttc",     # 宋体
        "C:/Windows/Fonts/simhei.ttf",     # 黑体
        "C:/Windows/Fonts/yahei.ttf",
        "C:/Windows/Fonts/Deng.ttf",       # 等线
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    # Search
    import glob
    fonts = glob.glob("C:/Windows/Fonts/*.ttf") + glob.glob("C:/Windows/Fonts/*.ttc")
    for f in fonts:
        name = os.path.basename(f).lower()
        if 'yahei' in name or 'simsun' in name or 'deng' in name or 'msyh' in name or 'simhei' in name or 'noto' in name:
            return f
    return fonts[0] if fonts else None

font_path = find_chinese_font()
font_family = "msyh" if font_path and 'msyh' in font_path.lower() else "sans-serif"

if font_path:
    font_name = os.path.splitext(os.path.basename(font_path))[0]
    print(f"Using font: {font_path}")
else:
    print("WARNING: No Chinese font found!")
    font_path = ""

html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
@page {{
  size: A4;
  margin: 1.2cm 1.5cm;
}}

@font-face {{
  font-family: 'ChineseFont';
  src: url('file:///{font_path.replace(chr(92), '/') if font_path else ''}');
}}

body {{
  font-family: 'ChineseFont', sans-serif;
  font-size: 10pt;
  color: #333;
  line-height: 1.5;
}}

h1 {{
  font-size: 13pt;
  color: #1A5276;
  margin-top: 18pt;
  margin-bottom: 8pt;
  border-bottom: 2px solid #1A5276;
  padding-bottom: 3pt;
}}

h2 {{
  font-size: 11pt;
  color: #2E86C1;
  margin-top: 12pt;
  margin-bottom: 6pt;
}}

.cover-title {{
  font-size: 22pt;
  color: #1A5276;
  text-align: center;
  font-weight: bold;
  margin-top: 30pt;
}}

.cover-sub {{
  text-align: center;
  color: #2E86C1;
  font-size: 12pt;
  margin-top: 6pt;
}}

.cover-info {{
  text-align: center;
  color: #7F8C8D;
  font-size: 10pt;
  margin-top: 4pt;
}}

.cover-motto {{
  text-align: center;
  color: #999;
  font-style: italic;
  font-size: 10pt;
  margin-top: 20pt;
}}

table {{
  width: 100%;
  border-collapse: collapse;
  margin: 4pt 0;
  font-size: 9pt;
}}

th {{
  background: #1A5276;
  color: white;
  padding: 4pt 6pt;
  text-align: center;
  font-weight: bold;
}}

th.weekend {{
  background: #2E86C1;
}}

td {{
  padding: 3pt 6pt;
  border: 0.5pt solid #AAA;
  vertical-align: top;
}}

tr:nth-child(even) td {{
  background: #F8F9FA;
}}

.day-header {{
  font-weight: bold;
  font-size: 10pt;
  color: #1A5276;
  margin-top: 8pt;
  margin-bottom: 3pt;
}}

.day-header.weekend {{
  color: #2E86C1;
}}

.tip-row td {{
  background: #D4E6F1 !important;
  font-style: italic;
  font-size: 8.5pt;
  color: #C0392B;
}}

.section-note {{
  font-size: 9pt;
  color: #555;
  margin-bottom: 6pt;
}}

.blt {{
  margin: 2pt 0;
  padding-left: 12pt;
}}

.blt::before {{
  content: ">";
  color: #C0392B;
  font-weight: bold;
  margin-right: 4pt;
}}

.footer {{
  text-align: center;
  color: #999;
  font-style: italic;
  font-size: 9pt;
  margin-top: 20pt;
}}

.page-break {{
  page-break-before: always;
}}

.score-table th {{
  font-size: 8.5pt;
  padding: 3pt 4pt;
}}

.score-table td {{
  font-size: 8.5pt;
  padding: 2pt 4pt;
}}

.score-table .gap {{
  color: #C0392B;
  font-weight: bold;
}}
</style>
</head>
<body>

<div class="cover-title">PTE 四周冲刺计划</div>
<div class="cover-sub">考试日期：2026年6月25日</div>
<div class="cover-info">目标总分 69（听力61 / 阅读62 / 口语79 / 写作73）| 当前总分 64</div>
<div class="cover-info" style="font-size:9pt;font-style:italic">猩际评分偏严，口语真考比模考高3-7分，猩际口语到72-75即可</div>
<div class="cover-motto">— 每周推进 · 每天有量 · 稳扎稳打 —</div>

<h1>当前成绩总览</h1>
<table class="score-table">
<tr>
  <th>科目</th><th>当前</th><th>目标</th><th>差距</th><th>核心短板</th><th>策略</th>
</tr>
<tr>
  <td><strong>口语</strong></td><td class="gap">62</td><td>79</td><td class="gap">-17</td><td>RS 48%/RA 43%/长句崩</td><td>RS换首字母法+DI维持31%权重</td>
</tr>
<tr>
  <td><strong>写作</strong></td><td>71</td><td>73</td><td class="gap">-2</td><td>SWT 55.6%</td><td>连接词多样化，写作+阅读联动</td>
</tr>
<tr>
  <td><strong>阅读</strong></td><td>60</td><td>62</td><td class="gap">-2</td><td>RO 67%/FIB拖62%</td><td>去年90%，恢复语感即可</td>
</tr>
<tr>
  <td><strong>听力</strong></td><td>60</td><td>61</td><td class="gap">-1</td><td>HIW 60%/FIB-L 44%</td><td>RS联动+HIW辨词+捡分</td>
</tr>
</table>

<p style="font-size:9pt;color:#555">RS 是口语+听力双科联动的核心引擎，必须换方法。老方法（反复听读）两个月原地踏步48%。首字母法+长句精听是唯一出路。阅读FIB拖拽和RO去年都是90%，恢复语感即可，不用焦虑。</p>
"""

# Week data
weeks = [
    {
        "num": "一",
        "title": "恢复+方法切换",
        "dates": "5/26（周二）— 6/1（周一）",
        "note": "核心任务：RS 首字母法入门 + FIB拖拽语感恢复。前3天可能不适应、RS得分甚至下降，坚持一周后会明显改善。FIB拖拽去年90%的基础还在，每天15min刷题恢复近义词辨别力即可。",
        "days": [
            ("RS+RA主攻", [
                ["RS 首字母法+长句精听", "15-20题", "35min", "前3天可能不适应，坚持"],
                ["RA 影子跟读+OneLine选句", "6-8题", "20min", "选全认识的句子练"],
                ["DI 数据图数字精确引用", "5题", "10min", "重点第18题类型(多数字)"],
                ["FIB拖拽 近义词辨析", "5题", "15min", "恢复去年语感，不用背词"],
                ["HIW 辨词专项", "3-4题", "10min", "闭眼只听，不预判"],
            ], "RS首字母法第1天，得分可能下降，正常现象"),
            ("阅读恢复", [
                ["RS 首字母法巩固", "15题", "30min", "短句为主找手感"],
                ["RO 代词指代追踪", "3-4题", "10min", "去年90%，恢复逻辑感"],
                ["FIB下拉 语法+词义", "5题", "15min", "注意时态和词性搭配"],
                ["RA 一句话策略特训", "6题", "15min", "专注意群和连读"],
                ["SWT 连接词多样化", "2题", "10min", "不用and，用which/while/so"],
                ["维持组 (RL/WFD/SGD)", "各2题", "15min", "轮换选2个"],
            ], ""),
            ("均衡轮换", [
                ["RS 首字母法+长句", "15题", "30min", "开始尝试14词以上长句"],
                ["RA 影子跟读", "6题", "15min", "注意发音和降调"],
                ["FIB拖拽+RO混合", "5+3题", "15min", "找语感为主"],
                ["DI 流程图/图片题", "3题", "10min", "补弱项"],
                ["FIB-L 听写+拼写", "3题", "10min", "重点拼写训练"],
                ["HIW 辨词", "3题", "5min", "戒语境猜词"],
            ], "HIW：听的时候不要先看文本，先盲听再对照"),
            ("口语实战", [
                ["RS 高强度模拟", "20题连续", "40min", "模拟考试环境"],
                ["RA 一句话专练", "8题", "20min", "选句+意群+连读全套"],
                ["RL 笔记关键词+模板", "3题", "15min", "练笔记速度"],
                ["RTS 多样化开场白", "2题", "10min", "准备3个不同开场白"],
                ["SGD Speaker区分", "2题", "10min", "注意音调区分人物"],
            ], "RL/RTS/SGD模板今天过一遍，默写到顺"),
            ("阅读巩固", [
                ["RS 首字母法+长句", "15题", "30min", "本周最后一次长句重点练"],
                ["FIB拖拽 近义词", "5题", "15min", "注意近义词混淆类型"],
                ["RO 代词指代", "3题", "10min", "Pencil类全对保持"],
                ["DI 维持", "3题", "10min", "数字精确引用"],
                ["SWT 精练", "2题", "10min", "连接词+信息完整性"],
                ["WFD 预测题过一遍", "5题", "10min", "纠正多余词策略"],
            ], ""),
            ("周末小测", [
                ["猩际模考口语全套", "1套", "40min", "看看RS进展"],
                ["错题复盘", "—", "20min", "标出RS得分和错因"],
                ["模板默写 (DI/SGD/RL/RTS)", "全部", "15min", "默写到不卡壳"],
                ["WE 模板补全", "1篇", "15min", "补缺点/特殊题型"],
            ], "周末不要刷太多题，重点是复盘本周进展"),
            ("休息/补漏", [
                ["上周弱项补练", "自定", "30min", "哪弱补哪"],
                ["ASQ高频刷", "50题", "30min", "一次性任务，纯记忆"],
                ["HCS/MCS-L题型了解", "看看", "15min", "知道长什么样就行"],
            ], "ASQ尽量本周刷完，2h总量"),
        ]
    },
    {
        "num": "二",
        "title": "上量+模考",
        "dates": "6/2（周二）— 6/8（周一）",
        "note": "核心任务：RS 方法稳定后加量 + SWT 专项突破。周末做一次完整模考，检验两周训练效果，重点看 RS 和 HIW 的变化。SWT 从本周开始每日2题精练，连接词多样化是核心。",
        "days": [
            ("RS+RA 加量", [
                ["RS 首字母法+长句精听", "20-25题", "40min", "长句比例提高到50%"],
                ["RA 影子跟读", "6-8题", "15min", "尝试读全文+选句切换"],
                ["DI 数据图数字精确", "5题", "10min", "引用数字要准"],
                ["FIB拖拽 搭配感恢复", "5题", "10min", "不再跳词汇缺口"],
                ["HIW 辨词", "3题", "10min", "昨天总结的问题针对性练"],
            ], "RS应该有明显进步了，长句不再崩溃"),
            ("SWT+听力", [
                ["RS 巩固", "15题", "30min", "短句1遍过，长句才精听"],
                ["SWT 精练", "3题", "15min", "连接词变化形成习惯"],
                ["FIB-L 听写+拼写", "4题", "10min", "注意concertied类拼写错"],
                ["RO 维持", "3题", "5min", "保持手感"],
                ["维持组 (RL/SGD/WFD)", "各2题", "15min", "轮换选2个"],
            ], "SWT连接词：避免只用and，准备5个替换词"),
            ("均衡轮换", [
                ["RS 首字母法", "20题", "35min", "混合长短句随机播放"],
                ["RA 一句话特训", "6题", "15min", "连读弱读重点练"],
                ["FIB下拉 语法+词义", "5题", "10min", "时态和固定搭配"],
                ["DI 流程图/图片", "3题", "10min", "空间位置句必加"],
                ["RTS 多样化开场白", "2题", "10min", "自创内容练"],
                ["维持组 (HIW/WFD/SST)", "各2题", "10min", "轮换选2个"],
            ], "RA注意猩际V3评分，3分标准：大部分词在连续短语中"),
            ("口语实战", [
                ["RS 高强度模拟", "25题连续", "40min", "模拟考试压力"],
                ["RA 发音专项", "8题", "20min", "重点意群和降调"],
                ["RL 笔记+模板", "3题", "15min", "练笔记速度"],
                ["SGD Speaker区分", "2题", "10min", "注意第三人称转换"],
                ["DI 图片/地图题", "2题", "5min", "纯客观描述"],
            ], "本周末模考，今天确认模板都背熟了"),
            ("阅读冲刺", [
                ["RS 首字母法", "15题", "30min", "混合训练"],
                ["FIB拖拽 近义词", "5题", "15min", "总结本周错词"],
                ["RO 代词指代", "3题", "10min", "争取全对"],
                ["SWT 精练", "2题", "10min", "注意信息完整性"],
                ["DI 维持", "3题", "5min", "数字精确引用"],
                ["FIB-L 拼写", "3题", "10min", "听写训练"],
            ], "总结本周错词本，近义词混淆高频词多看几遍"),
            ("完整模考", [
                ["猩际完整模考", "1套", "2h", "全套模拟考试节奏"],
                ["错题分析", "全部", "30min", "重点看RS/HIW/SWT变化"],
                ["模板默写检查", "全部", "15min", "确认不卡壳"],
                ["WE 模板默写", "1篇", "15min", "同意不同意+缺点题"],
            ], "模考后仔细分析，对比上周进步"),
            ("休息/补漏", [
                ["模考反馈调整", "—", "20min", "根据模考结果调整下周"],
                ["ASQ高频剩余", "剩余题", "30min", "刷完或复习"],
                ["WFD预测题过一遍", "剩余题", "30min", "背熟高频题"],
            ], "ASQ和WFD一次性任务尽量在本周完成"),
        ]
    },
] + [
    {
        "num": "三",
        "title": "冲刺口语+联动科目",
        "dates": "6/9（周二）— 6/15（周一）",
        "note": "核心任务：RS 冲刺40min + ALL模板默写到肌肉记忆。此时 RS 应该已有明显进步，长句不再崩溃。所有口语模板（DI/SGD/RL/RTS）必须不经大脑脱口而出。",
        "days": [
            ("RS冲刺+口语", [
                ["RS 首字母法+长句专攻", "25题", "40min", "长句\u226514词为主"],
                ["RA 影子跟读+生词预读", "8题", "20min", "排除生词隐患"],
                ["DI 维持", "3题", "10min", "保持手感"],
                ["SWT 精练", "2题", "10min", "信息完整性+连接词"],
                ["HIW 辨词", "3题", "10min", "戒语境猜词"],
            ], "RS目标65%，如果长句还崩加练10min"),
            ("阅读+听力", [
                ["RS 首字母法", "20题", "35min", "混合训练"],
                ["FIB拖拽 近义词", "5题", "15min", "维持手感"],
                ["RO 代词指代", "3题", "10min", "目标全对"],
                ["FIB-L 听写+拼写", "4题", "10min", "拼写准确性"],
                ["维持组 (RL/SGD/WFD)", "各2题", "15min", "轮换选2个"],
            ], "FIB拖拽和RO已接近目标，维持即可，不用加量"),
            ("均衡轮换", [
                ["RS 首字母法", "20题", "35min", "巩固两周成果"],
                ["RA 发音+流利度", "6题", "15min", "重点词重音+连读"],
                ["DI 所有题型混合", "5题", "10min", "数据+流程+图片"],
                ["RTS 多样化开场白", "2题", "10min", "自创内容补弱"],
                ["SWT 精练", "2题", "10min", "连接词变化"],
                ["SST 听音频练笔记", "1题", "5min", "不用背题"],
            ], "注意猩际V3发音评分：assimilation和deletion"),
            ("口语实战模拟", [
                ["RS 高强度模拟", "25题连续", "40min", "模拟考试"],
                ["RA 一句话+全文", "8题", "20min", "一句话为主，2-3意群"],
                ["RL 笔记+模板", "3题", "15min", "笔记关键词质量"],
                ["SGD Speaker区分", "2题", "10min", "注意用模板串联"],
                ["DI 难题专练", "3题", "10min", "数字多/生词多的题"],
            ], "模拟考试状态，RA读错直接跳过不能回读"),
            ("查漏补缺", [
                ["RS 首字母法", "15题", "30min", "重点巩固上周错题"],
                ["FIB下拉 语法", "5题", "15min", "注意时态+固定搭配"],
                ["SWT 精练", "2题", "10min", "五选三不选"],
                ["WE 完整写一篇", "1篇", "15min", "计时25min"],
                ["FIB-L 听写", "3题", "10min", "复习拼写"],
            ], "WE限时25min写一篇，写完检查语法"),
            ("周末复盘", [
                ["猩际口语专项模考", "1套", "30min", "看RS和RA进展"],
                ["错题复盘", "全部", "20min", "标出三周进步最大的题型"],
                ["模板默写+检查", "全部", "20min", "DI/SGD/RL/RTS/SWT/WE"],
                ["弱项针对性补练", "自定", "30min", "哪弱补哪"],
            ], "对比三周前的模考成绩，应该已经大幅进步了"),
            ("休息/补漏", [
                ["上周弱项补练", "自定", "30min", "重点RS长句"],
                ["WFD预测题复习", "剩余题", "30min", "确保高频都背熟"],
                ["HCS/MCS-L题型复习", "看看", "10min", "考前了解"],
            ], "下周模考前最后一次轻松日"),
        ]
    },
    {
        "num": "四",
        "title": "查漏补缺+考前冲刺",
        "dates": "6/16（周二）— 6/24（周三）",
        "note": "核心任务：根据第三周模考结果针对性补弱。重点是稳住各题型不掉分，模板默写到肌肉记忆，考前不刷新题只回顾。",
        "days": [
            ("RS冲刺+全科", [
                ["RS 首字母法+长句", "25题", "40min", "最后冲刺，目标70%"],
                ["RA 影子跟读", "6题", "15min", "注意猩际V3流利度4分标准"],
                ["DI 所有题型", "5题", "10min", "维持手感"],
                ["FIB拖拽+RO", "5+3题", "10min", "维持即可"],
                ["SWT 精练", "2题", "10min", "信息完整+连接词变化"],
                ["HIW 辨词", "2题", "5min", "保持手感"],
            ], "本周目标：模拟考试稳住，确保各题型不滑坡"),
            ("全科模拟", [
                ["RS 首字母法", "20题", "30min", "混合训练"],
                ["RA 一句话+全文", "6题", "15min", "发音+流利度都练"],
                ["FIB下拉+拖拽", "5+5题", "15min", "全题型混合"],
                ["RO+SWT", "3+2题", "15min", "混合训练"],
                ["FIB-L+HIW", "3+3题", "10min", "听力混合训练"],
                ["WFD 预测题", "5题", "10min", "注意不追加多余词"],
            ], ""),
            ("口语全真模拟", [
                ["RS 高强度模拟", "30题连续", "45min", "模拟考试极限状态"],
                ["RA 一句话特训", "8题", "15min", "选句速度+发音质量"],
                ["DI+RL 混合", "5+3题", "15min", "高权重题型不能掉"],
                ["SGD+RTS 混合", "3+2题", "10min", "模板流畅度"],
                ["DI 生词应对", "3题", "10min", "遇到生词直接跳"],
            ], "练生词跳过：跳过扣1个内容错误，卡顿扣流利度分，更亏"),
            ("全科模拟", [
                ["RS 首字母法", "20题", "30min", "混合训练"],
                ["RA 全文+一句话切换", "6题", "15min", "练习根据不同难度选择"],
                ["FIB拉+拖+RO", "5+5+3题", "20min", "全题型混合"],
                ["SWT+WE", "2+1题", "20min", "写作混合训练"],
                ["SST 听+写", "1题", "10min", "维持手感"],
            ], ""),
            ("最后查漏", [
                ["RS 首字母法", "15题", "30min", "最后冲一波"],
                ["RA 一句话", "6题", "15min", "保持手感"],
                ["DI 全部类型", "5题", "10min", "维持"],
                ["模板最后一次默写", "全部", "20min", "确保肌肉记忆"],
                ["错题本回顾", "全部", "15min", "看看自己常犯的错误"],
                ["WE 默写", "1篇", "10min", "计时20min写一篇"],
            ], "明天不刷新题，只回顾"),
            ("考前复盘", [
                ["RS 轻轻过一遍", "10题", "15min", "不刷量，找感觉"],
                ["RA 读3-5句", "5句", "10min", "保持口腔肌肉活动"],
                ["模板默写检查", "全部", "15min", "确保每个模板都能脱口而出"],
                ["WFD 高频快速过", "10题", "15min", "只写确定词"],
                ["ASQ 快速复习", "30题", "10min", "纯记忆再过一遍"],
            ], "今天复习为主，不刷新题不模考"),
            ("考前休息", [
                ["轻声读几句RA", "2-3句", "5min", "激活口腔肌肉"],
                ["深呼吸", "—", "5min", "放松心态"],
                ["检查考试证件和交通", "—", "10min", "确认考点和时间"],
                ["早睡", "—", "—", "保证休息"],
            ], "模考64→真考69需要的5分已经在四周的练习中了，放轻松"),
        ]
    }
]

days_names = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]

for wk in weeks:
    html += f'<div class="page-break"></div>'
    html += f'<h1>第{wk["num"]}周：{wk["title"]}（{wk["dates"]}）</h1>'
    html += f'<p class="section-note">{wk["note"]}</p>'

    for i, (day_label, tasks, tip) in enumerate(wk["days"]):
        is_weekend = i >= 5
        day_name = days_names[i]
        hdr_class = 'day-header weekend' if is_weekend else 'day-header'
        html += f'<div class="{hdr_class}">{day_name} — {day_label}</div>'
        html += '<table><tr>'
        wc = ' class="weekend"' if is_weekend else ''
        html += f'<th{wc}>训练内容 | 做题量</th>'
        html += f'<th{wc}>时间</th>'
        html += f'<th{wc}>注意</th>'
        html += '</tr>'

        for task in tasks:
            html += '<tr>'
            html += f'<td><strong>{task[0]}</strong> | {task[1]}</td>'
            html += f'<td style="color:#7F8C8D;font-size:8pt">{task[3]}</td>'
            html += '</tr>'

        if tip:
            html += f'<tr class="tip-row"><td colspan="3">>> {tip}</td></tr>'

        html += '</table>'

# Appendix
html += '<div class="page-break"></div>'
html += '<h1>附录：关键提醒</h1>'
tips = [
    "[重点] RS 必须换方法：首字母法+长句精听，老方法已经无效（2个月原地踏步）",
    "[重点] RO + FIB拖拽是恢复型：去年90%，优先拾回，比RS容易出分",
    "[重点] 你是模板型学习者：给框架就出分。WE缺点特殊题型模板必须补",
    "[重点] 猩际口语评分偏严：模考口语72-75就能对应真考79，不用死嗑猩际79",
    "[重点] WFD 纠正策略：只写确定词，不追加多余词，背熟预测题更安全",
    "[重点] SST 不需要背：自己听写已经89%，背题反而干扰听力判断",
    "[重点] 每天2h不能减：2个月+8分的节奏证明这个强度有效",
    "[重点] 6/25考不过也正常：当实战练手，最迟7月底稳过",
]
for t in tips:
    html += f'<div class="blt">{t}</div>'

html += '<div style="margin-top:10pt"></div>'
extra = [
    "猩际 RA OneLine V3 流利度评分：3分要求\"大部分词在连续短语中，no staccato\"",
    "猩际 RA OneLine V3 发音评分：重音正确+连读同化是4-5分的分水岭",
    "猩际 RA OneLine V3 内容评分：跳过/替换/多读都算一个错误，选全认识的句",
]
for e in extra:
    html += f'<div class="blt">{e}</div>'

html += '<div class="footer">— 计划完 · 加油！ —</div>'
html += '</body></html>'

# Generate PDF
output_path = "C:/Users/ikun/Desktop/PTE_4Week_Plan.pdf"
doc = weasyprint.HTML(string=html)
doc.write_pdf(output_path)
print(f"PDF generated: {output_path}")
print(f"Size: {os.path.getsize(output_path)} bytes")
