const overlayImage = new Image();
overlayImage.src = "public/janecek.png";

const renderCanvas = async ({ canvas, state }) => {
  const ctx = canvas.getContext("2d");
  // clear to black (for transparent images)
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // scale image to always fill the canvas
  const scaleX = canvas.width / state.image.width;
  const scaleY = canvas.height / state.image.height;
  const scale = Math.max(scaleX, scaleY);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.drawImage(state.image, 0, 0);
  ctx.setTransform(); // reset so that everything else is normal size

  ctx.drawImage(
    overlayImage,
    state.overlayCoords.x,
    state.overlayCoords.y,
    state.overlayCoords.width,
    state.overlayCoords.height,
  );

  if (state.displayText) {
    const fontSize = 95;
    const lineHeight = 95;
    const maxWidth = 750;
    ctx.font = `bold ${fontSize}px 'bc-novatica-cyr'`;
    const text = state.text || "Tohle s memy";
    const x = 50;
    let y = 350;
    ctx.fillStyle = "#f9dc4d";
    ctx.textBaseline = "top";
    ctx.fillStyle = "yellow";

    const words = text.split(" ");
    let line = "";
    words.forEach((word, index) => {
      const testLine = `${line + word} `;
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && index > 0) {
        ctx.fillText(line, x, y);
        line = `${word} `;
        y += lineHeight;
      } else {
        line = testLine;
      }
    });

    ctx.fillText(line, x, y);
    y += lineHeight;
  }
};

export default renderCanvas;
