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

// State
let dropdownOpen = false;
let soundEnabled = false;
let darkMode = true;
let sizeState = 0; // 0=default, 1=medium, 2=large
let currentTimezone = 'local';
let timezones = [];

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
    if (e.code === 'Escape') timezoneContainer.classList.remove('active');
  });
  
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

function toggleTheme(playSound) {
  darkMode = !darkMode;
  document.body.classList.toggle("light-mode");
  themeToggle.classList.toggle('active');
  localStorage.setItem('darkMode', darkMode);
  
  // Update icon
  const icon = themeToggle.querySelector('object');
  icon.data = `assets/icons/${darkMode ? 'sun' : 'moon'}.svg`;
  
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



// Start the clock
init();
