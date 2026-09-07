let count = 0;

const btn = document.getElementById('counterBtn');
const num = document.getElementById('counterNum');

btn.addEventListener('click', () => {
  count += 1;
  num.textContent = count;
});
