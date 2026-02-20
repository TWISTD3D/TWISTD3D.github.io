// sync.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getDatabase, ref, set, onValue } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

const firebaseConfig = {
  apiKey:            "AIzaSyDcGq4UF6wqKLcI7zidskV8OKOM06AUDTM",
  authDomain:        "server-19034.firebaseapp.com",
  databaseURL:       "https://server-19034-default-rtdb.firebaseio.com",
  projectId:         "server-19034",
  storageBucket:     "server-19034.firebasestorage.app",
  messagingSenderId: "860267587022",
  appId:             "1:860267587022:web:83c5629f49a58789d1379f"
};

let db, profileRef;

// call this once on page load
export function initFirebaseSync() {
  try {
    const app = initializeApp(firebaseConfig);
    db  = getDatabase(app);
    profileRef = ref(db, 'profile');

    // expose save function globally so your existing code can call it
    window.saveProfileToFirebase = async function saveProfileToFirebase() {
      // build the same publicMeta object you already use
      const publicMeta = {
        username: document.getElementById('username-el')?.textContent || '',
        bio: (window.bioTexts && window.bioTexts[0]) || '',
        tab: (window.tabTexts && window.tabTexts[0]) || '',
        status: window.currentStatus || 'offline',
        badges: window.badgeData || [],
        volLabel: window.volLabel || '',
        brightLabel: window.brightLabel || '',
        pfpText: document.getElementById('avatar-fallback')?.textContent || '',
        socialLinks: window.socialLinks || {}
      };

      await set(profileRef, publicMeta);
      console.log('Profile saved to Firebase');
    };

    // listen for changes and apply them
    window._fbPending = null;

    onValue(profileRef, (snap) => {
      const d = snap.exists() ? snap.val() : null;
      if (!d) return;

      if (window.applyProfileData) {
        window.applyProfileData(d);
      } else {
        window._fbPending = d;
      }
    });

    // flush pending once DOM + your scripts are ready
    window.addEventListener('DOMContentLoaded', () => {
      if (window._fbPending && window.applyProfileData) {
        window.applyProfileData(window._fbPending);
        window._fbPending = null;
      }
    });

    console.log('Firebase sync ready ✓');
  } catch (e) {
    console.warn('Firebase init failed — using local only:', e);
  }
}
