# iOS Keyboard Fix for Chat Interface

## Problem
The chat input field was being covered by the keyboard when it appeared, making it impossible to see what was being typed.

## Solution Implemented (v2)

### 1. Changed KeyboardAvoidingView Behavior
- Changed behavior from `padding` to `position` for iOS
- This provides better control over input field positioning
- Set keyboardVerticalOffset to 0 for ChatScreen, 60 for ChatScreenWithBackButton

### 2. Added Dynamic Keyboard Height Tracking
- Implemented keyboard event listeners (keyboardWillShow/keyboardWillHide)
- Track actual keyboard height dynamically
- Auto-scroll to bottom when keyboard appears

### 3. Dynamic Input Container Padding
- Padding adjusts based on keyboard visibility
- When keyboard is visible: padding = 0
- When keyboard is hidden: padding = 20 (for home indicator)

### Key Changes:
- `ChatScreen.tsx`: 
  - Added Keyboard event listeners
  - Changed behavior to 'position'
  - Dynamic padding based on keyboard state
- `ChatScreenWithBackButton.tsx`: 
  - Same keyboard handling implementation
  - Offset adjusted for fixed header (60px)
- `ChatInput.tsx`: 
  - Simplified padding (removed platform-specific adjustments)

## Testing
To verify the fix:
1. Open the app on iOS device/simulator
2. Navigate to chat screen
3. Tap on the input field
4. Keyboard should push the input field up smoothly
5. Input field should be fully visible above keyboard
6. Test on different iPhone models (SE, 14, 14 Pro Max)

## Technical Details
- Uses `keyboardWillShow` on iOS for smooth animation
- Falls back to `keyboardDidShow` on Android
- Auto-scrolls to bottom with 100ms delay for smooth UX
- Position-based behavior prevents layout jumps

## Additional Notes
- The fix handles both regular ChatScreen and ChatScreenWithBackButton
- Dynamic keyboard height ensures compatibility across all device sizes
- No hardcoded values - adapts to actual keyboard height