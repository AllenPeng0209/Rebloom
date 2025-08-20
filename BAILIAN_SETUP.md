# 百炼API集成设置指南

## 🚀 已完成的集成

✅ **百炼API客户端** (`src/lib/bailian.ts`)
- 支持标准的文本生成API调用
- 支持流式响应（可选）
- 完整的错误处理和日志记录

✅ **聊天功能更新** (`app/(tabs)/index.tsx`)
- 替换模拟AI回复为真实百炼API调用
- 包含对话历史上下文
- 专业的心理健康AI人格设定
- API失败时的fallback机制

## 🔧 环境配置

### 1. 获取百炼API密钥

1. 访问 [阿里云DashScope控制台](https://dashscope.console.aliyun.com/)
2. 创建API Key
3. 复制您的API密钥

### 2. 配置环境变量

创建 `.env` 文件（或更新现有文件）：

```env
# 百炼API配置
EXPO_PUBLIC_BAILIAN_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
EXPO_PUBLIC_BAILIAN_ENDPOINT=https://dashscope.aliyuncs.com
EXPO_PUBLIC_BAILIAN_WORKSPACE_ID=your_workspace_id

# Supabase配置（已有）
EXPO_PUBLIC_SUPABASE_URL=https://ptmfiaysmkapqchpcpck.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 重新启动应用

```bash
npm start
```

## 🤖 AI人格设定

系统已配置专业的心理健康AI人格：

```
你是 Ash，一个专业的AI心理健康伴侣。你的任务是倾听、理解，并帮助用户处理心理健康问题。请用温暖、支持和专业的语调回应，提供有用的建议和情感支持。请用繁体中文回复。
```

## 🔄 工作流程

1. **用户发送消息** → 保存到数据库
2. **构建对话历史** → 包含最近10条消息作为上下文
3. **调用百炼API** → 获取AI回复
4. **显示回复** → 保存AI回复到数据库
5. **错误处理** → API失败时使用预设回复

## 📊 API配置详情

- **模型**: `qwen-turbo`
- **最大tokens**: 1000
- **温度**: 0.7
- **Top-p**: 0.8
- **重复惩罚**: 1.1

## 🛠️ 调试

- 查看控制台日志以监控API调用
- API错误和响应都会记录到控制台
- 网络错误时会自动fallback到预设回复

## 🔒 安全注意事项

- API密钥通过环境变量安全存储
- 不要将API密钥提交到版本控制
- 生产环境建议使用更严格的访问控制

## 📱 测试步骤

1. 配置API密钥
2. 重启应用
3. 登录用户账户
4. 发送消息测试AI回复
5. 检查控制台确认API调用成功

现在您的应用已经集成了真实的百炼AI，可以提供专业的心理健康支持对话！
