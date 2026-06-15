#!/usr/bin/env python3
"""Check DOCX fonts and styling issues."""
import zipfile
import xml.etree.ElementTree as ET

docx_path = "C:/Users/ikun/Desktop/PTE_4Week_Plan.docx"

with zipfile.ZipFile(docx_path) as z:
    # Check fonts
    print("=== Font Table ===")
    ft = z.read('word/fontTable.xml')
    root = ET.fromstring(ft)
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    for f in root.findall('.//w:font', ns):
        name = f.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}name', {}).get('{http://www.w3.org/XML/1998/namespace}val', '?')
        print(f"  Font: {name}")
    
    # Check document runs for font references
    doc = z.read('word/document.xml')
    root = ET.fromstring(doc)
    # Look at rFonts and sz
    fonts_used = set()
    sizes_used = set()
    for rPr in root.findall('.//w:rPr', ns):
        rFonts = rPr.find('w:rFonts', ns)
        if rFonts is not None:
            for attr in ['ascii', 'hAnsi', 'eastAsia', 'cs']:
                v = rFonts.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}' + attr)
                if v:
                    fonts_used.add((attr, v))
        sz = rPr.find('w:sz', ns)
        if sz is not None:
            v = sz.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val')
            if v:
                sizes_used.add(int(v)//2)
    
    print("\n=== Fonts used in runs ===")
    for attr, name in sorted(fonts_used):
        print(f"  {attr}: {name}")
    print(f"\n=== Font sizes used (pt) ===")
    print(f"  {sorted(sizes_used)}")
    
    # Check document theme / styles
    for name in z.namelist():
        if 'theme' in name.lower():
            print(f"\n=== Theme file: {name} ===")
            data = z.read(name)
            root = ET.fromstring(data)
            # Find major/minor fonts
            ns_all = {'a': 'http://schemas.openxmlformats.org/drawingml/2006/main'}
            for major in root.findall('.//a:majorFont', ns_all):
                for latin in major.findall('a:latin', ns_all):
                    print(f"  Major Latin: {latin.get('typeface', '?')}")
                for ea in major.findall('a:ea', ns_all):
                    print(f"  Major EastAsian: {ea.get('typeface', '?')}")
            for minor in root.findall('.//a:minorFont', ns_all):
                for latin in minor.findall('a:latin', ns_all):
                    print(f"  Minor Latin: {latin.get('typeface', '?')}")
                for ea in minor.findall('a:ea', ns_all):
                    print(f"  Minor EastAsian: {ea.get('typeface', '?')}")
            break
    
    # Check headers
    print("\n=== Header ===")
    hdr = z.read('word/header1.xml')
    root = ET.fromstring(hdr)
    for t in root.findall('.//w:t', ns):
        text = t.text or ''
        if text.strip():
            print(f"  {text[:100]}")

    print("\n=== Footer ===")
    ftr = z.read('word/footer1.xml')
    root = ET.fromstring(ftr)
    for t in root.findall('.//w:t', ns):
        text = t.text or ''
        if text.strip():
            print(f"  {text[:100]}")
    
    # Check document settings
    print("\n=== Settings ===")
    settings = z.read('word/settings.xml')
    print(settings[:2000].decode('utf-8'))
