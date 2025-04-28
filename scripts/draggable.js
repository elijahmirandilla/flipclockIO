class Draggable {
  constructor(element) {
    this.element = element;
    this.isDragging = false;
    this.offsetX = 0;
    this.offsetY = 0;
    
    this.init();
  }

  init() {
    this.element.style.position = 'fixed';
    this.element.style.cursor = 'grab';
    
    this.element.addEventListener('mousedown', this.startDrag.bind(this));
    document.addEventListener('mousemove', this.drag.bind(this));
    document.addEventListener('mouseup', this.endDrag.bind(this));
    
    this.element.addEventListener('touchstart', this.startDrag.bind(this), {passive: false});
    document.addEventListener('touchmove', this.drag.bind(this), {passive: false});
    document.addEventListener('touchend', this.endDrag.bind(this));
  }

  startDrag(e) {
    if (e.target.closest('.icon-btn')) return;
    
    this.isDragging = true;
    this.element.style.cursor = 'grabbing';
    
    const rect = this.element.getBoundingClientRect();
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    
    this.offsetX = clientX - rect.left;
    this.offsetY = clientY - rect.top;
    
    e.preventDefault();
  }

  drag(e) {
    if (!this.isDragging) return;
    
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    
    this.element.style.left = `${clientX - this.offsetX}px`;
    this.element.style.top = `${clientY - this.offsetY}px`;
    
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

document.addEventListener('DOMContentLoaded', function() {
  const starField = document.querySelector('.star-field');
  let isDragging = false;
  let startX, startY;
  let translateX = 0, translateY = 0;
  const sensitivity = 0.3; // Lower = less movement

  // Mouse down - slow stars
  document.addEventListener('mousedown', function(e) {
    isDragging = true;
    starField.classList.add('slow-motion');
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
  });

  // Mouse move - parallax effect
  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    
    starField.classList.add('dragging');
    
    // Calculate movement with sensitivity
    translateX = (e.clientX - startX) * sensitivity;
    translateY = (e.clientY - startY) * sensitivity;
    
    // Apply to all star layers to maintain parallax
    document.querySelectorAll('.star-field .layer').forEach(layer => {
      const currentTransform = window.getComputedStyle(layer).transform;
      const matrix = currentTransform !== 'none' 
        ? currentTransform.match(/^matrix\((.+)\)$/)[1].split(', ') 
        : [1, 0, 0, 1, 0, 0];
      
      layer.style.transform = `matrix(${matrix[0]}, ${matrix[1]}, ${matrix[2]}, ${matrix[3]}, ${translateX}, ${translateY})`;
    });
  });

  // Mouse up - reset
  document.addEventListener('mouseup', function() {
    if (isDragging) {
      isDragging = false;
      starField.classList.remove('slow-motion', 'dragging');
      
      // Smooth reset
      document.querySelectorAll('.star-field .layer').forEach(layer => {
        layer.style.transition = 'transform 0.5s ease-out';
        setTimeout(() => {
          const matrix = window.getComputedStyle(layer).transform.match(/^matrix\((.+)\)$/)[1].split(', ');
          layer.style.transform = `matrix(${matrix[0]}, ${matrix[1]}, ${matrix[2]}, ${matrix[3]}, 0, 0)`;
        }, 10);
        
        // Remove transition after reset
        setTimeout(() => {
          layer.style.transition = 'none';
        }, 600);
      });
    }
  });

  // Touch support
  document.addEventListener('touchstart', function(e) {
    isDragging = true;
    starField.classList.add('slow-motion');
    startX = e.touches[0].clientX - translateX;
    startY = e.touches[0].clientY - translateY;
  });

  document.addEventListener('touchmove', function(e) {
    if (!isDragging) return;
    e.preventDefault();
    
    starField.classList.add('dragging');
    
    translateX = (e.touches[0].clientX - startX) * sensitivity;
    translateY = (e.touches[0].clientY - startY) * sensitivity;
    
    document.querySelectorAll('.star-field .layer').forEach(layer => {
      const currentTransform = window.getComputedStyle(layer).transform;
      const matrix = currentTransform !== 'none' 
        ? currentTransform.match(/^matrix\((.+)\)$/)[1].split(', ') 
        : [1, 0, 0, 1, 0, 0];
      
      layer.style.transform = `matrix(${matrix[0]}, ${matrix[1]}, ${matrix[2]}, ${matrix[3]}, ${translateX}, ${translateY})`;
    });
  });

  document.addEventListener('touchend', function() {
    if (isDragging) {
      isDragging = false;
      starField.classList.remove('slow-motion', 'dragging');
      
      document.querySelectorAll('.star-field .layer').forEach(layer => {
        layer.style.transition = 'transform 0.5s ease-out';
        setTimeout(() => {
          const matrix = window.getComputedStyle(layer).transform.match(/^matrix\((.+)\)$/)[1].split(', ');
          layer.style.transform = `matrix(${matrix[0]}, ${matrix[1]}, ${matrix[2]}, ${matrix[3]}, 0, 0)`;
        }, 10);
        
        setTimeout(() => {
          layer.style.transition = 'none';
        }, 600);
      });
    }
  });
});
