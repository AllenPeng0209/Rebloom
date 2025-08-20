# 🚀 快速设置指南

## 🔥 紧急修复数据库错误

您的应用显示数据库表不存在的错误。请立即执行以下步骤：

### 步骤1: 创建数据库表 (⚠️ 必须执行)

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目
3. 点击左侧菜单的 **SQL Editor**
4. 复制 `create_tables.sql` 文件中的所有内容
5. 粘贴到SQL编辑器中
6. 点击 **Run** 执行

### 步骤2: 获取真实API Key

1. 在Supabase Dashboard中点击 **Settings** → **API**
2. 复制 **anon public** key
3. 替换 `src/lib/supabase.ts` 第5行的key

### 步骤3: 重新启动应用

```bash
npm start
```

## 🎯 当前状态

- ✅ 项目URL已配置: `https://ptmfiaysmkapqchpcpck.supabase.co`
- ❌ 数据库表缺失 (需要执行步骤1)
- ❌ API Key需要更新 (需要执行步骤2)

## 🔧 完成后可以测试

1. 用户注册
2. 用户登录
3. 聊天对话保存

执行完步骤1和2后，您的会员系统就完全可以使用了！
