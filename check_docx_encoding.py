#!/usr/bin/env python3
"""Inspect raw DOCX XML for garbled encoding issues."""
import zipfile
import xml.etree.ElementTree as ET
import re

docx_path = "C:/Users/ikun/Desktop/PTE_4Week_Plan.docx"

with zipfile.ZipFile(docx_path) as z:
    # Check document.xml for weird chars
    for name in z.namelist():
        if name.startswith('word/'):
            xml_content = z.read(name)
            # Check for encoding issues
            try:
                text = xml_content.decode('utf-8')
            except UnicodeDecodeError:
                print(f"  {name}: NOT valid UTF-8! Trying other decode...")
                text = xml_content.decode('utf-8-sig', errors='replace')
            
            # Search for weird characters outside normal ranges
            weird_chars = []
            for i, c in enumerate(text):
                if ord(c) > 127 and not (
                    '\u4e00' <= c <= '\u9fff' or
                    '\u3000' <= c <= '\u303f' or
                    '\uff00' <= c <= '\uffef' or
                    '\u2000' <= c <= '\u206f' or  # General punctuation
                    '\u2100' <= c <= '\u214f' or  # Letterlike symbols
                    c in '，。、；：？！""''【】（）—…·★◆▶●○◆◇▷♯♩♪♫♬•☆☑☞※℃→↓↑←↗↘'
                ):
                    if i < 50000 or 'document' in name:
                        weird_chars.append((name, i, f'U+{ord(c):04X}', repr(c)[:10]))
            
            if weird_chars:
                print(f"\n  {name}: {len(weird_chars)} weird chars (showing first 30):")
                for fn, pos, ucode, char_repr in weird_chars[:30]:
                    ctx = text[max(0,pos-20):pos+20]
                    ctx_clean = repr(ctx.encode('utf-8', errors='replace')[:60])
                    print(f"    pos={pos} {ucode} {char_repr}  context: ...{ctx_clean}...")
            else:
                print(f"  {name}: OK")
    
    # Check content_types
    print("\n--- [Content_Types].xml encoding check ---")
    ct = z.read('[Content_Types].xml').decode('utf-8')
    print(f"  Length: {len(ct)}, valid UTF-8: yes")
    
    # Check styles
    for name in ['word/styles.xml', 'word/stylesWithEffects.xml']:
        if name in z.namelist():
            data = z.read(name).decode('utf-8')
            print(f"  {name}: {len(data)} bytes, valid UTF-8")
