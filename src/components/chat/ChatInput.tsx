import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder'
import { speechToText } from '../../lib/bailian_omni'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface ChatInputProps {
  onSend: (message: string) => void
  onHeightChange?: (height: number) => void
  placeholder?: string
  maxLength?: number
  disabled?: boolean
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onHeightChange,
  placeholder = "Type your message...",
  maxLength = 1000,
  disabled = false,
}) => {
  const [message, setMessage] = useState('')
  const [inputHeight, setInputHeight] = useState(40)
  const [isFocused, setIsFocused] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [recordingError, setRecordingError] = useState<string | null>(null)
  const [processingTimeout, setProcessingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)
  
  // 使用新的语音录制 hook
  const voiceRecorder = useVoiceRecorder({
    maxDuration: 180000, // 3分钟
    audioFormat: 'wav',
    bitRate: 128000,
    sampleRate: 44100,
  })
  
  const scaleAnim = useRef(new Animated.Value(1)).current
  const voiceButtonScale = useRef(new Animated.Value(1)).current
  const voiceButtonOpacity = useRef(new Animated.Value(1)).current
  const inputRef = useRef<TextInput>(null)
  const voiceRecorderRef = useRef(voiceRecorder)

  // 更新 ref - 使用 useEffect 来避免每次渲染都更新
  React.useEffect(() => {
    voiceRecorderRef.current = voiceRecorder
  }, [voiceRecorder])

  // 清理函数，确保状态正确重置
  const cleanupProcessing = useCallback(async () => {
    setIsTranscribing(false)
    if (processingTimeout) {
      clearTimeout(processingTimeout)
      setProcessingTimeout(null)
    }
    await voiceRecorderRef.current.clearRecording()
  }, []) // 移除所有依赖，使用 ref 来访问最新值

  // 组件卸载时清理
  React.useEffect(() => {
    return () => {
      // 直接调用清理逻辑，避免依赖问题
      setIsTranscribing(false)
      if (processingTimeout) {
        clearTimeout(processingTimeout)
      }
      voiceRecorderRef.current.clearRecording()
    }
  }, []) // 空依赖数组，只在组件卸载时执行

  const handleSend = async () => {
    if (message.trim() && !disabled) {
      // Haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      }

      // Send animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start()

      onSend(message.trim())
      setMessage('')
      setInputHeight(40)
      onHeightChange?.(60) // 重置高度并通知父组件
      inputRef.current?.blur()
    }
  }

  const handleContentSizeChange = (event: any) => {
    const { height } = event.nativeEvent.contentSize
    // 更新输入框高度状态，用于容器高度调整
    const newHeight = Math.min(Math.max(height, 40), 200) // Min 40, Max 200
    setInputHeight(newHeight)
    onHeightChange?.(newHeight + 20) // Add padding
  }

  // 开始录音
  const startVoiceRecording = async () => {
    try {
      // 震动反馈
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
      }

      // 按钮动画
      Animated.parallel([
        Animated.timing(voiceButtonScale, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(voiceButtonOpacity, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start()

      // 使用新的 hook 开始录音
      await voiceRecorderRef.current.startRecording()
      
      // 清除错误状态
      setRecordingError(null)

    } catch (error) {
      console.error('开始录音失败:', error)
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      
      // 根据错误类型提供不同的提示
      let alertTitle = '录音功能暂不可用'
      let alertMessage = errorMessage
      
      if (errorMessage.includes('Expo Go')) {
        alertTitle = '开发环境限制'
        alertMessage = '在Expo Go中录音功能受限，请使用开发构建或真机测试。\n\n您可以继续使用文字输入与Ash对话。'
      } else if (errorMessage.includes('permission')) {
        alertTitle = '需要录音权限'
        alertMessage = '请在设置中允许应用使用麦克风权限。'
      } else if (errorMessage.includes('audio')) {
        alertTitle = '音频设备问题'
        alertMessage = '无法访问音频设备，请检查设备设置。'
      }
      
      Alert.alert(
        alertTitle, 
        alertMessage,
        [{ text: '知道了', style: 'default' }]
      )
      
      // 设置错误状态
      setRecordingError(errorMessage)
      
      // 重置按钮动画
      Animated.parallel([
        Animated.timing(voiceButtonScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(voiceButtonOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start()
    }
  }

  // 停止录音并处理
  const stopVoiceRecording = async (cancelled = false) => {
    try {
      // 震动反馈
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      }

      // 重置按钮动画
      Animated.parallel([
        Animated.timing(voiceButtonScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(voiceButtonOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start()

      if (cancelled) {
        await voiceRecorderRef.current.clearRecording()
        return
      }

      // 录音时长太短
      if (voiceRecorderRef.current.state.duration < 500) {
        Alert.alert('录音时间太短', '请长按录音至少0.5秒进行语音转文字并发送', [
          { text: '知道了', style: 'default' }
        ])
        await voiceRecorderRef.current.clearRecording()
        return
      }

      // 停止录音并获取base64数据
      const base64Data = await voiceRecorderRef.current.stopRecording()
      if (!base64Data) {
        throw new Error('录音失败')
      }

      // 开始语音转对话处理
      setIsTranscribing(true)
      
      try {
        // 设置超时机制，防止长时间卡住
        const timeoutPromise = new Promise((_, reject) => {
          const timeout = setTimeout(() => reject(new Error('语音处理超时')), 30000); // 30秒超时
          setProcessingTimeout(timeout)
        });

        // 只进行语音转文字，不调用AI对话
        const transcribedText = await Promise.race([
          speechToText(base64Data, (progress: string) => {
            console.log('处理进度:', progress)
          }),
          timeoutPromise
        ]) as string;

        // 清除超时
        if (processingTimeout) {
          clearTimeout(processingTimeout)
          setProcessingTimeout(null)
        }

        if (transcribedText && transcribedText.trim()) {
          // 震动反馈表示成功
          if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          }
          
          // 自动发送转录音频的文字
          onSend(transcribedText.trim())
          
        } else {
          Alert.alert('语音识别失败', '未能识别到语音内容，请重试', [
            { text: '重试', style: 'default' },
            { text: '取消', style: 'cancel' }
          ])
        }
      } catch (transcriptionError) {
        console.error('语音转文字失败:', transcriptionError)
        
        let errorMessage = '语音转文字失败，请重试'
        if (transcriptionError instanceof Error) {
          if (transcriptionError.message.includes('超时')) {
            errorMessage = '语音转文字超时，请检查网络连接后重试'
          } else if (transcriptionError.message.includes('网络')) {
            errorMessage = '网络连接失败，请检查网络后重试'
          } else if (transcriptionError.message.includes('API')) {
            errorMessage = '语音服务暂时不可用，请稍后重试'
          }
        }
        
        Alert.alert('语音转文字失败', errorMessage, [
          { 
            text: '重试', 
            style: 'default',
            onPress: () => {
              // 自动重试，但只重试一次
              setTimeout(() => {
                if (!isTranscribing) {
                  stopVoiceRecording()
                }
              }, 1000)
            }
          },
          { text: '取消', style: 'cancel' }
        ])
      }

    } catch (error) {
      console.error('停止录音失败:', error)
      Alert.alert('录音失败', '处理录音时出错，请重试', [
        { text: '重试', style: 'default' },
        { text: '取消', style: 'cancel' }
      ])
    } finally {
      await cleanupProcessing()
    }
  }



  // 创建语音按钮的手势响应器
  const voiceButtonResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => false,
    
    onPanResponderGrant: async () => {
      if (!disabled && !voiceRecorderRef.current.state.isRecording && !isTranscribing && !voiceRecorderRef.current.state.isLoading) {
        // 如果有错误状态，先清除
        if (recordingError) {
          setRecordingError(null)
        }
        
        try {
          await startVoiceRecording()
        } catch (error) {
          console.error('开始录音失败:', error)
        }
      }
    },
    
    onPanResponderRelease: async () => {
      if (voiceRecorderRef.current.state.isRecording) {
        try {
          await stopVoiceRecording()
        } catch (error) {
          console.error('停止录音失败:', error)
        }
      }
    },
    
    onPanResponderTerminate: async () => {
      if (voiceRecorderRef.current.state.isRecording) {
        try {
          await stopVoiceRecording(true) // 取消录音
        } catch (error) {
          console.error('取消录音失败:', error)
        }
      }
    }
  }), [disabled, isTranscribing, recordingError])

  const canSend = message.trim().length > 0 && !disabled
  const isVoiceDisabled = useMemo(() => {
    return disabled || 
           voiceRecorderRef.current.state.isRecording || 
           isTranscribing || 
           voiceRecorderRef.current.state.isLoading || 
           recordingError
  }, [disabled, isTranscribing, recordingError])

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, { minHeight: 60, maxHeight: 220 }]}>
        {/* Input background with glassmorphism effect */}
        <View style={styles.inputBackground}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
            style={styles.inputGradient}
          />
          
          <TextInput
            ref={inputRef}
            style={[styles.textInput, { minHeight: 40, maxHeight: 200 }]}
            value={message}
            onChangeText={setMessage}
            placeholder={placeholder}
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            multiline
            textAlignVertical="top" // 改为top对齐，提供更好的多行文本体验
            maxLength={maxLength}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onContentSizeChange={handleContentSizeChange}
            scrollEnabled={false} // 禁用滚动，让文本自动换行
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
            editable={!disabled}
            // 添加以下属性以改善多行文本体验
            autoCapitalize="sentences"
            autoCorrect={true}
            spellCheck={true}
          />
        </View>

        {/* Send button */}
        <Animated.View style={[styles.sendButtonContainer, { transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                opacity: canSend ? 1 : 0.5,
                backgroundColor: canSend ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)',
              }
            ]}
            onPress={handleSend}
            disabled={!canSend}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={canSend ? ['#FF6B3D', '#FF8F65'] : ['rgba(255, 107, 61, 0.5)', 'rgba(255, 143, 101, 0.5)']}
              style={styles.sendButtonGradient}
            >
              <Ionicons
                name="arrow-up"
                size={20}
                color={canSend ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)'}
                style={styles.sendIcon}
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

              {/* Voice input button with long press */}
      <Animated.View 
        style={[
          styles.voiceButton,
          {
            transform: [{ scale: voiceButtonScale }],
            opacity: voiceButtonOpacity,
          }
        ]}
        {...(!isVoiceDisabled ? voiceButtonResponder.panHandlers : {})}
      >
        <LinearGradient
          colors={
            voiceRecorderRef.current.state.isRecording 
              ? ['rgba(255, 59, 48, 0.9)', 'rgba(255, 69, 58, 0.7)']
              : isTranscribing
              ? ['rgba(255, 204, 0, 0.9)', 'rgba(255, 214, 10, 0.7)']
              : voiceRecorderRef.current.state.isLoading
              ? ['rgba(100, 100, 100, 0.8)', 'rgba(120, 120, 120, 0.6)']
              : recordingError
              ? ['rgba(255, 59, 48, 0.8)', 'rgba(255, 69, 58, 0.6)']
              : ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.15)']
          }
          style={styles.voiceButtonGradient}
        >
          {isTranscribing ? (
            <Ionicons
              name="hourglass"
              size={24}
              color="rgba(255, 255, 255, 0.9)"
            />
          ) : voiceRecorderRef.current.state.isLoading ? (
            <Ionicons
              name="refresh"
              size={24}
              color="rgba(255, 255, 255, 0.9)"
            />
          ) : recordingError ? (
            <Ionicons
              name="warning"
              size={24}
              color="rgba(255, 255, 255, 0.9)"
            />
          ) : (
            <Ionicons
              name={voiceRecorderRef.current.state.isRecording ? "stop" : "mic"}
              size={24}
              color="rgba(255, 255, 255, 0.9)"
            />
          )}
        </LinearGradient>
        

      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginRight: 12,
    justifyContent: 'flex-end', // 确保内容对齐到底部
  },
  inputBackground: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  textInput: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '400',
    textAlignVertical: 'top', // 改为top对齐，提供更好的多行文本体验
    lineHeight: 22, // 添加行高以改善多行文本的可读性
  },
  sendButtonContainer: {
    marginLeft: 8,
    marginBottom: 2,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    marginTop: -1, // Fine-tune icon alignment
  },
  voiceButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: -4,
  },
  voiceButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
  },
  transcribingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
})