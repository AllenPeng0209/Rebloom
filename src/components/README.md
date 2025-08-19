# 组件结构说明

## 目录结构

```
src/components/
├── common/          # 通用基础组件
│   ├── Button.tsx
│   ├── Collapsible.tsx
│   ├── ExternalLink.tsx
│   ├── HapticTab.tsx
│   ├── HelloWave.tsx
│   ├── ParallaxScrollView.tsx
│   ├── ThemedText.tsx
│   └── ThemedView.tsx
├── ui/              # UI基础组件
│   ├── IconSymbol.ios.tsx
│   ├── IconSymbol.tsx
│   ├── TabBarBackground.ios.tsx
│   └── TabBarBackground.tsx
├── chat/            # 聊天相关组件
│   ├── ChatInput.tsx
│   ├── ChatScreen.tsx
│   ├── ChatScreenWithBackButton.tsx
│   └── MessageBubble.tsx
├── insights/        # 洞察分析组件
│   ├── CalendarWidget.tsx
│   ├── DailyInsightCard.tsx
│   ├── MoodTrendCard.tsx
│   └── WeeklyInsight.tsx
└── onboarding/      # 引导流程组件
    ├── OnboardingCard.tsx
    └── OnboardingScreen.tsx
```

## 组件分类说明

### common/ - 通用基础组件
- **Button.tsx**: 通用按钮组件，支持多种变体和主题
- **Collapsible.tsx**: 可折叠内容组件
- **ExternalLink.tsx**: 外部链接组件
- **HapticTab.tsx**: 带触觉反馈的标签组件
- **HelloWave.tsx**: 动画问候组件
- **ParallaxScrollView.tsx**: 视差滚动视图组件
- **ThemedText.tsx**: 主题化文本组件
- **ThemedView.tsx**: 主题化视图组件

### ui/ - UI基础组件
- **IconSymbol.tsx**: 图标符号组件（跨平台）
- **IconSymbol.ios.tsx**: iOS专用图标组件
- **TabBarBackground.tsx**: 标签栏背景组件（跨平台）
- **TabBarBackground.ios.tsx**: iOS专用标签栏背景组件

### chat/ - 聊天相关组件
- **ChatInput.tsx**: 聊天输入组件
- **ChatScreen.tsx**: 聊天屏幕组件
- **ChatScreenWithBackButton.tsx**: 带返回按钮的聊天屏幕
- **MessageBubble.tsx**: 消息气泡组件

### insights/ - 洞察分析组件
- **CalendarWidget.tsx**: 日历小部件
- **DailyInsightCard.tsx**: 每日洞察卡片
- **MoodTrendCard.tsx**: 心情趋势卡片
- **WeeklyInsight.tsx**: 每周洞察组件

### onboarding/ - 引导流程组件
- **OnboardingCard.tsx**: 引导卡片组件
- **OnboardingScreen.tsx**: 引导屏幕组件

## 使用说明

### 导入路径
所有组件现在都统一从 `@/src/components/` 路径导入：

```typescript
// 通用组件
import { Button } from '@/src/components/common/Button';
import { ThemedText } from '@/src/components/common/ThemedText';

// UI组件
import { IconSymbol } from '@/src/components/ui/IconSymbol';

// 业务组件
import { ChatScreen } from '@/src/components/chat/ChatScreen';
import { DailyInsightCard } from '@/src/components/insights/DailyInsightCard';
```

### 组件命名规范
- 使用 PascalCase 命名组件文件
- 组件名称与文件名保持一致
- 导出使用命名导出（named export）

### 主题支持
大部分组件都支持主题化，通过 `useTheme` hook 或主题属性进行配置。

## 重构历史
- 原 `/components/` 和 `/src/components/` 目录已合并
- 所有组件现在统一位于 `/src/components/` 下
- 按功能和用途进行了清晰的分类
