const slider = document.getElementById('slider');
const afterContainer = document.querySelector('.after-images');

slider.addEventListener('input', () => {
  const percentage = slider.value;
  afterContainer.style.width = `${percentage}%`;
});
