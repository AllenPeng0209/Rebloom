import { device, element, by, expect, waitFor } from 'detox'

describe('End-to-End User Journey Tests', () => {
  beforeAll(async () => {
    await device.launchApp()
  })

  beforeEach(async () => {
    await device.reloadReactNative()
  })

  afterAll(async () => {
    await device.terminateApp()
  })

  describe('New User Onboarding Journey', () => {
    it('should complete full onboarding flow', async () => {
      // Launch app for first time
      await expect(element(by.id('welcome-screen'))).toBeVisible()

      // Welcome screen
      await expect(element(by.text('Welcome to Rebloom'))).toBeVisible()
      await element(by.id('get-started-button')).tap()

      // Permission requests
      await expect(element(by.id('permissions-screen'))).toBeVisible()
      await expect(element(by.text('We need a few permissions to help you'))).toBeVisible()
      
      // Notifications permission
      await element(by.id('notifications-permission-button')).tap()
      await waitFor(element(by.text('Allow'))).toBeVisible().whileElement(by.id('permissions-screen')).scroll(200, 'down')
      
      // Location permission (optional)
      await element(by.id('location-permission-skip')).tap()

      // Privacy and security setup
      await expect(element(by.id('privacy-setup-screen'))).toBeVisible()
      await expect(element(by.text('Your privacy is our priority'))).toBeVisible()
      
      // Accept privacy policy
      await element(by.id('privacy-policy-checkbox')).tap()
      await element(by.id('continue-privacy-button')).tap()

      // Account creation
      await expect(element(by.id('account-creation-screen'))).toBeVisible()
      await element(by.id('email-input')).typeText('testuser@example.com')
      await element(by.id('password-input')).typeText('SecurePassword123!')
      await element(by.id('password-confirm-input')).typeText('SecurePassword123!')
      await element(by.id('first-name-input')).typeText('John')
      await element(by.id('last-name-input')).typeText('Doe')
      await element(by.id('create-account-button')).tap()

      // Wait for account creation
      await waitFor(element(by.id('account-created-success'))).toBeVisible().withTimeout(10000)

      // Initial mood assessment
      await expect(element(by.id('initial-mood-screen'))).toBeVisible()
      await expect(element(by.text('How are you feeling right now?'))).toBeVisible()
      
      await element(by.id('mood-scale-slider')).swipe('right', 'fast', 0.6) // Set mood to ~6
      await element(by.id('energy-level-slider')).swipe('right', 'fast', 0.5) // Set energy to ~5
      await element(by.id('submit-initial-mood')).tap()

      // Personalization questions
      await expect(element(by.id('personalization-screen'))).toBeVisible()
      
      // Mental health goals
      await element(by.id('goal-stress-management')).tap()
      await element(by.id('goal-mood-tracking')).tap()
      await element(by.id('continue-goals-button')).tap()

      // Communication preferences
      await element(by.id('communication-casual')).tap()
      await element(by.id('continue-communication-button')).tap()

      // Crisis support setup
      await expect(element(by.id('crisis-support-setup'))).toBeVisible()
      await expect(element(by.text('Emergency contacts help keep you safe'))).toBeVisible()
      
      await element(by.id('emergency-contact-name')).typeText('Jane Doe')
      await element(by.id('emergency-contact-phone')).typeText('555-0123')
      await element(by.id('emergency-contact-relationship')).typeText('Sister')
      await element(by.id('add-emergency-contact')).tap()

      await element(by.id('continue-crisis-setup')).tap()

      // Complete onboarding
      await expect(element(by.id('onboarding-complete-screen'))).toBeVisible()
      await expect(element(by.text('You\'re all set!'))).toBeVisible()
      await element(by.id('start-using-rebloom')).tap()

      // Should arrive at main dashboard
      await expect(element(by.id('main-dashboard'))).toBeVisible()
      await expect(element(by.text('Good to see you, John'))).toBeVisible()
    })

    it('should handle onboarding interruption and resume', async () => {
      // Start onboarding
      await expect(element(by.id('welcome-screen'))).toBeVisible()
      await element(by.id('get-started-button')).tap()

      // Get to account creation
      await element(by.id('skip-permissions-button')).tap()
      await element(by.id('privacy-policy-checkbox')).tap()
      await element(by.id('continue-privacy-button')).tap()

      // Fill partial account info
      await element(by.id('email-input')).typeText('interrupted@example.com')
      await element(by.id('password-input')).typeText('Password123!')

      // Simulate app backgrounding
      await device.sendToHome()
      await device.launchApp()

      // Should resume onboarding
      await expect(element(by.id('account-creation-screen'))).toBeVisible()
      await expect(element(by.id('email-input'))).toHaveText('interrupted@example.com')

      // Complete registration
      await element(by.id('password-confirm-input')).typeText('Password123!')
      await element(by.id('first-name-input')).typeText('Jane')
      await element(by.id('create-account-button')).tap()

      await waitFor(element(by.id('account-created-success'))).toBeVisible().withTimeout(10000)
    })

    it('should allow skipping optional onboarding steps', async () => {
      await expect(element(by.id('welcome-screen'))).toBeVisible()
      await element(by.id('get-started-button')).tap()

      // Skip permissions
      await element(by.id('skip-permissions-button')).tap()

      // Skip detailed privacy setup
      await element(by.id('privacy-policy-checkbox')).tap()
      await element(by.id('continue-privacy-button')).tap()

      // Create minimal account
      await element(by.id('email-input')).typeText('minimal@example.com')
      await element(by.id('password-input')).typeText('SimplePass123!')
      await element(by.id('password-confirm-input')).typeText('SimplePass123!')
      await element(by.id('first-name-input')).typeText('Min')
      await element(by.id('create-account-button')).tap()

      await waitFor(element(by.id('account-created-success'))).toBeVisible().withTimeout(10000)

      // Skip initial mood
      await element(by.id('skip-initial-mood')).tap()

      // Skip personalization
      await element(by.id('skip-personalization')).tap()

      // Skip crisis setup (but show warning)
      await element(by.id('skip-crisis-setup')).tap()
      await expect(element(by.text('You can set this up later in settings'))).toBeVisible()
      await element(by.id('confirm-skip-crisis')).tap()

      // Should reach dashboard with minimal setup
      await expect(element(by.id('main-dashboard'))).toBeVisible()
      await expect(element(by.id('setup-incomplete-banner'))).toBeVisible()
    })
  })

  describe('Daily Usage Journey', () => {
    beforeEach(async () => {
      // Assume user is already logged in
      await element(by.id('login-email')).typeText('dailyuser@example.com')
      await element(by.id('login-password')).typeText('Password123!')
      await element(by.id('login-button')).tap()
      await waitFor(element(by.id('main-dashboard'))).toBeVisible().withTimeout(10000)
    })

    it('should complete daily check-in routine', async () => {
      // Morning check-in notification
      await expect(element(by.id('main-dashboard'))).toBeVisible()
      await expect(element(by.id('daily-checkin-card'))).toBeVisible()

      // Start mood check-in
      await element(by.id('daily-checkin-card')).tap()
      await expect(element(by.id('mood-checkin-screen'))).toBeVisible()

      // Set mood
      await element(by.id('mood-scale-slider')).swipe('right', 'fast', 0.7)
      await expect(element(by.id('mood-emoji-7'))).toBeVisible()

      // Set energy
      await element(by.id('energy-level-slider')).swipe('right', 'fast', 0.6)

      // Set sleep quality
      await element(by.id('sleep-quality-slider')).swipe('right', 'fast', 0.8)

      // Add notes
      await element(by.id('notes-input')).typeText('Had a good night\'s sleep, feeling optimistic today')

      // Select symptoms (if any)
      await element(by.id('symptom-mild-anxiety')).tap()

      // Select activities
      await element(by.id('activity-exercise')).tap()
      await element(by.id('activity-meditation')).tap()

      // Submit check-in
      await element(by.id('submit-mood-entry')).tap()

      // Success feedback
      await expect(element(by.text('Mood entry saved!'))).toBeVisible()
      await expect(element(by.id('mood-insight-card'))).toBeVisible()

      // Return to dashboard
      await element(by.id('back-to-dashboard')).tap()
      await expect(element(by.id('main-dashboard'))).toBeVisible()

      // Check that dashboard reflects new data
      await expect(element(by.id('current-mood-7'))).toBeVisible()
      await expect(element(by.id('streak-counter'))).toBeVisible()
    })

    it('should engage with AI chat for support', async () => {
      // Navigate to chat
      await element(by.id('bottom-tab-chat')).tap()
      await expect(element(by.id('chat-screen'))).toBeVisible()

      // Should show welcome message or continue conversation
      await expect(element(by.id('chat-messages-container'))).toBeVisible()

      // Send a message about stress
      await element(by.id('chat-input')).typeText('I\'m feeling stressed about work deadlines')
      await element(by.id('send-message-button')).tap()

      // Wait for AI response
      await waitFor(element(by.id('ai-message-response'))).toBeVisible().withTimeout(15000)

      // Should get supportive response
      await expect(element(by.text('work stress'))).toBeVisible()

      // Continue conversation
      await element(by.id('chat-input')).typeText('What are some quick ways to manage stress?')
      await element(by.id('send-message-button')).tap()

      await waitFor(element(by.id('ai-message-response'))).toBeVisible().withTimeout(15000)
      
      // Should get practical suggestions
      await expect(element(by.text('breathing'))).toBeVisible()

      // Use quick response options if available
      await element(by.id('quick-response-tell-me-more')).tap()

      await waitFor(element(by.id('ai-message-response'))).toBeVisible().withTimeout(15000)
    })

    it('should explore and use coping resources', async () => {
      // Navigate to explore tab
      await element(by.id('bottom-tab-explore')).tap()
      await expect(element(by.id('explore-screen'))).toBeVisible()

      // Browse meditation resources
      await element(by.id('category-meditation')).tap()
      await expect(element(by.id('meditation-resources-list'))).toBeVisible()

      // Select a guided meditation
      await element(by.id('meditation-anxiety-relief')).tap()
      await expect(element(by.id('resource-detail-screen'))).toBeVisible()

      // Start meditation
      await element(by.id('start-meditation-button')).tap()
      await expect(element(by.id('meditation-player'))).toBeVisible()

      // Control playback
      await element(by.id('play-pause-button')).tap() // Pause
      await element(by.id('seek-slider')).swipe('right', 'fast', 0.3) // Skip ahead
      await element(by.id('play-pause-button')).tap() // Resume

      // Complete meditation
      await element(by.id('meditation-complete-button')).tap()

      // Rate experience
      await element(by.id('rating-5-stars')).tap()
      await element(by.id('submit-rating')).tap()

      // Should track in mood data
      await element(by.id('bottom-tab-mood')).tap()
      await expect(element(by.text('Meditation'))).toBeVisible() // In recent activities
    })

    it('should view mood trends and insights', async () => {
      // Navigate to mood tab
      await element(by.id('bottom-tab-mood')).tap()
      await expect(element(by.id('mood-screen'))).toBeVisible()

      // View weekly trends
      await expect(element(by.id('mood-chart-weekly'))).toBeVisible()
      
      // Switch to monthly view
      await element(by.id('timeframe-monthly')).tap()
      await expect(element(by.id('mood-chart-monthly'))).toBeVisible()

      // View detailed entry
      await element(by.id('mood-entry-latest')).tap()
      await expect(element(by.id('mood-entry-detail'))).toBeVisible()
      await expect(element(by.text('Had a good night\'s sleep'))).toBeVisible()

      // Edit entry if needed
      await element(by.id('edit-mood-entry')).tap()
      await element(by.id('notes-input')).clearText()
      await element(by.id('notes-input')).typeText('Updated: Had great sleep, feeling very positive')
      await element(by.id('save-changes')).tap()

      // View insights
      await element(by.id('view-insights-button')).tap()
      await expect(element(by.id('mood-insights-screen'))).toBeVisible()
      await expect(element(by.text('patterns'))).toBeVisible()

      // Export data if needed
      await element(by.id('export-mood-data')).tap()
      await element(by.id('export-format-csv')).tap()
      await element(by.id('confirm-export')).tap()
      await expect(element(by.text('Data exported'))).toBeVisible()
    })

    it('should complete evening reflection routine', async () => {
      // Navigate to dashboard (evening time)
      await expect(element(by.id('main-dashboard'))).toBeVisible()
      
      // Evening check-in prompt should appear
      await expect(element(by.id('evening-reflection-card'))).toBeVisible()
      await element(by.id('evening-reflection-card')).tap()

      // Reflection questions
      await expect(element(by.id('reflection-screen'))).toBeVisible()
      await expect(element(by.text('How did your day go?'))).toBeVisible()

      // Rate day overall
      await element(by.id('day-rating-slider')).swipe('right', 'fast', 0.75)

      // What went well
      await element(by.id('went-well-input')).typeText('Completed important project milestone, felt accomplished')

      // What was challenging
      await element(by.id('challenging-input')).typeText('Meeting ran long, felt rushed')

      // Gratitude
      await element(by.id('gratitude-input')).typeText('Grateful for supportive team members')

      // Tomorrow's intention
      await element(by.id('intention-input')).typeText('Start day with meditation, take breaks between meetings')

      // Submit reflection
      await element(by.id('submit-reflection')).tap()

      // Encouraging message
      await expect(element(by.text('Thank you for reflecting'))).toBeVisible()
      await element(by.id('finish-evening-routine')).tap()

      // Dashboard shows completion
      await expect(element(by.id('evening-routine-complete'))).toBeVisible()
    })
  })

  describe('Crisis Support Journey', () => {
    beforeEach(async () => {
      // Login as user
      await element(by.id('login-email')).typeText('crisisuser@example.com')
      await element(by.id('login-password')).typeText('Password123!')
      await element(by.id('login-button')).tap()
      await waitFor(element(by.id('main-dashboard'))).toBeVisible().withTimeout(10000)
    })

    it('should handle crisis situation detection and intervention', async () => {
      // Go to chat and express crisis thoughts
      await element(by.id('bottom-tab-chat')).tap()
      await element(by.id('chat-input')).typeText('I feel hopeless and don\'t want to be here anymore')
      await element(by.id('send-message-button')).tap()

      // Crisis detection should trigger
      await waitFor(element(by.id('crisis-alert-modal'))).toBeVisible().withTimeout(10000)
      await expect(element(by.text('We\'re here to help'))).toBeVisible()
      await expect(element(by.text('immediate support'))).toBeVisible()

      // View crisis resources
      await element(by.id('view-crisis-resources')).tap()
      await expect(element(by.id('crisis-resources-screen'))).toBeVisible()

      // Should show hotline numbers prominently
      await expect(element(by.id('crisis-hotline-988'))).toBeVisible()
      await expect(element(by.id('crisis-text-741741'))).toBeVisible()

      // Test calling (will show confirmation dialog)
      await element(by.id('call-crisis-hotline')).tap()
      await expect(element(by.text('Call 988?'))).toBeVisible()
      await element(by.text('Cancel')).tap() // Don't actually call in test

      // View safety plan
      await element(by.id('view-safety-plan')).tap()
      await expect(element(by.id('safety-plan-screen'))).toBeVisible()

      // Should show personalized coping strategies
      await expect(element(by.id('coping-strategies-list'))).toBeVisible()
      await expect(element(by.id('emergency-contacts-list'))).toBeVisible()

      // Use a coping strategy
      await element(by.id('coping-strategy-breathing')).tap()
      await expect(element(by.id('breathing-exercise-modal'))).toBeVisible()
      await element(by.id('start-breathing-exercise')).tap()

      // Complete breathing exercise
      await waitFor(element(by.id('breathing-complete'))).toBeVisible().withTimeout(60000)
      await element(by.id('finish-exercise')).tap()

      // Return to chat with supportive AI response
      await element(by.id('back-to-chat')).tap()
      await expect(element(by.text('breathing exercise'))).toBeVisible()
      await expect(element(by.text('How are you feeling now?'))).toBeVisible()
    })

    it('should access emergency contacts from safety plan', async () => {
      // Navigate directly to crisis resources
      await element(by.id('main-menu-button')).tap()
      await element(by.id('menu-crisis-resources')).tap()
      
      await expect(element(by.id('crisis-resources-screen'))).toBeVisible()
      
      // Access safety plan
      await element(by.id('safety-plan-button')).tap()
      await expect(element(by.id('safety-plan-screen'))).toBeVisible()

      // Emergency contacts section
      await element(by.id('emergency-contacts-section')).scroll(200, 'down')
      await expect(element(by.id('contact-jane-doe'))).toBeVisible()

      // Quick call emergency contact
      await element(by.id('quick-call-jane-doe')).tap()
      await expect(element(by.text('Call Jane Doe?'))).toBeVisible()
      await element(by.text('Cancel')).tap()

      // Text emergency contact
      await element(by.id('text-jane-doe')).tap()
      await expect(element(by.id('text-composer'))).toBeVisible()
      await element(by.id('text-input')).typeText('Hi Jane, I need some support right now')
      await element(by.id('send-text')).tap()
      await expect(element(by.text('Message sent'))).toBeVisible()
    })

    it('should follow up after crisis intervention', async () => {
      // Simulate 24 hours after crisis intervention
      await device.setURLBlacklist(['.*']) // Disable network to simulate offline
      
      // Should show check-in notification
      await expect(element(by.id('crisis-followup-notification'))).toBeVisible()
      await element(by.id('crisis-followup-notification')).tap()

      await expect(element(by.id('crisis-followup-screen'))).toBeVisible()
      await expect(element(by.text('How are you feeling today?'))).toBeVisible()

      // Quick mood check
      await element(by.id('followup-mood-better')).tap()
      
      // Rate helpfulness of resources used
      await element(by.id('resource-helpfulness-4')).tap()
      
      // Additional support needed?
      await element(by.id('need-more-support-no')).tap()
      
      // Submit follow-up
      await element(by.id('submit-followup')).tap()
      await expect(element(by.text('Thank you for checking in'))).toBeVisible()

      // Should schedule next check-in
      await expect(element(by.text('We\'ll check in again tomorrow'))).toBeVisible()
      await element(by.id('continue-to-resources')).tap()
    })
  })

  describe('Settings and Privacy Journey', () => {
    beforeEach(async () => {
      await element(by.id('login-email')).typeText('settingsuser@example.com')
      await element(by.id('login-password')).typeText('Password123!')
      await element(by.id('login-button')).tap()
      await waitFor(element(by.id('main-dashboard'))).toBeVisible().withTimeout(10000)
    })

    it('should configure privacy and security settings', async () => {
      // Navigate to profile/settings
      await element(by.id('bottom-tab-profile')).tap()
      await expect(element(by.id('profile-screen'))).toBeVisible()

      // Privacy settings
      await element(by.id('privacy-settings-option')).tap()
      await expect(element(by.id('privacy-settings-screen'))).toBeVisible()

      // Enable biometric authentication
      await element(by.id('biometric-auth-toggle')).tap()
      await expect(element(by.text('Touch ID'))).toBeVisible() // or Face ID
      await element(by.id('enable-biometric-auth')).tap()
      
      // Should prompt for device authentication
      await waitFor(element(by.text('Use Touch ID for Rebloom?'))).toBeVisible().withTimeout(5000)
      // In test environment, this would be simulated
      
      // Data encryption settings
      await element(by.id('data-encryption-options')).tap()
      await element(by.id('encryption-level-high')).tap()
      await element(by.id('save-encryption-settings')).tap()

      // Analytics preferences
      await element(by.id('analytics-preferences')).scroll(200, 'down')
      await element(by.id('share-analytics-toggle')).tap() // Disable
      await element(by.id('crash-reporting-toggle')).tap() // Disable

      // Save privacy settings
      await element(by.id('save-privacy-settings')).tap()
      await expect(element(by.text('Privacy settings updated'))).toBeVisible()
    })

    it('should configure accessibility settings', async () => {
      await element(by.id('bottom-tab-profile')).tap()
      await element(by.id('accessibility-settings-option')).tap()
      await expect(element(by.id('accessibility-settings-screen'))).toBeVisible()

      // Text size adjustment
      await element(by.id('text-size-slider')).swipe('right', 'fast', 0.8) // Larger text
      await expect(element(by.id('preview-text-large'))).toBeVisible()

      // High contrast mode
      await element(by.id('high-contrast-toggle')).tap()
      await expect(element(by.id('high-contrast-preview'))).toBeVisible()

      // Reduce motion
      await element(by.id('reduce-motion-toggle')).tap()

      // Voice control settings
      await element(by.id('voice-control-options')).tap()
      await element(by.id('enable-voice-navigation')).tap()
      await element(by.id('voice-command-sensitivity-slider')).swipe('right', 'fast', 0.6)

      // Screen reader compatibility
      await element(by.id('screen-reader-optimizations')).tap()
      await element(by.id('enhanced-descriptions-toggle')).tap()

      // Save accessibility settings
      await element(by.id('save-accessibility-settings')).tap()
      await expect(element(by.text('Accessibility settings saved'))).toBeVisible()

      // Verify changes applied
      await element(by.id('back-button')).tap()
      await expect(element(by.id('profile-screen'))).toBeVisible()
      // Text should be visibly larger
      await expect(element(by.id('large-text-indicator'))).toBeVisible()
    })

    it('should manage data and account settings', async () => {
      await element(by.id('bottom-tab-profile')).tap()
      await element(by.id('account-settings-option')).tap()

      // Change email
      await element(by.id('change-email-option')).tap()
      await element(by.id('new-email-input')).typeText('newemail@example.com')
      await element(by.id('confirm-password-input')).typeText('Password123!')
      await element(by.id('update-email-button')).tap()
      await expect(element(by.text('Verification email sent'))).toBeVisible()
      await element(by.id('back-button')).tap()

      // Data export
      await element(by.id('data-export-option')).tap()
      await expect(element(by.id('data-export-screen'))).toBeVisible()
      
      await element(by.id('export-all-data')).tap()
      await element(by.id('export-format-json')).tap()
      await element(by.id('include-metadata-toggle')).tap()
      await element(by.id('start-export')).tap()
      
      await waitFor(element(by.text('Export complete'))).toBeVisible().withTimeout(30000)
      await element(by.id('download-export')).tap()

      // Account deletion (but cancel)
      await element(by.id('back-button')).tap()
      await element(by.id('danger-zone-section')).scroll(200, 'down')
      await element(by.id('delete-account-option')).tap()
      
      await expect(element(by.text('Delete Account'))).toBeVisible()
      await expect(element(by.text('This action cannot be undone'))).toBeVisible()
      await element(by.id('cancel-deletion')).tap()
    })
  })

  describe('Offline and Sync Journey', () => {
    beforeEach(async () => {
      await element(by.id('login-email')).typeText('offlineuser@example.com')
      await element(by.id('login-password')).typeText('Password123!')
      await element(by.id('login-button')).tap()
      await waitFor(element(by.id('main-dashboard'))).toBeVisible().withTimeout(10000)
    })

    it('should work offline and sync when reconnected', async () => {
      // Disable network to simulate offline
      await device.setURLBlacklist(['.*'])

      // Should show offline indicator
      await expect(element(by.id('offline-indicator'))).toBeVisible()

      // Create mood entry offline
      await element(by.id('daily-checkin-card')).tap()
      await element(by.id('mood-scale-slider')).swipe('right', 'fast', 0.6)
      await element(by.id('notes-input')).typeText('Feeling okay, working offline')
      await element(by.id('submit-mood-entry')).tap()

      // Should save locally
      await expect(element(by.text('Saved locally'))).toBeVisible()
      await expect(element(by.text('Will sync when online'))).toBeVisible()

      // Chat offline (with cached responses)
      await element(by.id('bottom-tab-chat')).tap()
      await element(by.id('chat-input')).typeText('How can I stay motivated while working from home?')
      await element(by.id('send-message-button')).tap()

      // Should show offline response
      await expect(element(by.text('Offline mode'))).toBeVisible()
      await expect(element(by.text('cached response'))).toBeVisible()

      // View offline resources
      await element(by.id('bottom-tab-explore')).tap()
      await expect(element(by.id('offline-resources-banner'))).toBeVisible()
      await expect(element(by.id('cached-meditations'))).toBeVisible()

      // Use downloaded meditation
      await element(by.id('offline-meditation-1')).tap()
      await element(by.id('start-meditation-button')).tap()
      await expect(element(by.id('meditation-player'))).toBeVisible()

      // Re-enable network
      await device.setURLBlacklist([])

      // Should show sync in progress
      await expect(element(by.id('sync-indicator'))).toBeVisible()

      // Wait for sync to complete
      await waitFor(element(by.id('sync-complete-indicator'))).toBeVisible().withTimeout(15000)

      // Verify data was synced
      await element(by.id('bottom-tab-mood')).tap()
      await expect(element(by.text('Feeling okay, working offline'))).toBeVisible()
      await expect(element(by.id('synced-indicator'))).toBeVisible()
    })

    it('should handle sync conflicts appropriately', async () => {
      // Create data on device
      await element(by.id('daily-checkin-card')).tap()
      await element(by.id('mood-scale-slider')).swipe('right', 'fast', 0.7)
      await element(by.id('notes-input')).typeText('Device version of mood entry')
      await element(by.id('submit-mood-entry')).tap()

      // Simulate network issue during sync
      await device.setURLBlacklist(['.*'])
      
      // Create another entry offline
      await element(by.id('quick-mood-widget')).tap()
      await element(by.id('quick-mood-5')).tap()

      // Re-enable network but simulate server conflict
      await device.setURLBlacklist([])

      // Should detect sync conflict
      await waitFor(element(by.id('sync-conflict-modal'))).toBeVisible().withTimeout(15000)
      await expect(element(by.text('Data Conflict'))).toBeVisible()
      await expect(element(by.text('Different versions'))).toBeVisible()

      // Choose to keep both versions
      await element(by.id('keep-both-versions')).tap()
      await element(by.id('resolve-conflict')).tap()

      // Should complete sync
      await waitFor(element(by.id('sync-complete-indicator'))).toBeVisible().withTimeout(10000)

      // Both entries should be visible
      await element(by.id('bottom-tab-mood')).tap()
      await expect(element(by.text('Device version of mood entry'))).toBeVisible()
      await expect(element(by.id('mood-entry-5'))).toBeVisible()
    })
  })

  describe('Performance and Reliability', () => {
    it('should handle app crashes and data recovery', async () => {
      // Create some data
      await element(by.id('login-email')).typeText('crashuser@example.com')
      await element(by.id('login-password')).typeText('Password123!')
      await element(by.id('login-button')).tap()
      await waitFor(element(by.id('main-dashboard'))).toBeVisible().withTimeout(10000)

      await element(by.id('daily-checkin-card')).tap()
      await element(by.id('mood-scale-slider')).swipe('right', 'fast', 0.8)
      await element(by.id('notes-input')).typeText('Important mood data before crash')
      
      // Simulate crash
      await device.terminateApp()
      await device.launchApp()

      // Should recover with login
      await element(by.id('login-email')).typeText('crashuser@example.com')
      await element(by.id('login-password')).typeText('Password123!')
      await element(by.id('login-button')).tap()

      // Should show data recovery
      await waitFor(element(by.id('data-recovery-modal'))).toBeVisible().withTimeout(10000)
      await expect(element(by.text('Unsaved changes recovered'))).toBeVisible()
      await element(by.id('restore-data-button')).tap()

      // Data should be restored
      await expect(element(by.id('mood-checkin-screen'))).toBeVisible()
      await expect(element(by.text('Important mood data before crash'))).toBeVisible()

      // Complete the entry
      await element(by.id('submit-mood-entry')).tap()
      await expect(element(by.text('Mood entry saved!'))).toBeVisible()
    })

    it('should maintain performance with large amounts of data', async () => {
      await element(by.id('login-email')).typeText('poweruser@example.com')
      await element(by.id('login-password')).typeText('Password123!')
      await element(by.id('login-button')).tap()
      await waitFor(element(by.id('main-dashboard'))).toBeVisible().withTimeout(10000)

      // User with 6 months of daily data
      await element(by.id('bottom-tab-mood')).tap()
      await expect(element(by.id('mood-screen'))).toBeVisible()

      // Chart should load smoothly
      await expect(element(by.id('mood-chart-weekly'))).toBeVisible()

      // Switch to yearly view (lots of data)
      await element(by.id('timeframe-yearly')).tap()
      await waitFor(element(by.id('mood-chart-yearly'))).toBeVisible().withTimeout(10000)

      // Scrolling through entries should be smooth
      await element(by.id('mood-entries-list')).scroll(1000, 'down')
      await element(by.id('mood-entries-list')).scroll(1000, 'down')
      await element(by.id('mood-entries-list')).scroll(1000, 'down')

      // Load more entries
      await expect(element(by.id('load-more-entries'))).toBeVisible()
      await element(by.id('load-more-entries')).tap()
      await waitFor(element(by.id('additional-entries-loaded'))).toBeVisible().withTimeout(5000)

      // Search through entries
      await element(by.id('search-entries-button')).tap()
      await element(by.id('search-input')).typeText('exercise')
      await element(by.id('search-submit')).tap()
      await expect(element(by.id('search-results'))).toBeVisible()
    })
  })
})

// Helper function to simulate different user states
const simulateUserState = async (userType: string) => {
  switch (userType) {
    case 'new_user':
      await device.clearUserData()
      break
    case 'returning_user':
      // User with existing data
      await device.setUserData({
        hasCompletedOnboarding: true,
        lastLogin: Date.now() - 86400000, // 24 hours ago
        moodEntryCount: 30
      })
      break
    case 'crisis_risk_user':
      await device.setUserData({
        hasCompletedOnboarding: true,
        recentCrisisFlags: 2,
        hasActiveSafetyPlan: true
      })
      break
  }
}

// Test performance monitoring
const measurePerformance = async (testName: string, operation: () => Promise<void>) => {
  const startTime = Date.now()
  await operation()
  const endTime = Date.now()
  const duration = endTime - startTime
  
  console.log(`Performance: ${testName} took ${duration}ms`)
  
  // Assert performance expectations
  if (testName.includes('load')) {
    expect(duration).toBeLessThan(3000) // 3 seconds for load operations
  } else if (testName.includes('sync')) {
    expect(duration).toBeLessThan(10000) // 10 seconds for sync operations
  } else {
    expect(duration).toBeLessThan(1000) // 1 second for UI operations
  }
}