(function () {
  'use strict';

  var toast = document.getElementById('toast');
  var toastTimer;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 1600);
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    return ok;
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return fallbackCopy(text); });
    }
    return Promise.resolve(fallbackCopy(text));
  }

  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      copyText(btn.getAttribute('data-copy')).then(function (ok) {
        showToast(ok ? 'Copied' : 'Copy failed. Press and hold to copy.');
      });
    });
  });

  var musicToggle = document.getElementById('music-toggle');
  var spotifyPanel = document.getElementById('spotify-panel');
  if (musicToggle && spotifyPanel) {
    musicToggle.addEventListener('click', function () {
      var open = spotifyPanel.hasAttribute('hidden');
      if (open) { spotifyPanel.removeAttribute('hidden'); }
      else { spotifyPanel.setAttribute('hidden', ''); }
      musicToggle.setAttribute('aria-expanded', String(open));
    });
  }

  document.querySelectorAll('[data-qr]').forEach(function (toggle) {
    var box = document.getElementById(toggle.getAttribute('data-qr'));
    toggle.addEventListener('click', function () {
      var open = box.hasAttribute('hidden');
      if (open) { box.removeAttribute('hidden'); } else { box.setAttribute('hidden', ''); }
      toggle.textContent = open ? 'Hide QR' : 'Show QR';
      toggle.setAttribute('aria-expanded', String(open));
    });
  });

  var exts = ['png', 'jpg', 'jpeg', 'webp'];
  document.querySelectorAll('img[data-base]').forEach(function (img) {
    var i = 0;
    var isLogo = img.hasAttribute('data-logo');
    if (isLogo) {
      img.addEventListener('load', function () { img.parentNode.classList.add('has-logo'); });
      if (img.complete && img.naturalWidth) { img.parentNode.classList.add('has-logo'); }
    }
    img.addEventListener('error', function () {
      i += 1;
      if (i < exts.length) { img.src = img.getAttribute('data-base') + '.' + exts[i]; }
    });
  });
})();
