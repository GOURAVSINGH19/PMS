# 🧪 GMS Frontend - Testing Checklist

## Pre-flight Checks

- [ ] Backend is running on http://localhost:8000
- [ ] PostgreSQL database is running
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Frontend is running on http://localhost:3000

## Authentication Tests

### Login
- [ ] Can access login page at http://localhost:3000/login
- [ ] Form validation works (empty fields)
- [ ] Invalid credentials show error
- [ ] Valid credentials log in successfully
- [ ] Redirects to dashboard after login
- [ ] Token stored in localStorage
- [ ] User info stored in localStorage

### Authorization
- [ ] Logged-in users can access dashboard
- [ ] Non-logged-in users redirect to login
- [ ] Admin can access /users and /teams
- [ ] Non-admin cannot access /users and /teams
- [ ] Logout clears token and redirects to login

## Dashboard Tests

- [ ] Dashboard loads without errors
- [ ] Statistics cards show correct counts
- [ ] Recent goals list displays
- [ ] Create Goal button visible
- [ ] Clicking stats navigates to filtered views
- [ ] At-risk count is accurate

## Goal Creation Tests

- [ ] Create Goal page loads
- [ ] All form fields render correctly
- [ ] Level dropdown has all options
- [ ] Tag dropdown has all options
- [ ] Priority dropdown shows weightage
- [ ] User dropdown loads all users
- [ ] Start date picker works
- [ ] Selecting tag + assignee shows weightage check
- [ ] Remaining weightage displays correctly
- [ ] Cannot submit if weightage exceeds limit
- [ ] Form validation works
- [ ] Goal creates successfully
- [ ] Redirects to goals list after creation
- [ ] Success toast appears

## Goals List Tests

- [ ] Goals list page loads
- [ ] All goals display in table
- [ ] Status badges show correct colors
- [ ] Priority badges show correct colors
- [ ] Progress bars display correctly
- [ ] At-risk indicator shows for at-risk goals
- [ ] View link navigates to goal detail
- [ ] Create Goal button works
- [ ] Filter by status works (URL params)
- [ ] Filter by at-risk works

## Goal Detail Tests

### Basic Display
- [ ] Goal detail page loads
- [ ] Title displays correctly
- [ ] Status badge shows
- [ ] Priority badge shows
- [ ] At-risk indicator shows if applicable
- [ ] Progress card shows percentage and bar
- [ ] Time elapsed card shows percentage
- [ ] Days remaining shows
- [ ] Weightage displays
- [ ] All details (level, tag, dates, assignee, creator) show
- [ ] Description displays if present

### Draft Status Actions
- [ ] Submit for Approval button shows for creator
- [ ] Submit action works
- [ ] Status changes to Pending Approval
- [ ] Success toast appears

### Pending Approval Actions
- [ ] Approve button shows for manager/admin
- [ ] Reject button shows for manager/admin
- [ ] Approve action works
- [ ] Reject action prompts for reason
- [ ] Reject action works
- [ ] Status changes accordingly

### Active Status Actions
- [ ] Update Progress button shows for assignee
- [ ] Mark Complete button shows for assignee
- [ ] Progress modal opens
- [ ] Progress slider works
- [ ] Notes field works
- [ ] Progress updates successfully
- [ ] Complete action works
- [ ] Status changes to Completed then Awaiting Feedback

### Subtasks
- [ ] Subtasks section displays
- [ ] Add Subtask button shows for assignee when active
- [ ] Add subtask modal opens
- [ ] Can add subtask with title and description
- [ ] Subtask appears in list
- [ ] Can toggle subtask completion
- [ ] Goal completion auto-calculates
- [ ] Can delete subtask
- [ ] Subtasks not editable when goal not active

### Feedback
- [ ] Feedback section displays
- [ ] Submit Member Feedback button shows for assignee
- [ ] Submit Evaluator Feedback button shows for manager/admin
- [ ] Member feedback modal opens
- [ ] Can submit deliverables and improvements
- [ ] Evaluator feedback modal opens
- [ ] All 5 rating sliders work
- [ ] Can submit evaluator comment
- [ ] Feedback displays after submission
- [ ] Status changes to Scorable after both feedbacks

### Scoring
- [ ] Score section displays
- [ ] Submit Score button shows for manager/admin when scorable
- [ ] Score modal opens
- [ ] Can select performance rating
- [ ] Score submits successfully
- [ ] Score displays after submission
- [ ] Status changes to Scored

## User Management Tests (Admin Only)

- [ ] Users page loads for admin
- [ ] All users display in table
- [ ] Add User button shows
- [ ] Add user modal opens
- [ ] Can create new user with all fields
- [ ] User appears in list
- [ ] Edit button opens modal with user data
- [ ] Can update user
- [ ] Delete button shows confirmation
- [ ] Can delete user
- [ ] Role dropdown works
- [ ] Team dropdown works
- [ ] Manager dropdown works
- [ ] Password field optional on edit

## Team Management Tests (Admin Only)

- [ ] Teams page loads for admin
- [ ] All teams display in cards
- [ ] Add Team button shows
- [ ] Add team modal opens
- [ ] Can create new team
- [ ] Team appears in list
- [ ] Manager dropdown shows only admin/manager users
- [ ] Edit button opens modal with team data
- [ ] Can update team
- [ ] Delete button shows confirmation
- [ ] Can delete team
- [ ] Member count displays correctly

## Navigation Tests

- [ ] Logo links to dashboard
- [ ] Dashboard nav link works
- [ ] Goals nav link works
- [ ] Users nav link shows for admin only
- [ ] Teams nav link shows for admin only
- [ ] Active page highlighted in nav
- [ ] User name displays in nav
- [ ] User role displays in nav
- [ ] Logout button works

## UI/UX Tests

### Visual
- [ ] Colors are consistent
- [ ] Fonts are readable
- [ ] Icons display correctly
- [ ] Buttons have hover states
- [ ] Links have hover states
- [ ] Progress bars animate
- [ ] Modals center correctly
- [ ] Forms are well-spaced
- [ ] Tables are readable

### Responsive
- [ ] Works on desktop (1920px)
- [ ] Works on laptop (1366px)
- [ ] Works on tablet (768px)
- [ ] Works on mobile (375px)
- [ ] Navigation adapts to screen size
- [ ] Tables scroll on mobile
- [ ] Modals fit on mobile
- [ ] Forms work on mobile

### Feedback
- [ ] Loading spinners show during API calls
- [ ] Success toasts appear for successful actions
- [ ] Error toasts appear for failed actions
- [ ] Form validation errors display
- [ ] Empty states show when no data
- [ ] Confirmation dialogs for destructive actions

## Error Handling Tests

- [ ] Invalid API responses show error toast
- [ ] Network errors show error toast
- [ ] 401 errors redirect to login
- [ ] 403 errors show appropriate message
- [ ] Form validation prevents submission
- [ ] Weightage validation prevents over-allocation
- [ ] Missing required fields show errors

## Performance Tests

- [ ] Pages load quickly
- [ ] No console errors
- [ ] No console warnings
- [ ] Images load properly (if any)
- [ ] Animations are smooth
- [ ] No memory leaks (check DevTools)
- [ ] API calls are not duplicated

## Browser Compatibility

- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge

## Security Tests

- [ ] Cannot access protected routes without login
- [ ] Cannot access admin routes without admin role
- [ ] Token expires and redirects to login
- [ ] Logout clears all auth data
- [ ] API calls include auth token
- [ ] Passwords are not visible in network tab
- [ ] No sensitive data in localStorage (except token)

## Integration Tests

- [ ] Creating goal reflects in dashboard stats
- [ ] Updating progress reflects in goals list
- [ ] Completing goal updates status everywhere
- [ ] Creating user shows in user dropdown
- [ ] Creating team shows in team dropdown
- [ ] Deleting user removes from dropdowns
- [ ] Deleting team updates users

## Edge Cases

- [ ] Empty goals list shows message
- [ ] Empty users list shows message
- [ ] Empty teams list shows message
- [ ] No subtasks shows message
- [ ] No feedback shows message
- [ ] No score shows message
- [ ] Long goal titles don't break layout
- [ ] Long descriptions don't break layout
- [ ] Special characters in input work
- [ ] Date edge cases work (past dates, future dates)

## Final Checks

- [ ] All features from backend are implemented
- [ ] All workflows work end-to-end
- [ ] No broken links
- [ ] No 404 errors
- [ ] No JavaScript errors
- [ ] README is accurate
- [ ] Documentation is complete
- [ ] Code is clean and commented
- [ ] Ready for production deployment

## Test Scenarios

### Scenario 1: Complete Goal Lifecycle
1. Login as admin
2. Create a new goal for a user
3. Goal should be auto-approved (admin created)
4. Login as that user
5. Update progress
6. Add subtasks
7. Complete subtasks
8. Mark goal complete
9. Submit member feedback
10. Login as manager
11. Submit evaluator feedback
12. Submit score
13. Verify goal is scored

### Scenario 2: Approval Workflow
1. Login as member
2. Create a goal
3. Submit for approval
4. Login as manager
5. Approve the goal
6. Verify status is active

### Scenario 3: Weightage Validation
1. Create goals totaling 90% weightage for a user/period
2. Try to create another goal with 20% weightage
3. Should show error about exceeding limit
4. Create goal with 10% weightage
5. Should succeed

### Scenario 4: Admin Management
1. Login as admin
2. Create a team
3. Create a user and assign to team
4. Create another user as manager
5. Assign manager to team
6. Verify hierarchy works

## Notes

- Test with different user roles (admin, manager, member)
- Test with different goal statuses
- Test with different priorities and tags
- Test with multiple users and teams
- Test edge cases and error scenarios
- Check browser console for any errors
- Verify all API calls succeed
- Check network tab for proper requests

## Sign-off

- [ ] All critical tests passed
- [ ] All major features work
- [ ] No blocking bugs
- [ ] Ready for demo/production

**Tested by**: _______________
**Date**: _______________
**Notes**: _______________
