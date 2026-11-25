// Same-origin embed sizing. The embedded canvas has a fixed CSS height, so
// changing the iframe height cannot create a viewport/ResizeObserver loop.
(() => {
  const frame = document.getElementById('neox1-explorer');
  if (!frame) return;
  let observer;
  function connect() {
    const content = frame.contentDocument?.querySelector('.lab');
    if (!content) return;
    observer?.disconnect();
    const resize = () => {
      const height = Math.ceil(content.getBoundingClientRect().height) + 4;
      if (height > 100 && height < 3000) frame.style.height = `${height}px`;
    };
    observer = new ResizeObserver(resize);
    observer.observe(content);
    resize();
  }
  frame.addEventListener('load', connect);
  if (frame.contentDocument?.readyState === 'complete') connect();
})();
