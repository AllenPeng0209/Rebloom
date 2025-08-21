// 心理咨詢師對話技巧工具

export interface CounselorResponse {
  type: 'reflection' | 'open_question' | 'clarification' | 'exploration' | 'summary' | 'validation' | 'empathic_question';
  template: string;
  example: string;
  whenToUse: string;
}

// 心理咨詢師回應技巧庫 - 纯粹倾听和反映风格
export const counselorTechniques: CounselorResponse[] = [
  // 简单情感反映
  {
    type: 'reflection',
    template: '听起来你感到{emotion}。',
    example: '听起来你感到很累。',
    whenToUse: '当用户表达情绪时，简单反映'
  },
  {
    type: 'reflection',
    template: '我听到你说{content}。',
    example: '我听到你说工作很辛苦。',
    whenToUse: '重复和确认用户的话'
  },
  {
    type: 'reflection',
    template: '{emotion}...',
    example: '很疲惫...',
    whenToUse: '最简单的情感反映'
  },

  // 极简陪伴（不用问句）
  {
    type: 'validation',
    template: '嗯。',
    example: '嗯。',
    whenToUse: '简单确认陪伴'
  },
  {
    type: 'validation',
    template: '...',
    example: '...',
    whenToUse: '用沉默陪伴'
  },
  {
    type: 'validation',
    template: '我明白。',
    example: '我明白。',
    whenToUse: '表达理解'
  },

  // 纯粹重复（不用问句）
  {
    type: 'reflection',
    template: '{content}。',
    example: '感到孤单。',
    whenToUse: '重复用户的话'
  },
  {
    type: 'reflection',
    template: '{content}...',
    example: '很孤单...',
    whenToUse: '简单重复确认'
  },

  // 无评判陪伴
  {
    type: 'validation',
    template: '我在听。',
    example: '我在听。',
    whenToUse: '表达专注的陪伴'
  },
  {
    type: 'validation',
    template: '我和你在一起。',
    example: '我和你在一起。',
    whenToUse: '提供支持的存在感'
  },
  {
    type: 'validation',
    template: '谢谢你告诉我。',
    example: '谢谢你告诉我。',
    whenToUse: '感谢用户的分享'
  },

  // 温和重述
  {
    type: 'summary',
    template: '所以...',
    example: '所以工作让你很有压力...',
    whenToUse: '温和地重述要点'
  },
  {
    type: 'summary',
    template: '你提到了{topic}。',
    example: '你提到了压力。',
    whenToUse: '简单确认关键词'
  },

  // 深化理解（关键时刻的共情提问）
  {
    type: 'empathic_question',
    template: '听起来{emotion}。你愿意多说一些吗？',
    example: '听起来很累。你愿意多说一些吗？',
    whenToUse: '关键时刻需要深入了解'
  },
  {
    type: 'empathic_question',
    template: '{emotion}...这种感觉怎么样？',
    example: '疲惫...这种感觉怎么样？',
    whenToUse: '探索情感体验'
  },
  {
    type: 'empathic_question',
    template: '我听到你说{content}。能告诉我更多吗？',
    example: '我听到你说工作很辛苦。能告诉我更多吗？',
    whenToUse: '邀请分享更多细节'
  },
  
  // 纯粹反映（大部分时候使用）
  {
    type: 'reflection',
    template: '听起来{emotion}。',
    example: '听起来很累。',
    whenToUse: '简单情感反映'
  },
  {
    type: 'reflection',
    template: '{emotion}...我能感受到。',
    example: '疲惫...我能感受到。',
    whenToUse: '表达理解和陪伴'
  },
  {
    type: 'reflection',
    template: '我听到你说{content}。这很重要。',
    example: '我听到你说工作很辛苦。这很重要。',
    whenToUse: '强调用户分享的重要性'
  }
];

// 根據用戶輸入選擇合適的回應技巧 - 优先简单反映，偶尔深化
export const selectCounselorTechnique = (
  userInput: string, 
  conversationContext?: {
    recentTopics: string[];
    emotionalState?: string;
    sessionLength: number;
  }
): CounselorResponse => {
  const input = userInput.toLowerCase();
  const sessionLength = conversationContext?.sessionLength || 0;
  
  // 判断是否为关键时刻（用户表达强烈情绪或重要信息）
  const isKeyMoment = 
    input.includes('很') || input.includes('非常') || input.includes('太') ||
    input.includes('痛苦') || input.includes('难受') || input.includes('崩溃') ||
    input.includes('不知道') || input.includes('迷茫') || input.includes('害怕') ||
    sessionLength > 5; // 或者对话已经进行一段时间
  
  // 20% 的关键时刻使用共情提问
  if (isKeyMoment && Math.random() < 0.2) {
    const empathicQuestions = counselorTechniques.filter(t => 
      t.type === 'empathic_question'
    );
    if (empathicQuestions.length > 0) {
      return empathicQuestions[Math.floor(Math.random() * empathicQuestions.length)];
    }
  }
  
  // 70% 的情况使用纯粹反映
  if (Math.random() < 0.7) {
    const reflections = counselorTechniques.filter(t => 
      t.type === 'reflection'
    );
    return reflections[Math.floor(Math.random() * reflections.length)];
  }
  
  // 25% 使用验证/陪伴
  if (Math.random() < 0.95) {
    const validations = counselorTechniques.filter(t => t.type === 'validation');
    return validations[Math.floor(Math.random() * validations.length)];
  }
  
  // 5% 使用总结
  const summaries = counselorTechniques.filter(t => t.type === 'summary');
  if (summaries.length > 0) {
    return summaries[Math.floor(Math.random() * summaries.length)];
  }
  
  // 默认返回简单反映
  const reflections = counselorTechniques.filter(t => t.type === 'reflection');
  return reflections[Math.floor(Math.random() * reflections.length)];
};

// 生成簡潔的咨詢師風格回應 - 极简风格
export const generateCounselorResponse = (
  userInput: string,
  selectedTechnique: CounselorResponse,
  context?: {
    detectedEmotion?: string;
    keyTopic?: string;
    previousMemory?: string;
  }
): string => {
  let response = selectedTechnique.template;
  
  // 只做最基本的替换，避免过度解释
  if (context?.detectedEmotion && response.includes('{emotion}')) {
    response = response.replace('{emotion}', context.detectedEmotion);
  }
  
  if (context?.keyTopic && response.includes('{topic}')) {
    response = response.replace('{topic}', context.keyTopic);
  }
  
  // 提取用户话语中的关键内容进行反映
  if (response.includes('{content}')) {
    const keyWords = userInput.split(' ').filter(word => 
      word.length > 1 && 
      !['我', '的', '了', '很', '是', '在', '有', '和', '就', '都', '但', '还', '也', '要', '会', '可以', '因为', '所以'].includes(word)
    );
    const keyContent = keyWords.slice(0, 2).join('');
    response = response.replace('{content}', keyContent || '这些');
  }
  
  // 移除记忆提及，保持纯粹的当下反映
  return response;
};

// 情緒詞彙映射
export const emotionMapping: {[key: string]: string} = {
  '累': '疲憊',
  '煩': '煩躁',
  '難過': '難過',
  '開心': '開心',
  '焦慮': '焦慮',
  '壓力': '有壓力',
  '困惑': '困惑',
  '失望': '失望',
  '生氣': '生氣',
  '害怕': '害怕',
  '孤單': '孤單',
  '無助': '無助',
  '沮喪': '沮喪',
  '興奮': '興奮',
  '緊張': '緊張',
  '放鬆': '放鬆'
};

// 從用戶輸入中檢測情緒
export const detectEmotion = (userInput: string): string | undefined => {
  for (const [keyword, emotion] of Object.entries(emotionMapping)) {
    if (userInput.includes(keyword)) {
      return emotion;
    }
  }
  return undefined;
};

// 提取關鍵話題
export const extractKeyTopic = (userInput: string): string | undefined => {
  const topics = ['工作', '家庭', '朋友', '學習', '健康', '關係', '金錢', '未來'];
  
  for (const topic of topics) {
    if (userInput.includes(topic)) {
      return topic;
    }
  }
  
  // 提取名詞
  const words = userInput.split('');
  const longWords = words.filter(word => word.length > 2);
  return longWords[0];
};
