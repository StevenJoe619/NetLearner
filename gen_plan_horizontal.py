#!/usr/bin/env python3
"""PTE四周计划 — 横表版：按ROI排，日期作列，任务作行。"""
import os, glob
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Table, TableStyle,
                                 PageBreak, Spacer)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from datetime import date, timedelta

# ── Font ──
def ffont():
    t = []
    for f in glob.glob("C:/Windows/Fonts/*.ttf"):
        n = os.path.basename(f).lower()
        if any(k in n for k in ['deng','simsun','simhei','yahei']): t.append(f)
    for p in ['deng','simsun','simhei','yahei']:
        for f in t:
            if p in os.path.basename(f).lower(): return f
    return t[0] if t else None

ff = ffont()
FONT = 'Helvetica'
if ff:
    fn = os.path.splitext(os.path.basename(ff))[0]
    pdfmetrics.registerFont(TTFont(fn, ff))
    FONT = fn

C1, C2, C3, C4 = '#1A5276', '#2E86C1', '#7F8C8D', '#C0392B'
S = lambda n, **kw: ParagraphStyle(n, fontName=FONT, **kw)
sty = {
 'tt': S('T', fontSize=15, textColor=HexColor(C1), alignment=1, spaceAfter=2, leading=18),
 'in': S('I', fontSize=8.5, textColor=HexColor(C3), alignment=1, spaceAfter=2, leading=11),
 'h1': S('H', fontSize=10.5, textColor=HexColor(C1), spaceBefore=4, spaceAfter=2, leading=13),
 'no': S('N', fontSize=7.8, textColor=HexColor('#555'), spaceAfter=3, leading=10),
 'th': S('TH', fontSize=7, textColor=HexColor('#FFF'), alignment=1, leading=8.5),
 'td': S('TD', fontSize=6.8, leading=9, spaceAfter=0),
 'tb': S('TB', fontSize=6.8, leading=9, spaceAfter=0),
 'sm': S('SM', fontSize=6.5, leading=8.5, spaceAfter=0, textColor=HexColor(C3)),
 'bl': S('BL', fontSize=7.8, leading=10.5, leftIndent=8),
 'ft': S('FT', fontSize=8, textColor=HexColor('#999'), alignment=1, fontStyle='italic'),
}
P = lambda t, s='td': Paragraph(t, sty[s])
W = ['一','二','三','四','五','六','日']

# ══ Date ranges ══
start_d = date(2026, 5, 31)  # 周日
exam_d = date(2026, 6, 24)   # 周三

def weeks():
    ws, d = [], start_d
    while d <= exam_d:
        we = d + timedelta(6)
        if we > exam_d: we = exam_d
        ws.append([d + timedelta(i) for i in range((we-d).days+1)])
        d = we + timedelta(1)
    return ws

# ══ Week schedules ══
# Daily fixed: RS, RA, DI, WFD (每天70min)
# Rotating by ROI: SWT>FIB拖拽>HIW>FIB-L>RL>WE>FIB下拉>RO>RTS>SGD>SST

def w0():  # Week 1: Foundation
    return {
        'fixed': [
            ("RS 首字母法", [("15-20题","35min","首字母法入门"),("20-25题","40min","长句≥14词"),("20题","35min","混合训练"),
                            ("20题","35min","巩固"),("20-25题","40min","高强度"),("15-20题","35min",""),("复盘","20min","看本周错题")]),
            ("RA 一句话", [("6题","15min","选全认识的句"),("8题","20min","意群+连读"),("6题","15min","发音+降调"),
                          ("6题","15min",""),("8题","20min","生词预读"),("6题","15min","复习"),("复盘","10min","标红标黄")]),
            ("DI 维持", [("3题","10min","图片题补弱"),("5题","10min","数据图数字"),("3题","10min","流程图"),
                        ("5题","10min","混合"),("3题","10min",""),("5题","10min","模考口语"),("复盘","10min","")]),
            ("WFD 刷题", [("5题","10min","首字母法"),("5题","10min","四步法"),("5题","10min",""),
                         ("5题","10min",""),("5题","10min",""),("5题","10min","复习错题"),("休息","—","总数160分4周")]),
        ],
        'rotate': [
            ("SWT 精练(p1)",[None,("2题","10min","连接词多样化"),None,("2题","10min","五选三不选"),None,("2题","10min",""),None]),
            ("FIB拖拽 近义词",[None,None,("5题","15min","恢复语感"),None,("5题","15min",""),None,None]),
            ("HIW 辨词",[None,("3题","10min","盲听不预判"),None,("3题","5min",""),None,None,("3题","5min","")]),
            ("FIB-L 听写",[None,None,None,("3题","10min","拼写训练"),None,("3题","10min",""),None]),
            ("RL 笔记+模板",[None,None,("2题","10min","笔迹关键词"),None,("2题","10min",""),None,None]),
            ("FIB下拉 语法",[None,None,None,None,("5题","10min","时态搭配"),None,None]),
            ("RO 代词指代",[None,("3题","10min","恢复逻辑感"),None,None,None,("3题","10min",""),None]),
            ("RTS 开场白",[None,None,None,("2题","10min","3个开场白"),None,None,None]),
            ("WE 写作",[None,None,None,None,None,None,("1篇","25min","限时25min")]),
            ("SGD Speaker",[None,None,None,None,None,("1题","5min","模板串联"),None]),
            ("SST 听写",[None,None,None,None,None,None,("1题","10min","维持")]),
        ]
    }

def w1():  # Week 2: Volume
    return {
        'fixed': [
            ("RS 首字母法", [("15-20题","35min",""),("25题","40min","长句50%"),("20题","35min","混合"),
                            ("20题","35min","巩固"),("25题","40min","高强度"),("15-20题","35min",""),("复盘/补弱","20min","")]),
            ("RA 一句话", [("6题","15min",""),("8题","20min","意群+连读"),("6题","15min","发音+降调"),
                          ("6题","15min",""),("8题","20min","全文+选句切换"),("6题","15min","复习"),("复盘","10min","")]),
            ("DI 维持", [("3题","10min",""),("5题","10min","数字精确"),("3题","10min","流程图"),
                        ("5题","10min","混合"),("3题","10min",""),("5题","10min","全题型"),("复盘","10min","")]),
            ("WFD 刷题", [("5题","10min",""),("5题","10min",""),("5题","10min",""),("5题","10min",""),
                         ("5题","10min",""),("5题","10min","复习"),("休息","—","进度过半")]),
        ],
        'rotate': [
            ("SWT 精练(p1)",[None,("3题","15min","连接词变化"),None,("2题","10min","信息完整"),None,("2题","10min",""),None]),
            ("FIB拖拽 近义词",[None,None,("5题","15min",""),None,("5题","15min",""),None,None]),
            ("HIW 辨词",[None,("3题","10min",""),None,("3题","5min",""),None,None,("3题","5min","")]),
            ("FIB-L 听写",[None,None,None,("4题","10min","拼写准确性"),None,("3题","10min",""),None]),
            ("RL 笔记+模板",[None,None,("2题","10min",""),None,("2题","10min",""),None,None]),
            ("FIB下拉 语法",[None,None,None,None,("5题","10min",""),None,None]),
            ("RO 代词指代",[None,("3题","10min","争取全对"),None,None,None,("3题","10min",""),None]),
            ("RTS 开场白",[None,None,None,("2题","10min","自创内容"),None,None,None]),
            ("WE 写作",[None,None,None,None,None,None,("1篇","25min","同意反对")]),
            ("SGD Speaker",[None,None,None,None,None,("1题","5min","第三人称转换"),None]),
            ("ASQ 高频",[None,None,None,None,None,None,("刷50题","30min","一次性任务")]),
            ("MODEL EXAM",[None,None,None,None,None,("全套","2h","周末做"),None]),
        ]
    }

def w2():  # Week 3: Sprint
    return {
        'fixed': [
            ("RS 首字母法", [("20题","40min","长句≥14词主攻"),("25题","40min","冲刺"),("20题","35min","混合"),
                            ("20题","35min",""),("25题","40min","高强度"),("20题","35min",""),("复盘","20min","")]),
            ("RA 一句话", [("6题","15min","发音+流利度"),("8题","20min","意群"),("6题","15min",""),("6题","15min",""),
                          ("8题","20min",""),("6题","15min","复习"),("复盘","10min","")]),
            ("DI 维持", [("3题","10min",""),("5题","10min",""),("3题","10min",""),("5题","10min",""),
                        ("3题","10min",""),("5题","10min","全部混合"),("复盘","10min","")]),
            ("WFD 刷题", [("10题","15min","加速"),("10题","15min",""),("10题","15min",""),("10题","15min",""),
                         ("10题","15min",""),("10题","15min","复习"),("休息","—","还剩40题")]),
        ],
        'rotate': [
            ("SWT 精练(p1)",[None,("2题","10min","五选三不选"),None,("2题","10min","信息完整"),None,("2题","10min",""),None]),
            ("FIB拖拽 近义词",[None,None,("5题","15min",""),None,("5题","15min",""),None,None]),
            ("HIW 辨词",[None,("3题","10min",""),None,("3题","5min",""),None,None,("3题","5min","")]),
            ("FIB-L 听写",[None,None,None,("3题","10min",""),None,("3题","10min",""),None]),
            ("RL 笔记+模板",[None,None,("3题","15min","练速度"),None,("2题","10min",""),None,None]),
            ("FIB下拉 语法",[None,None,None,None,("5题","10min",""),None,None]),
            ("RO 代词指代",[None,("3题","10min","目标全对"),None,None,None,("3题","5min",""),None]),
            ("RTS 开场白",[None,None,None,("2题","10min","补弱"),None,None,None]),
            ("WE 写作",[None,None,None,None,None,None,("1篇","20min","缺点题")]),
            ("SGD Speaker",[None,None,None,None,None,("1题","5min",""),None]),
            ("SST 听写",[None,None,None,None,None,None,("1题","10min","维持")]),
            ("ASQ 剩余",[None,None,None,None,None,("刷完剩余","30min",""),None]),
        ]
    }

def w3():  # Week 4: Final (6/21 Sun - 6/24 Wed)
    return {
        'fixed': [
            ("RS 首字母法", [("10题","15min","轻松过"),("15题","30min",""),("15题","30min",""),("5题","10min","激活",)]),
            ("RA 一句话", [("3-5句","10min",""),("6题","15min",""),("6题","15min",""),("2-3句","5min","激活口腔")]),
            ("DI 维持", [("3题","10min",""),("5题","10min",""),("3题","10min",""),("跳过","—","")]),
            ("WFD 刷题", [("10题","15min","高频回顾"),("10题","15min",""),("10题","15min",""),("10题","15min","最后冲")]),
        ],
        'rotate': [
            ("SWT 维持",[None,("2题","10min",""),None,None]),
            ("FIB拖拽+RO",[None,None,("5+3题","15min","维持"),None]),
            ("HIW+FIB-L",[None,("各3题","10min","维持"),None,None]),
            ("RL+RTS+SGD",[None,None,("各2题","15min","模板流畅"),None]),
            ("WE 模板默写",[None,None,None,("1篇","15min","计时20min")]),
            ("模板默写检查",[("全部","15min","DI/SGD/RL/RTS"),None,None,None]),
            ("ASQ 复习",[None,None,("30题","10min","快速过"),None]),
            ("考前放松",[None,None,None,("深呼吸","5min","早睡")]),
        ]
    }

schedule_funcs = [w0, w1, w2, w3]

# ══ Build table ══
def build_table(dates, sched):
    dl = [f"{d.month}/{d.day}({W[d.weekday()]})" for d in dates]
    n = len(dl)
    
    data = []
    # Header
    hdr = [P('任务','th')] + [P(l,'th') for l in dl]
    data.append(hdr)
    
    # Fixed tasks section
    sh = [P('<b>▎固定任务（每天必做，70min）</b>','tb')] + [P('','td')]*n
    data.append(sh)
    FTCOL = '#EBF5FB'
    data.append(sh)
    
    fi = 1  # section header row index
    for task_name, day_data in sched['fixed']:
        row = [P(f'{task_name}','tb')]
        for i in range(n):
            if i < len(day_data):
                q, t, nt = day_data[i]
                tx = f"{q}<br/><font color=\"{C3}\">{t}</font>"
                if nt: tx += f'<br/><font color="{C3}">{nt}</font>'
                row.append(P(tx,'td'))
            else:
                row.append(P('—','td'))
        data.append(row)
    
    # Rotating section
    sh2 = [P('<b>▎轮换任务（按ROI排）</b>','tb')] + [P('','td')]*n
    data.append(sh2)
    RTCOL = '#FEF9E7'
    
    for task_name, day_data in sched['rotate']:
        row = [P(f'{task_name}','tb')]
        for i in range(n):
            if i < len(day_data) and day_data[i] is not None:
                q, t, nt = day_data[i]
                tx = f"{q}<br/><font color=\"{C3}\">{t}</font>"
                if nt: tx += f'<br/><font color="{C3}">{nt}</font>'
                row.append(P(tx,'td'))
            else:
                row.append(P('—','td'))
        data.append(row)
    
    # Col widths
    pw = landscape(A4)[0] - 2*cm - 2*cm
    tw = 2.5*cm
    dw = (pw - tw) / n
    
    tbl = Table(data, colWidths=[tw]+[dw]*n, repeatRows=1)
    
    ts = [
        ('FONTSIZE',(0,0),(-1,-1),6.8), ('LEADING',(0,0),(-1,-1),9),
        ('VALIGN',(0,0),(-1,-1),'TOP'), ('ALIGN',(1,0),(-1,0),'CENTER'),
        ('GRID',(0,0),(-1,-1),0.2,HexColor('#CCC')),
        ('TOPPADDING',(0,0),(-1,-1),1.5), ('BOTTOMPADDING',(0,0),(-1,-1),1.5),
        ('LEFTPADDING',(0,0),(-1,-1),2.5), ('RIGHTPADDING',(0,0),(-1,-1),2.5),
        ('BACKGROUND',(0,0),(-1,0),HexColor(C1)), ('TEXTCOLOR',(0,0),(-1,0),HexColor('#FFF')),
        ('BACKGROUND',(0,1),(-1,1),HexColor(FTCOL)),
        # Alternating in fixed section
        ('BACKGROUND',(0,3),(-1,3),HexColor('#F8F9FA')),
        ('BACKGROUND',(0,5),(-1,5),HexColor('#F8F9FA')),
    ]
    
    # Rotating section header
    rs_hdr_idx = 1 + 1 + len(sched['fixed']) + 1  # header + section1 + fixed_rows + section2
    ri = 1 + 1 + len(sched['fixed'])  # start of section2 rows
    ts.append(('BACKGROUND',(0,ri),(-1,ri),HexColor(RTCOL)))
    
    # Alternating in rotating
    for r in range(ri+1, ri+1+len(sched['rotate'])):
        if (r - ri) % 2 == 0:
            ts.append(('BACKGROUND',(0,r),(-1,r),HexColor('#F8F9FA')))
    
    # Weekend columns tint
    for ci in range(1, n+1):
        wd = dates[ci-1].weekday()
        if wd >= 5:
            ts.append(('BACKGROUND',(ci,1),(ci,-1),HexColor('#F4F9FF')))
    
    tbl.setStyle(TableStyle(ts))
    return tbl

# ══ BUILD ══
doc = SimpleDocTemplate("C:/Users/ikun/Desktop/PTE_4Week_Plan.pdf",
    pagesize=landscape(A4), leftMargin=1*cm, rightMargin=1*cm,
    topMargin=0.7*cm, bottomMargin=0.5*cm)

story = []

# Cover
story.append(Spacer(1,10))
story.append(P('PTE 四周冲刺计划（横表·ROI排序）','tt'))
story.append(P(f'考试：6/24(三)  |  起始：5/31(日)  |  共{(exam_d-start_d).days}天  |  WFD 160题  |  WE 35题(已写7剩28)','in'))
story.append(P('目标 69（口语79 写作73 阅读62 听力61）| 当前 64（口语62 写作71 阅读60 听力60）','in'))
story.append(Spacer(1,4))

# ROI summary table
roi_data = [
    [P('','th'),P('题型','th'),P('当前','th'),P('目标','th'),P('权重','th'),P('ROI分','th'),P('策略','th')],
    [P('<b>P1</b>','tb'),P('SWT','tb'),P('55.6%','tb'),P('75%','tb'),P('28%','tb'),P('<b>5.4%</b>','tb'),P('连接词多样化+信息完整','sm')],
    [P('<b>P2</b>','tb'),P('RS','tb'),P('48.2%','tb'),P('70%','tb'),P('16%+听力','tb'),P('<b>3.9%</b>','tb'),P('首字母法+长句精听','sm')],
    [P('<b>P2</b>','tb'),P('FIB拖拽','tb'),P('61.9%','tb'),P('70%','tb'),P('20%','tb'),P('<b>1.6%</b>','tb'),P('去年90%易恢复','sm')],
    [P('<b>P3</b>','tb'),P('HIW','tb'),P('60%','tb'),P('85%','tb'),P('~8%','tb'),P('2.0%','sm'),P('盲听辨词戒语境猜','sm')],
    [P('<b>P3</b>','tb'),P('FIB-L','tb'),P('44%','tb'),P('65%','tb'),P('~8%','tb'),P('1.7%','sm'),P('听写+拼写同步练','sm')],
    [P('<b>P3</b>','tb'),P('RL','tb'),P('64.4%','tb'),P('80%','tb'),P('13%','tb'),P('2.3%','sm'),P('笔记关键词+模板','sm')],
    [P('<b>P4</b>','tb'),P('RA','tb'),P('43.1%','tb'),P('65%','tb'),P('9%','tb'),P('2.2%','sm'),P('一句话策略+意群','sm')],
    [P('<b>P4</b>','tb'),P('DI','tb'),P('83.6%','tb'),P('90%','tb'),P('31%','tb'),P('2.2%','sm'),P('维持+数字精确','sm')],
    [P('<b>P4</b>','tb'),P('WE','tb'),P('72.2%','tb'),P('80%','tb'),P('31%','tb'),P('2.4%','sm'),P('剩余28题每周2篇','sm')],
    [P('<b>维持</b>','tb'),P('WFD+SST+SGD','tb'),P('93/89/87%','tb'),P('维持','tb'),P('~','tb'),P('—','sm'),P('WFD改策略不追加多余词','sm')],
]
st = Table(roi_data, colWidths=[1.0*cm,2.2*cm,1.8*cm,1.8*cm,2.0*cm,1.5*cm,4.8*cm])
st.setStyle(TableStyle([
    ('FONTSIZE',(0,0),(-1,-1),7.2),('LEADING',(0,0),(-1,-1),9.5),
    ('ALIGN',(1,0),(-1,0),'CENTER'),('VALIGN',(0,0),(-1,-1),'MIDDLE'),
    ('GRID',(0,0),(-1,-1),0.2,HexColor('#BBB')),
    ('TOPPADDING',(0,0),(-1,-1),1.5),('BOTTOMPADDING',(0,0),(-1,-1),1.5),
    ('BACKGROUND',(0,0),(-1,0),HexColor(C1)),('TEXTCOLOR',(0,0),(-1,0),HexColor('#FFF')),
    ('BACKGROUND',(0,1),(-1,1),HexColor('#D5F5E3')),('BACKGROUND',(0,2),(-1,3),HexColor('#FEF9E7')),
    ('BACKGROUND',(0,4),(-1,7),HexColor('#F8F9FA')),
]))
story.append(st)
story.append(Spacer(1,3))

# Weeks
wls = ["第一周：方法切换\n5/31(日)—6/6(六)","第二周：上量+模考\n6/7(日)—6/13(六)",
       "第三周：口语冲刺\n6/14(日)—6/20(六)","第四周：考前冲刺\n6/21(日)—6/24(三)"]
wns = [
    "RS首字母法入门+FIB拖拽恢复语感。前3天RS得分可能下降正常。WFD每天5题。SWT连接词多样化开始练。",
    "RS方法稳定加量+SWT专项。周末完整模考。FIB拖拽语感恢复。WFD继续5题/天。",
    "RS冲刺40min+ALL模板肌肉记忆。WFD加量到10题/天。最后一周冲刺。",
    "稳住不掉分，不刷新题只回顾。WFD高频快速过。6/24考前放松深呼吸。",
]

for wi, dates in enumerate(weeks()):
    if wi > 0: story.append(PageBreak())
    sched = schedule_funcs[wi]()
    story.append(P(wls[wi],'h1'))
    story.append(P(wns[wi],'no'))
    tbl = build_table(dates, sched)
    story.append(tbl)

# Appendix
story.append(PageBreak())
PAGE_W, PAGE_H = A4
doc.pagesize = A4
story.append(P('附录：关键提醒','h1'))
for t in [
    "[重点] RS首字母法是唯一出路——老方法2个月原地踏步48%",
    "[重点] FIB拖拽+RO去年90%——恢复型，比RS容易出分",
    "[重点] SWT连接词多样化：not only...but also/while/which/so/although",
    "[重点] WFD只写确定词不追加——猩际不扣但正式考试扣",
    "[重点] SST不用背——自己听写89%，背题干扰判断",
    "[重点] 猩际口语偏严：模考72-75=真考79",
    "[重点] 每天2h不能减——2个月+8分的节奏有效",
    "[重点] 6/24考不过也正常——当实战练手，最迟7月底稳过",
]:
    story.append(P(t,'bl'))
story.append(Spacer(1,6))
for e in [
    "RA V3流利度3分=大部分词在连续短语中，no staccato",
    "RA V3发音4-5分=重音正确+连读同化",
    "RA V3内容=跳过/替换/多读都算1个错误",
]:
    story.append(P(e,'bl'))
story.append(Spacer(1,10))
story.append(P('<i>— 计划完 · 加油！ —</i>','ft'))

doc.build(story)
print(f"OK -> C:\\Users\\ikun\\Desktop\\PTE_4Week_Plan.pdf")
sz = os.path.getsize("C:/Users/ikun/Desktop/PTE_4Week_Plan.pdf")
print(f"{sz} bytes ({sz//1024} KB)")
