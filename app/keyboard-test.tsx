import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Keyboard,
  Platform,
} from 'react-native'

export default function KeyboardTest() {
  const [text, setText] = useState('')
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  React.useEffect(() => {
    const keyboardWillShow = Keyboard.addListener('keyboardWillShow', (e) => {
      console.log('Keyboard will show:', e.endCoordinates.height)
      setKeyboardHeight(e.endCoordinates.height)
    })

    const keyboardWillHide = Keyboard.addListener('keyboardWillHide', () => {
      console.log('Keyboard will hide')
      setKeyboardHeight(0)
    })

    return () => {
      keyboardWillShow.remove()
      keyboardWillHide.remove()
    }
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>键盘测试</Text>
        <Text style={styles.subtitle}>键盘高度: {keyboardHeight}px</Text>
        
        <View style={styles.spacer} />
        
        <Text style={styles.label}>测试输入框:</Text>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="在这里输入文字..."
          multiline
        />
      </View>
      
      {/* 输入框 - 使用绝对定位 */}
      <View style={[
        styles.inputContainer,
        { 
          bottom: keyboardHeight,
          paddingBottom: keyboardHeight > 0 ? 0 : Platform.OS === 'ios' ? 20 : 16
        }
      ]}>
        <TextInput
          style={styles.chatInput}
          placeholder="聊天输入框..."
          multiline
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  spacer: {
    height: 200,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    minHeight: 100,
  },
  inputContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  chatInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    minHeight: 40,
  },
})
