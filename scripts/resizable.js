class ClockResizer {
  constructor(container, scaleStep = 0.1, minScale = 0.5, maxScale = 2) {
    this.container = container;
    this.scaleStep = scaleStep;
    this.minScale = minScale;
    this.maxScale = maxScale;
    this.currentScale = 1;
    this.isDragging = false;
    this.startY = 0;
    
    this.init();
  }

  init() {
    document.getElementById('resizeToggle').addEventListener('click', () => this.toggleSize());
    document.addEventListener('keydown', (e) => {
      if (e.code === 'KeyR') this.toggleSize();
    });

    // Touch pinch zoom
    this.container.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.container.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
  }

  toggleSize() {
    this.currentScale = this.currentScale === this.maxScale ? this.minScale : this.maxScale;
    this.applyScale();
  }

  handleTouchStart(e) {
    if (e.touches.length === 2) {
      this.isDragging = true;
      this.startY = Math.abs(e.touches[0].clientY - e.touches[1].clientY);
    }
  }

  handleTouchMove(e) {
    if (!this.isDragging || e.touches.length !== 2) return;
    
    const currentY = Math.abs(e.touches[0].clientY - e.touches[1].clientY);
    const delta = (currentY - this.startY) * 0.01;
    
    this.currentScale = Math.max(this.minScale, Math.min(this.maxScale, this.currentScale + delta));
    this.applyScale();
    this.startY = currentY;
    
    e.preventDefault();
  }

  applyScale() {
    this.container.style.setProperty('--clock-scale', this.currentScale);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const clockContainer = document.getElementById('clockContainer');
  new ClockResizer(clockContainer);
});