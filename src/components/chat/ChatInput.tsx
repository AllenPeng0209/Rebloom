import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useRef, useState } from 'react'
import {
  Alert,
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder'
import { processVoiceToChat } from '../../lib/bailian_omni'

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
      inputRef.current?.blur()
    }
  }

  const handleContentSizeChange = (event: any) => {
    const { height } = event.nativeEvent.contentSize
    const newHeight = Math.min(Math.max(height, 40), 120) // Min 40, Max 120
    setInputHeight(newHeight)
    onHeightChange?.(newHeight + 20) // Add padding
  }

  // 开始录音
  const startVoiceRecording = async () => {
    try {
      // 震动反馈
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      }

      // 按钮动画
      Animated.parallel([
        Animated.timing(voiceButtonScale, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(voiceButtonOpacity, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start()

      // 使用新的 hook 开始录音
      await voiceRecorder.startRecording()

    } catch (error) {
      console.error('开始录音失败:', error)
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      
      Alert.alert(
        '录音功能暂不可用', 
        errorMessage,
        [{ text: '知道了', style: 'default' }]
      )
      
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
        await voiceRecorder.clearRecording()
        return
      }

      // 录音时长太短
      if (voiceRecorder.state.duration < 500) {
        Alert.alert('录音时间太短', '请长按录音至少0.5秒')
        await voiceRecorder.clearRecording()
        return
      }

      // 停止录音并获取base64数据
      const base64Data = await voiceRecorder.stopRecording()
      if (!base64Data) {
        throw new Error('录音失败')
      }

      // 开始语音转对话处理
      setIsTranscribing(true)
      
      try {
        // 使用新的语音转对话功能，直接获取AI回复
        const chatResult = await processVoiceToChat(base64Data, (progress) => {
          console.log('处理进度:', progress)
        })

        if (chatResult.transcribedText.trim()) {
          // 发送用户的语音识别结果
          onSend(chatResult.transcribedText.trim())
          
          // 如果有AI回复，也发送AI的回复
          if (chatResult.aiResponse.trim()) {
            // 延迟一下让用户消息先显示
            setTimeout(() => {
              // 这里需要修改onSend函数来支持AI消息类型
              onSend(chatResult.aiResponse.trim())
            }, 500)
          }
        } else {
          Alert.alert('语音识别失败', '未能识别到语音内容，请重试')
        }
      } catch (transcriptionError) {
        console.error('语音转对话失败:', transcriptionError)
        Alert.alert('语音处理失败', '语音处理失败，请重试')
      }

    } catch (error) {
      console.error('停止录音失败:', error)
      Alert.alert('录音失败', '处理录音时出错')
    } finally {
      setIsTranscribing(false)
      // 清理录音数据
      await voiceRecorder.clearRecording()
    }
  }



  // 创建语音按钮的手势响应器
  const voiceButtonResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => false,
    
    onPanResponderGrant: async () => {
      if (!disabled && !voiceRecorder.state.isRecording && !isTranscribing && !voiceRecorder.state.isLoading) {
        startVoiceRecording()
      }
    },
    
    onPanResponderRelease: () => {
      if (voiceRecorder.state.isRecording) {
        stopVoiceRecording()
      }
    },
    
    onPanResponderTerminate: () => {
      if (voiceRecorder.state.isRecording) {
        stopVoiceRecording(true) // 取消录音
      }
    }
  })

  const canSend = message.trim().length > 0 && !disabled
  const isVoiceDisabled = disabled || voiceRecorder.state.isRecording || isTranscribing || voiceRecorder.state.isLoading

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, { height: inputHeight + 20 }]}>
        {/* Input background with glassmorphism effect */}
        <View style={styles.inputBackground}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
            style={styles.inputGradient}
          />
          
          <TextInput
            ref={inputRef}
            style={[styles.textInput, { height: inputHeight }]}
            value={message}
            onChangeText={setMessage}
            placeholder={placeholder}
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            multiline
            textAlignVertical="center"
            maxLength={maxLength}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onContentSizeChange={handleContentSizeChange}
            scrollEnabled={inputHeight >= 120}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
            editable={!disabled}
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
            voiceRecorder.state.isRecording 
              ? ['rgba(255, 59, 48, 0.8)', 'rgba(255, 69, 58, 0.6)']
              : isTranscribing
              ? ['rgba(255, 204, 0, 0.8)', 'rgba(255, 214, 10, 0.6)']
              : voiceRecorder.state.isLoading
              ? ['rgba(100, 100, 100, 0.8)', 'rgba(120, 120, 120, 0.6)']
              : ['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']
          }
          style={styles.voiceButtonGradient}
        >
          {isTranscribing ? (
            <Ionicons
              name="hourglass"
              size={24}
              color="rgba(255, 255, 255, 0.9)"
            />
          ) : voiceRecorder.state.isLoading ? (
            <Ionicons
              name="refresh"
              size={24}
              color="rgba(255, 255, 255, 0.9)"
            />
          ) : (
            <Ionicons
              name={voiceRecorder.state.isRecording ? "stop" : "mic"}
              size={24}
              color="rgba(255, 255, 255, 0.9)"
            />
          )}
        </LinearGradient>
        
        {/* Recording duration indicator */}
        {voiceRecorder.state.isRecording && (
          <View style={styles.recordingIndicator}>
            <Text style={styles.recordingText}>
              {voiceRecorder.formatDuration()}
            </Text>
          </View>
        )}
        
        {/* Transcribing indicator */}
        {isTranscribing && (
          <View style={styles.transcribingIndicator}>
            <Text style={styles.transcribingText}>
              转录中...
            </Text>
          </View>
        )}
        
        {/* Loading indicator */}
        {voiceRecorder.state.isLoading && !isTranscribing && (
          <View style={styles.transcribingIndicator}>
            <Text style={styles.transcribingText}>
              准备中...
            </Text>
          </View>
        )}
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
    textAlignVertical: 'center',
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
  recordingIndicator: {
    position: 'absolute',
    top: -30,
    left: '50%',
    marginLeft: -25,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  recordingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  transcribingIndicator: {
    position: 'absolute',
    top: -35,
    left: '50%',
    marginLeft: -35,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    minWidth: 70,
    alignItems: 'center',
  },
  transcribingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
})