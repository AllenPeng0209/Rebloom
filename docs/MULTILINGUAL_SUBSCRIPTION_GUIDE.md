# 多语言订阅管理功能实现指南

## 概述

本文档描述了 Rebloom 应用中订阅管理功能的多语言实现。该功能支持简体中文、繁体中文、英文和日文四种语言，为用户提供本地化的订阅管理体验。

## 支持的语言

- **简体中文 (zh-CN)**: 中国大陆用户
- **繁体中文 (zh-TW)**: 台湾、香港、澳门用户
- **英文 (en)**: 国际用户
- **日文 (ja)**: 日本用户

## 功能特性

### 订阅管理功能
- 订阅方案展示（免费版、高级版、家庭版）
- 功能对比和选择
- 升级和降级操作
- 订阅状态管理
- 会员专享权益展示

### 账单管理功能
- 交易记录查看
- 付款方式管理
- 发票下载
- 订阅状态监控

## 技术实现

### 1. 语言配置文件

所有翻译文本存储在 `src/locales/` 目录下的 JSON 文件中：

```
src/locales/
├── zh-CN.json    # 简体中文
├── zh-TW.json    # 繁体中文
├── en.json       # 英文
└── ja.json       # 日文
```

### 2. 翻译键结构

#### 订阅管理相关翻译键

```json
{
  "subscription": {
    "title": "订阅管理",
    "currentPlan": "当前计划",
    "freePlan": "免费版",
    "premiumPlan": "高级版",
    "familyPlan": "家庭版",
    "selectPlan": "选择订阅方案",
    "mostPopular": "最受欢迎",
    "currentPlanText": "当前方案",
    "manageSubscription": "管理订阅",
    "selectThisPlan": "选择此方案",
    "premiumExclusive": "Premium 会员专享",
    "manageSubscriptionSettings": "管理订阅设置",
    "freeFeatures": {
      "basicChat": "每日基本对话",
      "moodTracking": "心情追踪",
      "basicInsights": "基础洞察",
      "communitySupport": "社区支持"
    },
    "premiumFeatures": {
      "unlimitedChat": "无限制对话",
      "deepAnalysis": "深度心理分析",
      "personalizedTherapy": "个性化治疗建议",
      "crisisSupport": "24/7 危机支持",
      "professionalConsult": "专业心理师咨询",
      "advancedInsights": "高级洞察报告",
      "voiceChat": "语音对话功能",
      "prioritySupport": "优先客户支持"
    },
    "familyFeatures": {
      "supportMembers": "支持最多6个家庭成员",
      "allPremiumFeatures": "所有高级版功能",
      "familyDashboard": "家庭心理健康仪表板",
      "familyTherapist": "家庭治疗师咨询",
      "emergencyNetwork": "紧急联络网络",
      "familyHealthPlan": "家庭心理健康计划"
    },
    "benefits": {
      "aiAnalysis": {
        "title": "AI 深度分析",
        "description": "获得更深入的心理状态分析和个性化建议"
      },
      "professionalConsultation": {
        "title": "专业咨询",
        "description": "每月与真人心理师进行一对一咨询"
      },
      "support247": {
        "title": "24/7 支持",
        "description": "全天候危机干预和紧急心理支持"
      }
    }
  }
}
```

#### 账单管理相关翻译键

```json
{
  "billing": {
    "title": "账单管理",
    "transactions": "交易记录",
    "methods": "付款方式",
    "invoices": "发票",
    "premiumMember": "Premium 会员",
    "nextCharge": "下次扣款",
    "manageSubscription": "管理订阅",
    "addPaymentMethod": "添加付款方式",
    "downloadInvoiceText": "下载发票",
    "default": "默认",
    "expires": "到期",
    "status": {
      "completed": "已完成",
      "pending": "处理中",
      "failed": "失败",
      "refunded": "已退款",
      "unknown": "未知"
    }
  }
}
```

### 3. 组件实现

#### 订阅管理组件 (`app/profile/subscription.tsx`)

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

export default function SubscriptionScreen() {
  const { t } = useLanguage();
  
  // 使用翻译函数获取多语言文本
  const plans = [
    {
      id: 'free',
      name: t('subscription.freePlan'),
      features: [
        t('subscription.freeFeatures.basicChat'),
        t('subscription.freeFeatures.moodTracking'),
        // ...
      ]
    }
  ];
  
  return (
    // 组件渲染逻辑
  );
}
```

#### 账单管理组件 (`app/profile/billing.tsx`)

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

export default function BillingScreen() {
  const { t } = useLanguage();
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return t('billing.status.completed');
      case 'pending': return t('billing.status.pending');
      // ...
    }
  };
  
  return (
    // 组件渲染逻辑
  );
}
```

### 4. 语言上下文

使用 `LanguageContext` 来管理当前语言状态：

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

const { t, setLanguage, currentLanguage } = useLanguage();
```

## 使用方法

### 1. 切换语言

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

const { setLanguage } = useLanguage();

// 切换到简体中文
setLanguage('zh-CN');

// 切换到繁体中文
setLanguage('zh-TW');

// 切换到英文
setLanguage('en');

// 切换到日文
setLanguage('ja');
```

### 2. 获取翻译文本

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

const { t } = useLanguage();

// 获取简单翻译
const title = t('subscription.title');

// 获取嵌套翻译
const feature = t('subscription.premiumFeatures.unlimitedChat');

// 获取带参数的翻译
const message = t('subscription.upgradeMessage', { plan: 'Premium Plan' });
```

### 3. 测试多语言功能

使用演示组件 `MultilingualSubscriptionDemo` 来测试多语言功能：

```typescript
import MultilingualSubscriptionDemo from '@/components/demo/MultilingualSubscriptionDemo';

// 在需要测试的页面中使用
<MultilingualSubscriptionDemo />
```

## 最佳实践

### 1. 翻译键命名

- 使用层级结构组织翻译键
- 使用描述性的键名
- 保持键名的一致性

### 2. 文本长度

- 考虑不同语言的文本长度差异
- 为UI组件预留足够的空间
- 测试长文本的显示效果

### 3. 文化适配

- 考虑不同文化的表达习惯
- 适配不同地区的日期格式
- 注意货币符号和数字格式

### 4. 测试

- 在所有支持的语言环境下测试
- 验证文本截断和换行
- 检查特殊字符的显示

## 维护和更新

### 1. 添加新翻译

1. 在所有语言文件中添加新的翻译键
2. 确保翻译的准确性和一致性
3. 更新相关组件以使用新的翻译键

### 2. 更新现有翻译

1. 修改语言文件中的翻译文本
2. 测试更新后的显示效果
3. 确保所有相关组件正常工作

### 3. 添加新语言

1. 创建新的语言配置文件
2. 翻译所有必要的文本
3. 更新语言选择器
4. 测试新语言的功能

## 故障排除

### 常见问题

1. **翻译不显示**: 检查翻译键是否正确
2. **语言切换不生效**: 确认 `setLanguage` 函数被正确调用
3. **文本截断**: 调整UI组件的尺寸或文本样式

### 调试技巧

1. 使用 `MultilingualSubscriptionDemo` 组件进行测试
2. 检查控制台中的语言切换日志
3. 验证翻译文件的结构和内容

## 总结

多语言订阅管理功能为 Rebloom 应用提供了国际化支持，提升了用户体验。通过合理的架构设计和最佳实践，确保了功能的可维护性和扩展性。

如需更多帮助或有疑问，请参考相关文档或联系开发团队。
