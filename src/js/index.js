import renderCanvas from "./canvas.js";
import { fetchNewImage, loadCustomImage } from "./image.js";

const canvas = document.getElementById("picture");
const canvasRect = canvas.getBoundingClientRect();

const initialWidth = 493;
const initialHeight = 897;
const descale = 1.8;

const state = {
  image: new Image(),
  canvas: {
    offsetX: canvasRect.left,
    offsetY: canvasRect.top,
    scale: canvasRect.width / 800,
  },
  overlayCoords: {
    x: 500,
    y: 800 - (initialHeight / descale),
    width: initialWidth / descale,
    height: initialHeight / descale,
    oldWidth: initialWidth / descale,
    oldHeight: initialHeight / descale,
  },
  touch: {
    eventCache: [],
    prevDiff: -1,
  },
  move: {
    startX: null,
    startY: null,
  },
  isDragging: false,
  displayText: false,
  text: "",
};

const zoomImage = (value) => {
  state.overlayCoords.width = initialWidth * (value / 100);
  state.overlayCoords.height = initialHeight * (value / 100);

  state.overlayCoords.x += (state.overlayCoords.oldWidth - state.overlayCoords.width) / 2;
  state.overlayCoords.y += (state.overlayCoords.oldHeight - state.overlayCoords.height) / 2;

  state.overlayCoords.oldWidth = state.overlayCoords.width;
  state.overlayCoords.oldHeight = state.overlayCoords.height;
  renderCanvas({ canvas, state });
};

// overlay move listeners
const onMouseDown = (e) => {
  const isTouch = !!e.touches;
  // mouse position
  const mx = Number((isTouch ? e.touches[0].clientX : e.clientX) - state.canvas.offsetX);
  const my = Number((isTouch ? e.touches[0].clientY : e.clientY) - state.canvas.offsetY);

  // overlay image position (with scaling)
  const ix = state.overlayCoords.x * state.canvas.scale;
  const iy = state.overlayCoords.y * state.canvas.scale;
  const iw = state.overlayCoords.width * state.canvas.scale;
  const ih = state.overlayCoords.height * state.canvas.scale;

  if (mx > ix && mx < ix + iw && my > iy && my < iy + ih) {
    state.isDragging = true;
  }

  state.move.startX = mx;
  state.move.startY = my;
};
canvas.addEventListener("mousedown", onMouseDown);
canvas.addEventListener("touchstart", onMouseDown);

canvas.addEventListener("mouseup", () => { state.isDragging = false; });

const onMouseMove = (e) => {
  const isTouch = !!e.touches;
  // mouse position
  const mx = Number((isTouch ? e.touches[0].clientX : e.clientX) - state.canvas.offsetX);
  const my = Number((isTouch ? e.touches[0].clientY : e.clientY) - state.canvas.offsetY);

  // overlay image position (with scaling)
  const ix = state.overlayCoords.x * state.canvas.scale;
  const iy = state.overlayCoords.y * state.canvas.scale;
  const iw = state.overlayCoords.width * state.canvas.scale;
  const ih = state.overlayCoords.height * state.canvas.scale;

  // fancy cursor
  if (mx > ix && mx < ix + iw && my > iy && my < iy + ih) {
    canvas.style.cursor = "pointer";
  } else {
    canvas.style.cursor = "initial";
  }

  if (state.isDragging) {
    // calculate the distance the mouse has moved
    // since the last mousemove
    const dx = mx - state.move.startX;
    const dy = my - state.move.startY;

    state.overlayCoords.x += dx / state.canvas.scale;
    state.overlayCoords.y += dy / state.canvas.scale;

    renderCanvas({ canvas, state });

    // reset the starting mouse position for the next mousemove
    state.move.startX = mx;
    state.move.startY = my;
  }
};
canvas.addEventListener("mousemove", onMouseMove);
canvas.addEventListener("touchmove", onMouseMove);

// background image drop listeners
canvas.addEventListener("dragover", (e) => e.preventDefault());
canvas.addEventListener("drop", async (e) => {
  e.preventDefault();
  if (!e.dataTransfer || e.dataTransfer.files.length <= 0) {
    return;
  }
  state.image = await loadCustomImage({ image: e.dataTransfer.files[0] });
  renderCanvas({ canvas, state });
});

// buttons
const buttonRandomImg = document.getElementById("randomize");
buttonRandomImg.addEventListener("click", async () => {
  state.image = await fetchNewImage();
  renderCanvas({ canvas, state });
});

const inputCustomImg = document.getElementById("customImage");
inputCustomImg.addEventListener("change", async (e) => {
  e.preventDefault();
  if (e.target.files.length <= 0) return;
  state.image = await loadCustomImage({ image: e.target.files[0] });
  renderCanvas({ canvas, state });
});
const buttonCustomImg = document.getElementById("customImageBtn");
buttonCustomImg.addEventListener("click", () => {
  inputCustomImg.click();
});

const toggleText = document.getElementById("toggleText");
const inputCustom = document.getElementById("customText");
toggleText.addEventListener("click", () => {
  state.displayText = !state.displayText;
  toggleText.innerText = toggleText.innerText === "Přidat text" ? "Odebrat text" : "Přidat text";
  renderCanvas({ canvas, state });
});

const replaceWithCustomText = async (e) => {
  if (e.type === "input" || inputCustom.value) {
    state.text = inputCustom.value;
    renderCanvas({ canvas, state });
  }
};
inputCustom.addEventListener("click", replaceWithCustomText);
inputCustom.addEventListener("input", replaceWithCustomText);

// slider
const slider = document.getElementById("slider");
slider.addEventListener("input", (e) => {
  zoomImage(e.target.value);
  renderCanvas({ canvas, state });
});

// download link
const downloadLinkReal = document.createElement("a");
downloadLinkReal.setAttribute("download", "TohleJsmeMy.jpg");
const linkSave = document.getElementById("save");
linkSave.addEventListener("click", (e) => {
  e.preventDefault();
  downloadLinkReal.setAttribute("href", canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream"));
  downloadLinkReal.click();
});

// overlay touch gestures
canvas.addEventListener("pointerdown", (e) => state.touch.eventCache.push(e));
canvas.addEventListener("pointermove", (e) => {
  for (let i = 0; i < state.touch.eventCache.length; i++) {
    if (e.pointerId === state.touch.eventCache[i].pointerId) {
      state.touch.eventCache[i] = e;
      break;
    }
  }

  // If two pointers are down, check for pinch gestures
  if (state.touch.eventCache.length === 2) {
    // Calculate the distance between the two pointers
    const curDiff = Math.abs(state.touch.eventCache[0].clientX - state.touch.eventCache[1].clientX);

    if (state.touch.prevDiff > 0) {
      // zoom in
      if (curDiff > state.touch.prevDiff) {
        slider.value = Number(slider.value) + 2;
        zoomImage(slider.value);
      }
      // zoom out
      if (curDiff < state.touch.prevDiff) {
        slider.value = Number(slider.value) - 2;
        zoomImage(slider.value);
      }
    }

    state.touch.prevDiff = curDiff;
  }
});

const onPointerUp = (e) => {
  for (let i = 0; i < state.touch.eventCache.length; i++) {
    if (state.touch.eventCache[i].pointerId === e.pointerId) {
      state.touch.eventCache.splice(i, 1);
      break;
    }
  }
  // If the number of pointers down is less than two then reset diff tracker
  if (state.touch.eventCache.length < 2) state.touch.prevDiff = -1;
};
canvas.addEventListener("pointerup", onPointerUp);
canvas.addEventListener("pointercancel", onPointerUp);
canvas.addEventListener("pointerout", onPointerUp);
canvas.addEventListener("pointerleave", onPointerUp);

// window resize tweak
window.addEventListener("resize", () => {
  const resizedCanvasRect = canvas.getBoundingClientRect();
  state.canvas = {
    offsetX: resizedCanvasRect.left,
    offsetY: resizedCanvasRect.top,
    scale: resizedCanvasRect.width / 800,
  };
});

// first render
const init = async () => {
  state.image = await fetchNewImage();
  renderCanvas({ canvas, state });
};

init();
