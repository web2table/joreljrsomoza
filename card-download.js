(() => {
  const button = document.querySelector('.card-download');
  const card = document.querySelector('.business-card');
  if (!button || !card) return;
  button.addEventListener('click', async () => {
    if (typeof window.html2canvas !== 'function') {
      alert('The card image tool is unavailable. Please check your connection and try again.');
      return;
    }
    const originalLabel = button.getAttribute('aria-label');
    button.disabled = true;
    button.setAttribute('aria-label', 'Preparing business card image');
    try {
      await document.fonts.ready;
      const canvas = await window.html2canvas(card, {
        scale: Math.max(2, window.devicePixelRatio || 1),
        useCORS: true,
        backgroundColor: null,
        logging: false,
        ignoreElements: element => element.classList?.contains('card-download')
      });
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Could not create image');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'jorel-somoza-business-card.png';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (error) {
      console.error('Business card image export failed:', error);
      alert('Could not save the card image. Please try again.');
    } finally {
      button.disabled = false;
      button.setAttribute('aria-label', originalLabel || 'Save business card image');
    }
  });
})();