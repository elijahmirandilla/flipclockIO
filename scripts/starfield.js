document.addEventListener('DOMContentLoaded', function() {
  const starField = document.querySelector('.star-field');
  let isDragging = false;
  let startX, startY;
  let currentX = 0, currentY = 0;
  const maxOffset = 200; // Limits how far you can drag
  
  // Mouse down - start interaction
  document.addEventListener('mousedown', function(e) {
    isDragging = true;
    starField.classList.add('slow-motion');
    startX = e.clientX - currentX;
    startY = e.clientY - currentY;
    
    setTimeout(() => {
      if (isDragging) {
        starField.classList.add('dragging');
      }
    }, 50);
  });
  
  // Mouse move - handle dragging
  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    
    // Calculate new position with limits
    currentX = Math.max(-maxOffset, Math.min(maxOffset, e.clientX - startX));
    currentY = Math.max(-maxOffset, Math.min(maxOffset, e.clientY - startY));
    
    starField.style.transform = `translate(${currentX}px, ${currentY}px)`;
  });
  
  // Mouse up - end interaction
  document.addEventListener('mouseup', function() {
    endInteraction();
  });
  
  // Handle touch devices
  document.addEventListener('touchstart', function(e) {
    isDragging = true;
    starField.classList.add('slow-motion');
    startX = e.touches[0].clientX - currentX;
    startY = e.touches[0].clientY - currentY;
    
    setTimeout(() => {
      if (isDragging) {
        starField.classList.add('dragging');
      }
    }, 50);
  });
  
  document.addEventListener('touchmove', function(e) {
    if (!isDragging) return;
    e.preventDefault();
    
    currentX = Math.max(-maxOffset, Math.min(maxOffset, e.touches[0].clientX - startX));
    currentY = Math.max(-maxOffset, Math.min(maxOffset, e.touches[0].clientY - startY));
    
    starField.style.transform = `translate(${currentX}px, ${currentY}px)`;
  });
  
  document.addEventListener('touchend', function() {
    endInteraction();
  });
  
  function endInteraction() {
    if (isDragging) {
      isDragging = false;
      starField.classList.remove('dragging', 'slow-motion');
      
      // Smoothly return to center
      starField.style.transform = 'translate(0, 0)';
    }
  }
});