import { act, fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { ChatInput } from '../../../src/components/chat/ChatInput'

// Mock the voice recorder hook
jest.mock('../../../src/hooks/useVoiceRecorder', () => ({
  useVoiceRecorder: () => ({
    state: {
      isRecording: false,
      isLoading: false,
      duration: 0,
    },
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
    clearRecording: jest.fn(),
    formatDuration: jest.fn(() => '00:00'),
  }),
}))

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
  },
}))

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}))

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}))

describe('ChatInput', () => {
  const mockOnSend = jest.fn()
  const mockOnHeightChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('应该正确渲染输入框', () => {
    const { getByPlaceholderText } = render(
      <ChatInput onSend={mockOnSend} />
    )

    expect(getByPlaceholderText('Type your message...')).toBeTruthy()
  })

  it('应该支持多行文本输入', () => {
    const { getByPlaceholderText } = render(
      <ChatInput onSend={mockOnSend} onHeightChange={mockOnHeightChange} />
    )

    const input = getByPlaceholderText('Type your message...')
    
    // 输入多行文本
    const longText = '这是第一行文本\n这是第二行文本\n这是第三行文本\n这是第四行文本\n这是第五行文本'
    
    act(() => {
      fireEvent.changeText(input, longText)
    })

    // 验证输入框内容
    expect(input.props.value).toBe(longText)
  })

  it('应该在输入多行文本时调整高度', () => {
    const { getByPlaceholderText } = render(
      <ChatInput onSend={mockOnSend} onHeightChange={mockOnHeightChange} />
    )

    const input = getByPlaceholderText('Type your message...')
    
    // 模拟内容大小变化事件
    act(() => {
      fireEvent(input, 'contentSizeChange', {
        nativeEvent: {
          contentSize: { width: 200, height: 150 }
        }
      })
    })

    // 验证高度变化回调被调用
    expect(mockOnHeightChange).toHaveBeenCalledWith(170) // 150 + 20 padding
  })

  it('应该限制最大高度为200px', () => {
    const { getByPlaceholderText } = render(
      <ChatInput onSend={mockOnSend} onHeightChange={mockOnHeightChange} />
    )

    const input = getByPlaceholderText('Type your message...')
    
    // 模拟超过最大高度的内容大小变化事件
    act(() => {
      fireEvent(input, 'contentSizeChange', {
        nativeEvent: {
          contentSize: { width: 200, height: 300 }
        }
      })
    })

    // 验证高度被限制在200px
    expect(mockOnHeightChange).toHaveBeenCalledWith(220) // 200 + 20 padding
  })

  it('应该禁用滚动以支持自动换行', () => {
    const { getByPlaceholderText } = render(
      <ChatInput onSend={mockOnSend} onHeightChange={mockOnHeightChange} />
    )

    const input = getByPlaceholderText('Type your message...')
    
    // 验证滚动被禁用，以支持自动换行
    expect(input.props.scrollEnabled).toBe(false)
  })

  it('应该正确发送消息', () => {
    const { getByPlaceholderText } = render(
      <ChatInput onSend={mockOnSend} />
    )

    const input = getByPlaceholderText('Type your message...')
    
    // 输入文本
    act(() => {
      fireEvent.changeText(input, '测试消息')
    })

    // 模拟提交
    act(() => {
      fireEvent(input, 'submitEditing')
    })

    // 验证发送回调被调用
    expect(mockOnSend).toHaveBeenCalledWith('测试消息')
  })

  it('应该清空输入框并重置高度在发送后', () => {
    const { getByPlaceholderText } = render(
      <ChatInput onSend={mockOnSend} onHeightChange={mockOnHeightChange} />
    )

    const input = getByPlaceholderText('Type your message...')
    
    // 输入文本并改变高度
    act(() => {
      fireEvent.changeText(input, '测试消息')
      fireEvent(input, 'contentSizeChange', {
        nativeEvent: {
          contentSize: { width: 200, height: 100 }
        }
      })
    })

    // 发送消息
    act(() => {
      fireEvent(input, 'submitEditing')
    })

    // 验证输入框被清空
    expect(input.props.value).toBe('')
    
    // 验证高度被重置
    expect(mockOnHeightChange).toHaveBeenCalledWith(60) // 40 + 20 padding
  })

  it('应该随着输入内容向上扩大', () => {
    const { getByPlaceholderText } = render(
      <ChatInput onSend={mockOnSend} onHeightChange={mockOnHeightChange} />
    )

    const input = getByPlaceholderText('Type your message...')
    
    // 输入多行文本
    act(() => {
      fireEvent.changeText(input, '第一行\n第二行\n第三行')
      fireEvent(input, 'contentSizeChange', {
        nativeEvent: {
          contentSize: { width: 200, height: 80 }
        }
      })
    })

    // 验证高度变化被通知
    expect(mockOnHeightChange).toHaveBeenCalledWith(100) // 80 + 20 padding
  })
})
