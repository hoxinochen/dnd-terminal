/**
 * Map Viewport Controller
 * EXP-UX-GEMINI-001 Candidate Decoupled Module
 * Strictly Zero Emojis
 */

export const ZOOM_MIN = 0.4;
export const ZOOM_MAX = 3.0;
export const ZOOM_STEP = 0.15;

/**
 * Clamps a zoom scale within valid range [0.4, 3.0]
 */
export function clampZoom(value) {
  const num = Number(value) || 1.0;
  return Math.round(Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, num)) * 100) / 100;
}

/**
 * Calculates next zoom level based on action
 */
export function calculateNextZoom(current, action, delta = 0) {
  const cur = Number(current) || 1.0;
  switch (action) {
    case 'in':
      return clampZoom(cur + ZOOM_STEP);
    case 'out':
      return clampZoom(cur - ZOOM_STEP);
    case 'reset':
      return 1.0;
    case 'delta':
      return clampZoom(cur + delta);
    default:
      return clampZoom(cur);
  }
}

/**
 * Applies zoom scale directly to viewport and canvas DOM elements
 */
export function applyMapScale(viewport, canvas, scale, labelElement = null) {
  if (!viewport || !canvas) return;
  const clamped = clampZoom(scale);
  viewport.style.setProperty('--map-scale', String(clamped));
  canvas.style.transform = `scale(${clamped})`;
  if (labelElement) {
    labelElement.textContent = `${Math.round(clamped * 100)}%`;
  }
}

/**
 * Binds mouse wheel, pinch-to-zoom, and floating button controls to map viewport
 */
export function bindMapController(viewport, canvas, options = {}) {
  if (!viewport || !canvas) return () => {};

  const {
    initialZoom = 1.0,
    labelElement = null,
    onZoomChange = null,
    panHandle = null,
    onBackgroundClick = null,
  } = options;

  let currentZoom = clampZoom(initialZoom);
  applyMapScale(viewport, canvas, currentZoom, labelElement);

  let pan = null;
  let backgroundPress = null;
  const startPan = event => {
    if (event.button !== 0 || event.isPrimary === false) return;
    pan = { id:event.pointerId, x:event.clientX, y:event.clientY, left:viewport.scrollLeft, top:viewport.scrollTop };
    panHandle.setPointerCapture?.(event.pointerId);
    panHandle.classList.add('is-panning');
    event.preventDefault();
    event.stopPropagation();
  };
  const movePan = event => {
    if (!pan || pan.id !== event.pointerId) return;
    viewport.scrollLeft = pan.left - (event.clientX-pan.x);
    viewport.scrollTop = pan.top - (event.clientY-pan.y);
    event.preventDefault();
  };
  const endPan = event => {
    if (!pan || pan.id !== event.pointerId) return;
    pan = null;
    panHandle.classList.remove('is-panning');
    if (panHandle.hasPointerCapture?.(event.pointerId)) panHandle.releasePointerCapture(event.pointerId);
  };
  const panKey = event => {
    const delta = {ArrowLeft:[-48,0],ArrowRight:[48,0],ArrowUp:[0,-48],ArrowDown:[0,48]}[event.key];
    if (!delta) return;
    viewport.scrollBy(delta[0],delta[1]);
    event.preventDefault();
  };
  const excluded = target => target.closest('[data-token],[data-entry-placement-token],[data-s2-placement-token],button,input,select,textarea,a,summary,[data-map-pan-handle]');
  const backgroundDown = event => {
    backgroundPress = event.button === 0 && event.isPrimary !== false && !excluded(event.target)
      ? { id:event.pointerId,x:event.clientX,y:event.clientY,time:Date.now(),moved:false } : null;
  };
  const backgroundMove = event => {
    if (backgroundPress && Math.hypot(event.clientX-backgroundPress.x,event.clientY-backgroundPress.y)>6) backgroundPress.moved=true;
  };
  const backgroundUp = event => {
    const press=backgroundPress; backgroundPress=null;
    if (press && press.id===event.pointerId && !press.moved && Date.now()-press.time<500 && !excluded(event.target)) onBackgroundClick?.();
  };
  const cancelBackground = () => { backgroundPress=null; };
  panHandle?.addEventListener('pointerdown',startPan);
  panHandle?.addEventListener('pointermove',movePan);
  panHandle?.addEventListener('pointerup',endPan);
  panHandle?.addEventListener('pointercancel',endPan);
  panHandle?.addEventListener('lostpointercapture',endPan);
  panHandle?.addEventListener('keydown',panKey);
  viewport.addEventListener('pointerdown',backgroundDown);
  viewport.addEventListener('pointermove',backgroundMove);
  viewport.addEventListener('pointerup',backgroundUp);
  viewport.addEventListener('pointercancel',cancelBackground);

  // 1. Natural Mouse Wheel Zoom (NO Ctrl key required!)
  const handleWheel = (event) => {
    event.preventDefault();
    // Smooth wheel delta damping: scroll up zooms in, scroll down zooms out
    const delta = event.deltaY < 0 ? 0.1 : -0.1;
    const next = calculateNextZoom(currentZoom, 'delta', delta);
    if (next !== currentZoom) {
      currentZoom = next;
      applyMapScale(viewport, canvas, currentZoom, labelElement);
      onZoomChange?.(currentZoom);
    }
  };

  viewport.addEventListener('wheel', handleWheel, { passive: false });

  // 2. Touch Pinch-to-Zoom (for tablets and touchpads)
  let initialPinchDist = 0;
  let pinchBaseZoom = currentZoom;

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      initialPinchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchBaseZoom = currentZoom;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && initialPinchDist > 0) {
      e.preventDefault();
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = currentDist / initialPinchDist;
      const next = clampZoom(pinchBaseZoom * ratio);
      if (next !== currentZoom) {
        currentZoom = next;
        applyMapScale(viewport, canvas, currentZoom, labelElement);
        onZoomChange?.(currentZoom);
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) {
      initialPinchDist = 0;
    }
  };

  canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
  canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
  canvas.addEventListener('touchend', handleTouchEnd, { passive: true });

  // Cleanup handler
  return () => {
    panHandle?.removeEventListener('pointerdown',startPan);
    panHandle?.removeEventListener('pointermove',movePan);
    panHandle?.removeEventListener('pointerup',endPan);
    panHandle?.removeEventListener('pointercancel',endPan);
    panHandle?.removeEventListener('lostpointercapture',endPan);
    panHandle?.removeEventListener('keydown',panKey);
    viewport.removeEventListener('pointerdown',backgroundDown);
    viewport.removeEventListener('pointermove',backgroundMove);
    viewport.removeEventListener('pointerup',backgroundUp);
    viewport.removeEventListener('pointercancel',cancelBackground);
    viewport.removeEventListener('wheel', handleWheel);
    canvas.removeEventListener('touchstart', handleTouchStart);
    canvas.removeEventListener('touchmove', handleTouchMove);
    canvas.removeEventListener('touchend', handleTouchEnd);
  };
}
