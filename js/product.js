/* FORMA ONE product page — order form → Netlify Forms (form name "order") */
(function () {
  'use strict';
  var form = document.getElementById('order-form');
  if (!form) return;

  var showSuccess = function () {
    form.hidden = true;
    var success = document.getElementById('order-success');
    success.hidden = false;
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var required = form.querySelectorAll('input[required]');
    var ok = true;
    required.forEach(function (f) {
      f.style.borderColor = '';
      if (!f.value.trim()) { f.style.borderColor = '#FFC000'; ok = false; }
    });
    if (!ok) return;

    var isLocal = /^(localhost|127\.|192\.168\.)/.test(window.location.hostname);
    if (isLocal) { showSuccess(); return; }

    var btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString()
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      showSuccess();
    }).catch(function () {
      btn.disabled = false;
      btn.textContent = 'Reserve Your Kitchen — $200 Deposit';
      var err = document.getElementById('order-error');
      if (!err) {
        err = document.createElement('p');
        err.id = 'order-error';
        err.className = 'quote-fine';
        err.style.color = '#FFC000';
        form.appendChild(err);
      }
      err.textContent = 'Something went wrong sending your order — please try again, or email hello@formakitchens.com.au directly.';
    });
  });
}());
