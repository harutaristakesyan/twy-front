# Mock API Testing Guide - CRUD Operations

## 🎯 What You Can Test

Your mock system now supports **full CRUD operations** for users:
- ✅ **Create** - Add new users to the mock store
- ✅ **Read** - View the users list
- ✅ **Update** - Edit user details (role, branch, active status)
- ✅ **Delete** - Remove users from the mock store
- ✅ **Profile** - View and update your own profile (My Profile tab)

All changes are **persistent** during your session (until page refresh).

---

## 🚀 Getting Started

1. **Ensure dev server is running**: 
   ```bash
   npm run dev
   ```

2. **Open browser**: Go to `http://localhost:5174/` (or the port shown in terminal)

3. **Navigate to Users page**: Click "Users" in the sidebar

4. **Open browser console**: Press `F12` or `Cmd+Option+I` to see debug logs

---

## 📋 Expected Initial State

You should see **4 mock users**:

| Name | Email | Role | Branch | Status |
|------|-------|------|--------|--------|
| John Doe | john.doe@example.com | Owner | Main Branch | ✅ Active |
| Jane Smith | jane.smith@example.com | Accountant | Main Branch | ✅ Active |
| Bob Johnson | bob.johnson@example.com | Agent | Secondary Branch | ❌ Inactive |
| Alice Williams | alice.williams@example.com | Carrier | Regional Branch | ✅ Active |

---

## 🧪 Test Scenario 1: Create a New User

### Steps:
1. Click the **"Add User"** button (top right)
2. Fill in the form:
   - **First Name**: `Mike`
   - **Last Name**: `Wilson`
   - **Email**: `mike.wilson@example.com`
   - **Role**: Select `Agent`
   - **Branch**: Select `Main Branch`
   - **Status**: Toggle to `Active`
3. Click **"Create User"** button

### Expected Results:
- ✅ Success message: "User created successfully"
- ✅ Modal closes automatically
- ✅ Table refreshes and shows **5 users** (Mike Wilson added)
- ✅ Statistics cards update (Total Users: 5, Active: 4)

### Console Logs to Look For:
```
🔍 Interceptor checking: POST /users
✅ Matched users endpoint, forwarding to handler
🎭 Mock POST /users
🔵 POST /users intercepted, creating user: {...}
✅ User created successfully: {...}
📊 Total users in store: 5
```

---

## 🧪 Test Scenario 2: Edit an Existing User

### Steps:
1. Find **"Bob Johnson"** in the table (the inactive Agent)
2. Click the **Edit icon** (pencil) in the Actions column
3. In the modal, change:
   - **Role**: Change from `Agent` to `Carrier`
   - **Status**: Toggle to `Active` (currently Inactive)
4. Click **"Update User"** button

### Expected Results:
- ✅ Success message: "User updated successfully"
- ✅ Modal closes
- ✅ Table refreshes
- ✅ Bob Johnson now shows as `Carrier` with `Active` status
- ✅ Statistics update (Active Users: 4 → 4 or 5, Carriers: 1 → 2)

### Console Logs to Look For:
```
🔍 Interceptor checking: PUT /users/3
✅ Matched users endpoint, forwarding to handler
🎭 Mock PUT /users/3
🟡 PUT /users/3 intercepted, updating user: {...}
✅ User updated successfully: {...}
```

---

## 🧪 Test Scenario 3: Delete a User

### Steps:
1. Find **"Alice Williams"** in the table
2. Click the **Delete icon** (trash) in the Actions column
3. A confirmation dialog appears
4. Click **"Yes"** to confirm deletion

### Expected Results:
- ✅ Success message: "User deleted successfully"
- ✅ Table refreshes
- ✅ Alice Williams is **removed** from the table
- ✅ Total users count decreases (5 → 4 or 4 → 3)
- ✅ Statistics update accordingly

### Console Logs to Look For:
```
🔍 Interceptor checking: DELETE /users/4
✅ Matched users endpoint, forwarding to handler
🎭 Mock DELETE /users/4
🔴 DELETE /users/4 intercepted, deleting user
✅ User deleted successfully, ID: 4
📊 Remaining users in store: 4
```

---

## 🧪 Test Scenario 4: My Profile (Self Update)

Test the profile page functionality:

### Steps:
1. Navigate to Users page
2. Click on the **"My Profile"** tab (next to "User Management")
3. You should see the current user profile (John Doe - Owner)
4. Click **"Edit Profile"** button
5. Update the profile:
   - **First Name**: Change to `Jonathan`
   - **Last Name**: Change to `Doe`
   - **Email**: Change to `jonathan.doe@example.com`
6. Click **"Save Changes"** button

### Expected Results:
- ✅ Success message: "Profile updated successfully"
- ✅ Form becomes read-only again
- ✅ Profile displays updated information
- ✅ Changes persist in the User Management table
- ✅ If you edit John Doe in the User Management tab, you'll see the updated info

### Console Logs to Look For:
```
🔍 Interceptor checking: GET /users/me
✅ Matched users endpoint, forwarding to handler
🎭 Mock GET /users/me
👤 GET /users/me intercepted, fetching current user profile
✅ Current user profile retrieved: {...}

🔍 Interceptor checking: PUT /users/self
✅ Matched users endpoint, forwarding to handler
🎭 Mock PUT /users/self
👤 PUT /users/self intercepted, updating current user profile: {...}
✅ Profile updated successfully: {...}
```

### Important Note:
- The profile page updates the **same user** that appears in the User Management table
- Mock system simulates you as logged in as **John Doe** (ID: 1, Owner role)
- Any changes in "My Profile" will be reflected in the User Management table and vice versa

---

## 🧪 Test Scenario 5: Complete Workflow

Test all operations together:

1. **CREATE**: Add 2 new users
   - Sarah Connor (Owner, Main Branch, Active)
   - Kyle Reese (Accountant, Secondary Branch, Active)

2. **READ**: Verify table shows 6 users total

3. **UPDATE**: 
   - Change Jane Smith's role to Accountant
   - Change Bob Johnson's status to Active

4. **PROFILE UPDATE**:
   - Go to "My Profile" tab
   - Update your (John Doe's) email and name

5. **DELETE**: Remove Alice Williams

6. **VERIFY**: 
   - Final count: 5 users
   - Active users count updated
   - Role distribution changed in statistics
   - Your profile changes reflected in User Management table

---

## 🔍 Verification Checklist

### ✅ Mock API is Working If:
- [ ] Console shows: `🎭 Mock API is enabled`
- [ ] Console shows: `🔧 Mock Config: { ENABLE_MOCK_API: true, ... }`
- [ ] Orange badge `🎭 MOCK MODE` visible in bottom-right corner
- [ ] Initial table shows 4 mock users
- [ ] Create/Edit/Delete operations complete without errors
- [ ] "My Profile" tab loads and displays John Doe's profile
- [ ] Profile updates work and reflect in User Management table

### ❌ Troubleshooting If Not Working:

| Issue | Solution |
|-------|----------|
| No users in table | Check console for `ENABLE_MOCK_API: true` |
| Console shows `Mock API is disabled` | Restart dev server: `Ctrl+C`, then `npm run dev` |
| No orange badge | Mocks not enabled - check `.env.development` |
| "Failed to fetch users" error | Check if interceptor is catching requests |
| Created user disappears after refresh | **Expected behavior** - mock data resets on refresh |

---

## 📊 Console Debug Logs Reference

### Successful GET (Read):
```
🔍 Interceptor checking: GET /users
✅ Matched users endpoint, forwarding to handler
🎭 Mock GET /users
📋 Returning mock users from store
📊 Mock users count: 4 [Array]
```

### Successful POST (Create):
```
🔍 Interceptor checking: POST /users
✅ Matched users endpoint, forwarding to handler
🎭 Mock POST /users
🔵 POST /users intercepted, creating user: {firstName: 'Mike', ...}
✅ User created successfully: {id: '5', firstName: 'Mike', ...}
📊 Total users in store: 5
```

### Successful PUT (Update):
```
🔍 Interceptor checking: PUT /users/3
✅ Matched users endpoint, forwarding to handler
🎭 Mock PUT /users/3
🟡 PUT /users/3 intercepted, updating user: {role: 'carrier', ...}
✅ User updated successfully: {id: '3', role: 'carrier', ...}
```

### Successful DELETE:
```
🔍 Interceptor checking: DELETE /users/4
✅ Matched users endpoint, forwarding to handler
🎭 Mock DELETE /users/4
🔴 DELETE /users/4 intercepted, deleting user
✅ User deleted successfully, ID: 4
📊 Remaining users in store: 3
```

### Successful GET Current User (Profile):
```
🔍 Interceptor checking: GET /users/me
✅ Matched users endpoint, forwarding to handler
🎭 Mock GET /users/me
👤 GET /users/me intercepted, fetching current user profile
✅ Current user profile retrieved: {id: '1', firstName: 'John', ...}
```

### Successful PUT Self Update (Profile):
```
🔍 Interceptor checking: PUT /users/self
✅ Matched users endpoint, forwarding to handler
🎭 Mock PUT /users/self
👤 PUT /users/self intercepted, updating current user profile: {...}
✅ Profile updated successfully: {id: '1', firstName: 'Jonathan', ...}
```

---

## 🎓 Advanced Testing

### Test Edge Cases:

1. **Rapid Operations**: Create 3 users quickly in succession
2. **Filter Testing**: Use search and filters after CRUD operations
3. **Statistics Validation**: Verify all stat cards update correctly
4. **Pagination**: Add 15+ users to test pagination
5. **Concurrent Edits**: Open edit modal for one user, then another

### Test Search & Filters:

1. Create users with varied properties
2. Test search by name/email
3. Filter by role (Owner, Agent, etc.)
4. Filter by status (Active/Inactive)
5. Combine filters

---

## 💡 Pro Tips

1. **Keep Console Open**: All operations are logged for debugging
2. **Check Network Tab**: You'll see requests but they're intercepted
3. **Mock Delay**: 500ms delay simulates real API (configurable in mockConfig.ts)
4. **Persistent Changes**: Mock data persists until you refresh the page
5. **Click Orange Badge**: Shows current mock configuration in console

---

## 🎉 Success Criteria

You'll know everything is working perfectly when:
- ✅ All 4 initial users load immediately
- ✅ Can create users and see them appear in table
- ✅ Can edit users and see changes reflected
- ✅ Can delete users and see them removed
- ✅ "My Profile" tab loads with John Doe's information
- ✅ Can edit profile and changes persist across tabs
- ✅ Statistics cards update after each operation
- ✅ Console shows detailed logs for every operation
- ✅ Success messages appear after each action
- ✅ Table refreshes automatically after operations

---

## 📝 Notes

- **Data Persistence**: Mock data is **in-memory only** and resets on page refresh
- **Real API**: When backend is ready, set `VITE_ENABLE_MOCKS=false` in `.env.development`
- **Production**: Mocks are automatically disabled in production builds
- **Network Delay**: 500ms delay is intentional to simulate real API latency

---

**Happy Testing! 🚀**

For any issues, check the browser console for detailed debug logs.

