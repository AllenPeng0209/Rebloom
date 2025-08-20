import { useLanguage } from '@/contexts/LanguageContext'
import { trackService, type TrackDetail } from '@/services/trackService'
import { Ionicons } from '@expo/vector-icons'
import { Audio } from 'expo-av'
import * as Haptics from 'expo-haptics'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import {
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default function PlayerScreen() {
  const { trackId } = useLocalSearchParams<{ trackId: string }>()
  const router = useRouter()
  const { t } = useLanguage()
  
  const [track, setTrack] = useState<TrackDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [sound, setSound] = useState<Audio.Sound | null>(null)
  const [playbackRate, setPlaybackRate] = useState(1.0)
  
  const positionRef = useRef(0)

  useEffect(() => {
    if (trackId) {
      loadTrack(String(trackId))
    }
    
    return () => {
      if (sound) {
        sound.unloadAsync()
      }
    }
  }, [trackId])

  const loadTrack = async (id: string) => {
    try {
      setIsLoading(true)
      const trackDetail = await trackService.getTrackDetail(id)
      if (trackDetail) {
        setTrack(trackDetail)
        // 自動開始播放第一個音檔
        if (trackDetail.audio.length > 0 && trackDetail.audio[0].files.length > 0) {
          const audioUrl = trackDetail.audio[0].files[0].path
          await setupAudio(audioUrl)
        }
      }
    } catch (error) {
      console.error('Failed to load track:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const setupAudio = async (audioUrl: string) => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      })

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false, isLooping: false, rate: playbackRate },
        onPlaybackStatusUpdate
      )
      
      setSound(newSound)
    } catch (error) {
      console.error('Failed to setup audio:', error)
    }
  }

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis || 0)
      setDuration(status.durationMillis || 0)
      setIsPlaying(status.isPlaying || false)
      positionRef.current = status.positionMillis || 0
    }
  }

  const togglePlayPause = async () => {
    if (!sound) return
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    
    try {
      if (isPlaying) {
        await sound.pauseAsync()
      } else {
        await sound.playAsync()
      }
    } catch (error) {
      console.error('Failed to toggle play/pause:', error)
    }
  }

  const seek = async (seconds: number) => {
    if (!sound) return
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    
    try {
      const newPosition = Math.max(0, Math.min(duration, positionRef.current + seconds * 1000))
      await sound.setPositionAsync(newPosition)
    } catch (error) {
      console.error('Failed to seek:', error)
    }
  }

  const changePlaybackRate = async () => {
    if (!sound) return
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    
    const rates = [0.75, 1.0, 1.25, 1.5]
    const currentIndex = rates.indexOf(playbackRate)
    const nextRate = rates[(currentIndex + 1) % rates.length]
    
    try {
      await sound.setRateAsync(nextRate, true)
      setPlaybackRate(nextRate)
    } catch (error) {
      console.error('Failed to change playback rate:', error)
    }
  }

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration > 0 ? (position / duration) * 100 : 0

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>載入中...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!track) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>無法載入音軌</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>播放器</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Cover Image */}
      <View style={styles.coverContainer}>
        <Image
          source={{ uri: track.coverUrl || 'https://via.placeholder.com/300x300?text=Medito' }}
          style={styles.coverImage}
          contentFit="cover"
        />
      </View>

      {/* Track Info */}
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle}>{track.title}</Text>
        {track.subtitle && <Text style={styles.trackSubtitle}>{track.subtitle}</Text>}
        {track.artist && <Text style={styles.artistName}>{track.artist.name}</Text>}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => seek(-15)} style={styles.controlButton}>
          <Ionicons name="play-back" size={24} color="#fff" />
          <Text style={styles.seekText}>15s</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={36} 
            color="#fff" 
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => seek(15)} style={styles.controlButton}>
          <Ionicons name="play-forward" size={24} color="#fff" />
          <Text style={styles.seekText}>15s</Text>
        </TouchableOpacity>
      </View>

      {/* Secondary Controls */}
      <View style={styles.secondaryControls}>
        <TouchableOpacity onPress={changePlaybackRate} style={styles.rateButton}>
          <Text style={styles.rateText}>{playbackRate}x</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 44,
  },
  coverContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  coverImage: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    borderRadius: 12,
  },
  trackInfo: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  trackTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  trackSubtitle: {
    color: '#bbb',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  artistName: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  progressContainer: {
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: '#888',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 30,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  seekText: {
    color: '#888',
    fontSize: 10,
    marginTop: 4,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#333',
    borderRadius: 20,
  },
  rateText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
})
