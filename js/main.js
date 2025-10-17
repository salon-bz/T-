// js/main.js
const menuBtn = document.getElementById('menuBtn');
const menuPanel = document.getElementById('menuPanel');
menuBtn.addEventListener('click', ()=> menuPanel.style.display = menuPanel.style.display === 'block' ? 'none' : 'block');

const contactAdmin = document.getElementById('contactAdmin');
if(contactAdmin) contactAdmin.href = 'https://wa.me/573142369516?text=' + encodeURIComponent('hola vengo de la pagina web');
