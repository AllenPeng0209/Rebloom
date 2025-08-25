// 语音识别结果接口
export interface VoiceChatResult {
  transcribedText: string;
  aiResponse: string;
  confidence: number;
}

// 配置接口
interface OmniConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

// 获取配置
async function getOmniConfig(): Promise<OmniConfig> {
  const apiKey = process.env.EXPO_PUBLIC_BAILIAN_API_KEY;
  const baseURL = process.env.EXPO_PUBLIC_BAILIAN_ENDPOINT || 'https://dashscope.aliyuncs.com';
  
  if (!apiKey || !baseURL) {
    throw new Error('请先配置百炼API密钥:\n1. 环境变量: EXPO_PUBLIC_BAILIAN_API_KEY\n2. 环境变量: EXPO_PUBLIC_BAILIAN_ENDPOINT');
  }
  
  return {
    apiKey,
    baseURL,
    model: 'qwen-turbo'
  };
}

// DashScope 语音识别功能
export async function speechToText(
  audioBase64: string,
  onRealtimeText?: (text: string) => void
): Promise<string> {
  try {
    console.log('录音文件大小:', audioBase64.length, 'bytes (base64)');
    
    if (onRealtimeText) {
      onRealtimeText('正在处理语音识别...');
    }
    
    // 使用 DashScope ASR API 进行语音识别
    const result = await performDashScopeASR(audioBase64, onRealtimeText);
    
    console.log('DashScope 语音识别结果:', result);
    return result;
    
  } catch (error) {
    console.error('语音识别失败:', error);
    throw new Error(`语音识别失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// DashScope Qwen-Audio 语音识别实现
async function performDashScopeASR(
  audioBase64: string,
  onRealtimeText?: (text: string) => void
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const config = await getOmniConfig();
      
      if (onRealtimeText) {
        onRealtimeText('正在连接 Qwen-Audio...');
      }

      const url = `${config.baseURL}/compatible-mode/v1/chat/completions`;
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);

      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', `Bearer ${config.apiKey}`);
      xhr.setRequestHeader('Accept', 'text/event-stream');

      let fullTranscript = '';
      let lastProcessedPosition = 0;

      xhr.onprogress = () => {
        const chunk = xhr.responseText.substring(lastProcessedPosition);
        lastProcessedPosition = xhr.responseText.length;
        
        const lines = chunk.split('\n');

        for (const line of lines) {
            if (line.trim() === '' || !line.startsWith('data: ')) continue;
            
            const data = line.slice(6);
            if (data.trim() === '[DONE]') {
                // The stream is done, but we'll let onreadystatechange handle the final state.
                return;
            }

            try {
                const parsed = JSON.parse(data);
                const textChunk = parsed.choices?.[0]?.delta?.content || '';
                if (textChunk) {
                    fullTranscript += textChunk;
                    if (onRealtimeText) {
                        onRealtimeText(fullTranscript);
                    }
                }
            } catch (e) {
                console.warn('解析流数据失败 (onprogress):', data, e);
            }
        }
      };

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            if (onRealtimeText) {
              onRealtimeText('语音识别完成');
            }
            if (!fullTranscript) {
              console.warn('语音识别结果为空');
            }
            resolve(fullTranscript.trim());
          } else {
            console.error('Qwen-Audio 错误:', xhr.status, xhr.responseText);
            reject(new Error(`Qwen-Audio API 错误: ${xhr.status} - ${xhr.responseText}`));
          }
        }
      };
      
      xhr.onerror = () => {
        console.error('Qwen-Audio 请求失败');
        reject(new Error('Qwen-Audio 请求失败: 网络错误'));
      };

      const body = JSON.stringify({
        model: 'qwen2.5-omni-7b',
        stream: true,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'input_audio',
                input_audio: {
                  data: `data:audio/wav;base64,${audioBase64}`
                }
              },
              {
                type: 'text',
                text: '请将这段语音转录成文字，只输出转录的文字内容，不要其他解释。'
              }
            ]
          }
        ],
      });

      xhr.send(body);

    } catch (error) {
      console.error('Qwen-Audio 失败:', error);
      reject(error);
    }
  });
}

// AI对话功能 - 发送文本给AI并获取回复
async function sendToAI(
  userMessage: string,
  onProgress?: (chunk: string) => void
): Promise<string> {
  const config = await getOmniConfig();
  
  const requestBody = {
    model: config.model,
    input: {
      messages: [
        {
          role: "system",
          content: "你是Dolphin，一个专业的AI心理健康伴侣。请用繁体中文回复，提供温暖、理解和支持的对话。"
        },
        {
          role: "user",
          content: userMessage
        }
      ]
    },
    parameters: {
      max_tokens: 1000,
      temperature: 0.7,
      top_p: 0.8
    }
  };

  const response = await fetch(`${config.baseURL}/api/v1/services/aigc/text-generation/generation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
      'X-DashScope-SSE': 'disable'
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`AI对话请求失败: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  const aiResponse = data.output?.text || '';
  
  if (!aiResponse) {
    throw new Error('AI未返回有效回复');
  }
  
  if (onProgress) {
    onProgress('AI回复完成');
  }
  
  return aiResponse;
}

// 语音输入处理 - 完整流程：语音识别 + AI对话
export async function processVoiceToChat(
  audioBase64: string,
  onProgress?: (chunk: string) => void
): Promise<VoiceChatResult> {
  try {
    // 第一步：语音转文字
    if (onProgress) {
      onProgress('正在识别语音...');
    }
    
    const transcribedText = await speechToText(audioBase64, onProgress);
    
    if (!transcribedText || transcribedText.trim() === '') {
      throw new Error('语音识别结果为空');
    }
    
    // 第二步：发送给AI获取回复
    if (onProgress) {
      onProgress('AI正在思考...');
    }
    
    const aiResponse = await sendToAI(transcribedText, onProgress);
    
    return {
      transcribedText,
      aiResponse,
      confidence: 0.9
    };
    
  } catch (error) {
    console.error('语音转对话失败:', error);
    throw error;
  }
}

// 测试连接
export async function testOmniConnection(): Promise<boolean> {
  try {
    const config = await getOmniConfig();
    
    const response = await fetch(`${config.baseURL}/api/v1/services/aigc/text-generation/generation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        input: {
          messages: [{
            role: "user",
            content: "你好"
          }]
        },
        parameters: {
          max_tokens: 10
        }
      }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('连接测试失败:', error);
    return false;
  }
}

// 测试语音识别连接 (Qwen-Audio)
export async function testSpeechConnection(): Promise<boolean> {
  try {
    const config = await getOmniConfig();
    
    // 测试 Qwen-Audio OpenAI 兼容 API 连接
    const response = await fetch(`${config.baseURL}/compatible-mode/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen2.5-omni-7b',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '你好'
              }
            ]
          }
        ]
      }),
    });
    
    // 即使返回错误，只要不是认证错误，就说明连接正常
    const isConnected = response.status !== 401 && response.status !== 403;
    
    console.log('语音识别功能测试:', isConnected ? '✅ Qwen-Audio 连接正常' : '❌ Qwen-Audio 连接失败');
    return isConnected;
  } catch (error) {
    console.error('语音识别连接测试失败:', error);
    return false;
  }
}