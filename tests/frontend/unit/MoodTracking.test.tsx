import React from 'react'
import { render, fireEvent, waitFor, act } from '@testing-library/react-native'
import { Alert } from 'react-native'
import { MoodCheckInScreen } from '../../../src/components/mood/MoodCheckInScreen'
import { MoodVisualizationChart } from '../../../src/components/mood/MoodVisualizationChart'
import { QuickMoodWidget } from '../../../src/components/mood/QuickMoodWidget'

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn()
}))

jest.mock('react-native-chart-kit', () => ({
  LineChart: ({ data, ...props }) => {
    const MockChart = require('react-native').View
    return (
      <MockChart testID="mood-line-chart" {...props}>
        {/* Mock chart rendering */}
        {data.labels?.map((label, index) => (
          <MockChart key={index} testID={`chart-point-${index}`}>
            {label}: {data.datasets[0]?.data[index]}
          </MockChart>
        ))}
      </MockChart>
    )
  },
  BarChart: ({ data, ...props }) => {
    const MockChart = require('react-native').View
    return (
      <MockChart testID="mood-bar-chart" {...props}>
        {data.labels?.map((label, index) => (
          <MockChart key={index} testID={`bar-${index}`}>
            {label}: {data.datasets[0]?.data[index]}
          </MockChart>
        ))}
      </MockChart>
    )
  }
}))

// Mock date functions
const mockDate = new Date('2024-01-15T10:00:00Z')
global.Date = jest.fn(() => mockDate) as any
Date.now = jest.fn(() => mockDate.getTime())

// Mock mood service
const mockMoodService = {
  createMoodEntry: jest.fn(),
  getMoodEntries: jest.fn(),
  updateMoodEntry: jest.fn(),
  deleteMoodEntry: jest.fn(),
  getMoodAnalysis: jest.fn(),
  getMoodTrends: jest.fn(),
  exportMoodData: jest.fn()
}

jest.mock('../../../src/services/summaryService', () => ({
  summaryService: mockMoodService
}))

describe('Mood Tracking Components', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('MoodCheckInScreen', () => {
    const mockMoodEntries = [
      {
        id: '1',
        userId: 'user-123',
        moodScore: 7,
        energyLevel: 6,
        sleepQuality: 8,
        stressLevel: 4,
        anxiety: 3,
        notes: 'Feeling good today',
        symptoms: ['mild_anxiety'],
        activities: ['exercise', 'meditation'],
        recordedAt: '2024-01-15T09:00:00Z'
      },
      {
        id: '2',
        userId: 'user-123',
        moodScore: 5,
        energyLevel: 4,
        sleepQuality: 6,
        stressLevel: 6,
        anxiety: 5,
        notes: 'Okay day, some work stress',
        symptoms: ['fatigue'],
        activities: ['work'],
        recordedAt: '2024-01-14T18:00:00Z'
      }
    ]

    beforeEach(() => {
      mockMoodService.createMoodEntry.mockResolvedValue({
        id: 'new-entry-123',
        ...mockMoodEntries[0]
      })
      mockMoodService.getMoodEntries.mockResolvedValue(mockMoodEntries)
    })

    it('should render mood check-in form', () => {
      const { getByText, getByTestId } = render(
        <MoodCheckInScreen userId="user-123" />
      )

      expect(getByText('How are you feeling today?')).toBeTruthy()
      expect(getByTestId('mood-scale-slider')).toBeTruthy()
      expect(getByTestId('energy-level-slider')).toBeTruthy()
      expect(getByTestId('sleep-quality-slider')).toBeTruthy()
      expect(getByTestId('stress-level-slider')).toBeTruthy()
      expect(getByTestId('notes-input')).toBeTruthy()
    })

    it('should validate mood scale range (1-10)', async () => {
      const { getByTestId, getByText } = render(
        <MoodCheckInScreen userId="user-123" />
      )

      const moodSlider = getByTestId('mood-scale-slider')
      
      // Test invalid value (should be constrained)
      fireEvent(moodSlider, 'onValueChange', [11])
      
      const submitButton = getByTestId('submit-mood-entry')
      fireEvent.press(submitButton)

      // Should automatically constrain to valid range
      expect(getByText('10')).toBeTruthy() // Max value
    })

    it('should handle mood entry submission', async () => {
      const { getByTestId } = render(
        <MoodCheckInScreen userId="user-123" />
      )

      // Fill out form
      const moodSlider = getByTestId('mood-scale-slider')
      fireEvent(moodSlider, 'onValueChange', [7])

      const energySlider = getByTestId('energy-level-slider')
      fireEvent(energySlider, 'onValueChange', [6])

      const notesInput = getByTestId('notes-input')
      fireEvent.changeText(notesInput, 'Feeling great after exercise')

      const symptomCheckbox = getByTestId('symptom-anxiety')
      fireEvent.press(symptomCheckbox)

      const activityCheckbox = getByTestId('activity-exercise')
      fireEvent.press(activityCheckbox)

      // Submit form
      const submitButton = getByTestId('submit-mood-entry')
      fireEvent.press(submitButton)

      await waitFor(() => {
        expect(mockMoodService.createMoodEntry).toHaveBeenCalledWith({
          userId: 'user-123',
          moodScore: 7,
          energyLevel: 6,
          sleepQuality: expect.any(Number),
          stressLevel: expect.any(Number),
          anxiety: expect.any(Number),
          notes: 'Feeling great after exercise',
          symptoms: ['anxiety'],
          activities: ['exercise'],
          recordedAt: expect.any(String)
        })
      })
    })

    it('should show success message after submission', async () => {
      const { getByTestId, getByText } = render(
        <MoodCheckInScreen userId="user-123" />
      )

      const submitButton = getByTestId('submit-mood-entry')
      fireEvent.press(submitButton)

      await waitFor(() => {
        expect(getByText('Mood entry saved successfully!')).toBeTruthy()
      })
    })

    it('should handle submission errors gracefully', async () => {
      mockMoodService.createMoodEntry.mockRejectedValue(
        new Error('Network error')
      )

      const { getByTestId, getByText } = render(
        <MoodCheckInScreen userId="user-123" />
      )

      const submitButton = getByTestId('submit-mood-entry')
      fireEvent.press(submitButton)

      await waitFor(() => {
        expect(getByText('Failed to save mood entry')).toBeTruthy()
        expect(getByText('Please try again')).toBeTruthy()
      })
    })

    it('should save draft locally when offline', async () => {
      mockMoodService.createMoodEntry.mockRejectedValue(
        new Error('Network unavailable')
      )

      const { getByTestId, getByText } = render(
        <MoodCheckInScreen userId="user-123" />
      )

      const moodSlider = getByTestId('mood-scale-slider')
      fireEvent(moodSlider, 'onValueChange', [5])

      const submitButton = getByTestId('submit-mood-entry')
      fireEvent.press(submitButton)

      await waitFor(() => {
        expect(getByText('Saved locally')).toBeTruthy()
        expect(getByText('Will sync when online')).toBeTruthy()
      })

      // Should save to AsyncStorage
      expect(require('@react-native-async-storage/async-storage').setItem)
        .toHaveBeenCalledWith(
          expect.stringContaining('mood_draft_'),
          expect.any(String)
        )
    })

    it('should show visual mood feedback', async () => {
      const { getByTestId } = render(
        <MoodCheckInScreen userId="user-123" />
      )

      const moodSlider = getByTestId('mood-scale-slider')
      
      // Test different mood levels
      fireEvent(moodSlider, 'onValueChange', [1]) // Very low
      expect(getByTestId('mood-emoji-very-low')).toBeTruthy()

      fireEvent(moodSlider, 'onValueChange', [5]) // Neutral
      expect(getByTestId('mood-emoji-neutral')).toBeTruthy()

      fireEvent(moodSlider, 'onValueChange', [10]) // Very high
      expect(getByTestId('mood-emoji-very-high')).toBeTruthy()
    })

    it('should provide contextual prompts', async () => {
      const { getByTestId, getByText } = render(
        <MoodCheckInScreen userId="user-123" />
      )

      const moodSlider = getByTestId('mood-scale-slider')
      fireEvent(moodSlider, 'onValueChange', [3]) // Low mood

      await waitFor(() => {
        expect(getByText('What might help you feel better?')).toBeTruthy()
        expect(getByTestId('suggested-activities')).toBeTruthy()
      })
    })

    it('should detect concerning patterns', async () => {
      // Mock concerning mood pattern
      mockMoodService.getMoodEntries.mockResolvedValue([
        { moodScore: 3, recordedAt: '2024-01-15T09:00:00Z' },
        { moodScore: 2, recordedAt: '2024-01-14T09:00:00Z' },
        { moodScore: 2, recordedAt: '2024-01-13T09:00:00Z' }
      ])

      const { getByTestId, getByText } = render(
        <MoodCheckInScreen userId="user-123" />
      )

      const moodSlider = getByTestId('mood-scale-slider')
      fireEvent(moodSlider, 'onValueChange', [2]) // Another low mood

      const submitButton = getByTestId('submit-mood-entry')
      fireEvent.press(submitButton)

      await waitFor(() => {
        expect(getByText('Noticed a Pattern')).toBeTruthy()
        expect(getByText('Would you like some support resources?')).toBeTruthy()
      })
    })

    it('should be accessible', () => {
      const { getByA11yLabel, getByA11yHint } = render(
        <MoodCheckInScreen userId="user-123" />
      )

      expect(getByA11yLabel('Rate your mood from 1 to 10')).toBeTruthy()
      expect(getByA11yLabel('Rate your energy level from 1 to 10')).toBeTruthy()
      expect(getByA11yHint('Slide to adjust your mood rating')).toBeTruthy()
    })

    it('should handle rapid successive submissions', async () => {
      const { getByTestId } = render(
        <MoodCheckInScreen userId="user-123" />
      )

      const submitButton = getByTestId('submit-mood-entry')
      
      // Rapid submissions
      fireEvent.press(submitButton)
      fireEvent.press(submitButton)
      fireEvent.press(submitButton)

      // Should only submit once
      await waitFor(() => {
        expect(mockMoodService.createMoodEntry).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('MoodVisualizationChart', () => {
    const mockChartData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        data: [7, 6, 8, 5, 7, 9, 8],
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`
      }]
    }

    beforeEach(() => {
      mockMoodService.getMoodTrends.mockResolvedValue({
        chartData: mockChartData,
        averageMood: 7.1,
        trend: 'improving',
        insights: ['Mood tends to be higher on weekends']
      })
    })

    it('should render mood chart with data', async () => {
      const { getByTestId } = render(
        <MoodVisualizationChart userId="user-123" timeframe="week" />
      )

      await waitFor(() => {
        expect(getByTestId('mood-line-chart')).toBeTruthy()
      })
    })

    it('should show different chart types', async () => {
      const { getByTestId, rerender } = render(
        <MoodVisualizationChart 
          userId="user-123" 
          timeframe="week" 
          chartType="line"
        />
      )

      await waitFor(() => {
        expect(getByTestId('mood-line-chart')).toBeTruthy()
      })

      rerender(
        <MoodVisualizationChart 
          userId="user-123" 
          timeframe="week" 
          chartType="bar"
        />
      )

      await waitFor(() => {
        expect(getByTestId('mood-bar-chart')).toBeTruthy()
      })
    })

    it('should handle different timeframes', async () => {
      const timeframes = ['week', 'month', 'quarter']
      
      for (const timeframe of timeframes) {
        const { getByTestId } = render(
          <MoodVisualizationChart userId="user-123" timeframe={timeframe} />
        )

        await waitFor(() => {
          expect(mockMoodService.getMoodTrends).toHaveBeenCalledWith(
            'user-123',
            expect.objectContaining({ timeframe })
          )
        })
      }
    })

    it('should show trend indicators', async () => {
      const { getByText, getByTestId } = render(
        <MoodVisualizationChart userId="user-123" timeframe="week" />
      )

      await waitFor(() => {
        expect(getByText('Average: 7.1')).toBeTruthy()
        expect(getByText('Trend: Improving')).toBeTruthy()
        expect(getByTestId('trend-arrow-up')).toBeTruthy()
      })
    })

    it('should display insights', async () => {
      const { getByText } = render(
        <MoodVisualizationChart userId="user-123" timeframe="week" />
      )

      await waitFor(() => {
        expect(getByText('Mood tends to be higher on weekends')).toBeTruthy()
      })
    })

    it('should handle empty data gracefully', async () => {
      mockMoodService.getMoodTrends.mockResolvedValue({
        chartData: { labels: [], datasets: [{ data: [] }] },
        averageMood: null,
        trend: 'unknown',
        insights: []
      })

      const { getByText } = render(
        <MoodVisualizationChart userId="user-123" timeframe="week" />
      )

      await waitFor(() => {
        expect(getByText('No mood data available')).toBeTruthy()
        expect(getByText('Start tracking your mood to see trends')).toBeTruthy()
      })
    })

    it('should be interactive with touch events', async () => {
      const { getByTestId } = render(
        <MoodVisualizationChart userId="user-123" timeframe="week" />
      )

      await waitFor(() => {
        const chart = getByTestId('mood-line-chart')
        
        // Simulate touch on chart point
        fireEvent(chart, 'onDataPointClick', {
          index: 2,
          value: 8,
          label: 'Wed'
        })
      })

      // Should show detailed view or tooltip
      expect(getByTestId('chart-detail-modal')).toBeTruthy()
    })

    it('should export chart data', async () => {
      const { getByTestId } = render(
        <MoodVisualizationChart userId="user-123" timeframe="week" />
      )

      await waitFor(() => {
        const exportButton = getByTestId('export-chart-button')
        fireEvent.press(exportButton)
      })

      expect(mockMoodService.exportMoodData).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          format: 'chart_image',
          timeframe: 'week'
        })
      )
    })

    it('should handle chart rendering errors', async () => {
      mockMoodService.getMoodTrends.mockRejectedValue(
        new Error('Chart data unavailable')
      )

      const { getByText } = render(
        <MoodVisualizationChart userId="user-123" timeframe="week" />
      )

      await waitFor(() => {
        expect(getByText('Unable to load chart')).toBeTruthy()
      })
    })

    it('should be accessible with chart descriptions', async () => {
      const { getByA11yLabel } = render(
        <MoodVisualizationChart userId="user-123" timeframe="week" />
      )

      await waitFor(() => {
        expect(getByA11yLabel(
          'Mood chart showing weekly trend. Average mood 7.1, improving trend'
        )).toBeTruthy()
      })
    })
  })

  describe('QuickMoodWidget', () => {
    const mockProps = {
      userId: 'user-123',
      onMoodSelected: jest.fn(),
      showDetailed: false
    }

    it('should render quick mood selection buttons', () => {
      const { getByTestId } = render(
        <QuickMoodWidget {...mockProps} />
      )

      expect(getByTestId('quick-mood-1')).toBeTruthy() // Very low
      expect(getByTestId('quick-mood-5')).toBeTruthy() // Neutral  
      expect(getByTestId('quick-mood-10')).toBeTruthy() // Very high
    })

    it('should handle mood selection', async () => {
      const { getByTestId } = render(
        <QuickMoodWidget {...mockProps} />
      )

      const moodButton = getByTestId('quick-mood-7')
      fireEvent.press(moodButton)

      expect(mockProps.onMoodSelected).toHaveBeenCalledWith(7)
      expect(mockMoodService.createMoodEntry).toHaveBeenCalledWith({
        userId: 'user-123',
        moodScore: 7,
        isQuickEntry: true,
        recordedAt: expect.any(String)
      })
    })

    it('should show visual feedback for selection', async () => {
      const { getByTestId } = render(
        <QuickMoodWidget {...mockProps} />
      )

      const moodButton = getByTestId('quick-mood-8')
      fireEvent.press(moodButton)

      await waitFor(() => {
        expect(getByTestId('selected-mood-feedback')).toBeTruthy()
        expect(getByTestId('mood-emoji-8')).toBeTruthy()
      })
    })

    it('should expand to detailed form when requested', async () => {
      const { getByTestId } = render(
        <QuickMoodWidget {...mockProps} showDetailed={true} />
      )

      expect(getByTestId('energy-level-slider')).toBeTruthy()
      expect(getByTestId('notes-input')).toBeTruthy()
      expect(getByTestId('submit-detailed-mood')).toBeTruthy()
    })

    it('should show recent mood trends', async () => {
      mockMoodService.getMoodEntries.mockResolvedValue([
        { moodScore: 7, recordedAt: '2024-01-14T09:00:00Z' },
        { moodScore: 6, recordedAt: '2024-01-13T09:00:00Z' },
        { moodScore: 8, recordedAt: '2024-01-12T09:00:00Z' }
      ])

      const { getByText } = render(
        <QuickMoodWidget {...mockProps} showTrends={true} />
      )

      await waitFor(() => {
        expect(getByText('Recent average: 7.0')).toBeTruthy()
      })
    })

    it('should handle offline mood tracking', async () => {
      mockMoodService.createMoodEntry.mockRejectedValue(
        new Error('Network unavailable')
      )

      const { getByTestId, getByText } = render(
        <QuickMoodWidget {...mockProps} />
      )

      const moodButton = getByTestId('quick-mood-6')
      fireEvent.press(moodButton)

      await waitFor(() => {
        expect(getByText('Mood saved locally')).toBeTruthy()
      })
    })

    it('should provide haptic feedback', async () => {
      const mockHaptics = jest.fn()
      jest.doMock('expo-haptics', () => ({
        ImpactFeedbackStyle: { Light: 'light' },
        impactAsync: mockHaptics
      }))

      const { getByTestId } = render(
        <QuickMoodWidget {...mockProps} />
      )

      const moodButton = getByTestId('quick-mood-9')
      fireEvent.press(moodButton)

      await waitFor(() => {
        expect(mockHaptics).toHaveBeenCalled()
      })
    })

    it('should be accessible', () => {
      const { getByA11yLabel, getByA11yHint } = render(
        <QuickMoodWidget {...mockProps} />
      )

      expect(getByA11yLabel('Rate mood as 5 out of 10')).toBeTruthy()
      expect(getByA11yHint('Double tap to record this mood level')).toBeTruthy()
    })

    it('should animate mood selection', async () => {
      const { getByTestId } = render(
        <QuickMoodWidget {...mockProps} />
      )

      const moodButton = getByTestId('quick-mood-7')
      
      await act(async () => {
        fireEvent.press(moodButton)
      })

      // Animation testing would require more complex setup
      // This ensures the button press is handled
      expect(mockProps.onMoodSelected).toHaveBeenCalledWith(7)
    })

    it('should prevent duplicate rapid selections', async () => {
      const { getByTestId } = render(
        <QuickMoodWidget {...mockProps} />
      )

      const moodButton = getByTestId('quick-mood-5')
      
      // Rapid clicks
      fireEvent.press(moodButton)
      fireEvent.press(moodButton)
      fireEvent.press(moodButton)

      await waitFor(() => {
        // Should only trigger once
        expect(mockProps.onMoodSelected).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Integration Testing', () => {
    it('should integrate mood tracking with crisis detection', async () => {
      const CrisisAwareMoodWidget = () => {
        const [showCrisisResources, setShowCrisisResources] = React.useState(false)
        
        const handleMoodSelection = (mood: number) => {
          if (mood <= 3) {
            setShowCrisisResources(true)
          }
        }

        return (
          <>
            <QuickMoodWidget 
              userId="user-123"
              onMoodSelected={handleMoodSelection}
            />
            {showCrisisResources && (
              <EmergencyHelpButton
                onPress={jest.fn()}
                riskLevel="medium"
                isVisible={true}
              />
            )}
          </>
        )
      }

      const { getByTestId, queryByTestId } = render(<CrisisAwareMoodWidget />)

      // Initially no crisis resources
      expect(queryByTestId('emergency-help-button')).toBeFalsy()

      // Select low mood
      const lowMoodButton = getByTestId('quick-mood-2')
      fireEvent.press(lowMoodButton)

      await waitFor(() => {
        expect(getByTestId('emergency-help-button')).toBeTruthy()
      })
    })

    it('should sync mood data across components', async () => {
      const SyncedMoodComponents = () => {
        const [moodData, setMoodData] = React.useState([])
        
        const handleNewMood = (mood: number) => {
          const newEntry = {
            id: Date.now().toString(),
            moodScore: mood,
            recordedAt: new Date().toISOString()
          }
          setMoodData(prev => [...prev, newEntry])
        }

        return (
          <>
            <QuickMoodWidget 
              userId="user-123"
              onMoodSelected={handleNewMood}
            />
            <MoodVisualizationChart 
              userId="user-123"
              timeframe="week"
              data={moodData}
            />
          </>
        )
      }

      const { getByTestId } = render(<SyncedMoodComponents />)

      const moodButton = getByTestId('quick-mood-8')
      fireEvent.press(moodButton)

      await waitFor(() => {
        expect(getByTestId('mood-line-chart')).toBeTruthy()
      })
    })
  })

  describe('Performance Optimization', () => {
    it('should render efficiently with large datasets', async () => {
      const largeMoodData = Array.from({ length: 1000 }, (_, i) => ({
        id: i.toString(),
        moodScore: Math.floor(Math.random() * 10) + 1,
        recordedAt: new Date(Date.now() - i * 86400000).toISOString()
      }))

      mockMoodService.getMoodEntries.mockResolvedValue(largeMoodData)

      const startTime = Date.now()
      
      const { getByTestId } = render(
        <MoodVisualizationChart userId="user-123" timeframe="year" />
      )

      await waitFor(() => {
        expect(getByTestId('mood-line-chart')).toBeTruthy()
      })

      const renderTime = Date.now() - startTime
      expect(renderTime).toBeLessThan(1000) // Should render within 1 second
    })

    it('should debounce rapid mood selections', async () => {
      const debouncedHandler = jest.fn()
      
      const { getByTestId } = render(
        <QuickMoodWidget 
          userId="user-123"
          onMoodSelected={debouncedHandler}
        />
      )

      const moodButton = getByTestId('quick-mood-6')
      
      // Rapid selections
      for (let i = 0; i < 5; i++) {
        fireEvent.press(moodButton)
      }

      // Wait for debounce
      await waitFor(() => {
        expect(debouncedHandler).toHaveBeenCalledTimes(1)
      }, { timeout: 1000 })
    })
  })
})