# Soulmate 项目结构

## 概述
这是一个使用 Expo Router 和 React Native 构建的心理健康支持应用。项目采用模块化的架构设计，清晰的职责分离。

## 目录结构

```
soulmate/
├── app/                    # Expo Router 页面
│   ├── (tabs)/            # 标签页路由
│   ├── profile/           # 个人资料页面
│   ├── _layout.tsx        # 根布局
│   ├── chat.tsx           # 聊天页面
│   └── +not-found.tsx     # 404页面
├── src/                    # 前端源码
│   ├── components/         # React组件
│   │   ├── chat/          # 聊天相关组件
│   │   ├── common/        # 通用组件
│   │   ├── insights/      # 洞察相关组件
│   │   ├── onboarding/    # 引导相关组件
│   │   └── ui/            # UI基础组件
│   ├── contexts/          # React上下文
│   │   ├── LanguageContext.tsx
│   │   ├── NavigationContext.tsx
│   │   └── ThemeContext.tsx
│   └── hooks/             # 自定义hooks
├── lib/                    # 业务逻辑库
│   ├── services/          # 服务层
│   │   ├── ai/           # AI服务
│   │   │   ├── aiRecommendationService.ts
│   │   │   ├── bailian.ts
│   │   │   ├── bailian_omni_calendar.ts
│   │   │   └── openai.ts
│   │   ├── auth/         # 认证服务
│   │   │   └── api.ts
│   │   ├── chat/         # 聊天服务
│   │   │   ├── conversation.ts
│   │   │   ├── familyChat.ts
│   │   │   └── familyChatCache.ts
│   │   ├── finance/      # 财务服务
│   │   │   ├── financeService.ts
│   │   │   ├── smartFinanceService.ts
│   │   │   └── subscriptionService.ts
│   │   ├── health/       # 健康服务
│   │   │   ├── healthService.ts
│   │   │   └── mealService.ts
│   │   ├── notification/ # 通知服务
│   │   │   ├── notificationService.ts
│   │   │   ├── notifications.ts
│   │   │   └── notificationNavigation.ts
│   │   └── storage/      # 存储服务
│   │       ├── avatarService.ts
│   │       ├── calendarService.ts
│   │       ├── choreService.ts
│   │       ├── eventCache.ts
│   │       ├── japanLocalServices.ts
│   │       ├── memoryManager.ts
│   │       ├── photoSaveService.ts
│   │       ├── shoppingService.ts
│   │       └── simpleUserBehaviorService.ts
│   ├── types/            # 类型定义
│   │   ├── database.types.ts
│   │   └── index.ts
│   ├── utils/            # 工具函数
│   │   ├── i1al.ts
│   │   ├── location.ts
│   │   ├── nanoid.ts
│   │   ├── networkManager.ts
│   │   ├── performanceMonitor.ts
│   │   ├── performanceOptimizer.ts
│   │   ├── permissionUtils.ts
│   │   ├── recurrenceEngine.ts
│   │   ├── supabase.ts
│   │   └── index.ts
│   ├── constants/        # 常量
│   │   ├── Colors.ts
│   │   ├── i18n.ts
│   │   └── index.ts
│   ├── cache/           # 缓存相关
│   │   └── index.ts
│   ├── translations/    # 翻译文件
│   │   ├── en.json
│   │   ├── ja.json
│   │   ├── zh-CN.json
│   │   └── zh-TW.json
│   └── index.ts         # 主索引文件
├── assets/               # 静态资源
│   ├── fonts/
│   └── images/
├── docs/                # 文档
│   ├── interaction-design.md
│   ├── product-requirements.md
│   └── technical-architecture.md
├── tests/               # 测试文件
│   ├── e2e/
│   ├── integration/
│   └── unit/
├── scripts/             # 构建脚本
│   └── reset-project.js
└── public/              # 公共文件
    ├── assets/
    └── icons/
```

## 架构说明

### 1. 服务层 (lib/services/)
按功能域组织服务：
- **AI服务**: 人工智能相关功能
- **认证服务**: 用户认证和授权
- **聊天服务**: 对话和消息处理
- **财务服务**: 支付和订阅管理
- **健康服务**: 健康数据管理
- **通知服务**: 推送通知和提醒
- **存储服务**: 数据存储和缓存

### 2. 工具层 (lib/utils/)
通用工具函数：
- 网络管理
- 性能监控
- 权限处理
- 数据生成
- 位置服务

### 3. 类型定义 (lib/types/)
TypeScript类型定义：
- 数据库类型
- API接口类型
- 组件属性类型

### 4. 常量 (lib/constants/)
应用常量：
- 颜色主题
- 国际化配置
- 系统配置

### 5. 组件层 (src/components/)
React组件按功能分组：
- **聊天组件**: 消息气泡、输入框等
- **通用组件**: 按钮、文本、视图等
- **洞察组件**: 数据可视化、分析卡片等
- **引导组件**: 用户引导流程
- **UI组件**: 基础UI元素

## 导入规范

### 服务导入
```typescript
// 从服务层导入
import { aiRecommendationService } from '@/lib/services/ai';
import { notificationService } from '@/lib/services/notification';
```

### 工具导入
```typescript
// 从工具层导入
import { nanoid } from '@/lib/utils';
import { networkManager } from '@/lib/utils';
```

### 类型导入
```typescript
// 从类型层导入
import { User, Message } from '@/lib/types';
```

### 常量导入
```typescript
// 从常量层导入
import { Colors } from '@/lib/constants';
import { t } from '@/lib/constants/i18n';
```

## 开发规范

1. **新服务**: 在 `lib/services/` 下创建对应的功能目录
2. **新组件**: 在 `src/components/` 下创建对应的功能目录
3. **新类型**: 在 `lib/types/` 下创建类型文件
4. **新工具**: 在 `lib/utils/` 下创建工具文件
5. **新常量**: 在 `lib/constants/` 下创建常量文件

## 迁移说明

此结构是从原有的扁平化结构重构而来，主要改进：
- 按功能域组织服务
- 清晰的职责分离
- 更好的可维护性
- 便于团队协作
- 支持模块化开发
