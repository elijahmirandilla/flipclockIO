// DOM Elements
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const ampmEl = document.getElementById("ampm");
const flipSound = document.getElementById("flipSound");
const soundToggle = document.getElementById("soundToggle");
const timezoneToggle = document.getElementById("timezoneToggle");
const themeToggle = document.getElementById("themeToggle");
const resizeToggle = document.getElementById("resizeToggle");
const clockContainer = document.querySelector(".clock");

// State
let useLocalTime = true;
let soundEnabled = false;
let darkMode = true;
let sizeState = 0; // 0=default, 1=medium, 2=large

// Initialize
function init() {
  loadPreferences();
  setupEventListeners();
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
  
  if (soundEnabled) soundToggle.classList.add('active');
  if (!darkMode) toggleTheme(false);
}

function setupEventListeners() {
  soundToggle.addEventListener('click', toggleSound);
  timezoneToggle.addEventListener('click', toggleTimezone);
  themeToggle.addEventListener('click', () => toggleTheme(true));
  resizeToggle.addEventListener('click', toggleSize);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyS') toggleSound();
    if (e.code === 'KeyT') toggleTimezone();
    if (e.code === 'KeyD') toggleTheme(true);
    if (e.code === 'KeyR') toggleSize();
  });
}

// Clock functions
function getCurrentTime() {
  const now = new Date();
  
  if (!useLocalTime) {
    // US Eastern Time conversion
    const options = { timeZone: 'America/New_York', hour12: true };
    const usTime = now.toLocaleTimeString('en-US', options);
    const [time, ampm] = usTime.split(' ');
    let [hours, minutes] = time.split(':');
    
    return {
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      ampm
    };
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
    flipSound.currentTime = 0;
    flipSound.play().catch(console.error);
  }
}

function toggleTimezone() {
  useLocalTime = !useLocalTime;
  timezoneToggle.classList.toggle('active');
  updateClock();
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
    flipSound.currentTime = 0;
    flipSound.play().catch(console.error);
  }
}

function toggleSize() {
  sizeState = (sizeState + 1) % 3;
  
  switch(sizeState) {
    case 0: // Default
      document.documentElement.style.setProperty('--clock-scale', '1');
      document.documentElement.style.setProperty('--glow-opacity', '0');
      break;
    case 1: // Medium
      document.documentElement.style.setProperty('--clock-scale', '1.2');
      document.documentElement.style.setProperty('--glow-opacity', '0.3');
      break;
    case 2: // Large
      document.documentElement.style.setProperty('--clock-scale', '1.5');
      document.documentElement.style.setProperty('--glow-opacity', '0.6');
      break;
  }
  
  if (soundEnabled) {
    flipSound.currentTime = 0;
    flipSound.play().catch(console.error);
  }
}

// Start the clock
init();