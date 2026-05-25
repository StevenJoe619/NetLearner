---
name: ccna-question-generator
description: Generate CCNA/CCNP question banks as pure JSON for NetLearner. Output is questions/generated/*.json — no HTML, no engine code, just data. Use when creating new exam papers for the NetLearner platform.
---

# CCNA / CCNP Question Generator (JSON Version)

Generates **pure JSON question banks** for the NetLearner platform. Unlike the legacy HTML-based approach, this skill outputs only question data — the exam engine, styling, and page logic live in NetLearner's shared codebase.

## When to Use

- Creating a new CCNA 200-301 mock exam for NetLearner
- Creating a new CCNP 350-401 mock exam
- Adding questions for a specific domain (e.g., "generate 15 Security questions")
- Regenerating questions after a syllabus update

## Blueprint Coverage (CCNA 200-301 v1.1)

| Domain | Abbr | Level Test Qs | Mock Exam Qs | Key Topics |
|--------|------|---------------|--------------|------------|
| 1. Network Fundamentals | nf | 2 | 12 | OSI/TCP, fiber, IPv4/IPv6, switching, topologies |
| 2. Network Access | na | 2 | 12 | VLANs, trunking, STP/RSTP, EtherChannel, WLAN |
| 3. IP Connectivity | ic | 2 | 15 | Routing table, OSPF, static routes, FHRP |
| 4. IP Services | is | 1 | 6 | NAT, DHCP, NTP, DNS, SNMP, syslog, QoS |
| 5. Security Fundamentals | sf | 2 | 9 | ACLs, port security, AAA, VPN, wireless security |
| 6. Automation | ap | 1 | 6 | SDN, REST API, JSON/YAML, Ansible, DNA Center |

## Output Format

### File Location

Save to `questions/generated/{exam-id}.json` in the NetLearner project.

### JSON Structure (per question)

```json
{
  "id": "q_ccna_nf_001",
  "text": "Which OSI layer is responsible for logical addressing and routing?",
  "options": [
    "A. Physical Layer",
    "B. Data Link Layer",
    "C. Network Layer",
    "D. Transport Layer"
  ],
  "answer": "C",
  "explanation": "The Network Layer (Layer 3) handles logical addressing (IP) and routing. Layer 2 (Data Link) handles MAC addressing. Layer 4 (Transport) manages end-to-end connections. Layer 1 (Physical) deals with raw bit transmission.",
  "domain": "Network Fundamentals",
  "difficulty": "easy",
  "tags": ["osi-model", "routing", "ip-addressing"],
  "source": "ccna-level-demo"
}
```

### Field Rules

| Field | Constraint |
|-------|-----------|
| `id` | Format: `q_{target}_{domainAbbr}_{3digit #}` — globally unique across all files |
| `options` | Must have exactly 4 items, prefix with `A.` `B.` `C.` `D.` |
| `answer` | One of `"A"` `"B"` `"C"` `"D"` — must match an option prefix |
| `explanation` | At least 2 sentences, explain both why correct is right and why wrong options are wrong |
| `domain` | Full domain name from Blueprint table, not abbreviation |
| `difficulty` | One of `"easy"` `"medium"` `"hard"` |
| `source` | The exam-id from the file name (without `.json`) |

### Full File Example

```json
{
  "_meta": {
    "examId": "ccna-level-demo",
    "title": "CCNA 水平测试（示范卷）",
    "type": "level-test",
    "target": "CCNA",
    "syllabusVersion": "CCNA-200301-v1.1",
    "generatedAt": "2026-05-25",
    "questionCount": 10,
    "difficultyDistribution": { "easy": 3, "medium": 5, "hard": 2 }
  },
  "questions": [
    { "id": "q_ccna_nf_001", "text": "...", "options": [...], "answer": "C", "explanation": "...", "domain": "Network Fundamentals", "difficulty": "easy", "tags": [...], "source": "ccna-level-demo" }
  ]
}
```

## Difficulty Distribution

| Exam Type | Easy | Medium | Hard |
|-----------|------|--------|------|
| Level Test (10 Q) | 3 | 5 | 2 |
| Mock Exam (30 Q) | 9 | 15 | 6 |
| Full Mock (60 Q) | 18 | 30 | 12 |

## Question Quality Rules

1. **No cross-file duplicates** — every question must be conceptually distinct from all other generated files
2. **Tests understanding, not memorization** — avoid trivia like "what is the default AD of OSPF?"; ask "which route will be chosen and why?"
3. **Plausible distractors** — wrong options must represent real misconceptions, not obviously wrong answers
4. **Answer distribution** — correct answer should be roughly evenly split across A/B/C/D (each ~25%)
5. **Syllabus-only** — strictly within the provided Exam Topics text, no outside content
6. **Protocol questions** — test mechanism and behavior, not definition recall
7. **Troubleshooting scenarios** — for medium/hard questions, provide `show` command output and ask to identify the issue

## Workflow

```
1. User provides: target exam (CCNA/CCNP), exam type (level-test/mock), domains
2. You read the relevant Exam Topics from assets/data/exam-topics/
3. You generate questions following the format above
4. User saves the output to questions/generated/{exam-id}.json
5. User runs validation: node scripts/validate-questions.js questions/generated/{exam-id}.json
```

## Output Path Convention

| Exam Type | File Name | Questions |
|-----------|-----------|-----------|
| CCNA Level Test | `questions/generated/ccna-level-demo.json` | 10 |
| CCNA Mock Exam 1 | `questions/generated/ccna-mock-1.json` | 30 |
| CCNA Mock Exam 2 | `questions/generated/ccna-mock-2.json` | 30 |
| CCNP ENCOR Level Test | `questions/generated/ccnp-encor-level-demo.json` | 10 |
| CCNP ENCOR Mock 1 | `questions/generated/ccnp-encor-mock-1.json` | 30 |

## Legacy Note

The old `ccna-exam` skill (in `CCNP学习项目/CCNA/脚本工具/ccna-exam.md`) generates standalone HTML files with embedded engine code. That approach is deprecated for NetLearner — use this skill instead for all new question generation.
