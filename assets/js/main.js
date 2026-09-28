(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progressBar = document.querySelector('.scroll-progress span');
  let progressFrame = 0;
  const updateProgress = () => {
    progressFrame = 0;
    if (!progressBar) return;
    const range = document.documentElement.scrollHeight - window.innerHeight;
    const progress = range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0;
    progressBar.style.width = `${progress * 100}%`;
  };
  window.addEventListener('scroll', () => {
    if (!progressFrame) progressFrame = window.requestAnimationFrame(updateProgress);
  }, { passive: true });
  updateProgress();

  const navLinks = [...document.querySelectorAll('.site-nav a')];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    const activeObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${visible.target.id}`);
      });
    }, { rootMargin: '-20% 0px -65% 0px', threshold: [0, 0.05, 0.2] });
    sections.forEach((section) => activeObserver.observe(section));
  }

  const motionImage = document.querySelector('.motion-media[data-motion-src]');
  if (motionImage && !reducedMotion) {
    const loadMotion = () => {
      if (motionImage.dataset.loaded === 'true') return;
      motionImage.dataset.loaded = 'true';
      motionImage.src = motionImage.dataset.motionSrc;
      motionImage.addEventListener('load', () => {
        motionImage.closest('.motion-stage')?.classList.add('is-playing');
      }, { once: true });
    };

    if ('IntersectionObserver' in window) {
      const motionObserver = new IntersectionObserver((entries, observer) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        loadMotion();
        observer.disconnect();
      }, { rootMargin: '500px 0px' });
      motionObserver.observe(motionImage);
    } else {
      loadMotion();
    }
  }

  document.querySelectorAll('[data-copy-target]').forEach((button) => {
    button.addEventListener('click', async () => {
      const target = document.getElementById(button.dataset.copyTarget);
      if (!target) return;
      const text = target.innerText.trim();
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const range = document.createRange();
        range.selectNodeContents(target);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('copy');
        selection.removeAllRanges();
      }
      const original = button.textContent;
      button.textContent = 'Copied';
      button.classList.add('is-copied');
      window.setTimeout(() => {
        button.textContent = original;
        button.classList.remove('is-copied');
      }, 1600);
    });
  });
})();
