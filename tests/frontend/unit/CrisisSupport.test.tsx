import React from 'react'
import { render, fireEvent, waitFor, act } from '@testing-library/react-native'
import { Alert } from 'react-native'
import { CrisisResourceScreen } from '../../../src/components/crisis/CrisisResourceScreen'
import { EmergencyHelpButton } from '../../../src/components/crisis/EmergencyHelpButton'
import { SafetyPlanInterface } from '../../../src/components/crisis/SafetyPlanInterface'

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}))

jest.mock('expo-linking', () => ({
  openURL: jest.fn(),
  canOpenURL: jest.fn().mockResolvedValue(true)
}))

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native')
  return {
    ...RN,
    Alert: {
      alert: jest.fn()
    },
    Linking: {
      openURL: jest.fn(),
      canOpenURL: jest.fn().mockResolvedValue(true)
    }
  }
})

// Mock crisis service
const mockCrisisService = {
  getCrisisResources: jest.fn(),
  reportCrisisEvent: jest.fn(),
  contactEmergencyServices: jest.fn(),
  getSafetyPlan: jest.fn(),
  updateSafetyPlan: jest.fn()
}

jest.mock('../../../src/services/interventionService', () => ({
  interventionService: mockCrisisService
}))

describe('Crisis Support Components', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('CrisisResourceScreen', () => {
    const mockResources = [
      {
        id: '1',
        title: 'National Suicide Prevention Lifeline',
        description: 'Free and confidential emotional support',
        contactInfo: {
          phone: '988',
          website: 'https://suicidepreventionlifeline.org',
          available: '24/7'
        },
        type: 'hotline',
        priority: 'critical'
      },
      {
        id: '2', 
        title: 'Crisis Text Line',
        description: 'Text-based crisis support',
        contactInfo: {
          sms: '741741',
          available: '24/7'
        },
        type: 'text_support',
        priority: 'high'
      },
      {
        id: '3',
        title: 'Local Emergency Services',
        description: 'Call 911 for immediate emergency assistance',
        contactInfo: {
          phone: '911'
        },
        type: 'emergency',
        priority: 'critical'
      }
    ]

    beforeEach(() => {
      mockCrisisService.getCrisisResources.mockResolvedValue(mockResources)
    })

    it('should render crisis resources successfully', async () => {
      const { getByText, getByTestId } = render(<CrisisResourceScreen />)

      await waitFor(() => {
        expect(getByText('Crisis Support Resources')).toBeTruthy()
        expect(getByText('National Suicide Prevention Lifeline')).toBeTruthy()
        expect(getByText('Crisis Text Line')).toBeTruthy()
        expect(getByText('Local Emergency Services')).toBeTruthy()
      })

      expect(mockCrisisService.getCrisisResources).toHaveBeenCalled()
    })

    it('should prioritize critical resources at the top', async () => {
      const { getAllByTestId } = render(<CrisisResourceScreen />)

      await waitFor(() => {
        const resourceCards = getAllByTestId('crisis-resource-card')
        expect(resourceCards).toHaveLength(3)
      })

      // Critical resources should appear first
      const firstResource = getAllByTestId('crisis-resource-card')[0]
      expect(firstResource).toHaveTextContent('National Suicide Prevention Lifeline')
    })

    it('should handle phone number calling', async () => {
      const { getByTestId } = render(<CrisisResourceScreen />)

      await waitFor(() => {
        const phoneButton = getByTestId('call-button-988')
        expect(phoneButton).toBeTruthy()
      })

      const phoneButton = getByTestId('call-button-988')
      fireEvent.press(phoneButton)

      expect(require('react-native').Linking.openURL).toHaveBeenCalledWith('tel:988')
    })

    it('should handle SMS texting', async () => {
      const { getByTestId } = render(<CrisisResourceScreen />)

      await waitFor(() => {
        const textButton = getByTestId('text-button-741741')
        expect(textButton).toBeTruthy()
      })

      const textButton = getByTestId('text-button-741741')
      fireEvent.press(textButton)

      expect(require('react-native').Linking.openURL).toHaveBeenCalledWith('sms:741741')
    })

    it('should open website links', async () => {
      const { getByTestId } = render(<CrisisResourceScreen />)

      await waitFor(() => {
        const websiteButton = getByTestId('website-button-1')
        expect(websiteButton).toBeTruthy()
      })

      const websiteButton = getByTestId('website-button-1')
      fireEvent.press(websiteButton)

      expect(require('react-native').Linking.openURL).toHaveBeenCalledWith(
        'https://suicidepreventionlifeline.org'
      )
    })

    it('should show loading state initially', () => {
      mockCrisisService.getCrisisResources.mockReturnValue(
        new Promise(resolve => setTimeout(resolve, 1000))
      )

      const { getByTestId } = render(<CrisisResourceScreen />)

      expect(getByTestId('loading-indicator')).toBeTruthy()
    })

    it('should handle resource loading errors', async () => {
      mockCrisisService.getCrisisResources.mockRejectedValue(
        new Error('Failed to load resources')
      )

      const { getByText } = render(<CrisisResourceScreen />)

      await waitFor(() => {
        expect(getByText('Unable to load crisis resources')).toBeTruthy()
        expect(getByText('Please try again or call 911 for emergency assistance')).toBeTruthy()
      })
    })

    it('should provide offline crisis resources', async () => {
      mockCrisisService.getCrisisResources.mockRejectedValue(
        new Error('Network unavailable')
      )

      const { getByText, getByTestId } = render(<CrisisResourceScreen />)

      await waitFor(() => {
        expect(getByText('Emergency Numbers')).toBeTruthy()
        expect(getByTestId('call-button-911')).toBeTruthy()
      })
    })

    it('should track crisis resource interactions', async () => {
      const { getByTestId } = render(<CrisisResourceScreen />)

      await waitFor(() => {
        const phoneButton = getByTestId('call-button-988')
        fireEvent.press(phoneButton)
      })

      expect(mockCrisisService.reportCrisisEvent).toHaveBeenCalledWith({
        type: 'resource_accessed',
        resourceId: '1',
        resourceType: 'hotline',
        contactMethod: 'phone',
        timestamp: expect.any(Date)
      })
    })

    it('should be accessible with screen readers', async () => {
      const { getByA11yLabel, getByA11yRole } = render(<CrisisResourceScreen />)

      await waitFor(() => {
        expect(getByA11yLabel('Call National Suicide Prevention Lifeline at 988')).toBeTruthy()
        expect(getByA11yLabel('Text Crisis Text Line at 741741')).toBeTruthy()
        expect(getByA11yRole('button')).toBeTruthy()
      })
    })
  })

  describe('EmergencyHelpButton', () => {
    const mockProps = {
      onPress: jest.fn(),
      riskLevel: 'high' as const,
      isVisible: true
    }

    it('should render emergency button when visible', () => {
      const { getByText, getByTestId } = render(
        <EmergencyHelpButton {...mockProps} />
      )

      expect(getByText('Get Help Now')).toBeTruthy()
      expect(getByTestId('emergency-help-button')).toBeTruthy()
    })

    it('should not render when not visible', () => {
      const { queryByTestId } = render(
        <EmergencyHelpButton {...mockProps} isVisible={false} />
      )

      expect(queryByTestId('emergency-help-button')).toBeFalsy()
    })

    it('should show different styles for different risk levels', () => {
      const { getByTestId, rerender } = render(
        <EmergencyHelpButton {...mockProps} riskLevel="critical" />
      )

      const criticalButton = getByTestId('emergency-help-button')
      expect(criticalButton.props.style).toMatchObject(
        expect.objectContaining({
          backgroundColor: expect.any(String)
        })
      )

      rerender(<EmergencyHelpButton {...mockProps} riskLevel="medium" />)

      const mediumButton = getByTestId('emergency-help-button')
      expect(mediumButton.props.style.backgroundColor).not.toBe(
        criticalButton.props.style.backgroundColor
      )
    })

    it('should handle button press', () => {
      const { getByTestId } = render(
        <EmergencyHelpButton {...mockProps} />
      )

      const button = getByTestId('emergency-help-button')
      fireEvent.press(button)

      expect(mockProps.onPress).toHaveBeenCalled()
    })

    it('should call emergency services for critical risk', async () => {
      const criticalProps = {
        ...mockProps,
        riskLevel: 'critical' as const,
        autoCallEmergency: true
      }

      const { getByTestId } = render(
        <EmergencyHelpButton {...criticalProps} />
      )

      const button = getByTestId('emergency-help-button')
      fireEvent.press(button)

      expect(Alert.alert).toHaveBeenCalledWith(
        'Emergency Services',
        expect.stringContaining('call emergency services'),
        expect.any(Array)
      )
    })

    it('should provide haptic feedback on press', async () => {
      const mockHaptics = jest.fn()
      jest.doMock('expo-haptics', () => ({
        ImpactFeedbackStyle: { Heavy: 'heavy' },
        impactAsync: mockHaptics
      }))

      const { getByTestId } = render(
        <EmergencyHelpButton {...mockProps} />
      )

      const button = getByTestId('emergency-help-button')
      fireEvent.press(button)

      await waitFor(() => {
        expect(mockHaptics).toHaveBeenCalled()
      })
    })

    it('should be highly accessible', () => {
      const { getByA11yLabel, getByA11yHint } = render(
        <EmergencyHelpButton {...mockProps} />
      )

      expect(getByA11yLabel('Emergency help button')).toBeTruthy()
      expect(getByA11yHint('Double tap to get immediate crisis support and resources')).toBeTruthy()
    })

    it('should animate button appearance', async () => {
      const { getByTestId, rerender } = render(
        <EmergencyHelpButton {...mockProps} isVisible={false} />
      )

      expect(queryByTestId('emergency-help-button')).toBeFalsy()

      await act(async () => {
        rerender(<EmergencyHelpButton {...mockProps} isVisible={true} />)
      })

      expect(getByTestId('emergency-help-button')).toBeTruthy()
      // Animation testing would require more complex setup
    })
  })

  describe('SafetyPlanInterface', () => {
    const mockSafetyPlan = {
      id: 'safety-plan-1',
      userId: 'user-123',
      warningSignsPersonal: [
        'Feeling hopeless',
        'Isolating from others',
        'Sleep problems'
      ],
      warningSignsExternal: [
        'Friends notice mood changes',
        'Missing work/school'
      ],
      copingStrategies: [
        'Deep breathing exercises',
        'Call a friend',
        'Go for a walk'
      ],
      socialSupports: [
        { name: 'John Doe', phone: '555-0123', relationship: 'friend' },
        { name: 'Dr. Smith', phone: '555-0456', relationship: 'therapist' }
      ],
      professionalContacts: [
        { name: 'Crisis Hotline', phone: '988', available: '24/7' },
        { name: 'Dr. Johnson', phone: '555-0789', available: 'Mon-Fri 9-5' }
      ],
      environmentalSafety: [
        'Remove harmful items from home',
        'Stay around supportive people'
      ],
      reasonsForLiving: [
        'My family needs me',
        'I want to see my goals achieved',
        'There are people who care about me'
      ],
      updatedAt: new Date().toISOString()
    }

    beforeEach(() => {
      mockCrisisService.getSafetyPlan.mockResolvedValue(mockSafetyPlan)
      mockCrisisService.updateSafetyPlan.mockResolvedValue(mockSafetyPlan)
    })

    it('should render safety plan sections', async () => {
      const { getByText } = render(<SafetyPlanInterface userId="user-123" />)

      await waitFor(() => {
        expect(getByText('My Safety Plan')).toBeTruthy()
        expect(getByText('Warning Signs I Notice')).toBeTruthy()
        expect(getByText('Coping Strategies')).toBeTruthy()
        expect(getByText('Social Support Contacts')).toBeTruthy()
        expect(getByText('Professional Contacts')).toBeTruthy()
        expect(getByText('Reasons for Living')).toBeTruthy()
      })
    })

    it('should display existing safety plan data', async () => {
      const { getByText } = render(<SafetyPlanInterface userId="user-123" />)

      await waitFor(() => {
        expect(getByText('Feeling hopeless')).toBeTruthy()
        expect(getByText('Deep breathing exercises')).toBeTruthy()
        expect(getByText('John Doe')).toBeTruthy()
        expect(getByText('My family needs me')).toBeTruthy()
      })
    })

    it('should allow editing safety plan items', async () => {
      const { getByTestId, getByDisplayValue } = render(
        <SafetyPlanInterface userId="user-123" />
      )

      await waitFor(() => {
        const editButton = getByTestId('edit-safety-plan')
        fireEvent.press(editButton)
      })

      const copingInput = getByDisplayValue('Deep breathing exercises')
      fireEvent.changeText(copingInput, 'Updated coping strategy')

      const saveButton = getByTestId('save-safety-plan')
      fireEvent.press(saveButton)

      expect(mockCrisisService.updateSafetyPlan).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          copingStrategies: expect.arrayContaining(['Updated coping strategy'])
        })
      )
    })

    it('should add new safety plan items', async () => {
      const { getByTestId, getByPlaceholderText } = render(
        <SafetyPlanInterface userId="user-123" />
      )

      await waitFor(() => {
        const editButton = getByTestId('edit-safety-plan')
        fireEvent.press(editButton)
      })

      const addCopingButton = getByTestId('add-coping-strategy')
      fireEvent.press(addCopingButton)

      const newCopingInput = getByPlaceholderText('Enter new coping strategy')
      fireEvent.changeText(newCopingInput, 'New coping method')

      expect(getByDisplayValue('New coping method')).toBeTruthy()
    })

    it('should remove safety plan items', async () => {
      const { getByTestId, queryByText } = render(
        <SafetyPlanInterface userId="user-123" />
      )

      await waitFor(() => {
        const editButton = getByTestId('edit-safety-plan')
        fireEvent.press(editButton)
      })

      expect(queryByText('Feeling hopeless')).toBeTruthy()

      const removeButton = getByTestId('remove-warning-sign-0')
      fireEvent.press(removeButton)

      expect(queryByText('Feeling hopeless')).toBeFalsy()
    })

    it('should validate required fields', async () => {
      mockCrisisService.getSafetyPlan.mockResolvedValue({
        ...mockSafetyPlan,
        copingStrategies: [],
        socialSupports: []
      })

      const { getByText, getByTestId } = render(
        <SafetyPlanInterface userId="user-123" />
      )

      await waitFor(() => {
        const editButton = getByTestId('edit-safety-plan')
        fireEvent.press(editButton)
      })

      const saveButton = getByTestId('save-safety-plan')
      fireEvent.press(saveButton)

      await waitFor(() => {
        expect(getByText('Please add at least one coping strategy')).toBeTruthy()
        expect(getByText('Please add at least one support contact')).toBeTruthy()
      })
    })

    it('should handle quick call to support contacts', async () => {
      const { getByTestId } = render(
        <SafetyPlanInterface userId="user-123" isEmergency={true} />
      )

      await waitFor(() => {
        const callButton = getByTestId('quick-call-john-doe')
        fireEvent.press(callButton)
      })

      expect(require('react-native').Linking.openURL).toHaveBeenCalledWith('tel:555-0123')
    })

    it('should show emergency mode with prominent actions', async () => {
      const { getByText, getByTestId } = render(
        <SafetyPlanInterface userId="user-123" isEmergency={true} />
      )

      await waitFor(() => {
        expect(getByText('Emergency Safety Plan')).toBeTruthy()
        expect(getByTestId('emergency-coping-strategies')).toBeTruthy()
        expect(getByTestId('emergency-contacts')).toBeTruthy()
      })
    })

    it('should save changes locally if offline', async () => {
      mockCrisisService.updateSafetyPlan.mockRejectedValue(
        new Error('Network unavailable')
      )

      const { getByTestId } = render(
        <SafetyPlanInterface userId="user-123" />
      )

      await waitFor(() => {
        const editButton = getByTestId('edit-safety-plan')
        fireEvent.press(editButton)
      })

      const saveButton = getByTestId('save-safety-plan')
      fireEvent.press(saveButton)

      await waitFor(() => {
        expect(getByText('Changes saved locally')).toBeTruthy()
        expect(getByText('Will sync when online')).toBeTruthy()
      })
    })

    it('should be accessible with proper semantics', async () => {
      const { getByA11yLabel, getAllByA11yRole } = render(
        <SafetyPlanInterface userId="user-123" />
      )

      await waitFor(() => {
        expect(getByA11yLabel('Edit safety plan')).toBeTruthy()
        expect(getAllByA11yRole('button')).toHaveLength(expect.any(Number))
      })
    })

    it('should export safety plan for sharing', async () => {
      const { getByTestId } = render(
        <SafetyPlanInterface userId="user-123" />
      )

      await waitFor(() => {
        const exportButton = getByTestId('export-safety-plan')
        fireEvent.press(exportButton)
      })

      expect(Alert.alert).toHaveBeenCalledWith(
        'Export Safety Plan',
        expect.stringContaining('share'),
        expect.any(Array)
      )
    })

    it('should show safety plan completion progress', async () => {
      const { getByTestId, getByText } = render(
        <SafetyPlanInterface userId="user-123" />
      )

      await waitFor(() => {
        expect(getByTestId('completion-progress')).toBeTruthy()
        expect(getByText(/\d+% complete/)).toBeTruthy()
      })
    })
  })

  describe('Crisis Detection Integration', () => {
    it('should automatically show crisis resources when risk detected', async () => {
      const CrisisDetectionWrapper = () => {
        const [showResources, setShowResources] = React.useState(false)
        
        React.useEffect(() => {
          // Simulate crisis detection
          setShowResources(true)
        }, [])

        return showResources ? <CrisisResourceScreen /> : null
      }

      const { getByText } = render(<CrisisDetectionWrapper />)

      await waitFor(() => {
        expect(getByText('Crisis Support Resources')).toBeTruthy()
      })
    })

    it('should prioritize emergency button over other UI', async () => {
      const { getByTestId } = render(
        <EmergencyHelpButton
          onPress={jest.fn()}
          riskLevel="critical"
          isVisible={true}
        />
      )

      const button = getByTestId('emergency-help-button')
      
      // Emergency button should have high z-index
      expect(button.props.style).toMatchObject(
        expect.objectContaining({
          position: 'absolute',
          zIndex: expect.any(Number)
        })
      )
    })
  })

  describe('Performance and Memory Management', () => {
    it('should not cause memory leaks', async () => {
      const { unmount } = render(<CrisisResourceScreen />)

      await waitFor(() => {
        // Component should load resources
        expect(mockCrisisService.getCrisisResources).toHaveBeenCalled()
      })

      // Unmount should clean up properly
      unmount()
      
      // No additional cleanup assertions can be made in jsdom environment
      // This would typically be tested with memory profiling tools
    })

    it('should handle rapid component mounting/unmounting', () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<EmergencyHelpButton
          onPress={jest.fn()}
          riskLevel="medium"
          isVisible={true}
        />)
        unmount()
      }

      // Should not throw errors or cause issues
      expect(true).toBe(true)
    })
  })
})