['about', 'TianaSPalaceApp', 'TianaSPalaceAppwindow', 'SettingsAppwindow', 'SettingsApp'].forEach(id => {
  const el = document.getElementById(id);
  if (el) dragElement(el);
});

let biggestIndex = 100;

function dragElement(el) {
  let startX = 0, startY = 0, prevX = 0, prevY = 0;
  if (!el) return;

  el.onmousedown = dragMouseDown;
  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    prevX = e.clientX;
    prevY = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    startX = prevX - e.clientX;
    startY = prevY - e.clientY;
    prevX = e.clientX;
    prevY = e.clientY;
    el.style.top = (el.offsetTop - startY) + "px";
    el.style.left = (el.offsetLeft - startX) + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function handleWindowTap(element) {
  if (!element) return;
  biggestIndex++;
  element.style.zIndex = biggestIndex;
  const topBar = document.querySelector('#top');
  if (topBar) topBar.style.zIndex = biggestIndex + 1;
}

function openWindow(el) {
  if (!el) return;
  if (getComputedStyle(el).display !== 'none') return;
  el.style.display = 'flex';
  handleWindowTap(el);
}

function closeWindow(el) {
  if (!el) return;
  el.style.display = 'none';
}

function initializeWindow(id) {
  const el = document.getElementById(id);
  if (!el) return;
}

(function wireUI() {
  const welcome = document.getElementById('welcome');
  const welcomeOpen = document.getElementById('welcomeopen');
  const welcomeClose = document.getElementById('welcomeclose');
  if (welcomeOpen && welcome) welcomeOpen.addEventListener('click', () => openWindow(welcome));
  if (welcomeClose && welcome) welcomeClose.addEventListener('click', () => closeWindow(welcome));

  const about = document.getElementById('about');
  const aboutOpen = document.getElementById('aboutopen');
  const aboutClose = document.getElementById('aboutclose');
  if (aboutOpen && about) aboutOpen.addEventListener('click', () => openWindow(about));
  if (aboutClose && about) aboutClose.addEventListener('click', () => closeWindow(about));

  const tianaIcon = document.getElementById('TianaSPalaceApp');
  const tianaWindow = document.getElementById('TianaSPalaceAppwindow');
  const tianaClose = document.getElementById('TianaSPalaceAppwindowclose');
  if (tianaIcon && tianaWindow) tianaIcon.addEventListener('click', (e) => { e.stopPropagation(); openWindow(tianaWindow); });
  if (tianaClose && tianaWindow) tianaClose.addEventListener('click', () => closeWindow(tianaWindow));

  const settingsIcon = document.getElementById('SettingsApp');
  const settingsWindow = document.getElementById('SettingsAppwindow');
  const settingsClose = document.getElementById('SettingsAppwindowclose');
  if (settingsIcon && settingsWindow) settingsIcon.addEventListener('click', (e) => { e.stopPropagation(); openWindow(settingsWindow); });
  if (settingsClose && settingsWindow) settingsClose.addEventListener('click', () => closeWindow(settingsWindow));

  let selectedIcon;
  document.addEventListener('click', (e) => {
    const appEl = e.target.closest('.tiana-app, .settings-app');
    if (!appEl) return;
    if (selectedIcon === appEl) {
      appEl.classList.remove('selected');
      selectedIcon = null;
    } else {
      if (selectedIcon) selectedIcon.classList.remove('selected');
      appEl.classList.add('selected');
      selectedIcon = appEl;
    }
  });
})();



(function() {
  const STORAGE_KEY = 'appBackground';

  function applyBackground(bg) {
    if (!bg) return;
    if (bg.type === 'color') {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundColor = bg.value || '';
    } else if (bg.type === 'image') {
      document.body.style.backgroundImage = `url('${bg.value}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
    }
  }

  function saveBackground(bg) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(bg)); } catch (e) { console.warn('saveBackground failed', e); }
  }

  function loadBackground() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { return null; }
  }

  const colorPicker = document.getElementById('bgColorPicker');
  const imageUrlInput = document.getElementById('bgImageUrl');
  const applyImageUrlBtn = document.getElementById('applyImageUrl');
  const uploadInput = document.getElementById('bgUpload');
  const resetBtn = document.getElementById('resetBackground');

  const stored = loadBackground();
  if (stored) applyBackground(stored);
  if (colorPicker && stored && stored.type === 'color') colorPicker.value = stored.value;

  if (colorPicker) {
    colorPicker.addEventListener('input', (e) => {
      const value = e.target.value;
      applyBackground({ type: 'color', value });
      saveBackground({ type: 'color', value });
    });
  }

  if (applyImageUrlBtn && imageUrlInput) {
    applyImageUrlBtn.addEventListener('click', () => {
      const url = imageUrlInput.value.trim();
      if (!url) return;
      applyBackground({ type: 'image', value: url });
      saveBackground({ type: 'image', value: url });
    });
  }

  if (uploadInput) {
    uploadInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
        const dataUrl = evt.target.result;
        applyBackground({ type: 'image', value: dataUrl });
        saveBackground({ type: 'image', value: dataUrl });
      };
      reader.readAsDataURL(file);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      document.body.style.backgroundImage = '';
      document.body.style.backgroundColor = '';
      if (colorPicker) colorPicker.value = '#ffffff';
      if (imageUrlInput) imageUrlInput.value = '';
      if (uploadInput) uploadInput.value = '';
      document.querySelectorAll('.wallpaper-thumb').forEach(b => b.classList.remove('selected'));
    });
  }

  function initWallpaperThumbs() {
    const thumbs = Array.from(document.querySelectorAll('.wallpaper-thumb'));
    if (!thumbs.length) return;
    thumbs.forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.getAttribute('data-url') || btn.dataset.url;
        if (!url) return;
        thumbs.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        applyBackground({ type: 'image', value: url });
        saveBackground({ type: 'image', value: url });
      });
    });

    if (stored && stored.type === 'image') {
      thumbs.forEach(b => {
        const u = b.getAttribute('data-url') || b.dataset.url;
        if (u === stored.value) b.classList.add('selected');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWallpaperThumbs);
  } else {
    initWallpaperThumbs();
  }

})();

(function() {
  const win = document.getElementById('welcome');
  const handle = document.getElementById('rayImg');
  if (!win || !handle) return;

  let dragging = false;
  let startX = 0, startY = 0;
  let origLeft = 0, origTop = 0;

  handle.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = win.getBoundingClientRect();
    
    origLeft = rect.left;
    origTop = rect.top;
    handle.style.cursor = 'grabbing';
  });

  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    win.style.left = (origLeft + dx) + 'px';
    win.style.top  = (origTop + dy) + 'px';
  });

  window.addEventListener('pointerup', (e) => {
    if (!dragging) return;
    dragging = false;
    try { handle.releasePointerCapture(e.pointerId); } catch {}
    handle.style.cursor = 'grab';
  });
})();