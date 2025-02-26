# Game Progress Saving Testing Plan

This document outlines a comprehensive testing plan for the game progress saving functionality. Each test case is designed to verify a specific aspect of the implementation.

## Test Categories

1. Basic Save/Load Functionality
2. Offline Progress Calculation
3. Error Handling and Edge Cases
4. Performance Testing
5. Multi-Device Synchronization

## 1. Basic Save/Load Functionality

### Test Case 1.1: Manual Save and Load
**Description:** Verify that manually triggering a save persists the game state and can be loaded later.

**Steps:**
1. Log in to the game
2. Generate some resources (e.g., click the energy button 10 times)
3. Click the "Test Save" button
4. Refresh the page
5. Verify that the energy amount is preserved after refresh

**Expected Result:** The energy amount should be the same after refreshing the page.

### Test Case 1.2: Automatic Periodic Saving
**Description:** Verify that the game state is automatically saved at regular intervals.

**Steps:**
1. Log in to the game
2. Generate some resources
3. Wait for 35 seconds (past the 30-second auto-save interval)
4. Refresh the page
5. Verify that the resources are preserved

**Expected Result:** The game state should be automatically saved after 30 seconds and recovered after refresh.

### Test Case 1.3: Page Unload Saving
**Description:** Verify that the game state is saved when leaving the page.

**Steps:**
1. Log in to the game
2. Generate some resources
3. Navigate away from the page (e.g., to another section of the game)
4. Return to the original page
5. Verify that the resources are preserved

**Expected Result:** Resources should be saved when navigating away and restored when returning.

### Test Case 1.4: LocalStorage Backup
**Description:** Verify that the game state is backed up to localStorage.

**Steps:**
1. Log in to the game
2. Generate some resources
3. Trigger a save
4. Open browser developer tools
5. Check localStorage for a "gameProgressBackup" entry
6. Verify that the backup data matches the current game state

**Expected Result:** LocalStorage should contain a backup of the game state.

## 2. Offline Progress Calculation

### Test Case 2.1: Basic Offline Progress
**Description:** Verify that resources accumulate while offline based on auto-generation rates.

**Steps:**
1. Log in to the game
2. Upgrade auto-generation for energy
3. Note the current energy amount
4. Close the browser or tab
5. Wait for 5 minutes
6. Return to the game
7. Verify that energy has increased based on the auto-generation rate

**Expected Result:** Energy should increase by (auto-generation rate × 5 minutes × 60 seconds).

### Test Case 2.2: Offline Progress Cap
**Description:** Verify that offline progress is capped at the maximum time limit.

**Steps:**
1. Log in to the game
2. Upgrade auto-generation for energy
3. Manually modify the lastOnline timestamp to be 48 hours ago (using developer tools)
4. Refresh the page
5. Verify that offline progress is capped at 24 hours (1440 minutes)

**Expected Result:** Resources should increase based on a maximum of 24 hours, not the full 48 hours.

### Test Case 2.3: Resource Capacity Limits
**Description:** Verify that resources don't exceed their capacity during offline progress.

**Steps:**
1. Log in to the game
2. Set energy close to capacity (e.g., 90/100)
3. Set auto-generation to a high value
4. Close the browser or tab
5. Wait for 5 minutes
6. Return to the game
7. Verify that energy doesn't exceed capacity

**Expected Result:** Energy should be capped at maximum capacity (100) even if offline generation would exceed it.

### Test Case 2.4: Offline Progress Modal
**Description:** Verify that the offline progress modal displays correctly with accurate information.

**Steps:**
1. Log in to the game
2. Upgrade auto-generation for multiple resources
3. Close the browser or tab
4. Wait for 5 minutes
5. Return to the game
6. Verify that the offline progress modal appears
7. Check that it shows the correct time away and resource gains

**Expected Result:** Offline progress modal should show the correct time away and accurate resource gains.

## 3. Error Handling and Edge Cases

### Test Case 3.1: Network Disconnection During Save
**Description:** Verify that the game handles network disconnection during save operations.

**Steps:**
1. Log in to the game
2. Generate some resources
3. Disconnect from the internet (turn off Wi-Fi or use browser dev tools to go offline)
4. Trigger a save
5. Verify that the save operation fails gracefully
6. Reconnect to the internet
7. Trigger another save
8. Verify that the save succeeds

**Expected Result:** The game should show an appropriate error message when offline, and successfully save when back online.

### Test Case 3.2: Corrupted LocalStorage Data
**Description:** Verify that the game handles corrupted localStorage data.

**Steps:**
1. Log in to the game
2. Generate some resources
3. Trigger a save
4. Using browser dev tools, modify the localStorage data to be invalid JSON
5. Refresh the page
6. Verify that the game recovers by loading from server or initializing a new game

**Expected Result:** The game should detect the corrupted data, log an error, and fall back to server data or defaults.

### Test Case 3.3: Time Manipulation Detection
**Description:** Verify that the game detects and handles client time manipulation.

**Steps:**
1. Log in to the game
2. Generate some resources
3. Change the system clock forward by 24 hours
4. Refresh the page
5. Verify that server verification rejects the manipulated time

**Expected Result:** The server should detect the time discrepancy and reject the client's calculated offline progress.

### Test Case 3.4: Missing User Session
**Description:** Verify that the game handles missing user sessions appropriately.

**Steps:**
1. Log in to the game
2. Generate some resources
3. Manually clear the authentication token/cookie (using browser dev tools)
4. Trigger a save
5. Verify that the game prompts for re-authentication

**Expected Result:** The game should detect the missing session and prompt the user to log in again.

## 4. Performance Testing

### Test Case 4.1: Rapid State Changes
**Description:** Verify that the UI remains responsive during rapid state changes and saves.

**Steps:**
1. Log in to the game
2. Set up a script or rapid clicking to generate resources quickly
3. Monitor UI responsiveness and performance metrics
4. Verify that the game remains responsive despite frequent state changes

**Expected Result:** The UI should remain responsive, and the debounced save functionality should prevent excessive save operations.

### Test Case 4.2: Large Save State
**Description:** Verify that the game handles large save states efficiently.

**Steps:**
1. Log in to the game
2. Simulate a large game state by progressing far in the game
3. Trigger a save
4. Monitor save operation performance
5. Verify that the save completes within a reasonable time

**Expected Result:** The save operation should complete quickly (under 2 seconds) even with a large game state.

### Test Case 4.3: Save Frequency Impact
**Description:** Verify that changing save frequency doesn't impact performance.

**Steps:**
1. Log in to the game
2. Modify the auto-save interval to 5 seconds (from the default 30)
3. Generate resources continuously
4. Monitor UI responsiveness for 2 minutes
5. Verify that the more frequent saves don't cause performance issues

**Expected Result:** The UI should remain responsive even with more frequent save operations.

## 5. Multi-Device Synchronization

### Test Case 5.1: Basic Multi-Device Sync
**Description:** Verify that game progress synchronizes across multiple devices.

**Steps:**
1. Log in to the game on Device A
2. Generate some resources
3. Trigger a save
4. Log in to the game on Device B with the same account
5. Verify that the resources from Device A are visible on Device B

**Expected Result:** The game state should synchronize across devices when using the same account.

### Test Case 5.2: Conflict Resolution
**Description:** Verify that the game resolves conflicts when both devices have made changes.

**Steps:**
1. Log in to the game on Device A
2. Generate some resources on Device A
3. Disconnect Device A from the internet
4. Log in to the game on Device B with the same account
5. Generate different resources on Device B
6. Save on Device B
7. Reconnect Device A to the internet
8. Trigger a save on Device A
9. Verify that the conflict is resolved by using the most recent save

**Expected Result:** The game should detect the conflict and resolve it by using the timestamp comparison.

### Test Case 5.3: Offline Progress on Multiple Devices
**Description:** Verify that offline progress works correctly when using multiple devices.

**Steps:**
1. Log in to the game on Device A
2. Upgrade auto-generation for energy
3. Log out from Device A
4. Wait for 5 minutes
5. Log in to the game on Device B with the same account
6. Verify that offline progress is calculated correctly
7. Generate some more resources on Device B
8. Log out from Device B
9. Log in to the game on Device A again
10. Verify that the changes from Device B are visible on Device A

**Expected Result:** Offline progress should be calculated correctly regardless of which device is used, and changes should synchronize across devices.

## Test Automation Suggestions

For critical functionality, consider implementing automated tests:

1. **Unit Tests:** 
   - Test the `calculateOfflineProgress` function with various inputs
   - Test the resource update functions with different scenarios
   - Test localStorage backup and recovery methods

2. **Integration Tests:**
   - Test the save/load cycle with simulated network delays
   - Test the offline progress calculation end-to-end
   - Test migration between different save format versions

3. **Performance Tests:**
   - Measure the time taken to save and load with different state sizes
   - Test the debounce functionality during rapid state changes

## Test Environment Setup

To facilitate testing, create a test environment with:

1. A testing account with predefined progress
2. Mock server endpoints to simulate different network conditions
3. A tool to manipulate the system clock for offline progress testing
4. A method to simulate different devices (e.g., multiple browsers or profiles) 