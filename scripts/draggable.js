class Draggable {
  constructor(element) {
    this.element = element;
    this.isDragging = false;
    this.offsetX = 0;
    this.offsetY = 0;
    this.startX = 0;
    this.startY = 0;
    
    this.init();
  }

  init() {
    this.element.style.position = 'fixed';
    this.element.style.cursor = 'grab';
    this.element.style.touchAction = 'none';
    
    this.element.addEventListener('mousedown', this.startDrag.bind(this));
    document.addEventListener('mousemove', this.drag.bind(this));
    document.addEventListener('mouseup', this.endDrag.bind(this));
    
    this.element.addEventListener('touchstart', this.startDrag.bind(this), {passive: false});
    document.addEventListener('touchmove', this.drag.bind(this), {passive: false});
    document.addEventListener('touchend', this.endDrag.bind(this));
  }

  startDrag(e) {
    if (e.target.closest('.icon-btn') || 
        e.target.closest('.timezone-dropdown') || 
        e.target === timezoneSearch) return;
    
    this.isDragging = true;
    this.element.style.cursor = 'grabbing';
    
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    
    const rect = this.element.getBoundingClientRect();
    this.offsetX = clientX - rect.left;
    this.offsetY = clientY - rect.top;
    this.startX = clientX;
    this.startY = clientY;
    
    e.preventDefault();
  }

  drag(e) {
    if (!this.isDragging) return;
    
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    
    // Check if it's a significant movement to prevent accidental drags
    if (Math.abs(clientX - this.startX) > 5 || Math.abs(clientY - this.startY) > 5) {
      this.element.style.left = `${clientX - this.offsetX}px`;
      this.element.style.top = `${clientY - this.offsetY}px`;
    }
    
    e.preventDefault();
  }

  endDrag() {
    this.isDragging = false;
    this.element.style.cursor = 'grab';
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const controlPanel = document.getElementById('controlPanel');
  new Draggable(controlPanel);
});