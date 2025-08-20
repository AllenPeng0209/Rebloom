# Soulmate 会员系统设置指南

## 完成的功能

✅ **邮箱注册登录系统**
- 用户可以通过邮箱和密码注册新账户
- 用户可以登录现有账户
- 支持多语言界面（中文繁体、中文简体、日语、英语）
- 自动创建用户档案

✅ **聊天对话保存功能**
- 所有聊天对话自动保存到Supabase数据库
- 每个用户有独立的对话记录
- 支持多个对话会话
- AI回复和用户消息都会保存

✅ **完整的用户认证流程**
- 集成到应用主界面
- 未登录用户会看到登录/注册界面
- 登录后可以正常使用聊天功能
- 自动处理会话状态

## 数据库设置

### 1. Supabase数据库表结构

请在您的Supabase项目中运行 `supabase_setup.sql` 文件中的SQL脚本，这将创建以下表：

- `user_profiles` - 用户档案信息
- `chat_conversations` - 聊天对话会话
- `chat_messages` - 聊天消息记录

### 2. 需要设置的环境变量

在项目根目录创建 `.env` 文件（如果不存在）：

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**注意**: 请将 `src/lib/supabase.ts` 中的硬编码URL和密钥替换为环境变量：

```typescript
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
```

## 功能说明

### 认证系统
- **注册**: 用户输入邮箱、密码和显示名称
- **登录**: 用户输入邮箱和密码
- **自动创建档案**: 注册时自动在 `user_profiles` 表中创建用户记录

### 聊天系统
- **自动保存**: 用户发送的消息和AI回复都会自动保存
- **对话管理**: 每次开始聊天时创建新的对话会话
- **历史记录**: 用户的所有对话都会保存在数据库中

### 安全性
- **行级安全**: 使用Supabase RLS确保用户只能访问自己的数据
- **认证状态**: 自动管理用户登录状态
- **数据隔离**: 每个用户的数据完全隔离

## 使用流程

1. **首次使用**: 用户需要注册账户
2. **邮箱验证**: 注册后需要验证邮箱（可选配置）
3. **登录**: 使用注册的邮箱和密码登录
4. **开始聊天**: 登录后自动创建新对话会话
5. **持续对话**: 所有消息自动保存，可以持续对话

## 技术架构

### 前端组件
- `AuthScreen` - 登录/注册界面
- `AuthContext` - 认证状态管理
- `ChatService` - 聊天数据服务

### 后端服务
- **Supabase Auth** - 用户认证
- **Supabase Database** - 数据存储
- **Row Level Security** - 数据安全

### 数据流
1. 用户认证 → AuthContext → 全局状态
2. 聊天消息 → ChatService → Supabase数据库
3. 数据查询 → RLS过滤 → 用户专属数据

## 下一步开发建议

1. **消息历史加载**: 实现加载用户历史对话功能
2. **对话列表**: 显示用户的所有对话会话
3. **用户档案编辑**: 允许用户编辑个人信息
4. **忘记密码**: 实现密码重置功能
5. **社交登录**: 添加Google/Apple登录选项

## 故障排除

### 常见问题
1. **无法连接Supabase**: 检查URL和API密钥是否正确
2. **数据库错误**: 确保已运行SQL设置脚本
3. **认证失败**: 检查Supabase认证配置

### 调试方法
- 查看控制台错误信息
- 检查Supabase仪表板中的日志
- 验证RLS策略是否正确配置
