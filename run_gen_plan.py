#!/usr/bin/env python3
"""Generate PTE 4-week plan PDF to a specified path."""
import sys, os
sys.path.insert(0, 'E:/NetLearner')
from gen_plan_pdf import *

# Allow override via command line
if len(sys.argv) > 1:
    out_path = sys.argv[1]
else:
    out_path = "C:/Users/ikun/Desktop/PTE_4Week_Plan.pdf"

doc = SimpleDocTemplate(
    out_path,
    pagesize=A4,
    leftMargin=1.2*cm, rightMargin=1.2*cm,
    topMargin=1.0*cm, bottomMargin=0.8*cm,
)
doc.build(story)
print(f"OK -> {out_path} ({os.path.getsize(out_path)} bytes)")
