const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generators = [
  { url: "https://source.unsplash.com/800x800?people", weight: 10 },
  { url: "https://source.unsplash.com/800x800?group", weight: 5 },
];

const unrolledGenerators = generators.flatMap(({ url, weight }) => Array(weight).fill(url));

let displayText = false;
let currentText = "";

const imageReader = new FileReader();
let currentImage = new Image();

const rerollImage = async () => {
  const imageData = await fetch(pickRandom(unrolledGenerators));

  return new Promise((resolve) => {
    const image = new Image();

    image.addEventListener("load", () => {
      currentImage = image;
      resolve();
    });

    image.crossOrigin = "anonymous";
    image.src = imageData.url;
  });
};

const canvas = document.getElementById("picture");
const ctx = canvas.getContext("2d");

const getCanvasInfo = () => {
  const canvasRect = canvas.getBoundingClientRect();
  return {
    offsetX: canvasRect.left,
    offsetY: canvasRect.top,
    canvasScale: canvasRect.width / 800,
  };
};

let { offsetX, offsetY, canvasScale } = getCanvasInfo();

let isDragging = false;
let startX;
let startY;

const overlayImage = new Image();
overlayImage.src = "public/janecek.png";
const initialWidth = 493;
const initialHeight = 897;
const descale = 1.8;
const overlayImageCoords = {
  x: 500,
  y: 800 - (initialHeight / descale),
  width: initialWidth / descale,
  height: initialHeight / descale,
};

const onMouseDown = (e) => {
  const isTouch = !!e.touches;
  // mouse position
  const mx = Number((isTouch ? e.touches[0].clientX : e.clientX) - offsetX);
  const my = Number((isTouch ? e.touches[0].clientY : e.clientY) - offsetY);

  // overlay image position (with scaling)
  const ix = overlayImageCoords.x * canvasScale;
  const iy = overlayImageCoords.y * canvasScale;
  const iw = overlayImageCoords.width * canvasScale;
  const ih = overlayImageCoords.height * canvasScale;

  if (mx > ix && mx < ix + iw && my > iy && my < iy + ih) {
    isDragging = true;
  }

  startX = mx;
  startY = my;
};

canvas.addEventListener("mousedown", onMouseDown);
canvas.addEventListener("touchstart", onMouseDown);

canvas.addEventListener("mouseup", () => { isDragging = false; });

const setFile = (file) => {
  if (!file.type.startsWith("image/")) {
    return;
  }

  imageReader.readAsDataURL(file);
};

canvas.addEventListener("dragover", (e) => e.preventDefault());

canvas.addEventListener("drop", (e) => {
  e.preventDefault();
  if (!e.dataTransfer || e.dataTransfer.files.length <= 0) {
    return;
  }

  setFile(e.dataTransfer.files[0]);
});

const repaintImage = async () => {
  // clear to black (for transparent images)
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // scale image to always fill the canvas
  const scaleX = canvas.width / currentImage.width;
  const scaleY = canvas.height / currentImage.height;
  const scale = Math.max(scaleX, scaleY);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.drawImage(currentImage, 0, 0);
  ctx.setTransform(); // reset so that everything else is normal size

  ctx.drawImage(overlayImage, overlayImageCoords.x, overlayImageCoords.y, overlayImageCoords.width, overlayImageCoords.height);

  if (displayText) {
    const fontSize = 100;
    ctx.font = `bold ${fontSize}px 'bc-novatica-cyr'`;
    const line = currentText || "Tohle s memy";
    const x = 50;
    const y = 350;
    const padding = 15;
    ctx.fillStyle = "#f9dc4d";
    ctx.textBaseline = "top";
    ctx.fillStyle = "yellow";
    ctx.fillText(line, x + padding, y + padding);
  }
};

const onMove = (e) => {
  const isTouch = !!e.touches;
  // mouse position
  const mx = Number((isTouch ? e.touches[0].clientX : e.clientX) - offsetX);
  const my = Number((isTouch ? e.touches[0].clientY : e.clientY) - offsetY);

  // overlay image position (with scaling)
  const ix = overlayImageCoords.x * canvasScale;
  const iy = overlayImageCoords.y * canvasScale;
  const iw = overlayImageCoords.width * canvasScale;
  const ih = overlayImageCoords.height * canvasScale;

  // fancy cursor
  if (mx > ix && mx < ix + iw && my > iy && my < iy + ih) {
    canvas.style.cursor = "pointer";
  } else {
    canvas.style.cursor = "initial";
  }

  if (isDragging) {
    // calculate the distance the mouse has moved
    // since the last mousemove
    const dx = mx - startX;
    const dy = my - startY;

    overlayImageCoords.x += dx / canvasScale;
    overlayImageCoords.y += dy / canvasScale;

    repaintImage();

    // reset the starting mouse position for the next mousemove
    startX = mx;
    startY = my;
  }
};

canvas.addEventListener("mousemove", onMove);
canvas.addEventListener("touchmove", onMove);

imageReader.addEventListener("load", (e) => {
  currentImage = new Image();
  currentImage.addEventListener("load", () => repaintImage());
  currentImage.src = e.target.result;
});

const buttonRandomImg = document.getElementById("randomize");
buttonRandomImg.addEventListener("click", async () => {
  await rerollImage();
  repaintImage();
});

const inputCustomImg = document.getElementById("customImage");
inputCustomImg.addEventListener("change", (e) => {
  e.preventDefault();
  if (e.target.files.length <= 0) {
    return;
  }
  setFile(e.target.files[0]);
});
const buttonCustomImg = document.getElementById("customImageBtn");
buttonCustomImg.addEventListener("click", () => {
  inputCustomImg.click();
});

const toggleText = document.getElementById("toggleText");
const inputCustom = document.getElementById("customText");
toggleText.addEventListener("click", () => {
  displayText = !displayText;
  toggleText.innerText = toggleText.innerText === "Přidat text" ? "Odebrat text" : "Přidat text";
  repaintImage();
});

const replaceWithCustomText = async (e) => {
  if (e.type === "input" || inputCustom.value) {
    currentText = inputCustom.value;
    repaintImage();
  }
};
inputCustom.addEventListener("click", replaceWithCustomText);
inputCustom.addEventListener("input", replaceWithCustomText);

const slider = document.getElementById("slider");
let oldWidth = overlayImageCoords.width;
let oldHeight = overlayImageCoords.height;
const zoomImage = (value) => {
  overlayImageCoords.width = initialWidth * (value / 100);
  overlayImageCoords.height = initialHeight * (value / 100);

  overlayImageCoords.x += (oldWidth - overlayImageCoords.width) / 2;
  overlayImageCoords.y += (oldHeight - overlayImageCoords.height) / 2;

  oldWidth = overlayImageCoords.width;
  oldHeight = overlayImageCoords.height;
  repaintImage();
};
slider.addEventListener("input", (e) => zoomImage(e.target.value));

const downloadLinkReal = document.createElement("a");
downloadLinkReal.setAttribute("download", "TohleJsmeMy.jpg");
const linkSave = document.getElementById("save");
linkSave.addEventListener("click", (e) => {
  e.preventDefault();
  downloadLinkReal.setAttribute("href", canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream"));
  downloadLinkReal.click();
});

window.addEventListener("resize", () => {
  const resizedCanvasInfo = getCanvasInfo();
  offsetX = resizedCanvasInfo.offsetX;
  offsetY = resizedCanvasInfo.offsetY;
  canvasScale = resizedCanvasInfo.canvasScale;
});

rerollImage()
  .then(() => repaintImage());

// /////////////////////
const evCache = [];
let prevDiff = -1;

canvas.addEventListener("pointerdown", (e) => evCache.push(e));
canvas.addEventListener("pointermove", (e) => {
  for (let i = 0; i < evCache.length; i++) {
    if (e.pointerId === evCache[i].pointerId) {
      evCache[i] = e;
      break;
    }
  }

  // If two pointers are down, check for pinch gestures
  if (evCache.length === 2) {
    // Calculate the distance between the two pointers
    const curDiff = Math.abs(evCache[0].clientX - evCache[1].clientX);

    if (prevDiff > 0) {
      // zoom in
      if (curDiff > prevDiff) {
        slider.value = Number(slider.value) + 2;
        zoomImage(slider.value);
      }
      // zoom out
      if (curDiff < prevDiff) {
        slider.value = Number(slider.value) - 2;
        zoomImage(slider.value);
      }
    }

    prevDiff = curDiff;
  }
});

const onPointerUp = (e) => {
  for (let i = 0; i < evCache.length; i++) {
    if (evCache[i].pointerId === e.pointerId) {
      evCache.splice(i, 1);
      break;
    }
  }
  // If the number of pointers down is less than two then reset diff tracker
  if (evCache.length < 2) prevDiff = -1;
};

canvas.addEventListener("pointerup", onPointerUp);
canvas.addEventListener("pointercancel", onPointerUp);
canvas.addEventListener("pointerout", onPointerUp);
canvas.addEventListener("pointerleave", onPointerUp);
