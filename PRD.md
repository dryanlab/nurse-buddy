# English Buddy — 产品需求文档 (PRD)

> **版本:** v1.0  
> **最后更新:** 2025-07-17  
> **作者:** Su Yan  
> **状态:** Draft

---

## 目录

1. [项目概述与愿景](#1-项目概述与愿景)
2. [目标用户与用户故事](#2-目标用户与用户故事)
3. [功能需求](#3-功能需求)
4. [非功能需求](#4-非功能需求)
5. [技术架构概览](#5-技术架构概览)
6. [开发阶段规划](#6-开发阶段规划)
7. [成功指标 (KPIs)](#7-成功指标-kpis)
8. [竞品分析](#8-竞品分析)
9. [风险与挑战](#9-风险与挑战)
10. [附录](#10-附录)

---

## 1. 项目概述与愿景

### 1.1 产品定位

**English Buddy** 是一款面向在美华人成人英语学习者的 AI 驱动英语学习应用，核心聚焦 **发音纠正**，辅以场景对话、词汇强化和语法纠正。产品特别针对医疗/护理行业从业者设计专业英语内容。

### 1.2 愿景

> 让每一个在美华人都能自信地说英语——不只是"能说"，而是"说得好"。

传统英语学习产品大多面向初学者，忽略了一个庞大群体：**英语基础不错但口语/发音有明显瓶颈的中高级学习者**。他们能读能写，但一开口就暴露口音问题，在职场（尤其医疗等高沟通要求行业）面临巨大压力。English Buddy 就是为这群人设计的。

### 1.3 核心差异化

| 维度 | 市场现有产品 | English Buddy |
|------|-------------|---------------|
| 发音纠正粒度 | 单词级别 | **音素级别**（phoneme-level） |
| 目标人群 | 通用 | **针对中国口音**定制 |
| 行业场景 | 无/通用 | **医疗/护理**专业场景 |
| 界面语言 | 全英文 | **中文 UI + 中文解释** |
| 反馈风格 | 机械评分 | **鼓励式、温柔引导** |

### 1.4 与 AI Learning Buddy 的关系

English Buddy 与已有项目 [AI Learning Buddy](../ai-learning-buddy/) 共享底层技术架构：

- **共享层:** AI Provider 抽象、语音模块（STT/TTS）、进度系统、UI 组件库、PWA 基础架构
- **独立层:** 教学内容、学习逻辑、评估算法、场景数据
- **未来规划:** 重构为 `learning-platform` monorepo，两个应用作为独立 packages

---

## 2. 目标用户与用户故事

### 2.1 核心用户画像 (Primary Persona)

| 属性 | 描述 |
|------|------|
| **姓名** | 小雅（化名） |
| **年龄** | 28-35 岁 |
| **背景** | 中国大陆出生长大，来美 2-5 年 |
| **职业** | 正在读护士课程（Nursing Program），目标成为 RN |
| **英语水平** | 中级偏上（CEFR B1-B2），读写尚可，口语薄弱 |
| **核心痛点** | 口音重、被同学/老师听不懂、临床实习沟通困难 |
| **次要痛点** | 医疗术语不熟、语法错误频出（尤其口语中）、词汇量不够 |
| **学习时间** | 碎片化，每天 15-30 分钟 |
| **设备** | 主要用手机（iPhone），偶尔用笔记本 |
| **心理特征** | 勤奋但容易焦虑、害怕被评判、需要正面鼓励 |

### 2.2 次要用户画像

- **在美华人其他职业人群**（IT、会计、餐饮等）——使用日常场景模块
- **国内有出国/外企需求的职场人**——使用通用发音纠正和商务场景

### 2.3 用户故事 (User Stories)

#### 发音相关

| ID | 用户故事 | 优先级 |
|----|---------|--------|
| US-01 | 作为小雅，我想知道我哪个音发得不对，而不只是"这个词不太准" | P0 |
| US-02 | 作为小雅，我想听到标准发音然后跟读，直到我发对为止 | P0 |
| US-03 | 作为小雅，我想看到我的发音准确度分数随时间提升 | P0 |
| US-04 | 作为小雅，我想专门练习 th、r/l、v/w 这些中国人最难的音 | P0 |
| US-05 | 作为小雅，我想看到我的嘴型应该怎么摆（口腔动画/图示） | P2 |

#### 场景对话

| ID | 用户故事 | 优先级 |
|----|---------|--------|
| US-06 | 作为小雅，我想模拟和病人对话，练习问诊流程 | P0 |
| US-07 | 作为小雅，我想在对话中被纠正发音和语法，但不要让我觉得很丢脸 | P0 |
| US-08 | 作为小雅，我想练习紧急情况下的英语沟通（code blue、过敏反应等） | P1 |
| US-09 | 作为小雅，我想练习和超市收银员、银行职员的日常对话 | P1 |

#### 词汇与语法

| ID | 用户故事 | 优先级 |
|----|---------|--------|
| US-10 | 作为小雅，我想学习护理专业词汇，包括正确发音 | P0 |
| US-11 | 作为小雅，我想在我说完一句话后看到更地道的表达方式 | P1 |
| US-12 | 作为小雅，我想针对我常犯的语法错误做专项练习 | P1 |

#### 学习系统

| ID | 用户故事 | 优先级 |
|----|---------|--------|
| US-13 | 作为小雅，我想每天有一个 15 分钟的学习计划，不让我感到压力 | P1 |
| US-14 | 作为小雅，我想看到我这周/这月进步了多少 | P1 |
| US-15 | 作为小雅，我想获得成就徽章，让我有动力继续学 | P2 |

---

## 3. 功能需求

### 3.1 P0 — 核心功能（MVP 必须）

#### 3.1.1 发音评估与纠正引擎

**概述:** 用户说一个单词/句子 → 系统识别语音 → 与标准发音对比 → 给出音素级别反馈。

**详细需求:**

- **语音输入:** 使用 Web Speech API (STT) 或 Azure Speech SDK 进行实时语音识别
- **发音评估:** 
  - 音素级别准确度评分（0-100）
  - 单词级别评分
  - 句子整体评分（流利度 + 准确度 + 完整度 + 韵律）
- **问题标注:**
  - 在文本上高亮标红发音有问题的音素/单词
  - 显示用户实际发出的音素 vs 目标音素（如 `/θ/` → 用户发成 `/s/`）
  - 针对中国口音的专项检测：
    - `th` [θ/ð] → 常发成 [s/z]
    - `r` vs `l` 混淆
    - `v` → 常发成 [w]
    - 长短元音混淆（ship/sheep, bit/beat）
    - 词尾辅音省略（-ed, -s, -th）
    - 重音位置错误（尤其多音节医疗术语）
- **TTS 示范:**
  - 播放标准发音（美式英语）
  - 支持慢速播放（0.7x）
  - 可单独播放某个音素的标准发音
- **跟读模式:**
  - 系统播放 → 用户跟读 → 系统评估 → 显示对比
  - 支持反复练习直到达到目标分数
  - 达标后播放鼓励动画/音效

**UI 示意:**

```
┌──────────────────────────────────────┐
│  请朗读以下句子：                      │
│                                      │
│  "The patient's temperature is       │
│   thirty-eight point five degrees."  │
│                                      │
│  🔊 听标准发音    🐢 慢速播放          │
│                                      │
│         🎤 按住说话                    │
│                                      │
│  ─── 评估结果 ───                     │
│                                      │
│  The patient's [temperature] is      │
│  [thirty]-eight point five degrees.  │
│  （红色 = 需改进）                     │
│                                      │
│  📊 总分: 72/100                      │
│                                      │
│  ⚠️ 具体问题：                        │
│  • "temperature" - 重音位置错误        │
│    你的: tempeRATure ❌               │
│    正确: TEMperature ✅               │
│  • "thirty" - /θ/ 发成了 /s/          │
│    💡 舌尖要放在上下牙齿之间            │
│                                      │
│  🔄 再试一次    ➡️ 下一个              │
└──────────────────────────────────────┘
```

#### 3.1.2 医疗场景对话练习

**概述:** 用户与 AI 进行角色扮演对话，模拟真实医疗场景。

**详细需求:**

- **场景列表:**（详见附录 A）
  - 入院评估（Admission Assessment）
  - 生命体征测量沟通
  - 给药说明（Medication Administration）
  - 疼痛评估（Pain Assessment）
  - 交接班报告（Shift Report / SBAR）
  - 病人教育（Patient Education）
  - 紧急响应沟通（Emergency Communication）
  - 与家属沟通
- **对话机制:**
  - AI 扮演病人/医生/家属，用户扮演护士
  - 多轮对话，有上下文记忆
  - 对话中实时进行发音评估
  - 对话结束后给出综合反馈报告
- **难度分级:**
  - 初级：提供中文提示 + 英文参考句
  - 中级：只提供场景描述，用户自由发挥
  - 高级：加入意外情况（病人情绪激动、突发症状等）
- **反馈机制:**
  - 每轮对话后可选择查看"更好的说法"
  - 专业术语使用是否准确
  - 语气是否合适（护士需要 empathetic tone）

#### 3.1.3 核心词汇系统

- **护理词汇表:**（详见附录 C）
  - 按场景分类（生命体征、药物、症状、器械等）
  - 每个词包含：音标、发音音频、中文释义、例句、使用场景
- **词汇卡片:**
  - 展示单词 → 发音练习 → 语境例句
  - 标注该词的发音难点（如 stethoscope 的重音）
- **Spaced Repetition:**
  - 基于 SM-2 算法或变体
  - 根据发音准确度和词义记忆双维度调整复习间隔

### 3.2 P1 — 重要功能（第二阶段）

#### 3.2.1 日常生活场景对话

- 超市购物（询价、退换货）
- 银行业务（开户、贷款咨询）
- 学校沟通（家长会、和老师交流）
- 医院就医（自己看病，描述症状）
- 电话沟通（预约、客服投诉）
- 社交场合（聊天、聚会介绍）

#### 3.2.2 语法纠正系统

- **实时语法分析:**
  - AI 分析用户在对话/自由练习中的语法
  - 温柔提示错误，给出修正建议
  - 用中文解释语法规则
- **中国人常见语法错误专项练习:**
  - 时态混乱（中文无时态变化 → 常忘记过去式/进行时）
  - 冠词遗漏/误用（a/an/the — 中文无冠词概念）
  - 介词搭配错误
  - 单复数不一致
  - 主谓一致
  - he/she 混用（中文"他/她"发音相同）
- **练习形式:**
  - 纠错练习（找出句子中的错误）
  - 翻译练习（中文→英文，检查语法正确性）
  - 填空练习（选择正确的时态/冠词/介词）

#### 3.2.3 学习系统

- **每日学习计划:**
  - 根据用户可用时间（15/20/30 分钟）生成计划
  - 自动平衡发音/词汇/对话/语法的比例
  - 优先安排用户薄弱环节
- **进度追踪 Dashboard:**
  - 发音准确度趋势图（按周/月）
  - 词汇量增长曲线
  - 各音素的掌握程度雷达图
  - 场景完成度
  - 连续学习天数
- **弱点分析:**
  - AI 每周生成一份学习报告
  - 指出最需要提升的 3 个方面
  - 推荐对应的练习内容

#### 3.2.4 打卡与成就系统

- 每日打卡（完成当日学习目标即算打卡）
- 连续打卡奖励（7天/30天/100天）
- 成就徽章：
  - 🎯 **完美发音** — 某个音素连续 5 次满分
  - 🏥 **护理之星** — 完成所有医疗场景
  - 📚 **词汇大师** — 掌握 500 个专业词汇
  - 🗣️ **对话达人** — 完成 50 次角色扮演
  - 🔥 **坚持不懈** — 连续 30 天打卡

### 3.3 P2 — 增强功能（未来迭代）

- **发音口腔动画:** 3D/2D 口腔截面图，展示舌头、嘴唇位置
- **社区功能:** 学习小组、互相点评发音
- **AI 自由对话:** 不限场景的自由英语对话练习
- **NCLEX 备考模块:** 护士执照考试相关英语
- **语音日记:** 每天录一段英语日记，AI 分析进步
- **发音对比回放:** 录音 A（第一天）vs 录音 B（一个月后）
- **线下场景预演:** 上传即将参加的会议/面试信息，AI 定制练习

---

## 4. 非功能需求

### 4.1 性能

| 指标 | 要求 |
|------|------|
| 首屏加载时间 (FCP) | < 2s（3G 网络下 < 4s） |
| 语音识别延迟 | < 1s（用户停止说话到开始评估） |
| 发音评估返回 | < 3s |
| AI 对话响应 | < 2s（首 token），支持 streaming |
| TTS 音频播放 | < 500ms（缓存后即时） |
| PWA 离线支持 | 词汇卡片和已缓存的对话可离线使用 |

### 4.2 安全与隐私

- **语音数据:**
  - 用户录音仅用于实时评估，评估后立即删除原始音频
  - 不将用户语音数据用于模型训练（除非用户明确 opt-in）
  - 发音评分结果以数值形式存储，不保留音频
- **个人数据:**
  - 符合 CCPA（在美用户）
  - 学习数据加密存储（AES-256）
  - 支持用户数据导出和账户删除
- **认证:**
  - 支持 Google / Apple / 邮箱注册登录
  - JWT + Refresh Token 机制
  - 敏感操作需二次验证

### 4.3 可访问性 (Accessibility)

- 支持系统字体大小调整
- 色盲友好的配色方案（发音反馈不仅靠颜色，还有图标/文字）
- 语音反馈支持文字同步显示

### 4.4 国际化 (i18n)

- v1.0: 中文界面 + 中文解释
- v2.0: 考虑支持日语、韩语、越南语等其他亚洲语言使用者

---

## 5. 技术架构概览

### 5.1 整体架构

```
┌─────────────────────────────────────────────────┐
│                   客户端 (PWA)                    │
│   Next.js + React + TypeScript + Tailwind CSS    │
│                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ 发音练习  │ │ 场景对话  │ │ 词汇/语法模块    │  │
│  └────┬─────┘ └────┬─────┘ └────────┬─────────┘  │
│       │            │                │             │
│  ┌────┴────────────┴────────────────┴─────────┐  │
│  │          共享服务层 (Shared Services)         │  │
│  │  Audio Engine │ AI Provider │ Progress Tracker│  │
│  └────────────────────┬──────────────────────┘  │
└───────────────────────┼──────────────────────────┘
                        │
            ┌───────────┼───────────┐
            ▼           ▼           ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │ Azure    │ │ Gemini   │ │ ElevenLabs│
    │ Speech   │ │ API      │ │ / Web TTS │
    │ SDK      │ │          │ │           │
    │(发音评估) │ │(AI对话)  │ │(语音合成) │
    └──────────┘ └──────────┘ └──────────┘
```

### 5.2 技术栈详细

| 层次 | 技术选择 | 说明 |
|------|---------|------|
| **框架** | Next.js 14+ (App Router) | SSR + 静态生成，SEO 友好 |
| **语言** | TypeScript (strict) | 类型安全 |
| **样式** | Tailwind CSS + Radix UI | 快速开发 + 无障碍组件 |
| **状态管理** | Zustand / Jotai | 轻量，适合 React |
| **AI 主力** | Google Gemini API | 对话生成、语法分析、内容生成 |
| **AI 备选** | OpenAI GPT-4o | Fallback + 特定任务 |
| **STT** | Web Speech API / Azure Speech SDK | 浏览器原生优先，Azure 备选 |
| **TTS** | ElevenLabs API / Web Speech Synthesis | 高质量语音优先 |
| **发音评估** | Azure Speech SDK Pronunciation Assessment | 音素级别评估，支持打分 |
| **数据库** | Supabase (PostgreSQL) | Auth + DB + Realtime |
| **缓存** | IndexedDB (Dexie.js) | 离线词汇卡片 |
| **部署** | Vercel | 与 Next.js 深度集成 |
| **分析** | Mixpanel / PostHog | 用户行为分析 |

### 5.3 发音评估技术方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **Azure Speech SDK** | 音素级别评估、官方支持、准确度高 | 收费（$1/1000次）、需网络 | ⭐⭐⭐⭐⭐ |
| **Speechace API** | 专为语言学习设计 | 收费、文档较少 | ⭐⭐⭐⭐ |
| **开源 (Kaldi/Whisper + 自定义)** | 免费、可定制 | 开发成本高、需 ML 专长 | ⭐⭐ |
| **Web Speech API 对比法** | 免费、零成本 | 粗粒度、浏览器差异大 | ⭐⭐ |

**结论:** MVP 阶段使用 **Azure Speech SDK Pronunciation Assessment**，成熟后考虑自研评估模型。

### 5.4 共享模块设计 (与 AI Learning Buddy)

```typescript
// 共享抽象层
learning-platform/
├── packages/
│   ├── ai-provider/          // AI 调用抽象（Gemini, OpenAI）
│   ├── audio-engine/         // STT + TTS 封装
│   ├── progress-tracker/     // 学习进度、打卡、成就
│   ├── ui-components/        // 通用 UI 组件
│   └── pwa-core/            // PWA 配置、离线策略
├── apps/
│   ├── ai-learning-buddy/   // 通用学习应用
│   └── english-buddy/       // 英语发音学习应用
└── package.json             // monorepo (pnpm workspace)
```

---

## 6. 开发阶段规划

### Phase 1 — MVP（8-10 周）

> **目标:** 核心发音纠正 + 基础医疗场景 + 最小可用产品

| 周次 | 任务 | 交付物 |
|------|------|--------|
| W1-2 | 项目搭建、发音评估 SDK 集成 | 能录音并返回音素级评分的 prototype |
| W3-4 | 发音练习界面、跟读模式 | 可用的发音练习页面 |
| W5-6 | 医疗场景对话（3 个场景）| AI 角色扮演对话 + 对话中发音评估 |
| W7-8 | 核心词汇表（200 词）+ SRS | 护理词汇学习模块 |
| W9 | PWA 配置、响应式适配 | 可安装的移动 PWA |
| W10 | 测试、修复、灰度发布 | MVP 上线 |

**Phase 1 功能范围:**
- ✅ 单词/句子发音评估（音素级别）
- ✅ 跟读模式
- ✅ 3 个医疗场景对话
- ✅ 200 个护理词汇卡片
- ✅ 基础进度追踪
- ❌ 语法纠正（Phase 2）
- ❌ 日常场景（Phase 2）
- ❌ 成就系统（Phase 2）

### Phase 2 — 功能完善（6-8 周）

- 语法纠正系统
- 日常生活场景对话（6 个场景）
- 医疗场景扩充至 10 个
- 词汇扩充至 500 词
- 每日学习计划 + 打卡
- 弱点分析 Dashboard
- 成就徽章系统

### Phase 3 — 增强与扩展（持续）

- 口腔动画辅助
- 社区功能
- 更多场景和词汇
- NCLEX 备考模块
- monorepo 重构
- 多语言母语支持

---

## 7. 成功指标 (KPIs)

### 7.1 产品指标

| 指标 | Phase 1 目标 | Phase 2 目标 | 衡量方式 |
|------|-------------|-------------|---------|
| **DAU** | 50 | 300 | Analytics |
| **次日留存率** | > 40% | > 50% | Cohort 分析 |
| **7日留存率** | > 20% | > 30% | Cohort 分析 |
| **日均使用时长** | > 8 min | > 15 min | Session 统计 |
| **完成率**（开始练习→完成） | > 60% | > 70% | 漏斗分析 |

### 7.2 学习效果指标

| 指标 | 目标 | 衡量方式 |
|------|------|---------|
| **发音准确度提升** | 使用 30 天后平均提升 15+ 分 | 前后测对比 |
| **词汇记忆留存** | 7 天后复习正确率 > 70% | SRS 数据 |
| **用户自我感知** | > 80% 用户认为"口语有进步" | 月度问卷 |

### 7.3 业务指标（如未来商业化）

| 指标 | 目标 |
|------|------|
| **付费转化率** | > 5%（如采用 freemium 模式） |
| **NPS** | > 50 |
| **推荐率** | > 30% 用户主动推荐给朋友 |

---

## 8. 竞品分析

### 8.1 竞品概览

| 产品 | 发音纠正 | 医疗场景 | 中文支持 | 中国口音针对 | 价格 |
|------|---------|---------|---------|-------------|------|
| **ELSA Speak** | ⭐⭐⭐⭐⭐ 音素级 | ❌ | ❌ 全英文 | 部分 | $12/月 |
| **Duolingo** | ⭐⭐ 粗粒度 | ❌ | ✅ | ❌ | 免费+$7/月 |
| **流利说** | ⭐⭐⭐⭐ | ❌ | ✅ | ✅ | ¥99/月 |
| **Speechling** | ⭐⭐⭐⭐ 真人反馈 | ❌ | ✅ | 部分 | $20/月 |
| **Rosetta Stone** | ⭐⭐⭐ | ❌ | ❌ | ❌ | $12/月 |
| **English Buddy** | ⭐⭐⭐⭐⭐ 音素级 | ✅ 核心特色 | ✅ 全中文 | ✅ 专门针对 | TBD |

### 8.2 竞品深度分析

#### ELSA Speak
- **优势:** 发音评估技术业界领先，AI 驱动，音素级别反馈
- **劣势:** 全英文界面，对中国用户不友好；无行业场景；通用化设计
- **我们的机会:** 中文 UI + 医疗场景 + 中国口音专项

#### Duolingo
- **优势:** 游戏化做得极好，用户粘性高，免费可用
- **劣势:** 发音纠正能力弱，内容偏初级，不适合中高级学习者
- **我们的机会:** 面向中高级用户，专业深度

#### 流利说（Liulishuo）
- **优势:** 中文产品，AI 课程体系完善，在中国市场有知名度
- **劣势:** 在美国市场影响力小，无医疗场景，偏考试导向
- **我们的机会:** 服务在美华人这个被忽视的细分市场

### 8.3 差异化总结

English Buddy 的核心竞争力不在于单一功能超越所有竞品，而在于 **三个维度的交叉点**：

```
        音素级发音纠正
             ╱╲
            ╱  ╲
           ╱    ╲
    中国口音 ──── 医疗场景
      专项         专业
```

**目前没有任何产品同时覆盖这三个维度。** 这就是我们的蓝海。

---

## 9. 风险与挑战

### 9.1 技术风险

| 风险 | 严重程度 | 可能性 | 缓解策略 |
|------|---------|--------|---------|
| 发音评估准确度不够 | 🔴 高 | 中 | 使用 Azure Speech SDK 成熟方案；收集用户反馈持续校准；提供"不准确"反馈按钮 |
| Web Speech API 浏览器兼容性 | 🟡 中 | 高 | Azure Speech SDK 作为 fallback；明确标注支持的浏览器 |
| AI 对话质量不稳定 | 🟡 中 | 中 | 精心设计 prompt；关键场景用预设对话树 + AI 灵活扩展；人工审核场景内容 |
| 移动端录音质量 | 🟡 中 | 中 | 音频预处理（降噪）；指导用户使用环境要求 |

### 9.2 产品风险

| 风险 | 严重程度 | 可能性 | 缓解策略 |
|------|---------|--------|---------|
| 目标市场太窄 | 🟡 中 | 中 | Phase 1 聚焦护理场景验证 PMF；Phase 2 扩展更多职业场景 |
| 用户留存困难 | 🔴 高 | 高 | 强化游戏化（徽章、连续打卡）；显示进步（before/after 对比）；Push 通知提醒 |
| 学习效果难以量化 | 🟡 中 | 中 | 定期前后测对比；可视化进步曲线；收集用户故事 |

### 9.3 商业风险

| 风险 | 严重程度 | 可能性 | 缓解策略 |
|------|---------|--------|---------|
| API 成本过高 | 🟡 中 | 中 | 缓存常用 TTS 音频；限制免费用户每日评估次数；优化 prompt 减少 token |
| 竞品模仿 | 🟢 低 | 低 | 快速迭代；深耕护理社群；建立用户信任 |

---

## 10. 附录

### 附录 A：医疗英语场景清单

#### A1. 入院评估 (Admission Assessment)
```
场景描述: 新病人入院，护士进行初始评估
关键词汇: chief complaint, medical history, allergies, vital signs, insurance
关键句型:
- "Hi, I'm [Name], and I'll be your nurse today."
- "Can you tell me what brought you to the hospital?"
- "Are you allergic to any medications?"
- "On a scale of 1 to 10, how would you rate your pain?"
- "I'm going to take your blood pressure now."
```

#### A2. 生命体征 (Vital Signs)
```
场景描述: 测量并记录生命体征
关键词汇: blood pressure, heart rate, respiratory rate, temperature, 
           oxygen saturation, systolic, diastolic
关键句型:
- "I need to check your vitals."
- "Your blood pressure is 120 over 80."
- "Your temperature is slightly elevated at 100.4."
- "Take a deep breath for me, please."
```

#### A3. 给药 (Medication Administration)
```
场景描述: 向病人解释药物并给药
关键词汇: dosage, side effects, contraindication, oral, intravenous (IV),
           intramuscular, subcutaneous, as needed (PRN)
关键句型:
- "I have your medication here. This is [drug name] for [condition]."
- "This may cause some drowsiness."
- "Have you taken this medication before?"
- "Please let me know if you experience any unusual symptoms."
```

#### A4. 疼痛评估 (Pain Assessment)
```
场景描述: 评估病人的疼痛程度和性质
关键词汇: sharp, dull, throbbing, radiating, intermittent, constant,
           pain scale, onset, location, duration
关键句型:
- "Can you describe your pain for me?"
- "Is the pain constant or does it come and go?"
- "Does the pain spread to any other area?"
- "What makes it better or worse?"
```

#### A5. 交接班 SBAR (Shift Report)
```
场景描述: 使用 SBAR 格式进行护士交接班
关键词汇: situation, background, assessment, recommendation,
           handoff, oncoming nurse, outgoing nurse
关键句型:
- "This is [patient name] in room [number]."
- "She was admitted for [diagnosis]."
- "Her vitals have been stable, but..."
- "I recommend we continue monitoring..."
```

#### A6. 紧急情况 (Emergency Communication)
```
场景描述: 紧急情况下的快速沟通
关键词汇: code blue, rapid response, anaphylaxis, hemorrhage,
           crash cart, intubation, CPR, defibrillator
关键句型:
- "I need help in room [number]!"
- "The patient is unresponsive."
- "Call a code blue!"
- "Get the crash cart, stat!"
- "Patient is in V-fib, prepare to defibrillate."
```

#### A7. 病人教育 (Patient Education)
```
场景描述: 出院指导，教病人自我护理
关键词汇: discharge instructions, follow-up appointment, wound care,
           activity restriction, warning signs
关键句型:
- "Before you go home, I want to go over a few things."
- "You should avoid heavy lifting for two weeks."
- "If you notice any redness, swelling, or fever, call your doctor."
- "Do you have any questions about your medications?"
```

#### A8. 与家属沟通 (Family Communication)
```
场景描述: 向病人家属解释病情和护理计划
关键词汇: prognosis, treatment plan, informed consent, visiting hours,
           advanced directive, power of attorney
关键句型:
- "I understand this is a difficult time for your family."
- "The doctor will explain the treatment plan in detail."
- "Your [family member] is resting comfortably now."
- "Do you have any questions or concerns?"
```

### 附录 B：中国英语学习者常见发音问题清单

#### B1. 辅音问题

| 目标音素 | 常见错误 | 示例 | 练习重点 |
|---------|---------|------|---------|
| /θ/ (th, voiceless) | → /s/ | **th**ink → "sink" | 舌尖放上下齿之间，送气不振动 |
| /ð/ (th, voiced) | → /z/ or /d/ | **th**is → "zis" / "dis" | 同上，但声带振动 |
| /r/ | → /l/ 或卷舌过度 | **r**ight → "light" | 舌头不接触上颚，向后卷曲 |
| /l/ (final) | 省略或弱化 | hospita**l** → "hospita" | 舌尖抵上齿龈，完成 dark L |
| /v/ | → /w/ | **v**ery → "wery" | 上齿咬下唇 |
| /ʒ/ | → /dʒ/ 或 /ʃ/ | mea**s**ure → "measure" 不到位 | 舌中部抬高，声带振动 |
| /n/ vs /ŋ/ (final) | 混淆 | si**n** vs si**ng** | 注意舌位不同 |

#### B2. 元音问题

| 目标音素 | 常见错误 | 示例 | 练习重点 |
|---------|---------|------|---------|
| /ɪ/ vs /iː/ | 长短不分 | sh**i**p vs sh**ee**p | 短 /ɪ/ 更放松，长 /iː/ 更紧 |
| /æ/ | → /e/ 或 /a/ | b**a**d → "bed" / "bod" | 嘴巴大张，舌前部低 |
| /ʌ/ vs /ɑː/ | 混淆 | c**u**t vs c**a**rt | /ʌ/ 短且居中 |
| /ɔː/ | → /o/ | c**au**ght | 嘴巴圆形张开 |
| /ɜːr/ | 卷舌不足或过度 | n**ur**se | R-colored vowel |
| /eɪ/ | → /e/ | p**a**tient → "petient" | 双元音要有滑动 |
| /oʊ/ | → /o/ | d**o**se → 扁平化 | 从 /o/ 滑向 /ʊ/ |

#### B3. 超音段问题 (Suprasegmental)

| 问题类型 | 描述 | 示例 |
|---------|------|------|
| **重音位置** | 多音节词重音放错 | steTHOscope ❌ → STEthoscope ✅ |
| **句子重音** | 每个词同等重读（中文节奏） | 应强调实义词，弱化虚词 |
| **语调** | 过于平坦（中文声调干扰） | 疑问句末尾应升调 |
| **连读** | 词与词之间断开 | "check it out" → "che-ki-tout" |
| **弱读** | 虚词不弱读 | "to" 应弱读为 /tə/，不是 /tuː/ |
| **词尾辅音省略** | -ed, -s, -th 被吞掉 | "helped" → "help" |

### 附录 C：核心护理词汇表（部分）

#### C1. 生命体征 (Vital Signs) — 25 词

| 英文 | 音标 | 中文 | 发音难点 |
|------|------|------|---------|
| vital signs | /ˈvaɪtl̩ saɪnz/ | 生命体征 | v 不要发成 w |
| blood pressure | /blʌd ˈpreʃər/ | 血压 | bl- 辅音丛 |
| systolic | /sɪˈstɑːlɪk/ | 收缩压 | 重音在第二音节 |
| diastolic | /ˌdaɪəˈstɑːlɪk/ | 舒张压 | 重音在第三音节 |
| heart rate | /hɑːrt reɪt/ | 心率 | r 不要发成 l |
| respiratory | /ˈrespərətɔːri/ | 呼吸的 | 重音在第一音节 |
| temperature | /ˈtemprətʃər/ | 体温 | 重音在第一音节，不是第二 |
| oxygen saturation | /ˈɑːksɪdʒən ˌsætʃəˈreɪʃn/ | 血氧饱和度 | saturation 重音 |
| stethoscope | /ˈsteθəskoʊp/ | 听诊器 | th + 重音在第一音节 |
| thermometer | /θərˈmɑːmɪtər/ | 温度计 | 开头 th + 重音第二 |

#### C2. 常见症状 (Symptoms) — 30 词

| 英文 | 音标 | 中文 | 发音难点 |
|------|------|------|---------|
| nausea | /ˈnɔːziə/ | 恶心 | 不是 "naw-see-ah" |
| diarrhea | /ˌdaɪəˈriːə/ | 腹泻 | 重音在第三音节 |
| hemorrhage | /ˈhemərɪdʒ/ | 出血 | 重音在第一音节 |
| dyspnea | /dɪspˈniːə/ | 呼吸困难 | 重音在第二音节 |
| edema | /ɪˈdiːmə/ | 水肿 | 重音在第二音节 |
| fatigue | /fəˈtiːɡ/ | 疲劳 | 重音在第二音节 |
| dizziness | /ˈdɪzinəs/ | 头晕 | zz 浊音 |
| palpitation | /ˌpælpɪˈteɪʃn/ | 心悸 | 重音在第三音节 |
| inflammation | /ˌɪnfləˈmeɪʃn/ | 炎症 | 重音在第三音节 |
| contusion | /kənˈtuːʒn/ | 挫伤 | -sion 发 /ʒn/ |

#### C3. 常用药物名 (Medications) — 20 词

| 英文 | 音标 | 中文 | 发音难点 |
|------|------|------|---------|
| acetaminophen | /əˌsiːtəˈmɪnəfɪn/ | 对乙酰氨基酚 | 5 音节，重音第三 |
| ibuprofen | /ˌaɪbjuːˈproʊfən/ | 布洛芬 | 重音在第三音节 |
| amoxicillin | /əˌmɑːksɪˈsɪlɪn/ | 阿莫西林 | 重音在第四音节 |
| metformin | /metˈfɔːrmɪn/ | 二甲双胍 | 重音在第二音节 |
| lisinopril | /laɪˈsɪnəprɪl/ | 赖诺普利 | 重音在第二音节 |
| hydrochlorothiazide | /ˌhaɪdroʊˌklɔːroʊˈθaɪəzaɪd/ | 氢氯噻嗪 | 多音节 + th |
| metoprolol | /məˈtoʊprəlɔːl/ | 美托洛尔 | 重音在第二音节 |
| omeprazole | /oʊˈmepræzoʊl/ | 奥美拉唑 | 重音在第二音节 |
| warfarin | /ˈwɔːrfərɪn/ | 华法林 | w 不是 v |
| insulin | /ˈɪnsəlɪn/ | 胰岛素 | 重音在第一音节 |

---

> **文档结束**  
> 本 PRD 为 living document，将随项目推进持续更新。  
> 如有问题或建议，请直接在文档中添加 comment 或联系作者。
