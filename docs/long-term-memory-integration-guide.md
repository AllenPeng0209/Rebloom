# 長期記憶功能完整整合指南

## 🧠 功能概述

基於 [Mem0](https://github.com/mem0ai/mem0) 的理念，我們實現了完整的長期記憶系統，讓 AI 心理健康伴侶能夠：

- **記住用戶**：個人信息、偏好、經歷
- **理解情緒**：情感模式、心理狀態變化
- **學習成長**：治療進展、行為模式
- **深度共情**：基於歷史記憶的個性化回應

## 🏗️ 系統架構

### 1. 記憶上下文管理 (`src/contexts/MemoryContext.tsx`)

**核心功能：**
- 多層級記憶分類系統
- 智能重要性評分
- 情感分析和模式識別
- 個性化問候語生成

**記憶分類：**
```typescript
interface UserMemory {
  id: string;
  content: string;
  category: 'personal' | 'preference' | 'emotional' | 'behavioral' | 'therapeutic' | 'relationship';
  importance: number; // 1-10
  timestamp: Date;
  emotionalTone: 'positive' | 'negative' | 'neutral';
  tags: string[];
}
```

### 2. 增強統一設置 (`src/contexts/UnifiedSettingsContext.tsx`)

**記憶增強提示詞生成：**
- 整合 AI 個性設置
- 融入治療方法配置
- 添加歷史記憶上下文
- 生成共情響應元素

### 3. 智能提供者架構 (`src/components/providers/AppProviders.tsx`)

**條件性記憶啟用：**
- 用戶登入後啟用完整記憶功能
- 未登入時提供基礎功能
- 確保記憶與用戶 ID 關聯

## 🎯 記憶分類系統

### 個人記憶 (Personal)
- 基本信息：姓名、年齡、職業
- 生活背景：家庭、工作、興趣
- 重要事件：里程碑、轉折點

**示例：**
```
"我是一名軟件工程師，最近剛搬到新城市工作"
分類：personal | 重要性：6 | 標籤：[工作, 生活變化]
```

### 情感記憶 (Emotional)
- 情緒狀態：當前感受、情緒波動
- 觸發因素：壓力源、快樂源
- 情感模式：長期趨勢

**示例：**
```
"最近因為工作壓力感到很焦慮，晚上經常失眠"
分類：emotional | 重要性：8 | 情感：negative
```

### 治療記憶 (Therapeutic)
- 心理健康狀況：診斷、症狀
- 治療目標：期望改善的方面
- 進展記錄：改善或退步

**示例：**
```
"通過CBT練習，我學會了識別負面思維模式"
分類：therapeutic | 重要性：9 | 標籤：[CBT, 進展]
```

### 行為記憶 (Behavioral)
- 日常習慣：作息、飲食、運動
- 行為模式：應對策略、反應方式
- 改變嘗試：新習慣、行為調整

### 關係記憶 (Relationship)
- 人際關係：家人、朋友、同事
- 關係動態：衝突、支持、變化
- 社交模式：交往方式、溝通風格

## 🤖 智能記憶處理

### 自動分類算法
```typescript
const analyzeMemoryCategory = (content: string) => {
  const isPersonalInfo = content.includes('我') || content.includes('家人') || content.includes('工作');
  const isEmotional = content.includes('感覺') || content.includes('情緒') || content.includes('心情');
  const isTherapeutic = content.includes('焦慮') || content.includes('憂鬱') || content.includes('壓力');
  
  // 智能分類邏輯
}
```

### 重要性評分系統
- **1-3分**：日常對話，低重要性
- **4-6分**：個人信息，中等重要性  
- **7-8分**：情感狀態，高重要性
- **9-10分**：治療相關，極高重要性

### 情感分析引擎
```typescript
const analyzeEmotionalTone = (content: string) => {
  const positiveWords = ['開心', '快樂', '滿意', '感謝', '愛'];
  const negativeWords = ['難過', '憂鬱', '焦慮', '害怕', '生氣'];
  // 返回 'positive' | 'negative' | 'neutral'
}
```

## 🔄 記憶增強對話流程

### 1. 用戶輸入處理
```typescript
// 用戶發送消息時
const userInput = "我今天工作很累，感覺壓力很大";

// 自動分析和分類
const category = 'emotional';
const importance = 7;
const emotionalTone = 'negative';

// 添加到記憶系統
await addMemory(userInput, category, importance, ['工作壓力', '情緒']);
```

### 2. 記憶檢索
```typescript
// 檢索相關記憶
const relevantMemories = await retrieveMemories(userInput, 3);

// 示例檢索結果
[
  { content: "上週也提到工作壓力大", importance: 7, category: 'emotional' },
  { content: "我是軟件工程師", importance: 6, category: 'personal' },
  { content: "之前學過深呼吸放鬆技巧", importance: 8, category: 'therapeutic' }
]
```

### 3. 增強提示詞生成
```typescript
const enhancedPrompt = `
你是 Dolphin，溫暖支持型的AI心理健康伴侶...

重要記憶上下文：
1. [emotional] 上週也提到工作壓力大 (重要性: 7/10, negative)
2. [personal] 我是軟件工程師 (重要性: 6/10, neutral)
3. [therapeutic] 之前學過深呼吸放鬆技巧 (重要性: 8/10, positive)

當前情緒狀態：distressed
最近討論話題：工作, 壓力, 疲勞

共情增強指導：
- 記得你之前提到的工作壓力...
- 我能感受到你最近經歷的困難
- 基於我們之前的討論

記住：你不僅是一個AI助手，更是一個了解用戶的長期陪伴者，能夠記住並關懷用戶的成長歷程。
`;
```

### 4. AI 回應示例

**沒有記憶的回應：**
```
"聽起來你今天工作很累，壓力很大。你可以試試深呼吸來放鬆一下。"
```

**有記憶增強的回應：**
```
"我記得你上週也提到工作壓力很大，看來這個問題持續困擾著你。作為一名軟件工程師，工作壓力確實不小。還記得我們之前討論過的深呼吸放鬆技巧嗎？或許現在正是練習的好時機。你覺得這週的壓力和上週相比如何？有什麼特別的觸發因素嗎？"
```

## 📱 記憶管理界面

### 記憶查看功能 (`app/profile/memory-management.tsx`)

**功能特點：**
- 按分類瀏覽記憶
- 情緒分析報告
- 記憶重要性調整
- 記憶刪除管理

**界面組件：**
```typescript
// 分類過濾器
const categories = [
  { id: 'personal', name: '個人', icon: 'person.crop.circle', color: '#FF6B6B' },
  { id: 'emotional', name: '情感', icon: 'heart', color: '#4ECDC4' },
  { id: 'therapeutic', name: '治療', icon: 'cross.case', color: '#45B7D1' }
];

// 記憶卡片顯示
- 分類標籤和顏色編碼
- 重要性評分 (1-10)
- 情感標籤 (積極/消極/中性)
- 時間戳記
- 相關標籤
```

## 🎨 個性化體驗示例

### 首次對話
```
AI: "你好！很高興與你對話。"
```

### 有記憶後的對話
```
AI: "你好！工作怎麼樣？希望你今天感覺好一些。"
```

### 深度記憶整合
```
用戶: "我又失眠了"
AI: "我記得你之前提到過因為工作壓力導致失眠的問題。上次我們討論了睡前放鬆練習，你有嘗試嗎？另外，你提到的那個重要項目現在進展如何？會不會是這個原因影響了你的睡眠？"
```

## 🔧 技術實現要點

### 1. 記憶存儲策略
- 使用 AsyncStorage 本地持久化
- 按用戶 ID 隔離記憶數據
- 自動備份重要記憶

### 2. 性能優化
- 記憶檢索限制數量 (3-5條)
- 重要性權重排序
- 時間衰減算法

### 3. 隱私保護
- 本地存儲，不上傳雲端
- 用戶可完全控制記憶數據
- 支持記憶刪除和重置

## 📊 記憶分析功能

### 情緒模式分析
```typescript
const analyzeEmotionalPattern = async () => {
  const recentMemories = await getRecentMemories(14); // 最近14天
  const emotionalCounts = {
    positive: memories.filter(m => m.emotionalTone === 'positive').length,
    negative: memories.filter(m => m.emotionalTone === 'negative').length,
    neutral: memories.filter(m => m.emotionalTone === 'neutral').length
  };
  
  // 生成分析報告
  if (positiveRatio > 0.6) {
    return '最近你的情緒狀態整體比較積極正面';
  } else if (negativeRatio > 0.5) {
    return '最近你似乎經歷了一些挑戰，情緒波動較大';
  }
}
```

### 治療進展追蹤
- 記錄治療相關的對話
- 追蹤症狀改善情況
- 識別有效的應對策略

## 🚀 使用指南

### 初始設置
1. **用戶登入**：記憶功能自動啟用
2. **開始對話**：系統自動記錄重要信息
3. **個性化增強**：隨著對話增加，AI 理解加深

### 記憶管理
1. **查看記憶**：進入個人檔案 → 記憶管理
2. **調整重要性**：點擊重要性分數進行調整
3. **刪除記憶**：不需要的記憶可以刪除
4. **情緒分析**：查看情緒模式報告

### 最佳實踐
- **分享重要信息**：告訴 AI 你的背景、目標、偏好
- **表達情感**：讓 AI 理解你的情緒狀態
- **反饋進展**：分享治療或改善的進展
- **定期檢視**：查看記憶管理頁面了解 AI 對你的理解

## 🎯 共情增強效果

### 傳統 AI 回應
- 通用化建議
- 缺乏個人化理解
- 每次對話都是新開始

### 記憶增強 AI 回應
- 基於個人歷史的建議
- 展現對用戶的深度理解
- 持續的關係建立
- 真正的成長陪伴

這個長期記憶系統讓你的 AI 心理健康伴侶不再是一個健忘的助手，而是一個真正了解你、記住你、關懷你成長的長期夥伴！
