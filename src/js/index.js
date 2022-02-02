import { claims, generators } from "./data.js";
import { pickRandom } from "./helperFunctions.js";

const unrolledGenerators = generators.flatMap(({ url, weight }) => Array(weight).fill(url));

const imageReader = new FileReader();

let currentImage = new Image();
let currentText = "Test text";

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

const rerollText = () => {
  currentText = pickRandom(claims);
};

const canvas = document.getElementById("picture");
const ctx = canvas.getContext("2d");
const font = new FontFace("Bebas Neue", "url(public/BebasNeue-Bold.ttf)");
const canvasRect = canvas.getBoundingClientRect();
const offsetX = canvasRect.left;
const offsetY = canvasRect.top;

let isDragging = false;
let startX;
let startY;

const overlayImage = new Image();
overlayImage.src = "public/janecek.png";
const initialWidth = 493;
const initialHeight = 897;
const overlayImageCoords = { x: 525, y: 20, width: initialWidth / 1.5, height: initialHeight / 1.5 };

canvas.addEventListener("mousedown", (e) => {
  // mouse position
  const mx = Number(e.clientX - offsetX);
  const my = Number(e.clientY - offsetY);

  if (mx > overlayImageCoords.x && mx < overlayImageCoords.x + overlayImageCoords.width
    && my > overlayImageCoords.y && my < overlayImageCoords.y + overlayImageCoords.height) {
    isDragging = true;
  }

  startX = mx;
  startY = my;
});

canvas.addEventListener("mouseup", () => { isDragging = false; });

const initFont = async () => {
  await font.load();
  document.fonts.add(font);
};

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

  /*
  const lines = splitText(currentText, 20).reverse();
  const fontSize = lines.length < 5 ? 60 : 40;
  ctx.font = `${fontSize}px 'Bebas Neue'`;
  lines.forEach((line, index) => {
    const x = 30;
    const y = 685;
    const padding = 15;
    const lineHeight = padding + fontSize;
    ctx.fillStyle = "#f9dc4d";
    ctx
      .fillRect(x, y - (index * lineHeight), ctx.measureText(line).width + 2 * padding, lineHeight);
    ctx.textBaseline = "top";
    ctx.fillStyle = "black";
    ctx.fillText(line, x + padding, y + padding - (index * lineHeight));
  });
  */
};

canvas.addEventListener("mousemove", (e) => {
  // mouse position
  const mx = Number(e.clientX - offsetX);
  const my = Number(e.clientY - offsetY);
  // fancy cursor
  if (mx > overlayImageCoords.x && mx < overlayImageCoords.x + overlayImageCoords.width
    && my > overlayImageCoords.y && my < overlayImageCoords.y + overlayImageCoords.height) {
    canvas.style.cursor = "pointer";
  } else {
    canvas.style.cursor = "initial";
  }

  if (isDragging) {
    // calculate the distance the mouse has moved
    // since the last mousemove
    const dx = mx - startX;
    const dy = my - startY;

    overlayImageCoords.x += dx;
    overlayImageCoords.y += dy;

    repaintImage();

    // reset the starting mouse position for the next mousemove
    startX = mx;
    startY = my;
  }
});

imageReader.addEventListener("load", (e) => {
  currentImage = new Image();
  currentImage.addEventListener("load", () => repaintImage());
  currentImage.src = e.target.result;
});

const buttonRandom = document.getElementById("randomize");
buttonRandom.addEventListener("click", async () => {
  rerollText();
  await rerollImage();
  repaintImage();
});

const buttonRandomImg = document.getElementById("randomize-img");
buttonRandomImg.addEventListener("click", async () => {
  await rerollImage();
  repaintImage();
});

const buttonRandomText = document.getElementById("randomize-text");
buttonRandomText.addEventListener("click", () => {
  rerollText();
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

const inputCustom = document.getElementById("customText");
const replaceWithCustomText = async (e) => {
  if (e.type === "input" || inputCustom.value) {
    currentText = inputCustom.value;
    repaintImage();
  }
};
inputCustom.addEventListener("click", replaceWithCustomText);
inputCustom.addEventListener("input", replaceWithCustomText);

const slider = document.getElementById("slider");
slider.addEventListener("input", (e) => {
  overlayImageCoords.width = initialWidth * (e.target.value / 100);
  overlayImageCoords.height = initialHeight * (e.target.value / 100);
  repaintImage();
});

const downloadLinkReal = document.createElement("a");
downloadLinkReal.setAttribute("download", "PirStanKampan.jpg");
const linkSave = document.getElementById("save");
linkSave.addEventListener("click", (e) => {
  e.preventDefault();
  downloadLinkReal.setAttribute("href", canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream"));
  downloadLinkReal.click();
});

initFont();

rerollText();
rerollImage()
  .then(() => repaintImage());
