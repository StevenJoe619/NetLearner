/**
 * planner-generator.js — 学习计划生成器
 *
 * 纯函数。beginner=12周, intermediate=8周, advanced=4周。
 */

function generatePlan(level, target, weakDomains) {
  const weeks = { beginner: 12, intermediate: 8, advanced: 4 }[level] || 8;
  return {
    generatedAt: new Date().toISOString(),
    basedOn: { level, target },
    title: `${weeks}周 ${target} 备考计划`,
    subtitle: level === 'beginner' ? '从基础开始，适合初学者'
      : level === 'intermediate' ? '跳过基础，聚焦核心主题'
      : '高强度冲刺，聚焦薄弱环节',
    totalWeeks: weeks,
    weeklyPlans: buildPlan(level, weeks, weakDomains || []),
    weakDomains: weakDomains || []
  };
}

const DOMAINS = [
  { id: 'Network Fundamentals', topics: ['OSI/TCP模型','IPv4/IPv6','子网划分','线缆与介质'] },
  { id: 'Network Access', topics: ['VLAN/Trunk','STP/RSTP','EtherChannel','WLAN'] },
  { id: 'IP Connectivity', topics: ['路由表','OSPF','静态路由','FHRP'] },
  { id: 'IP Services', topics: ['NAT','DHCP','NTP','SNMP','QoS'] },
  { id: 'Security Fundamentals', topics: ['ACL','Port Security','AAA','DHCP Snooping'] },
  { id: 'Automation', topics: ['SDN','REST API','JSON/YAML','Ansible','DNA Center'] }
];

function buildPlan(level, totalWeeks, weak) {
  const plans = [];
  const weakSet = new Set(weak);
  let week = 1;

  const domains = level === 'beginner' ? DOMAINS : DOMAINS.filter(d => d.id !== 'Network Fundamentals');

  domains.forEach(d => {
    if (week >= totalWeeks) return;
    const extra = weakSet.has(d.id) ? 1 : 0;
    for (let w = 0; w <= extra && week <= totalWeeks; w++) {
      plans.push(mkWk(week, d, 1));
      week++;
    }
  });

  while (week <= totalWeeks) {
    plans.push(mkMock(week));
    week++;
  }
  return plans;
}

function mkWk(n, d, _intensity) {
  const tasks = [];
  const labels = ['一','二','三','四','五','六','日'];
  const types = ['read','read','practice','practice','lab','read','practice'];
  d.topics.forEach((t, i) => {
    const idx = i % 7;
    tasks.push({
      day: idx + 1, dayLabel: '周' + labels[idx],
      type: types[idx % types.length],
      description: `${t}`,
      minutes: idx < 2 ? 45 : 30
    });
  });
  return {
    week: n, title: `第${n}周 · ${d.id}`, focusDomains: [d.id],
    estimatedHours: 4, tasks: tasks.sort((a,b) => a.day - b.day),
    milestone: `掌握 ${d.id} 核心概念`
  };
}

function mkMock(n) {
  const tasks = [];
  for (let d = 1; d <= 5; d++) {
    tasks.push({ day: d, dayLabel: '周'+['一','二','三','四','五','六','七'][d-1], type: 'practice', description: '模拟考试 + 错题分析', minutes: 90 });
  }
  tasks.push({ day: 6, dayLabel: '周六', type: 'lab', description: '实验复习', minutes: 60 });
  return {
    week: n, title: `第${n}周 · 模拟考试周`, phase: '模考冲刺', focusDomains: ['All'],
    estimatedHours: 8, tasks, milestone: '错题率降至 20% 以下'
  };
}
