# FoodDash – Changes & New Features

## 🆕 Features Added

### 1. 🔐 Google Login (Frontend + Backend)

**Frontend (LoginPage.jsx)**
- "Continue with Google" button using Google Identity Services (GSI)
- Handles both `google.accounts.id.prompt()` and rendered button modes
- On success: receives Google ID token → calls `/api/auth/google` → stores JWT

**Backend (New files)**
- `GoogleAuthDto.java` — request DTO `{ token: string }`
- `GoogleAuthService.java` — verifies Google token via `https://oauth2.googleapis.com/tokeninfo`, auto-creates user if new
- `AuthController.java` — new `POST /api/auth/google` endpoint

**Setup steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → APIs & Services → Credentials → Create OAuth 2.0 Client ID (Web application)
3. Add `http://localhost:5173` (and your production domain) to Authorized JavaScript origins
4. Copy the Client ID
5. In `frontend/src/pages/LoginPage.jsx`: replace `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID
6. In `backend/src/main/resources/application.properties`: replace `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID

---

### 2. 🌙 Dark / Light Mode

- **ThemeContext.jsx** — React context with `toggleTheme()`, persists in `localStorage`, prevents flash via `index.html` script
- **index.css** — CSS custom properties for both themes (`[data-theme="dark"]` / `[data-theme="light"]`)
- **Navbar** — Sun/Moon icon toggle button
- **ProfilePage** — Toggle switch in preferences section
- All components use CSS variables (`var(--text-primary)`, `var(--bg-card)`, etc.) instead of hardcoded dark colors

**Available CSS variables:**
```css
--bg-primary        /* page background */
--bg-card           /* card backgrounds */
--bg-input          /* input backgrounds */
--bg-glass          /* navbar/glass backgrounds */
--text-primary      /* main text */
--text-secondary    /* sub text */
--text-muted        /* placeholder/hint text */
```

---

### 3. 📍 Live Order Tracking (`/orders/:id/track`)

- Step-by-step visual tracker with animated progress line
- Steps: Placed → Confirmed → Preparing → Ready → On the Way → Delivered
- **Auto-polls every 10 seconds** for real-time updates
- Shows delivery agent name if assigned
- Itemized order summary at the bottom
- "Track" button added to OrdersPage for all active orders

---

### 4. ❤️ Favorites

- Heart button on every restaurant page (top-right of hero image)
- Stored in `localStorage` as `favorites`
- **FavoritesPage** (`/favorites`) — grid of saved restaurants with quick "Order Now"
- Available in nav for CUSTOMER role
- `favoritesApi` helper in `services/api.js`

---

### 5. 🏷️ Promo Codes

- Promo code input in CartPage with Apply/Remove flow
- Built-in codes: `WELCOME10` (10% off), `FLAT50` (₹50 off), `FIRST20` (20% off)
- Discount reflected in Bill Summary
- `promoCode` sent with order to backend
- Easy to extend: add codes to `promoCodes` object in `services/api.js`
- Backend can validate server-side in `OrderController.java`

---

### 6. 👤 Profile Page (`/profile`)

- Avatar display (Google profile photo or default icon)
- Editable name, phone, delivery address
- Google badge if signed in via Google
- Dark/Light mode toggle switch
- Notification toggle (UI)
- Sign out button

---

## 📁 New / Modified Files

### Frontend (`/frontend/src/`)
| File | Status |
|---|---|
| `context/ThemeContext.jsx` | ✅ NEW |
| `context/AuthContext.jsx` | 🔄 UPDATED — added `googleLogin` |
| `App.jsx` | 🔄 UPDATED — ThemeProvider, new routes |
| `index.css` | 🔄 UPDATED — CSS theme variables |
| `index.html` | 🔄 UPDATED — anti-FOUC script |
| `components/Navbar.jsx` | 🔄 UPDATED — theme toggle, profile link |
| `pages/LoginPage.jsx` | 🔄 UPDATED — Google Sign-In button |
| `pages/CartPage.jsx` | 🔄 UPDATED — promo codes, theme variables |
| `pages/OrdersPage.jsx` | 🔄 UPDATED — Track button |
| `pages/RestaurantPage.jsx` | 🔄 UPDATED — Favorite heart button |
| `pages/TrackOrderPage.jsx` | ✅ NEW |
| `pages/FavoritesPage.jsx` | ✅ NEW |
| `pages/ProfilePage.jsx` | ✅ NEW |
| `services/api.js` | 🔄 UPDATED — `authApi.googleLogin`, `favoritesApi`, `applyPromo` |

### Backend (`/backend/src/`)
| File | Status |
|---|---|
| `dto/GoogleAuthDto.java` | ✅ NEW |
| `service/GoogleAuthService.java` | ✅ NEW |
| `controller/AuthController.java` | 🔄 UPDATED — `/api/auth/google` endpoint |
| `resources/application.properties` | 🔄 UPDATED — `google.client-id` property |

