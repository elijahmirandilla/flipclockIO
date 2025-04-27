# Cosmic Flip Clock 🌌⏰

A beautiful flip clock with realistic shooting star effects that appear in the background during dark mode. Features smooth animations, timezone support, and customizable settings.

![Screenshot of Cosmic Flip Clock](https://example.com/screenshot.jpg) *(replace with your screenshot URL)*

## Features ✨

- **Realistic Flip Clock Animation**
  - Smooth card-flipping animation for hours and minutes
  - AM/PM indicator
- **Shooting Star Effects** 🌠
  - Random meteor showers in dark mode
  - Multiple colors (blue, green, orange, fireball)
  - Copyright text glows 5 seconds before appearance
- **Customization Options**
  - Light/Dark mode toggle
  - Timezone selection (with search)
  - Clock size adjustment
  - Sound effects toggle
- **Interactive Controls**
  - Draggable control panel
  - Keyboard shortcuts
  - Fullscreen mode

## Installation & Usage 🚀

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/cosmic-flip-clock.git
   cd cosmic-flip-clock

2. Open in browser:
Simply open index.html in your preferred browser
No build process required


3. Controls:
D - Toggle dark/light mode
S - Toggle sound effects
T - Open timezone selector
R - Resize clock
F - Toggle fullscreen
Esc - Close timezone selector


Shooting Star Details 🌠
The shooting stars feature:
Appear randomly (every 1-5 minutes in production)
5-second visual warning via copyright text glow

Four color variations:
Blue/White (default meteor)
Green (copper content)
Orange (iron content)
Yellow Fireball (rare, bright)


Customization 🛠️
Modify these CSS variables in styles/main.css:

css
:root {
  --bg: #0a0a0a;               /* Background color */
  --number: #1a1a1a;           /* Clock card color */
  --accent: rgba(100,200,255,0.7);  /* Accent/active color */
  --glass-bg: rgba(30, 30, 30, 0.5); /* Glass panel opacity */
}

Browser Support 🌐
Works on all modern browsers:
Chrome
Firefox
Safari
Edge
Mobile Safari/Chrome

License 📄
MIT License - Free for personal and commercial use

Created by Elijah
Live Demo (https://elijahmirandilla.github.io/flipclockIO/)
