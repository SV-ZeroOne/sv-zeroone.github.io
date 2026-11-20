// Same-origin embed sizing for the K8 exploded view. The canvas has a fixed
// CSS height inside the frame, so resizing the iframe cannot start a loop.
(() => {
  const frame = document.getElementById('k8-explorer');
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
