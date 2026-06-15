#!/usr/bin/env python3
"""Generate PTE 4-week plan PDF — one table per week, 7 rows per table."""
import os, glob
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Table, TableStyle,
                                 PageBreak, Spacer)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# ── Font setup ──
ttf_candidates = []
for f in glob.glob("C:/Windows/Fonts/*.ttf"):
    n = os.path.basename(f).lower()
    if any(k in n for k in ['deng','simsun','simhei','yahei','noto','segoeui']):
        ttf_candidates.append(f)

font_file = None
for prio in ['deng','simsun','simhei','yahei','noto','segoeui']:
    for f in ttf_candidates:
        if prio in os.path.basename(f).lower():
            font_file = f; break
    if font_file: break
if not font_file and ttf_candidates:
    font_file = ttf_candidates[0]

print(f"Font: {font_file}")
FONT = 'Helvetica'
if font_file:
    try:
        fn = os.path.splitext(os.path.basename(font_file))[0]
        pdfmetrics.registerFont(TTFont(fn, font_file))
        FONT = fn
    except Exception as e:
        print(f"Font err: {e}")

# ── Styles ──
C1, C2, C3 = '#1A5276', '#2E86C1', '#7F8C8D'
S = lambda name, **kw: ParagraphStyle(name, fontName=FONT, **kw)

sty = {
 'title':   S('T', fontSize=18, textColor=HexColor(C1), alignment=1, spaceAfter=4, leading=24),
 'sub':     S('Su', fontSize=11, textColor=HexColor(C2), alignment=1, spaceAfter=3),
 'info':    S('I', fontSize=9, textColor=HexColor(C3), alignment=1, spaceAfter=2),
 'motto':   S('M', fontSize=9.5, textColor=HexColor('#999'), alignment=1, spaceAfter=10, fontStyle='italic'),
 'h1':      S('H1', fontSize=12.5, textColor=HexColor(C1), spaceBefore=10, spaceAfter=4, leading=16),
 'note':    S('N', fontSize=8.5, textColor=HexColor('#555'), spaceAfter=5, leading=12),
 'day':     S('D', fontSize=9, textColor=HexColor(C1), leading=13),
 'th':      S('TH', fontSize=8, textColor=HexColor('#FFFFFF'), leading=10),
 'td':      S('TD', fontSize=7.8, leading=10.5, spaceAfter=0),
 'td_sm':   S('TS', fontSize=7.5, leading=10, spaceAfter=0, textColor=HexColor(C3)),
 'tip':     S('TP', fontSize=7.5, textColor=HexColor('#C0392B'), fontStyle='italic', leading=10),
}

P = lambda s, st='td': Paragraph(s, sty[st])

# ── Data ──
day_names = ['周一','周二','周三','周四','周五','周六','周日']

weeks = [
  ("一", "恢复+方法切换", "5/26（周二）— 6/1（周一）",
   "核心任务：RS 首字母法入门 + FIB拖拽语感恢复。前3天可能不适应、RS得分甚至下降，坚持一周后会明显改善。",
   [
    ("周一 — RS+RA主攻", [
     "RS 首字母法+长句精听 | 15-20题 | 35min",
     "RA 影子跟读+OneLine选句 | 6-8题 | 20min",
     "DI 数据图数字精确引用 | 5题 | 10min",
     "FIB拖拽 近义词辨析 | 5题 | 15min",
     "HIW 辨词专项 | 3-4题 | 10min",
    ], "RS首字母法第1天，得分可能下降，正常现象"),
    ("周二 — 阅读恢复", [
     "RS 首字母法巩固 | 15题 | 30min",
     "RO 代词指代追踪 | 3-4题 | 10min",
     "FIB下拉 语法+词义 | 5题 | 15min",
     "RA 一句话策略特训 | 6题 | 15min",
     "SWT 连接词多样化 | 2题 | 10min",
     "维持组 (RL/WFD/SGD) | 各2题 | 15min",
    ], ""),
    ("周三 — 均衡轮换", [
     "RS 首字母法+长句 | 15题 | 30min",
     "RA 影子跟读 | 6题 | 15min",
     "FIB拖拽+RO混合 | 5+3题 | 15min",
     "DI 流程图/图片题 | 3题 | 10min",
     "FIB-L 听写+拼写 | 3题 | 10min",
     "HIW 辨词 | 3题 | 5min",
    ], "HIW：听的时候不要先看文本，先盲听再对照"),
    ("周四 — 口语实战", [
     "RS 高强度模拟 | 20题连续 | 40min",
     "RA 一句话专练 | 8题 | 20min",
     "RL 笔记关键词+模板 | 3题 | 15min",
     "RTS 多样化开场白 | 2题 | 10min",
     "SGD Speaker区分 | 2题 | 10min",
    ], "RL/RTS/SGD模板今天过一遍，默写到顺"),
    ("周五 — 阅读巩固", [
     "RS 首字母法+长句 | 15题 | 30min",
     "FIB拖拽 近义词 | 5题 | 15min",
     "RO 代词指代 | 3题 | 10min",
     "DI 维持 | 3题 | 10min",
     "SWT 精练 | 2题 | 10min",
     "WFD 预测题过一遍 | 5题 | 10min",
    ], ""),
    ("周六 — 周末小测", [
     "猩际模考口语全套 | 1套 | 40min",
     "错题复盘 | — | 20min",
     "模板默写 (DI/SGD/RL/RTS) | 全部 | 15min",
     "WE 模板补全 | 1篇 | 15min",
    ], "周末不要刷太多题，重点是复盘本周进展"),
    ("周日 — 休息/补漏", [
     "上周弱项补练 | 自定 | 30min",
     "ASQ高频刷 | 50题 | 30min",
     "HCS/MCS-L题型了解 | 看看 | 15min",
    ], "ASQ尽量本周刷完，2h总量"),
  ]),
  ("二", "上量+模考", "6/2（周二）— 6/8（周一）",
   "核心任务：RS 方法稳定后加量 + SWT 专项突破。周末做一次完整模考，检验两周训练效果。",
   [
    ("周一 — RS+RA 加量", [
     "RS 首字母法+长句精听 | 20-25题 | 40min",
     "RA 影子跟读 | 6-8题 | 15min",
     "DI 数据图数字精确 | 5题 | 10min",
     "FIB拖拽 搭配感恢复 | 5题 | 10min",
     "HIW 辨词 | 3题 | 10min",
    ], "RS应该有明显进步了，长句不再崩溃"),
    ("周二 — SWT+听力", [
     "RS 巩固 | 15题 | 30min",
     "SWT 精练 | 3题 | 15min",
     "FIB-L 听写+拼写 | 4题 | 10min",
     "RO 维持 | 3题 | 5min",
     "维持组 (RL/SGD/WFD) | 各2题 | 15min",
    ], "SWT连接词：避免只用and，准备5个替换词"),
    ("周三 — 均衡轮换", [
     "RS 首字母法 | 20题 | 35min",
     "RA 一句话特训 | 6题 | 15min",
     "FIB下拉 语法+词义 | 5题 | 10min",
     "DI 流程图/图片 | 3题 | 10min",
     "RTS 多样化开场白 | 2题 | 10min",
     "维持组 (HIW/WFD/SST) | 各2题 | 10min",
    ], "RA注意猩际V3评分，3分标准：大部分词在连续短语中"),
    ("周四 — 口语实战", [
     "RS 高强度模拟 | 25题连续 | 40min",
     "RA 发音专项 | 8题 | 20min",
     "RL 笔记+模板 | 3题 | 15min",
     "SGD Speaker区分 | 2题 | 10min",
     "DI 图片/地图题 | 2题 | 5min",
    ], "本周末模考，今天确认模板都背熟了"),
    ("周五 — 阅读冲刺", [
     "RS 首字母法 | 15题 | 30min",
     "FIB拖拽 近义词 | 5题 | 15min",
     "RO 代词指代 | 3题 | 10min",
     "SWT 精练 | 2题 | 10min",
     "DI 维持 | 3题 | 5min",
     "FIB-L 拼写 | 3题 | 10min",
    ], "总结本周错词本，近义词混淆高频词多看几遍"),
    ("周六 — 完整模考", [
     "猩际完整模考 | 1套 | 2h",
     "错题分析 | 全部 | 30min",
     "模板默写检查 | 全部 | 15min",
     "WE 模板默写 | 1篇 | 15min",
    ], "模考后仔细分析，对比上周进步"),
    ("周日 — 休息/补漏", [
     "模考反馈调整 | — | 20min",
     "ASQ高频剩余 | 剩余题 | 30min",
     "WFD预测题过一遍 | 剩余题 | 30min",
    ], "ASQ和WFD一次性任务尽量在本周完成"),
  ]),
  ("三", "冲刺口语+联动科目", "6/9（周二）— 6/15（周一）",
   "核心任务：RS 冲刺40min + ALL模板默写到肌肉记忆。所有口语模板必须不经大脑脱口而出。",
   [
    ("周一 — RS冲刺+口语", [
     "RS 首字母法+长句专攻 | 25题 | 40min",
     "RA 影子跟读+生词预读 | 8题 | 20min",
     "DI 维持 | 3题 | 10min",
     "SWT 精练 | 2题 | 10min",
     "HIW 辨词 | 3题 | 10min",
    ], "RS目标65%，如果长句还崩加练10min"),
    ("周二 — 阅读+听力", [
     "RS 首字母法 | 20题 | 35min",
     "FIB拖拽 近义词 | 5题 | 15min",
     "RO 代词指代 | 3题 | 10min",
     "FIB-L 听写+拼写 | 4题 | 10min",
     "维持组 (RL/SGD/WFD) | 各2题 | 15min",
    ], "FIB拖拽和RO已接近目标，维持即可，不用加量"),
    ("周三 — 均衡轮换", [
     "RS 首字母法 | 20题 | 35min",
     "RA 发音+流利度 | 6题 | 15min",
     "DI 所有题型混合 | 5题 | 10min",
     "RTS 多样化开场白 | 2题 | 10min",
     "SWT 精练 | 2题 | 10min",
     "SST 听音频练笔记 | 1题 | 5min",
    ], "注意猩际V3发音评分：assimilation和deletion"),
    ("周四 — 口语实战模拟", [
     "RS 高强度模拟 | 25题连续 | 40min",
     "RA 一句话+全文 | 8题 | 20min",
     "RL 笔记+模板 | 3题 | 15min",
     "SGD Speaker区分 | 2题 | 10min",
     "DI 难题专练 | 3题 | 10min",
    ], "模拟考试状态，RA读错直接跳过不能回读"),
    ("周五 — 查漏补缺", [
     "RS 首字母法 | 15题 | 30min",
     "FIB下拉 语法 | 5题 | 15min",
     "SWT 精练 | 2题 | 10min",
     "WE 完整写一篇 | 1篇 | 15min",
     "FIB-L 听写 | 3题 | 10min",
    ], "WE限时25min写一篇，写完检查语法"),
    ("周六 — 周末复盘", [
     "猩际口语专项模考 | 1套 | 30min",
     "错题复盘 | 全部 | 20min",
     "模板默写+检查 | 全部 | 20min",
     "弱项针对性补练 | 自定 | 30min",
    ], "对比三周前的模考成绩，应该已经大幅进步了"),
    ("周日 — 休息/补漏", [
     "上周弱项补练 | 自定 | 30min",
     "WFD预测题复习 | 剩余题 | 30min",
     "HCS/MCS-L题型复习 | 看看 | 10min",
    ], "下周模考前最后一次轻松日"),
  ]),
  ("四", "查漏补缺+考前冲刺", "6/16（周二）— 6/24（周三）",
   "核心任务：稳住各题型不掉分，模板默写到肌肉记忆，考前不刷新题只回顾。",
   [
    ("周一 — RS冲刺+全科", [
     "RS 首字母法+长句 | 25题 | 40min",
     "RA 影子跟读 | 6题 | 15min",
     "DI 所有题型 | 5题 | 10min",
     "FIB拖拽+RO | 5+3题 | 10min",
     "SWT 精练 | 2题 | 10min",
     "HIW 辨词 | 2题 | 5min",
    ], "本周目标：模拟考试稳住，确保各题型不滑坡"),
    ("周二 — 全科模拟", [
     "RS 首字母法 | 20题 | 30min",
     "RA 一句话+全文 | 6题 | 15min",
     "FIB下拉+拖拽 | 5+5题 | 15min",
     "RO+SWT | 3+2题 | 15min",
     "FIB-L+HIW | 3+3题 | 10min",
     "WFD 预测题 | 5题 | 10min",
    ], ""),
    ("周三 — 口语全真模拟", [
     "RS 高强度模拟 | 30题连续 | 45min",
     "RA 一句话特训 | 8题 | 15min",
     "DI+RL 混合 | 5+3题 | 15min",
     "SGD+RTS 混合 | 3+2题 | 10min",
     "DI 生词应对 | 3题 | 10min",
    ], "练生词跳过：跳过扣1个内容错误，卡顿扣流利度分，更亏"),
    ("周四 — 全科模拟", [
     "RS 首字母法 | 20题 | 30min",
     "RA 全文+一句话切换 | 6题 | 15min",
     "FIB拉+拖+RO | 5+5+3题 | 20min",
     "SWT+WE | 2+1题 | 20min",
     "SST 听+写 | 1题 | 10min",
    ], ""),
    ("周五 — 最后查漏", [
     "RS 首字母法 | 15题 | 30min",
     "RA 一句话 | 6题 | 15min",
     "DI 全部类型 | 5题 | 10min",
     "模板最后一次默写 | 全部 | 20min",
     "错题本回顾 | 全部 | 15min",
     "WE 默写 | 1篇 | 10min",
    ], "明天不刷新题，只回顾"),
    ("周六 — 考前复盘", [
     "RS 轻轻过一遍 | 10题 | 15min",
     "RA 读3-5句 | 5句 | 10min",
     "模板默写检查 | 全部 | 15min",
     "WFD 高频快速过 | 10题 | 15min",
     "ASQ 快速复习 | 30题 | 10min",
    ], "今天复习为主，不刷新题不模考"),
    ("周日 — 考前休息", [
     "轻声读几句RA | 2-3句 | 5min",
     "深呼吸 | — | 5min",
     "检查考试证件和交通 | — | 10min",
     "早睡 | — | —",
    ], "模考64->真考69需要的5分已经在四周的练习中了，放轻松"),
  ]),
]

# ── Build weekly table ──
def make_week_table(days):
    """Create one table: 7 rows (Mon-Sun) + header."""
    data = []

    # Header row
    hdr = [P('日', 'th'), P('训练内容 | 做题量 | 时间', 'th'), P('注意 / 提示', 'th')]
    data.append(hdr)

    for i, (label, tasks, tip) in enumerate(days):
        is_we = i >= 5
        bg = '#F0F4F8' if i % 2 == 0 else '#FFFFFF'
        if is_we:
            bg = '#EBF5FB' if i % 2 == 0 else '#F8F9FA'

        # Day cell
        day_cell = P(f'<b>{label.split(" — ")[0]}</b><br/>{label.split(" — ")[1] if " — " in label else ""}', 'day')

        # Tasks cell - combine all exercises
        tasks_html = []
        total_time = 0
        for t in tasks:
            parts = t.split(' | ')
            if len(parts) >= 3:
                name = parts[0]
                qty = parts[1]
                time_val = parts[2]
                try:
                    total_time += int(time_val.replace('min','').replace('h','60'))
                except:
                    pass
                tasks_html.append(f'<b>{name}</b> &nbsp;{qty} &nbsp;<font color="{C3}">{time_val}</font>')
            else:
                tasks_html.append(t)
        tasks_str = '<br/>'.join(tasks_html)
        time_sum = f'<font color="{C2}"><b>共{total_time}min</b></font>' if total_time else ''
        tasks_cell = P(f'{tasks_str}<br/>{time_sum}', 'td')

        # Tip cell
        if tip:
            tip_cell = P(f'<i><font color="#C0392B">>> {tip}</font></i>', 'tip')
        else:
            tip_cell = P('', 'td')

        data.append([day_cell, tasks_cell, tip_cell])

    col_w = [2.0*cm, 9.0*cm, 4.5*cm]
    t = Table(data, colWidths=col_w, repeatRows=1)
    ts = [
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('LEADING', (0,0), (-1,-1), 10.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.3, HexColor('#BBBBBB')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('BACKGROUND', (0,0), (-1,0), HexColor('#1A5276')),
        ('TEXTCOLOR', (0,0), (-1,0), HexColor('#FFFFFF')),
        ('BACKGROUND', (0,5), (-1,5), HexColor('#EBF5FB')),  # Sat
        ('BACKGROUND', (0,6), (-1,6), HexColor('#EBF5FB')),  # Sun
    ]
    # Alternating row colors for Mon-Fri
    for ri in range(1, 6):
        if ri % 2 == 1:
            ts.append(('BACKGROUND', (0,ri), (-1,ri), HexColor('#F8F9FA')))

    t.setStyle(TableStyle(ts))
    return t

# ── Score table ──
score_data = [
    [P('科目','th'), P('当前','th'), P('目标','th'), P('差距','th'), P('核心短板','th'), P('策略','th')],
    [P('<b>口语</b>'), P('62','td'), P('79','td'), P('<font color="#C0392B">-17</font>','td'),
     P('RS 48% / RA 43% / 长句崩','td'), P('RS换首字母法+DI维持31%权重','td')],
    [P('<b>写作</b>'), P('71','td'), P('73','td'), P('-2','td'),
     P('SWT 55.6%','td'), P('连接词多样化，写作+阅读联动','td')],
    [P('<b>阅读</b>'), P('60','td'), P('62','td'), P('-2','td'),
     P('RO 67% / FIB拖62%','td'), P('去年90%，恢复语感即可','td')],
    [P('<b>听力</b>'), P('60','td'), P('61','td'), P('-1','td'),
     P('HIW 60% / FIB-L 44%','td'), P('RS联动+HIW辨词+捡分','td')],
]
st = Table(score_data, colWidths=[1.2*cm, 1.0*cm, 1.0*cm, 1.0*cm, 3.5*cm, 4.5*cm])
st.setStyle(TableStyle([
    ('FONTSIZE', (0,0), (-1,-1), 8),
    ('LEADING', (0,0), (-1,-1), 11),
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('GRID', (0,0), (-1,-1), 0.3, HexColor('#AAAAAA')),
    ('TOPPADDING', (0,0), (-1,-1), 3),
    ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ('BACKGROUND', (0,0), (-1,0), HexColor('#1A5276')),
    ('TEXTCOLOR', (0,0), (-1,0), HexColor('#FFFFFF')),
    ('BACKGROUND', (0,1), (-1,1), HexColor('#F8F9FA')),
    ('BACKGROUND', (0,3), (-1,3), HexColor('#F8F9FA')),
]))

# ── Build document ──
doc = SimpleDocTemplate(
    "C:/Users/ikun/Desktop/PTE_4Week_Plan.pdf",
    pagesize=A4,
    leftMargin=1.2*cm, rightMargin=1.2*cm,
    topMargin=1.0*cm, bottomMargin=0.8*cm,
)

story = []

# Cover
story.append(Spacer(1, 20))
story.append(P('PTE 四周冲刺计划', 'title'))
story.append(P('考试日期：2026年6月25日', 'sub'))
story.append(P('目标总分 69（听力61 / 阅读62 / 口语79 / 写作73）| 当前总分 64', 'info'))
story.append(P('猩际评分偏严，口语真考比模考高3-7分，猩际口语到72-75即可', 'info'))
story.append(P('<i>— 每周推进 · 每天有量 · 稳扎稳打 —</i>', 'motto'))

# Score overview
story.append(Spacer(1, 6))
story.append(P('当前成绩总览', 'h1'))
story.append(st)
story.append(Spacer(1, 4))
story.append(P(
    'RS 是口语+听力双科联动的核心引擎，必须换方法。老方法（反复听读）两个月原地踏步48%。'
    '首字母法+长句精听是唯一出路。阅读FIB拖拽和RO去年都是90%，恢复语感即可，不用焦虑。', 'td'))

# Weeks
for wi, (num, title, dates, note, days) in enumerate(weeks):
    if wi > 0:
        story.append(PageBreak())
    story.append(P(f'第{num}周：{title}（{dates}）', 'h1'))
    story.append(P(note, 'note'))
    story.append(Spacer(1, 3))
    story.append(make_week_table(days))

# Appendix
story.append(PageBreak())
story.append(P('附录：关键提醒', 'h1'))

appendix_tips = [
    "[重点] RS 必须换方法：首字母法+长句精听，老方法已经无效（2个月原地踏步）",
    "[重点] RO + FIB拖拽是恢复型：去年90%，优先拾回，比RS容易出分",
    "[重点] 你是模板型学习者：给框架就出分。WE缺点特殊题型模板必须补",
    "[重点] 猩际口语评分偏严：模考口语72-75就能对应真考79，不用死嗑猩际79",
    "[重点] WFD 纠正策略：只写确定词，不追加多余词，背熟预测题更安全",
    "[重点] SST 不需要背：自己听写已经89%，背题反而干扰听力判断",
    "[重点] 每天2h不能减：2个月+8分的节奏证明这个强度有效",
    "[重点] 6/25考不过也正常：当实战练手，最迟7月底稳过",
]
for t in appendix_tips:
    story.append(P(t, 'td'))

story.append(Spacer(1, 6))
extra = [
    "猩际 RA OneLine V3 流利度评分：3分要求\"大部分词在连续短语中，no staccato\"",
    "猩际 RA OneLine V3 发音评分：重音正确+连读同化是4-5分的分水岭",
    "猩际 RA OneLine V3 内容评分：跳过/替换/多读都算一个错误，选全认识的句",
]
for e in extra:
    story.append(P(e, 'td'))

story.append(Spacer(1, 12))
story.append(P('<i>— 计划完 · 加油！ —</i>', 'motto'))

if __name__ == '__main__':
    doc.build(story)
    print(f"OK -> C:\\Users\\ikun\\Desktop\\PTE_4Week_Plan.pdf ({os.path.getsize('C:/Users/ikun/Desktop/PTE_4Week_Plan.pdf')} bytes)")
