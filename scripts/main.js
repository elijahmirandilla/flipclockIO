// DOM Elements
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const ampmEl = document.getElementById("ampm");
const flipSound = document.getElementById("flipSound");
const darkSound = document.getElementById("darkSound");
const lightSound = document.getElementById("lightSound");
const soundSound = document.getElementById("soundSound");
const timezoneSound = document.getElementById("timezoneSound");
const zoomSound = document.getElementById("zoomSound");
const soundToggle = document.getElementById("soundToggle");
const timezoneToggle = document.getElementById("timezoneToggle");
const themeToggle = document.getElementById("themeToggle");
const resizeToggle = document.getElementById("resizeToggle");
const clockContainer = document.querySelector(".clock");
const timezoneContainer = document.querySelector(".timezone-container");
const timezoneList = document.getElementById("timezoneList");
const timezoneSearch = document.getElementById("timezoneSearch");
const fullscreenToggle = document.getElementById("fullscreenToggle");
const shootingStarContainer = document.createElement('div');
shootingStarContainer.className = 'shooting-star-container';
document.body.appendChild(shootingStarContainer);

// State
let dropdownOpen = false;
let soundEnabled = false;
let darkMode = true;
let sizeState = 0; // 0=default, 1=medium, 2=large
let currentTimezone = 'local';
let timezones = [];
let isFullscreen = false;

// Timezone data
const timezoneData = [
  { name: 'Local Time', id: 'local' },
  { name: 'Pacific Time (US & Canada)', id: 'America/Los_Angeles', offset: 'PT' },
  { name: 'Mountain Time (US & Canada)', id: 'America/Denver', offset: 'MT' },
  { name: 'Central Time (US & Canada)', id: 'America/Chicago', offset: 'CT' },
  { name: 'Eastern Time (US & Canada)', id: 'America/New_York', offset: 'ET' },
  { name: 'London', id: 'Europe/London', offset: 'GMT' },
  { name: 'Berlin', id: 'Europe/Berlin', offset: 'CET' },
  { name: 'Paris', id: 'Europe/Paris', offset: 'CET' },
  { name: 'Tokyo', id: 'Asia/Tokyo', offset: 'JST' },
  { name: 'Sydney', id: 'Australia/Sydney', offset: 'AEST' },
  { name: 'Beijing', id: 'Asia/Shanghai', offset: 'CST' },
  { name: 'Dubai', id: 'Asia/Dubai', offset: 'GST' },
  { name: 'Moscow', id: 'Europe/Moscow', offset: 'MSK' },
  { name: 'Singapore', id: 'Asia/Singapore', offset: 'SGT' },
  { name: 'India', id: 'Asia/Kolkata', offset: 'IST' },
  { name: 'Brazil (East)', id: 'America/Sao_Paulo', offset: 'BRT' },
  { name: 'UTC', id: 'UTC', offset: 'UTC' }
];

// Initialize
function init() {
  loadPreferences();
  setupEventListeners();
  populateTimezones();
  updateClock();
  setInterval(updateClock, 1000);
  
  // Preload sound after interaction
  document.body.addEventListener('click', () => {
    flipSound.load().catch(console.error);
  }, { once: true });
}

function loadPreferences() {
  soundEnabled = localStorage.getItem('soundEnabled') === 'true';
  darkMode = localStorage.getItem('darkMode') !== 'false';
  currentTimezone = localStorage.getItem('timezone') || 'local';
  
  if (soundEnabled) soundToggle.classList.add('active');
  if (!darkMode) toggleTheme(false);
  if (currentTimezone !== 'local') timezoneToggle.classList.add('active');
}

function setupEventListeners() {
  soundToggle.addEventListener('click', toggleSound);
  timezoneToggle.addEventListener('click', toggleTimezoneDropdown);
  themeToggle.addEventListener('click', () => toggleTheme(true));
  resizeToggle.addEventListener('click', toggleSize);
  
  // Close timezone dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!timezoneContainer.contains(e.target) && 
        e.target !== timezoneSearch && 
        !timezoneSearch.contains(e.target)) {
      timezoneContainer.classList.remove('active');
    }
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (dropdownOpen) {
      // Only allow Escape to close dropdown when it's open
      if (e.code === 'Escape') {
        timezoneContainer.classList.remove('active');
        dropdownOpen = false;
      }
      return;
    }

    if (e.code === 'KeyS') toggleSound();
    if (e.code === 'KeyT') toggleTimezoneDropdown();
    if (e.code === 'KeyD') toggleTheme(true);
    if (e.code === 'KeyR') toggleSize();
    if (e.code === 'KeyF') toggleFullscreen(); // New fullscreen shortcut
    if (e.code === 'Escape') timezoneContainer.classList.remove('active');
  });
  
  fullscreenToggle.addEventListener('click', toggleFullscreen);
  // Timezone search
  timezoneSearch.addEventListener('input', filterTimezones);
  timezoneSearch.addEventListener('click', (e) => e.stopPropagation());
}

function populateTimezones() {
  timezoneList.innerHTML = '';
  
  timezoneData.forEach(tz => {
    const item = document.createElement('div');
    item.className = 'timezone-item';
    if (tz.id === currentTimezone) item.classList.add('active');
    item.innerHTML = `
      <span>${tz.name}</span>
      ${tz.offset ? `<span class="offset">${tz.offset}</span>` : ''}
    `;
    item.addEventListener('click', () => selectTimezone(tz.id));
    timezoneList.appendChild(item);
  });
}

function filterTimezones() {
  const searchTerm = timezoneSearch.value.toLowerCase();
  const items = timezoneList.querySelectorAll('.timezone-item');
  
  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(searchTerm) ? 'flex' : 'none';
  });
}

function toggleTimezoneDropdown() {
  dropdownOpen = !dropdownOpen;
  timezoneContainer.classList.toggle('active');
  if (dropdownOpen) {
    setTimeout(() => timezoneSearch.focus(), 100);
  }
  if (soundEnabled) {
     timezoneSound.currentTime = 0;
     timezoneSound.play().catch(console.error);
   }
}

function selectTimezone(timezoneId) {
  currentTimezone = timezoneId;
  localStorage.setItem('timezone', timezoneId);
  
  // Update UI
  const items = timezoneList.querySelectorAll('.timezone-item');
  items.forEach(item => item.classList.remove('active'));
  
  const selectedItem = Array.from(items).find(item => 
    item.textContent.includes(timezoneData.find(tz => tz.id === timezoneId)?.name || 'Local Time')
  );
  if (selectedItem) selectedItem.classList.add('active');
  
  // Update button state
  if (timezoneId === 'local') {
    timezoneToggle.classList.remove('active');
  } else {
    timezoneToggle.classList.add('active');
  }
  
  updateClock();
  timezoneContainer.classList.remove('active');
  dropdownOpen = false;
  
  if (soundEnabled) {
    timezoneSound.currentTime = 0;
    timezoneSound.play().catch(console.error);
  }
}

// Clock functions
function getCurrentTime() {
  const now = new Date();
  
  if (currentTimezone !== 'local') {
    const options = { 
      timeZone: currentTimezone, 
      hour12: true,
      hour: 'numeric',
      minute: 'numeric'
    };
    
    try {
      const timeString = now.toLocaleTimeString('en-US', options);
      const [time, ampm] = timeString.split(' ');
      let [hours, minutes] = time.split(':');
      
      // Handle 24-hour format locales
      if (!ampm && hours >= 12) {
        ampm = 'PM';
        if (hours > 12) hours = hours - 12;
      } else if (!ampm) {
        ampm = 'AM';
      }
      
      return {
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        ampm: ampm || 'AM'
      };
    } catch (e) {
      console.error('Error with timezone:', e);
      // Fallback to local time
      currentTimezone = 'local';
      timezoneToggle.classList.remove('active');
    }
  }
  
  // Local time
  let hours = now.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  
  return {
    hours: String(hours).padStart(2, "0"),
    minutes: String(now.getMinutes()).padStart(2, "0"),
    ampm
  };
}

function updateClock() {
  const { hours, minutes, ampm } = getCurrentTime();

  updateNumber(hoursEl, hours);
  updateNumber(minutesEl, minutes);
  ampmEl.textContent = ampm;
}

function updateNumber(element, newValue) {
  if (element.dataset.time !== newValue) {
    if (soundEnabled) {
      setTimeout(() => {
        flipSound.currentTime = 0;
        flipSound.play().catch(console.error);
      }, 100);
    }
    
    setTimeout(() => {
      element.dataset.time = newValue;
      element.classList.add("flip");
      setTimeout(() => element.classList.remove("flip"), 600);
      element.textContent = newValue;
    }, 200);
  }
}

// Control functions
function toggleSound() {
  soundEnabled = !soundEnabled;
  soundToggle.classList.toggle('active');
  localStorage.setItem('soundEnabled', soundEnabled);
  
  if (soundEnabled) {
    soundSound.currentTime = 0;
    soundSound.play().catch(console.error);
  }
}


// Meteor cluster system
function createMeteorShower() {
  if (document.body.classList.contains('light-mode')) return;

  // Determine meteor color type
  let colorType = 'blue'; // default
  if (Math.random() > 0.7) {
    const colors = ['green', 'orange', 'purple'];
    colorType = colors[Math.floor(Math.random() * colors.length)];
  }
  if (Math.random() > 0.9) colorType = 'fireball';

  // Trigger copyright glow 5 seconds before
  const copyright = document.querySelector('.copyright');
  copyright.classList.add(`glow-${colorType}`);
  setTimeout(() => {
    copyright.classList.remove(`glow-${colorType}`);
  }, 5000);

  // Create meteors after 5 seconds
  setTimeout(() => {
    const meteorCount = Math.floor(1 + Math.random() * 3);
    const showerDuration = 2000;

    for (let i = 0; i < meteorCount; i++) {
      setTimeout(() => {
        const star = document.createElement('div');
        star.className = 'shooting-star';

        // Random properties
        const startY = 20 + Math.random() * (window.innerHeight * 0.5);
        const angle = -15 + (Math.random() * -15);
        const length = 100 + Math.random() * 100;
        const fallDistance = 100 + Math.random() * 200;
        const driftX = (Math.random() - 0.5) * 80;
        const duration = 0.7 + Math.random() * 1;
        const delay = Math.random() * 1000;

        // Set properties
        star.style.setProperty('--start-y', `${startY}px`);
        star.style.setProperty('--angle', `${angle}deg`);
        star.style.setProperty('--length', `${length}px`);
        star.style.setProperty('--fall-distance', `${fallDistance}px`);
        star.style.setProperty('--drift-x', `${driftX}px`);
        star.style.animation = `meteor ${duration}s ${delay}ms linear forwards`;

        // Apply color
        switch(colorType) {
          case 'green':
            star.style.background = `linear-gradient(90deg, 
              rgba(100,255,100,1) 0%, 
              rgba(100,220,150,0.8) 50%, 
              rgba(100,180,100,0) 100%)`;
            break;
          case 'orange':
            star.style.background = `linear-gradient(90deg, 
              rgba(255,180,100,1) 0%, 
              rgba(255,150,120,0.8) 50%, 
              rgba(255,120,100,0) 100%)`;
            break;
          case 'purple':
            star.style.background = `linear-gradient(90deg, 
              rgba(200,150,255,1) 0%, 
              rgba(180,160,255,0.8) 50%, 
              rgba(150,120,255,0) 100%)`;
            break;
          case 'fireball':
            star.style.height = '2px';
            star.style.filter = 'drop-shadow(0 0 8px rgba(255, 220, 150, 0.8))';
            star.style.background = `linear-gradient(90deg, 
              rgba(255,255,200,1) 0%, 
              rgba(255,220,150,0.9) 50%, 
              rgba(255,180,100,0) 100%)`;
            break;
          default: // blue
            star.style.background = `linear-gradient(90deg, 
              rgba(255,255,255,1) 0%, 
              rgba(150,220,255,0.8) 50%, 
              rgba(100,180,255,0) 100%)`;
        }

        shootingStarContainer.appendChild(star);
        setTimeout(() => star.remove(), duration * 1000 + delay);
      }, Math.random() * showerDuration);
    }
  }, 5000);
}

// Schedule meteor showers (now 10-20s for testing with 5s warning)
function scheduleMeteorShowers() {
  if (document.body.classList.contains('light-mode')) return;
  
  createMeteorShower();
  setTimeout(scheduleMeteorShowers, 30000 + Math.random() * 240000);
}

// Initialize
if (!document.body.classList.contains('light-mode')) {
  setTimeout(scheduleMeteorShowers, 5000); // Start first shower after 5s
}

function toggleTheme(playSound) {
  darkMode = !darkMode;
  document.body.classList.toggle("light-mode");
  themeToggle.classList.toggle('active');
  localStorage.setItem('darkMode', darkMode);
  
  // Update icon
  const icon = themeToggle.querySelector('object');
  icon.data = `assets/icons/${darkMode ? 'sun' : 'moon'}.svg`;
  
  // Start or stop shooting stars based on theme
  if (darkMode) {
    shootingStarContainer.innerHTML = ''; // Clear any existing stars
    scheduleShootingStar();
  } else {
    shootingStarContainer.innerHTML = '';
  }
    
  if (playSound && soundEnabled) {
    if (darkMode) {
    darkSound.currentTime = 0;
    darkSound.play().catch(console.error) }
    else {
    lightSound.currentTime = 0;
    lightSound.play().catch(console.error);
    }
  }
}

function toggleSize() {
  sizeState = (sizeState + 1) % 3;
  
  // Reset all classes first
  resizeToggle.classList.remove('active', 'medium-light', 'full-light');
  
  switch(sizeState) {
    case 0: // Default
      document.documentElement.style.setProperty('--size-scale', '1');
      // No light - no active class
      break;
    case 1: // Medium
      document.documentElement.style.setProperty('--size-scale', '1.2');
      resizeToggle.classList.add('active', 'medium-light');
      break;
    case 2: // Large
      document.documentElement.style.setProperty('--size-scale', '1.5');
      resizeToggle.classList.add('active', 'full-light');
      break;
  }
  
  if (soundEnabled) {
    zoomSound.currentTime = 0;
    zoomSound.play().catch(console.error);
  }
}

// New function for fullscreen toggle
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.error(`Error attempting to enable fullscreen: ${err.message}`);
    });
    isFullscreen = true;
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      isFullscreen = false;
    }
  }
  
  fullscreenToggle.classList.toggle('active');
  if (soundEnabled) {
    zoomSound.currentTime = 0;
    zoomSound.play().catch(console.error);
  }
}

// Handle fullscreen change
document.addEventListener('fullscreenchange', () => {
  isFullscreen = !!document.fullscreenElement;
  fullscreenToggle.classList.toggle('active', isFullscreen);
});


// Start the clock
init();
