import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { processVoiceToChat, speechToText, VoiceChatResult } from '../lib/bailian_omni';

export interface VoiceRecordingOptions {
  quality?: 'low' | 'medium' | 'high';
  maxDurationMs?: number;
  onProgress?: (progress: { duration: number, isRecording: boolean }) => void;
}

export interface VoiceRecordingResult {
  uri: string;
  duration: number;
  base64?: string;
}

export class VoiceService {
  private static recording: Audio.Recording | null = null;
  private static isRecording = false;
  private static recordingStartTime = 0;

  /**
   * 请求录音权限
   */
  static async requestPermissions(): Promise<{ granted: boolean; canAskAgain?: boolean; message?: string }> {
    try {
      console.log('正在请求录音权限...');
      const permissionResponse = await Audio.requestPermissionsAsync();
      console.log('权限响应:', permissionResponse);
      
      const { status, canAskAgain } = permissionResponse;
      
      if (status === 'granted') {
        console.log('录音权限已授予');
        return { granted: true };
      } else if (status === 'denied' && canAskAgain) {
        console.log('录音权限被拒绝，但可以再次请求');
        return { 
          granted: false, 
          canAskAgain: true, 
          message: '需要麦克风权限才能录制语音消息，请在设置中允许访问麦克风。' 
        };
      } else {
        console.log('录音权限被永久拒绝');
        return { 
          granted: false, 
          canAskAgain: false, 
          message: '麦克风权限被拒绝，请在设备设置中手动开启麦克风权限。' 
        };
      }
    } catch (error) {
      console.error('获取录音权限失败:', error);
      return { 
        granted: false, 
        message: `获取麦克风权限时发生错误: ${error instanceof Error ? error.message : '未知错误'}` 
      };
    }
  }

  /**
   * 开始录音
   */
  static async startRecording(options: VoiceRecordingOptions = {}): Promise<boolean> {
    try {
      if (this.isRecording) {
        console.warn('录音已在进行中');
        return false;
      }

      // 检查权限
      const permissionResult = await this.requestPermissions();
      if (!permissionResult.granted) {
        throw new Error(permissionResult.message || '没有录音权限');
      }

      // 设置音频模式 - 使用简化但更兼容的配置
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false
      });

      // 等待一下让音频模式完全设置
      await new Promise(resolve => setTimeout(resolve, 200));

      // 创建录音实例 - 使用预设配置更稳定
      const { recording } = await Audio.Recording.createAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        // 覆盖一些设置以提高兼容性
        android: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
          extension: '.wav',
        },
        ios: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
          extension: '.wav',
        }
      });

      this.recording = recording;
      this.isRecording = true;
      this.recordingStartTime = Date.now();

      console.log('开始录音');
      return true;
    } catch (error) {
      console.error('开始录音失败:', error);
      this.isRecording = false;
      this.recording = null;
      
      // 检查是否是Expo Go环境的特定错误
      if (error instanceof Error) {
        if (error.message.includes('recorder not prepared') || 
            error.message.includes('Prepare encountered an error')) {
          console.log('检测到Expo Go录音限制，尝试降级处理');
          throw new Error('在Expo Go中录音功能受限，请使用开发构建或真机测试。\n\n您可以继续使用文字输入与Dolphin对话。');
        }
      }
      
      throw new Error(`无法开始录音: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 停止录音
   */
  static async stopRecording(): Promise<VoiceRecordingResult | null> {
    try {
      if (!this.isRecording || !this.recording) {
        console.warn('没有正在进行的录音');
        return null;
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      const duration = Date.now() - this.recordingStartTime;

      this.isRecording = false;
      this.recording = null;

      if (!uri) {
        throw new Error('录音文件URI为空');
      }

      console.log('录音完成:', { uri, duration });
      return { uri, duration };
    } catch (error) {
      console.error('停止录音失败:', error);
      this.isRecording = false;
      this.recording = null;
      return null;
    }
  }

  /**
   * 取消录音
   */
  static async cancelRecording(): Promise<void> {
    try {
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
      }
    } catch (error) {
      console.error('取消录音失败:', error);
    } finally {
      this.isRecording = false;
      this.recording = null;
    }
  }

  /**
   * 获取录音状态
   */
  static getRecordingStatus(): { isRecording: boolean; duration: number } {
    return {
      isRecording: this.isRecording,
      duration: this.isRecording ? Date.now() - this.recordingStartTime : 0,
    };
  }

  /**
   * 将音频文件转换为base64
   */
  static async audioFileToBase64(uri: string): Promise<string> {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error('音频文件转base64失败:', error);
      throw error;
    }
  }

  /**
   * 语音转文字（集成百炼Omni）
   */
  static async speechToText(
    audioUri: string,
    onProgress?: (text: string) => void
  ): Promise<string> {
    try {
      // 将音频文件转为base64
      const base64Audio = await this.audioFileToBase64(audioUri);
      
      // 调用百炼Omni语音识别
      const transcribedText = await speechToText(base64Audio, onProgress);
      
      return transcribedText;
    } catch (error) {
      console.error('语音转文字失败:', error);
      throw error;
    }
  }

  /**
   * 语音转对话（完整流程：语音识别 + AI回复）
   */
  static async voiceToChat(
    audioUri: string,
    onProgress?: (text: string) => void
  ): Promise<VoiceChatResult> {
    try {
      // 将音频文件转为base64
      const base64Audio = await this.audioFileToBase64(audioUri);
      
      // 调用百炼Omni完整语音对话流程
      const result = await processVoiceToChat(base64Audio, onProgress);
      
      return result;
    } catch (error) {
      console.error('语音转对话失败:', error);
      throw error;
    }
  }

  /**
   * 完整的语音输入流程：录音 → 转文字
   */
  static async processVoiceInput(
    onTranscriptionProgress?: (text: string) => void
  ): Promise<string> {
    try {
      // 1. 开始录音
      const recordingStarted = await this.startRecording();
      if (!recordingStarted) {
        throw new Error('无法开始录音');
      }

      // 这里应该由UI控制录音的停止
      // 返回一个Promise，等待外部调用stopRecording
      return new Promise((resolve, reject) => {
        // 这个Promise会在stopRecording后resolve
        // 实际使用时需要配合UI的长按释放逻辑
        resolve(''); // 临时返回，实际应该在stopRecording中处理
      });
    } catch (error) {
      console.error('语音输入处理失败:', error);
      throw error;
    }
  }

  /**
   * 清理资源
   */
  static async cleanup(): Promise<void> {
    try {
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
      }
      this.isRecording = false;
      this.recording = null;
    } catch (error) {
      console.error('清理录音资源失败:', error);
    }
  }
}
