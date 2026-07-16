/* FORMA Multi-Step Lead Form — Temu-style Engagement */
(function () {
  'use strict';

  const form = document.getElementById('quote-form-container');
  if (!form) return;

  const state = {
    step: 1,
    totalSteps: 4,
    data: {
      name: '',
      email: '',
      phone: '',
      postcode: '',
      layout: 'galley',
      metres: '7',
      collection: 'lume'
    }
  };

  // ---- DOM ELEMENTS ----
  const progressBar = document.querySelector('.form-progress-bar');
  const progressPercent = document.querySelector('.form-progress-percent');
  const stepCounter = document.querySelector('.form-step-counter');
  const nextBtn = document.getElementById('form-next');
  const prevBtn = document.getElementById('form-prev');
  const submitBtn = document.getElementById('form-submit');
  const steps = document.querySelectorAll('[data-step]');

  // ---- CONFETTI EFFECT ----
  function fireConfetti() {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '9999';
    document.body.appendChild(container);

    for (let i = 0; i < 30; i++) {
      const confetti = document.createElement('div');
      confetti.textContent = ['🎉', '✨', '🌟', '💛', '🎊'][Math.floor(Math.random() * 5)];
      confetti.style.position = 'fixed';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = '-20px';
      confetti.style.fontSize = '24px';
      confetti.style.animation = `fall ${2 + Math.random() * 2}s linear forwards`;
      confetti.style.opacity = '1';
      container.appendChild(confetti);
    }

    setTimeout(() => container.remove(), 4000);
  }

  const style = document.createElement('style');
  style.textContent = `
    @keyframes fall {
      to { 
        transform: translateY(100vh) rotate(360deg); 
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // ---- INPUT LISTENERS ----
  const inputs = document.querySelectorAll('[data-form-input]');
  inputs.forEach(input => {
    input.addEventListener('change', (e) => {
      const key = e.target.name;
      state.data[key] = e.target.type === 'radio' 
        ? e.target.value 
        : e.target.value;
      updateEstimate();
      updateDisplay();
      
      // Pulse animation on option select
      if (e.target.type === 'radio') {
        const card = e.target.closest('.option-label').querySelector('.option-card');
        if (card) {
          card.style.animation = 'none';
          setTimeout(() => card.style.animation = 'pulseSelect 0.4s ease-out', 10);
        }
      }
    });
    input.addEventListener('input', (e) => {
      const key = e.target.name;
      state.data[key] = e.target.value;
      updateEstimate();
      updateDisplay();
    });
  });

  // ---- UPDATE DISPLAY FOR RANGE ----
  function updateDisplay() {
    const metres = parseFloat(state.data.metres);
    const display = document.getElementById('metres-display');
    if (display) display.textContent = metres.toFixed(1) + 'm';
  }

  // ---- VALIDATION ----
  function validateStep(stepNum) {
    const stepEl = document.querySelector(`[data-step="${stepNum}"]`);
    const requiredInputs = stepEl.querySelectorAll('[required]');
    
    for (let input of requiredInputs) {
      if (!input.value.trim()) {
        input.focus();
        input.classList.add('error');
        input.style.animation = 'shake 0.3s ease-in-out';
        return false;
      }
      input.classList.remove('error');
    }
    return true;
  }

  // ---- SHOW/HIDE STEPS ----
  function showStep(num) {
    steps.forEach(step => step.hidden = true);
    const targetStep = document.querySelector(`[data-step="${num}"]`);
    if (targetStep) {
      targetStep.hidden = false;
      targetStep.style.animation = 'slideUp 0.4s ease-out';
    }

    // Update progress with animation
    if (progressBar) {
      const percent = (num / state.totalSteps * 100);
      progressBar.style.width = percent + '%';
    }
    if (progressPercent) {
      progressPercent.textContent = Math.round((num / state.totalSteps * 100)) + '%';
    }
    if (stepCounter) {
      stepCounter.textContent = `Step ${num} of ${state.totalSteps}`;
    }

    // Update button states
    if (prevBtn) prevBtn.hidden = num === 1;
    if (nextBtn) nextBtn.hidden = num === state.totalSteps;
    if (submitBtn) submitBtn.hidden = num !== state.totalSteps;

    // Update confirmation on step 4
    if (num === state.totalSteps) {
      updateConfirmation();
    }

    window.scrollTo({ top: form.offsetTop - 100, behavior: 'smooth' });
  }

  // ---- UPDATE CONFIRMATION SUMMARY ----
  function updateConfirmation() {
    const layouts = { galley: 'Galley', l: 'L-Shape', u: 'U-Shape', island: 'L + Island' };
    const collections = { lume: 'Timber-look', nera: 'Matte Black', officina: 'Steel Grey' };
    
    document.getElementById('confirm-name').textContent = state.data.name;
    document.getElementById('confirm-email').textContent = state.data.email;
    document.getElementById('confirm-phone').textContent = state.data.phone;
    document.getElementById('confirm-layout').textContent = layouts[state.data.layout];
    document.getElementById('confirm-metres').textContent = parseFloat(state.data.metres).toFixed(1) + ' metres';
    document.getElementById('confirm-collection').textContent = collections[state.data.collection];
    
    const metres = parseFloat(state.data.metres);
    const baseRate = 760;
    const estimate = metres * baseRate;
    const min = Math.round(estimate);
    const max = Math.round(estimate * 1.2);
    document.getElementById('confirm-estimate').textContent = `$${min.toLocaleString()} – $${max.toLocaleString()}`;
  }

  // ---- ESTIMATE CALCULATION ----
  function updateEstimate() {
    const metres = parseFloat(state.data.metres) || 7;
    const baseRate = 760;
    const estimate = metres * baseRate;
    const min = Math.round(estimate);
    const max = Math.round(estimate * 1.2);
    
    const estimateEl = document.getElementById('live-estimate');
    if (estimateEl) {
      estimateEl.textContent = `$${min.toLocaleString()} – $${max.toLocaleString()}`;
      estimateEl.style.animation = 'pulse 0.5s ease-out';
    }
  }

  // ---- NAVIGATION ----
  nextBtn?.addEventListener('click', () => {
    if (validateStep(state.step)) {
      state.step = Math.min(state.totalSteps, state.step + 1);
      showStep(state.step);
    }
  });

  prevBtn?.addEventListener('click', () => {
    state.step = Math.max(1, state.step - 1);
    showStep(state.step);
  });

  // ---- SUBMIT ----
  submitBtn?.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!validateStep(state.step)) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '🚀 Sending...';

    try {
      const formData = new FormData();
      Object.keys(state.data).forEach(key => {
        formData.append(key, state.data[key]);
      });
      formData.append('form-name', 'quote');

      const response = await fetch('/', {
        method: 'POST',
        body: formData
      });

      if (response.ok || response.status === 404) {
        fireConfetti();
        
        const successMsg = document.getElementById('quote-success');
        form.hidden = true;
        if (successMsg) {
          successMsg.hidden = false;
          successMsg.style.animation = 'slideUp 0.6s ease-out';
        }
        
        const successEl = document.querySelector('.quote-success');
        if (successEl) {
          setTimeout(() => {
            window.scrollTo({ top: successEl.offsetTop - 100, behavior: 'smooth' });
          }, 300);
        }
      } else {
        alert('Oops! Something went wrong. Please try again.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '✓ Send quote request';
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('Connection error. Please check your internet.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '✓ Send quote request';
    }
  });

  // Initialize
  showStep(1);
  updateEstimate();
  updateDisplay();
})();
