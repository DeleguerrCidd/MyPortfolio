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

  document.querySelectorAll('[data-num]').forEach(function (btn) {
    var value;
    try { value = atob(btn.getAttribute('data-num')); } catch (e) { return; }
    var num = btn.querySelector('.num');
    var label = btn.querySelector('.copy-label');
    var name = (btn.getAttribute('aria-label') || '').replace(/^Reveal /, '').replace(/ number$/, '');
    var revealed = false;
    btn.addEventListener('click', function () {
      if (!revealed) {
        revealed = true;
        num.textContent = value;
        label.textContent = 'Copy';
        btn.setAttribute('aria-label', 'Copy ' + name + ' number');
        return;
      }
      copyText(value).then(function (ok) {
        showToast(ok ? 'Copied' : 'Copy failed. Press and hold to copy.');
      });
    });
  });

  var pnAmount = document.getElementById('pn-amount');
  if (pnAmount) {
    var pnMethod = document.getElementById('pn-method');
    var pnName = document.getElementById('pn-name');
    var pnReason = document.getElementById('pn-reason');
    var pnPreview = document.getElementById('pn-preview');
    var pnCopy = document.getElementById('pn-copy');
    var pnMessenger = document.getElementById('pn-messenger');
    var pnMessage = '';

    function pnBuild() {
      var raw = pnAmount.value.replace(/[^0-9.]/g, '');
      var parts = raw.split('.');
      if (parts.length > 2) { raw = parts[0] + '.' + parts.slice(1).join(''); }
      var amt = parseFloat(raw);
      var ok = isFinite(amt) && amt > 0;
      if (!ok) {
        pnMessage = '';
        pnPreview.textContent = 'Enter an amount to build your message.';
      } else {
        var money = '\u20B1' + amt.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        var name = pnName.value.trim();
        var reason = pnReason.value.trim();
        pnMessage = 'Hi Cid, I just sent ' + money + ' via ' + pnMethod.value +
          (reason ? ' for ' + reason : '') + '.' + (name ? ' - ' + name : '');
        pnPreview.textContent = pnMessage;
      }
      pnCopy.disabled = pnMessenger.disabled = !ok;
    }

    [pnAmount, pnMethod, pnName, pnReason].forEach(function (el) {
      el.addEventListener('input', pnBuild);
      el.addEventListener('change', pnBuild);
    });

    pnCopy.addEventListener('click', function () {
      if (!pnMessage) { return; }
      copyText(pnMessage).then(function (ok) {
        showToast(ok ? 'Message copied' : 'Copy failed. Press and hold the message to copy.');
      });
    });

    pnMessenger.addEventListener('click', function () {
      if (!pnMessage) { return; }
      copyText(pnMessage).then(function () {
        showToast('Message copied. Paste it in Messenger.');
        window.open('https://m.me/mr.ciddd', '_blank', 'noopener');
      });
    });

    pnBuild();
  }

  var themeBtn = document.getElementById('theme-toggle');
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    if (themeMeta) { themeMeta.setAttribute('content', t === 'light' ? '#f4f4f5' : '#000000'); }
    if (themeBtn) {
      themeBtn.setAttribute('aria-label', t === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
      themeBtn.innerHTML = '<i class="fa-solid ' + (t === 'light' ? 'fa-moon' : 'fa-sun') + '" aria-hidden="true"></i>';
    }
  }
  applyTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

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

  function syncQrDownload(box) {
    var img = box.querySelector('img');
    var link = box.querySelector('[data-qr-download]');
    if (!img || !link || !img.currentSrc) { return; }
    link.href = img.currentSrc;
    var ext = img.currentSrc.split('.').pop().split(/[?#]/)[0];
    var name = link.getAttribute('download') || 'qr.jpg';
    link.setAttribute('download', name.replace(/\.[^.]+$/, '') + '.' + ext);
  }

  document.querySelectorAll('[data-qr]').forEach(function (toggle) {
    var box = document.getElementById(toggle.getAttribute('data-qr'));
    toggle.addEventListener('click', function () {
      var open = box.hasAttribute('hidden');
      if (open) { box.removeAttribute('hidden'); syncQrDownload(box); } else { box.setAttribute('hidden', ''); }
      toggle.textContent = open ? 'Hide QR' : 'Show QR';
      toggle.setAttribute('aria-expanded', String(open));
    });
  });

  var exts = ['png', 'jpg', 'jpeg', 'webp'];
  document.querySelectorAll('img[data-base]').forEach(function (img) {
    var i = 0;
    var isLogo = img.hasAttribute('data-logo');
    var qrBox = img.closest('.qr-wrap');
    if (isLogo) {
      img.addEventListener('load', function () { img.parentNode.classList.add('has-logo'); });
      if (img.complete && img.naturalWidth) { img.parentNode.classList.add('has-logo'); }
    }
    if (qrBox) {
      img.addEventListener('load', function () { syncQrDownload(qrBox); });
    }
    img.addEventListener('error', function () {
      i += 1;
      if (i < exts.length) { img.src = img.getAttribute('data-base') + '.' + exts[i]; }
    });
  });
})();
