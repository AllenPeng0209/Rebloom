# 心情日记页面多语言翻译总结

## 概述

本次工作为心情日记页面（Mood Journal）完成了完整的多语言翻译支持，包括繁体中文、简体中文、日语和英语四种语言。

## 翻译覆盖范围

### 1. 主要页面文本
- 页面标题：心情日记 / 心情日记 / 気分日記 / Mood Journal
- 副标题：追踪您的情感旅程 / 追踪您的情感旅程 / 感情の旅路を記録 / Track your emotional journey
- 今日洞察 / 今日洞察 / 今日のインサイト / Today's Insights

### 2. 日历组件
- 星期几显示：使用 `date-fns` 本地化功能自动支持多语言
- 月份年份显示：使用 `date-fns` 本地化功能自动支持多语言
- 心情指示器图例：
  - 好日子 / 好日子 / 良い日 / Good Day
  - 中性 / 中性 / 普通 / Neutral
  - 艰难的一天 / 艰难的一天 / 辛い日 / Tough Day

### 3. 洞察卡片
- 演示数据提示文本
- 无对话时的提示信息
- 开始对话按钮

### 4. 历史记录模态框
- 心理洞察历史 / 心理洞察历史 / 心理的インサイト履歴 / Psychological Insight History
- 专业心理师级别的每日分析和建议
- 生成今日总结功能
- 加载状态提示

### 5. 每日洞察卡片
- 对话次数、消息总数、心情趋势
- 主要情绪、情绪强度
- 关注程度指示器
- 危机警告信息
- 心理洞察和个性化建议部分

## 技术实现

### 1. 语言上下文系统
- 使用 `LanguageContext` 提供统一的翻译管理
- 支持参数化翻译（如日期格式化）
- 自动回退到默认语言（繁体中文）

### 2. 日期本地化
- 使用 `date-fns` 库的本地化功能
- 支持四种语言的日期格式
- 智能显示"今天"、"昨天"或具体日期

### 3. 组件更新
更新了以下组件以支持多语言：
- `MoodScreen` - 主页面
- `CalendarWidget` - 日历组件
- `SummaryHistoryView` - 历史记录视图
- `DailyInsightCard` - 每日洞察卡片

## 翻译键结构

### 心情页面相关
```
mood.title - 页面标题
mood.subtitle - 页面副标题
mood.todaysInsights - 今日洞察
mood.insightsFor - 特定日期的洞察
mood.noConversations - 无对话提示
mood.startConversation - 开始对话按钮
mood.mockInsightText - 演示数据提示
mood.insightHistory - 洞察历史
mood.dailyInsight - 每日洞察
```

### 历史记录相关
```
summary.loadError - 加载错误
summary.todaySummary - 今日总结
summary.detectConversation - 检测到对话
summary.generated - 生成成功
summary.trend.* - 心情趋势
summary.today/yesterday - 日期显示
summary.crisisFlag - 危机标志
summary.emptyTitle - 空状态标题
summary.headerTitle - 头部标题
```

### 洞察卡片相关
```
insightCard.title - 卡片标题
insightCard.refresh - 刷新按钮
insightCard.conversationCount - 对话次数
insightCard.messageCount - 消息总数
insightCard.moodTrend - 心情趋势
insightCard.mainEmotions - 主要情绪
insightCard.emotionIntensity - 情绪强度
insightCard.attentionLevel - 关注程度
insightCard.crisisWarning - 危机警告
insightCard.psychologicalInsights - 心理洞察
insightCard.personalizedRecommendations - 个性化建议
```

## 使用方法

### 1. 切换语言
用户可以在设置页面切换应用语言，所有文本会自动更新。

### 2. 添加新翻译
在 `LanguageContext.tsx` 中添加新的翻译键：
```typescript
'zh-TW': {
  'new.key': '繁體中文文本'
},
'zh-CN': {
  'new.key': '简体中文文本'
},
'ja': {
  'new.key': '日本語テキスト'
},
'en': {
  'new.key': 'English text'
}
```

### 3. 在组件中使用
```typescript
import { useLanguage } from '@/contexts/LanguageContext'

const { t } = useLanguage()
const text = t('mood.title')
```

## 测试建议

1. 切换不同语言，验证所有文本正确显示
2. 检查日期格式是否符合各语言习惯
3. 验证长文本在不同语言下的布局效果
4. 测试特殊字符和表情符号的显示

## 后续优化

1. 考虑添加更多语言支持
2. 优化长文本的布局适配
3. 添加语言特定的字体支持
4. 实现动态语言切换的动画效果
