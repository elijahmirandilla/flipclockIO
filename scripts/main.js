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
const timerAlarmSound = document.getElementById("timerAlarmSound");
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

// Mode Selector Elements
const modeToggle = document.getElementById("modeToggle");

// Stopwatch Elements
const swHoursEl = document.getElementById("sw-hours");
const swMinutesEl = document.getElementById("sw-minutes");
const swSecondsEl = document.getElementById("sw-seconds");
const swCentisecondsEl = document.getElementById("sw-centiseconds");
const swStartBtn = document.getElementById("sw-start");
const swLapBtn = document.getElementById("sw-lap");
const swResetBtn = document.getElementById("sw-reset");
const lapsList = document.getElementById("lapsList");

// Timer Elements
const tmHoursEl = document.getElementById("tm-hours");
const tmMinutesEl = document.getElementById("tm-minutes");
const tmSecondsEl = document.getElementById("tm-seconds");
const tmStartBtn = document.getElementById("tm-start");
const tmResetBtn = document.getElementById("tm-reset");
const tmSetHours = document.getElementById("tm-set-hours");
const tmSetMinutes = document.getElementById("tm-set-minutes");
const tmSetSeconds = document.getElementById("tm-set-seconds");
const tmSetBtn = document.getElementById("tm-set");

// State
let scrollLocked = false;
let scrollPosition = 0;
let dropdownOpen = false;
let soundEnabled = false;
let darkMode = true;
let sizeState = 0;
let currentTimezone = 'local';
let timezones = [];
let isFullscreen = false;
let currentMode = 'clock';
let stopwatchInterval;
let stopwatchStartTime;
let stopwatchElapsed = 0;
let stopwatchLaps = [];
let timerInterval;
let timerEndTime;
let timerDuration = 0;
let isTimerRunning = false;
let alarmTimeout;
let isAlarmPlaying = false;


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
  setupStopwatch();
  setupTimer();
  setupModeSwitching();
  
  // Preload sounds
  document.body.addEventListener('click', () => {
    [flipSound, darkSound, lightSound, soundSound, timezoneSound, zoomSound, timerAlarmSound].forEach(sound => {
      sound.load().catch(console.error);
    });
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
  fullscreenToggle.addEventListener('click', toggleFullscreen);
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!timezoneContainer.contains(e.target) && 
        e.target !== timezoneSearch && 
        !timezoneSearch.contains(e.target)) {
      timezoneContainer.classList.remove('active');
    }
    
    if (!document.querySelector('.mode-selector').contains(e.target)) {
      document.querySelector('.mode-selector').classList.remove('active');
    }
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (dropdownOpen) {
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
    if (e.code === 'KeyF') toggleFullscreen();
    if (e.code === 'KeyM') toggleModeDropdown();
    if (e.code === 'Escape') {
      timezoneContainer.classList.remove('active');
      document.querySelector('.mode-selector').classList.remove('active');
    }
  });
  
  // Timezone search
  timezoneSearch.addEventListener('input', filterTimezones);
  timezoneSearch.addEventListener('click', (e) => e.stopPropagation());
}

// Mode Switching Functions
function setupModeSwitching() {
  modeToggle.addEventListener('click', toggleModeDropdown);
  
  document.querySelectorAll('.mode-item').forEach(item => {
    item.addEventListener('click', function() {
      const mode = this.getAttribute('data-mode');
      switchMode(mode);
      
      // Highlight selected mode in dropdown
      document.querySelectorAll('.mode-item').forEach(i => {
        i.classList.toggle('active', i === this);
      });
    });
  });
}

function toggleModeDropdown() {
  document.querySelector('.mode-selector').classList.toggle('active');
  
  if (soundEnabled) {
    timezoneSound.currentTime = 0;
    timezoneSound.play().catch(console.error);
  }
}

// Update your switchMode function
function switchMode(mode) {
  if (currentMode === mode) return;
  
  // Release scroll lock if switching to clock mode
  if (mode === 'clock') {
    releaseScrollLock();
  }

  // Add changing state
  modeToggle.setAttribute('data-changing', 'true');

  // Hide all modes first
  document.querySelectorAll('.clock-mode, .stopwatch-mode, .timer-mode').forEach(el => {
    el.classList.remove('clock-active');
  });
  
  // Stop any running timers
  if (stopwatchInterval) {
    stopStopwatch();
    swStartBtn.textContent = 'Start';
  }
  
  if (timerInterval) {
    stopTimer();
    tmStartBtn.textContent = 'Start';
  }
  
  // After animation completes (300ms)
  setTimeout(() => {
    // Show selected mode
    currentMode = mode;
    document.querySelector(`.${mode}-mode`).classList.add('clock-active');
    
    // Update mode button icon
    const icon = modeToggle.querySelector('object');
    icon.data = `assets/icons/${mode}.svg`;
    
    // Remove changing state
    modeToggle.removeAttribute('data-changing');
    
    // Light up the mode button if not in clock mode
    modeToggle.classList.toggle('active', mode !== 'clock');
    
    // Clear laps when switching away from stopwatch
    if (mode !== 'stopwatch') {
      lapsList.innerHTML = '';
    }
    
    // Apply scroll lock if in dark mode and not clock mode
    if (darkMode && mode !== 'clock') {
      scrollToBottom().then(() => {
        applyScrollLock();
      });
    }

    if (soundEnabled) {
      soundSound.currentTime = 0;
      soundSound.play().catch(console.error);
    }
  }, 300);
}

// Add these new helper functions
function scrollToBottom() {
  return new Promise(resolve => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
    
    // Small delay to ensure scroll completes before locking
    setTimeout(resolve, 500);
  });
}

function applyScrollLock() {
  if (scrollLocked || !darkMode || currentMode === 'clock') return;
  
  scrollLocked = true;
  
  // Add class to hide scrollbar and prevent scrolling
  document.documentElement.classList.add('lock-scrolling');
  
  // Force scroll position to bottom
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'auto'
  });
  
  // Add touch listener for mobile devices
  document.addEventListener('touchmove', preventTouchScroll, { passive: false });
}

function releaseScrollLock() {
  if (!scrollLocked) return;
  
  scrollLocked = false;
  
  // Remove scroll lock styles
  document.documentElement.classList.remove('lock-scrolling');
  
  // Remove event listeners
  document.removeEventListener('touchmove', preventTouchScroll);
}

function preventTouchScroll(e) {
  if (scrollLocked) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
}

function preventKeyScroll(e) {
  if (!scrollLocked) return;
  
  // Prevent arrow keys, page up/down, home/end
  const keys = [33, 34, 35, 36, 37, 38, 39, 40];
  if (keys.includes(e.keyCode)) {
    e.preventDefault();
    e.stopPropagation();
    return false;
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
      currentTimezone = 'local';
      timezoneToggle.classList.remove('active');
    }
  }
  
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
    const shouldPlaySound = currentMode === 'clock' || 
                          (currentMode === 'timer' && element.id === 'tm-seconds') ||
                          (currentMode === 'stopwatch' && element.id === 'sw-seconds');
    
    if (soundEnabled && shouldPlaySound) {
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

// Stopwatch functions
function setupStopwatch() {
  swStartBtn.addEventListener('click', toggleStopwatch);
  swLapBtn.addEventListener('click', recordLap);
  swResetBtn.addEventListener('click', resetStopwatch);
  
  // Create input controls for all number inputs
  document.querySelectorAll('.input-group input').forEach(input => {
    const controls = document.createElement('div');
    controls.className = 'input-controls';
    
    const upBtn = document.createElement('div');
    upBtn.className = 'input-control';
    upBtn.innerHTML = '&uarr;';
    upBtn.addEventListener('click', () => adjustInput(input, 1));
    
    const downBtn = document.createElement('div');
    downBtn.className = 'input-control';
    downBtn.innerHTML = '&darr;';
    downBtn.addEventListener('click', () => adjustInput(input, -1));
    
    controls.appendChild(upBtn);
    controls.appendChild(downBtn);
    input.parentNode.appendChild(controls);
  });
}

function adjustInput(input, change) {
  let value = parseInt(input.value) || 0;
  const max = parseInt(input.max) || 59;
  const min = parseInt(input.min) || 0;
  
  value += change;
  if (value > max) value = max;
  if (value < min) value = min;
  
  input.value = String(value).padStart(2, '0');
  validateTimerInputs.call(input);
}

function toggleStopwatch() {
  if (stopwatchInterval) {
    stopStopwatch();
    swStartBtn.textContent = 'Start';
    swLapBtn.disabled = true;
  } else {
    startStopwatch();
    swStartBtn.textContent = 'Stop';
    swLapBtn.disabled = false;
    swResetBtn.disabled = false;
  }
}

function startStopwatch() {
  stopwatchStartTime = Date.now() - stopwatchElapsed;
  stopwatchInterval = setInterval(updateStopwatch, 10);
}

function stopStopwatch() {
  clearInterval(stopwatchInterval);
  stopwatchInterval = null;
  stopwatchElapsed = Date.now() - stopwatchStartTime;
}

function updateStopwatch() {
  const elapsed = Date.now() - stopwatchStartTime;
  const centiseconds = Math.floor((elapsed % 1000) / 10);
  const seconds = Math.floor((elapsed / 1000) % 60);
  const minutes = Math.floor((elapsed / (1000 * 60)) % 60);
  const hours = Math.floor((elapsed / (1000 * 60 * 60)) % 24);
  
  updateNumber(swCentisecondsEl, String(centiseconds).padStart(2, "0"));
  updateNumber(swSecondsEl, String(seconds).padStart(2, "0"));
  updateNumber(swMinutesEl, String(minutes).padStart(2, "0"));
  updateNumber(swHoursEl, String(hours).padStart(2, "0"));
}

function recordLap() {
  const elapsed = Date.now() - stopwatchStartTime;
  const centiseconds = Math.floor((elapsed % 1000) / 10);
  const seconds = Math.floor((elapsed / 1000) % 60);
  const minutes = Math.floor((elapsed / (1000 * 60)) % 60);
  const hours = Math.floor((elapsed / (1000 * 60 * 60)) % 24);
  
  const lapTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
  stopwatchLaps.unshift(lapTime);
  
  updateLapsDisplay();
  
  /* if (soundEnabled) {
    flipSound.currentTime = 0;
    flipSound.play().catch(console.error);
  } */
}

function updateLapsDisplay() {
  lapsList.innerHTML = '';
  
  stopwatchLaps.forEach((lap, index) => {
    const lapItem = document.createElement('div');
    lapItem.className = 'lap-item';
    lapItem.innerHTML = `
      <span>Lap ${stopwatchLaps.length - index}</span>
      <span>${lap}</span>
    `;
    lapsList.appendChild(lapItem);
  });
}

function resetStopwatch() {
  stopStopwatch();
  stopwatchElapsed = 0;
  stopwatchLaps = [];
  updateNumber(swCentisecondsEl, "00");
  updateNumber(swSecondsEl, "00");
  updateNumber(swMinutesEl, "00");
  updateNumber(swHoursEl, "00");
  swStartBtn.textContent = 'Start';
  swLapBtn.disabled = true;
  swResetBtn.disabled = true;
  lapsList.innerHTML = '';
}

// Timer functions
function setupTimer() {
  document.querySelector('.timer-set').classList.remove('hidden');
  tmStartBtn.addEventListener('click', toggleTimer);
  tmResetBtn.addEventListener('click', resetTimer);
  tmSetBtn.addEventListener('click', setTimer);
  
  // Validate timer inputs
  [tmSetHours, tmSetMinutes, tmSetSeconds].forEach(input => {
    input.addEventListener('input', validateTimerInputs);
    input.addEventListener('focus', function() {
      this.select();
    });
  });
}

function validateTimerInputs() {
  const hours = parseInt(tmSetHours.value) || 0;
  const minutes = parseInt(tmSetMinutes.value) || 0;
  const seconds = parseInt(tmSetSeconds.value) || 0;
  
  const hasValue = hours > 0 || minutes > 0 || seconds > 0;
  tmSetBtn.disabled = !hasValue;
  
  // Start button should remain disabled until timer is set
  if (!timerDuration) {
    tmStartBtn.disabled = true;
  }
  
  // Ensure values are within limits
  if (this.value > this.max) this.value = this.max;
  if (this.value < 0) this.value = 0;
  
  // Pad with leading zero
  if (this.value.length === 1) this.value = this.value.padStart(2, '0');
}


function toggleTimer() {
  if (timerInterval) {
    stopTimer();
    tmStartBtn.textContent = 'Start';
  } else {
    startTimer();
    tmStartBtn.textContent = 'Pause';
  }
}

// Update the startTimer function
function startTimer() {
  if (timerDuration <= 0) return;
  
  timerEndTime = Date.now() + timerDuration;
  timerInterval = setInterval(updateTimer, 100);
  tmResetBtn.disabled = false;
  
  // Hide input controls with transition
  document.querySelector('.timer-set').classList.add('hidden');
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerDuration = timerEndTime - Date.now();
  
}

function updateTimer() {
  const remaining = timerEndTime - Date.now();
  
  if (remaining <= 0) {
    timerFinished();
    return;
  }
  
  const seconds = Math.floor((remaining / 1000) % 60);
  const minutes = Math.floor((remaining / (1000 * 60)) % 60);
  const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
  
  updateNumber(tmSecondsEl, String(seconds).padStart(2, "0"));
  updateNumber(tmMinutesEl, String(minutes).padStart(2, "0"));
  updateNumber(tmHoursEl, String(hours).padStart(2, "0"));
}


function timerFinished() {
  stopTimer();
  timerDuration = 0;
  updateNumber(tmSecondsEl, "00");
  updateNumber(tmMinutesEl, "00");
  updateNumber(tmHoursEl, "00");
  tmStartBtn.textContent = 'Start';
  tmStartBtn.disabled = true;
  tmResetBtn.disabled = true; // Keep reset enabled for sound control
  document.querySelector('.timer-set').classList.remove('hidden');

  if (soundEnabled) {
    playAlarmSound();
  }
}

function playAlarmSound() {
  if (!isAlarmPlaying) {
    isAlarmPlaying = true;
    timerAlarmSound.currentTime = 0;
    timerAlarmSound.loop = true;
    timerAlarmSound.play().catch(console.error);
    
    // Auto-stop after 2 minutes
    alarmTimeout = setTimeout(() => {
      stopAlarmSound();
    }, 120000); // 2 minutes
  }
}

function stopAlarmSound() {
  if (isAlarmPlaying) {
    timerAlarmSound.pause();
    timerAlarmSound.currentTime = 0;
    timerAlarmSound.loop = false;
    isAlarmPlaying = false;
    
    if (alarmTimeout) {
      clearTimeout(alarmTimeout);
    }
  }
}

// Add this to document event listeners
document.addEventListener('click', () => {
  if (isAlarmPlaying) {
    stopAlarmSound();
  }
});

function resetTimer() {
  stopTimer();
  timerDuration = 0;
  updateNumber(tmSecondsEl, "00");
  updateNumber(tmMinutesEl, "00");
  updateNumber(tmHoursEl, "00");
  tmStartBtn.textContent = 'Start';
  tmStartBtn.disabled = true;
  tmResetBtn.disabled = true;
  
  // Show input controls with transition
  document.querySelector('.timer-set').classList.remove('hidden');
  
  // Reset input fields but don't clear them
  tmSetHours.value = "00";
  tmSetMinutes.value = "00";
  tmSetSeconds.value = "00";
  tmSetBtn.disabled = true;
  
  stopAlarmSound();
}

// Update setTimer function
function setTimer() {
  stopAlarmSound();
  
  const hours = parseInt(tmSetHours.value) || 0;
  const minutes = parseInt(tmSetMinutes.value) || 0;
  const seconds = parseInt(tmSetSeconds.value) || 0;
  
  timerDuration = (hours * 3600 + minutes * 60 + seconds) * 1000;
  
  if (timerDuration <= 0) return;
  
  updateNumber(tmSecondsEl, String(seconds).padStart(2, "0"));
  updateNumber(tmMinutesEl, String(minutes).padStart(2, "0"));
  updateNumber(tmHoursEl, String(hours).padStart(2, "0"));
  
  tmStartBtn.disabled = false;
  tmResetBtn.disabled = false;
  
  if (soundEnabled) {
    flipSound.currentTime = 0;
    flipSound.play().catch(console.error);
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
  setTimeout(scheduleMeteorShowers, 5000);
}

// Initialize
if (!document.body.classList.contains('light-mode')) {
  setTimeout(scheduleMeteorShowers, 10000); // Start first shower after 5s
}

function toggleTheme(playSound) {
  const icon = themeToggle.querySelector('object');
  const newIcon = document.createElement('object');
  
  // Create new icon element
  newIcon.data = `assets/icons/${darkMode ? 'moon' : 'sun'}.svg`;
  newIcon.type = "image/svg+xml";
  themeToggle.appendChild(newIcon);
  
  // Add animation class
  themeToggle.classList.add('theme-change');
  
  // Remove animation class after it completes
  setTimeout(() => {
    themeToggle.classList.remove('theme-change');
    icon.remove(); // Remove old icon
    newIcon.style.position = 'static'; // Reset positioning
  }, 800);
  
  darkMode = !darkMode;
  document.body.classList.toggle("light-mode");
  themeToggle.classList.toggle('active');
  localStorage.setItem('darkMode', darkMode);
  
  // Toggle background stylesheets
  document.getElementById('dark-bg').disabled = darkMode;
  document.getElementById('light-bg').disabled = !darkMode;

  // Handle scroll lock when changing theme
  if (!darkMode) {
    releaseScrollLock();
  } else if (currentMode !== 'clock') {
    scrollToBottom().then(() => {
      applyScrollLock();
    });
  }

  if (darkMode) {
    shootingStarContainer.innerHTML = '';
    scheduleShootingStar();
  } else {
    shootingStarContainer.innerHTML = '';
  }
    
  if (playSound && soundEnabled) {
    if (darkMode) {
      darkSound.currentTime = 0;
      darkSound.play().catch(console.error);
    } else {
      lightSound.currentTime = 0;
      lightSound.play().catch(console.error);
    }
  }
}

function toggleSize() {
  sizeState = (sizeState + 1) % 3;
  
  resizeToggle.classList.remove('active', 'medium-light', 'full-light');
  
  switch(sizeState) {
    case 0:
      document.documentElement.style.setProperty('--size-scale', '1');
      break;
    case 1:
      document.documentElement.style.setProperty('--size-scale', '1.2');
      resizeToggle.classList.add('active', 'medium-light');
      break;
    case 2:
      document.documentElement.style.setProperty('--size-scale', '1.5');
      resizeToggle.classList.add('active', 'full-light');
      break;
  }
  
  if (soundEnabled) {
    zoomSound.currentTime = 0;
    zoomSound.play().catch(console.error);
  }
}

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

// Timezone functions
function toggleTimezoneDropdown() {
  dropdownOpen = !dropdownOpen;
  timezoneContainer.classList.toggle('active');
  
  if (dropdownOpen) {
    if (window.innerWidth <= 768) {
      const dropdown = document.querySelector('.timezone-dropdown');
      const rect = timezoneToggle.getBoundingClientRect();
      dropdown.style.bottom = `${window.innerHeight - rect.top + 10}px`;
    }
    
    setTimeout(() => timezoneSearch.focus(), 100);
  }
  
  if (soundEnabled) {
    timezoneSound.currentTime = 0;
    timezoneSound.play().catch(console.error);
  }
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

function selectTimezone(timezoneId) {
  if (this.lastSelection && Date.now() - this.lastSelection < 500) return;
  this.lastSelection = Date.now();
  
  currentTimezone = timezoneId;
  localStorage.setItem('timezone', timezoneId);
  
  const items = timezoneList.querySelectorAll('.timezone-item');
  items.forEach(item => item.classList.remove('active'));
  
  const selectedItem = Array.from(items).find(item => 
    item.textContent.includes(timezoneData.find(tz => tz.id === timezoneId)?.name || 'Local Time')
  );
  if (selectedItem) selectedItem.classList.add('active');
  
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

// Start the clock
init();