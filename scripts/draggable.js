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