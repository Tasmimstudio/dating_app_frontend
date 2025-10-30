# Backend API Requirements for Full Functionality

## ✅ Already Working (Confirmed)
1. `POST /swipes/` - Create swipe (like, dislike, super_like)
2. `GET /users/{user_id}/potential-matches` - Get users to swipe
3. `GET /photos/user/{user_id}` - Get user photos
4. `GET /swipes/received-likes/{user_id}` - Get people who liked you
5. `GET /swipes/sent-likes/{user_id}` - Get people you liked
6. `GET /matches/{user_id}` - Get mutual matches
7. `GET /messages/{user1_id}/{user2_id}` - Get messages between users
8. `POST /messages/` - Send a message
9. `GET /messages/{user_id}/conversations` - Get conversations list
10. `GET /users/{user_id}` - Get user profile
11. `PUT /users/{user_id}` - Update user profile
12. `PUT /users/{user_id}/preferences` - Update user preferences

## ⚠️ Need to Verify/Add

### Critical for Current Features:
13. **Swipe Undo Support**
    - Need: `DELETE /swipes/{swipe_id}` or undo mechanism
    - Alternative: Just rewind to previous card (frontend only - already works!)

14. **Multiple Photos Support**
    - Verify: `/photos/user/{user_id}` returns array of ALL photos
    - Should return: `[{photo_id, url, is_primary, order}, ...]`

### For Phase 2 Features (Messaging):
15. **Real-time Messaging** (Optional but recommended)
    - WebSocket endpoint for live messages
    - Or: Polling with `GET /messages/new/{user_id}?since={timestamp}`

16. **Message Read Status**
    - `PATCH /messages/{message_id}/read` - Mark message as read
    - Response should include `read_at` timestamp

17. **Typing Indicator** (Optional)
    - WebSocket event or
    - `POST /messages/typing/{conversation_id}` with TTL

18. **Online Status**
    - `GET /users/{user_id}/status` - Get online/offline status
    - `PUT /users/status` - Update own status (last_seen)

### For Phase 3 Features (Safety):
19. **Block User**
    - `POST /users/{user_id}/block/{blocked_user_id}`
    - `DELETE /users/{user_id}/block/{blocked_user_id}` - Unblock
    - `GET /users/{user_id}/blocked` - List blocked users

20. **Report User**
    - `POST /reports/`
      ```json
      {
        "reporter_id": 123,
        "reported_user_id": 456,
        "reason": "inappropriate_content",
        "description": "Details here",
        "evidence": []
      }
      ```
    - Reasons: harassment, inappropriate_content, fake_profile, spam, other

### For Phase 4 Features (Enhanced Profile):
21. **Interests/Hobbies**
    - `GET /interests` - Get all available interests
    - `GET /users/{user_id}/interests` - Get user interests
    - `PUT /users/{user_id}/interests` - Update interests
      ```json
      {
        "interests": ["hiking", "reading", "cooking", "travel"]
      }
      ```

22. **Distance Calculation**
    - Ensure user profiles include `latitude` and `longitude`
    - Calculate distance on backend or frontend
    - Return in potential matches: `distance_km: 5.2`

23. **Advanced Filters**
    - `GET /users/{user_id}/potential-matches?filters={...}`
    - Filters: `min_age, max_age, max_distance, interests, education_level`

### For Phase 5 Features (Premium/Limits):
24. **Swipe Limits**
    - `GET /users/{user_id}/swipe-limits`
      ```json
      {
        "daily_swipes_remaining": 50,
        "super_likes_remaining": 3,
        "resets_at": "2025-10-16T00:00:00Z"
      }
      ```
    - Backend should track and enforce limits

25. **Notifications**
    - `GET /notifications/{user_id}` - Get notifications
    - `POST /notifications/mark-read/{notification_id}`
    - Types: new_match, new_message, profile_view, super_like

26. **Profile Views**
    - `POST /profile-views/` - Record profile view
      ```json
      {"viewer_id": 123, "viewed_user_id": 456}
      ```
    - `GET /profile-views/{user_id}` - Who viewed your profile

27. **Profile Verification**
    - `POST /verification/request` - Request verification
    - `GET /users/{user_id}/verification-status`

## 🔧 Database Schema Requirements

### Additional Tables Needed:
```sql
-- Blocks
CREATE TABLE blocks (
    id SERIAL PRIMARY KEY,
    blocker_id INTEGER REFERENCES users(user_id),
    blocked_id INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(blocker_id, blocked_id)
);

-- Reports
CREATE TABLE reports (
    report_id SERIAL PRIMARY KEY,
    reporter_id INTEGER REFERENCES users(user_id),
    reported_user_id INTEGER REFERENCES users(user_id),
    reason VARCHAR(50),
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Interests
CREATE TABLE interests (
    interest_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE user_interests (
    user_id INTEGER REFERENCES users(user_id),
    interest_id INTEGER REFERENCES interests(interest_id),
    PRIMARY KEY (user_id, interest_id)
);

-- Notifications
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    type VARCHAR(50),
    content TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Profile Views
CREATE TABLE profile_views (
    id SERIAL PRIMARY KEY,
    viewer_id INTEGER REFERENCES users(user_id),
    viewed_user_id INTEGER REFERENCES users(user_id),
    viewed_at TIMESTAMP DEFAULT NOW()
);

-- Swipe Limits
CREATE TABLE swipe_limits (
    user_id INTEGER PRIMARY KEY REFERENCES users(user_id),
    daily_swipes INTEGER DEFAULT 50,
    super_likes INTEGER DEFAULT 3,
    last_reset DATE DEFAULT CURRENT_DATE
);
```

### Modify Existing Tables:
```sql
-- Add to users table
ALTER TABLE users
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD COLUMN last_seen TIMESTAMP,
ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;

-- Add to messages table
ALTER TABLE messages
ADD COLUMN read_at TIMESTAMP,
ADD COLUMN read BOOLEAN DEFAULT FALSE;

-- Add to swipes table (for undo)
ALTER TABLE swipes
ADD COLUMN swipe_id SERIAL PRIMARY KEY;
```

## 📝 Priority Implementation Order:

### Immediate (For current features to work):
1. ✅ Multiple photos endpoint (verify it returns all photos)
2. ✅ Swipe undo (frontend only - already implemented!)

### High Priority (Next phase):
3. Block/unblock users
4. Report system
5. Message read status
6. Online status

### Medium Priority:
7. Interests system
8. Distance calculation
9. Advanced filters
10. Profile views tracking

### Low Priority (Premium features):
11. Swipe limits
12. Notifications system
13. Real-time WebSockets
14. Profile verification

## 🧪 Testing Checklist:

- [ ] Create multiple test users with photos
- [ ] Test swiping all actions (like, dislike, super_like)
- [ ] Test matching when both users like each other
- [ ] Test messaging between matched users
- [ ] Test profile viewing with multiple photos
- [ ] Test undo functionality
- [ ] Verify all photos load in profile modal
- [ ] Test on mobile devices
- [ ] Test with slow network (loading states)
- [ ] Test error handling (network failures)

## 🚀 Quick Wins (Can implement now without backend changes):

1. ✅ Profile view modal - DONE
2. ✅ Photo carousel - DONE
3. ✅ Undo button - DONE
4. Loading skeletons for cards
5. Animations for swipe actions
6. Keyboard shortcuts (arrow keys to swipe)
7. Profile completeness indicator (calculated frontend)
8. Local caching of profiles
9. Optimistic UI updates
10. Better error messages

Would you like me to implement any of the "Quick Wins" while we wait for backend support?
