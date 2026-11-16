(() => {
  const card = document.querySelector('.business-card');
  if (!card) return;

  const waitForImages = async () => {
    const images = Array.from(card.querySelectorAll('img'));
    await Promise.all(images.map((image) => {
      if (image.complete && image.naturalWidth > 0) return Promise.resolve();
      return new Promise((resolve) => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
      });
    }));
    if (document.fonts?.ready) await document.fonts.ready;
  };

  const createSaveableCard = async () => {
    if (typeof window.html2canvas !== 'function') return;
    await waitForImages();
    try {
      const canvas = await window.html2canvas(card, {
        backgroundColor: '#050505',
        scale: 2,
        useCORS: true,
        logging: false,
        width: card.scrollWidth,
        height: card.scrollHeight,
        windowWidth: 1200,
        windowHeight: 800
      });
      const image = document.createElement('img');
      image.className = 'saveable-card-image';
      image.alt = 'Digital business card. Press and hold to save this image to your photos.';
      image.src = canvas.toDataURL('image/png');
      image.draggable = false;

      const wrapper = document.createElement('section');
      wrapper.className = 'saveable-card-wrap';
      wrapper.setAttribute('aria-label', 'Saveable digital business card image');
      const hint = document.createElement('p');
      hint.className = 'saveable-card-hint';
      hint.textContent = 'Press and hold the business card image to save it to your Photos or Gallery.';
      wrapper.append(hint, image);
      card.parentNode.insertBefore(wrapper, card);
    } catch (error) {
      console.error('Could not create the saveable business card image:', error);
    }
  };

  window.addEventListener('load', createSaveableCard, { once: true });
})();