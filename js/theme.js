/* Run before CSS paints; a blocked storage API must never block the page. */
(function(){
  let theme='light';
  try { const stored=localStorage.getItem('moss-moon-theme'); if(stored==='dark'||stored==='light')theme=stored; } catch {}
  document.documentElement.dataset.theme=theme;
}());
