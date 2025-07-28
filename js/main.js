function loadImage(img) {
  return new Promise((resolve, reject) => {
    if (img.complete && img.naturalHeight !== 0) {
      resolve();
    } else {
      img.onload = () => resolve();
      img.onerror = reject;
    }
  });
}

function preloadFirstImage() {
  const firstContainer = document.querySelector('.container');
  const firstImages = firstContainer.querySelectorAll('.slider-image.lazy');
  const loader = firstContainer.querySelector('.image-loader');
  
  Promise.all(Array.from(firstImages).map(img => loadImage(img)))
    .then(() => {
      firstImages.forEach(img => {
        img.classList.remove('lazy');
        img.classList.add('loaded');
      });
      loader.classList.add('hidden');
    })
    .catch(error => {
      console.error('Error loading first images:', error);
      loader.classList.add('hidden');
    });
}

const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const container = entry.target;
      const loader = container.querySelector('.image-loader');
      const images = container.querySelectorAll('.slider-image.lazy');
      
      if (images.length > 0) {
        Promise.all(Array.from(images).map(img => loadImage(img)))
          .then(() => {
            images.forEach(img => {
              img.classList.remove('lazy');
              img.classList.add('loaded');
            });
            loader.classList.add('hidden');
          })
          .catch(error => {
            console.error('Error loading images:', error);
            loader.classList.add('hidden');
          });
      }
      
      observer.unobserve(container);
    }
  });
}, {
  rootMargin: '100px',
  root: document.querySelector('.carousel')
});

function preloadAdjacentImages() {
  const carousel = document.querySelector('.carousel');
  const containers = document.querySelectorAll('.container');
  const scrollLeft = carousel.scrollLeft;
  const containerWidth = containers[0].offsetWidth + 30;
  
  const currentIndex = Math.round(scrollLeft / containerWidth);
  
  [currentIndex - 1, currentIndex + 1].forEach(index => {
    if (index >= 0 && index < containers.length) {
      const container = containers[index];
      const lazyImages = container.querySelectorAll('.slider-image.lazy');
      const loader = container.querySelector('.image-loader');
      
      if (lazyImages.length > 0) {
        Promise.all(Array.from(lazyImages).map(img => loadImage(img)))
          .then(() => {
            lazyImages.forEach(img => {
              img.classList.remove('lazy');
              img.classList.add('loaded');
            });
            loader.classList.add('hidden');
          });
      }
    }
  });
}

let scrollTimeout;
    
document.addEventListener('DOMContentLoaded', () => {
  preloadFirstImage();

  const containers = document.querySelectorAll('.container');
  containers.forEach((container, index) => {
    if (index > 0) {
      imageObserver.observe(container);
    }
  });
  
  // Lógica del slider unificada
  // ... (tu código de funciones loadImage, etc. se mantiene igual arriba)

// Lógica del slider modificada
containers.forEach(container => {
    // Obtenemos tanto el slider invisible como el botón visible
    const sliderInput = container.querySelector('.slider');
    const sliderButton = container.querySelector('.slider-button');

    const updateSliderPosition = (clientX) => {
      const rect = container.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      
      // Actualizamos la variable CSS y el valor del input para accesibilidad
      container.style.setProperty('--position', `${percentage}%`);
      sliderInput.value = percentage;
    };

    let isDragging = false;
    let activeContainer = null;

    const startDrag = (e) => {
      // Nos aseguramos de que solo este contenedor esté activo
      activeContainer = container;
      isDragging = true;
      container.classList.add('is-dragging');
    };

    const drag = (e) => {
      // Solo arrastramos si el drag se inició en nuestro contenedor activo
      if (!isDragging || activeContainer !== container) return;

      // Prevenimos el scroll solo cuando estamos arrastrando activamente
      if (e.cancelable) e.preventDefault();
      
      const clientX = e.clientX ?? e.touches[0].clientX;
      updateSliderPosition(clientX);
    };

    const stopDrag = () => {
      if (!isDragging || activeContainer !== container) return;
      isDragging = false;
      container.classList.remove('is-dragging');
      activeContainer = null; // Limpiamos el contenedor activo
    };

    // --- CAMBIO PRINCIPAL ---
    // El evento de arrastre ahora se inicia desde el BOTÓN, no desde toda el área.
    sliderButton.addEventListener('mousedown', startDrag);
    sliderButton.addEventListener('touchstart', startDrag, { passive: true });

    // Los eventos de movimiento y fin se mantienen en 'window' para un drag más suave
    window.addEventListener('mousemove', drag);
    window.addEventListener('touchmove', drag, { passive: false });

    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchend', stopDrag);

    // Mantenemos el input del slider de rango para control con teclado y accesibilidad
    sliderInput.addEventListener('input', (e) => {
      container.style.setProperty('--position', `${e.target.value}%`);
    });
});
      
  const carousel = document.querySelector('.carousel');
  carousel.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      preloadAdjacentImages();
    }, 100);
  });
});