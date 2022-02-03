const generators = [
  { url: "https://source.unsplash.com/800x800?people", weight: 10 },
  { url: "https://source.unsplash.com/800x800?group", weight: 5 },
];

const unrolledGenerators = generators.flatMap(({ url, weight }) => Array(weight).fill(url));

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const fetchNewImage = async () => {
  const imageData = await fetch(pickRandom(unrolledGenerators));
  return new Promise((resolve) => {
    const image = new Image();

    image.addEventListener("load", () => resolve(image));

    image.crossOrigin = "anonymous";
    image.src = imageData.url;
  });
};

export const loadCustomImage = async ({ image }) => (
  new Promise((resolve, reject) => {
    if (!image.type.startsWith("image/")) reject();
    const imageReader = new FileReader();
    imageReader.readAsDataURL(image);
    imageReader.addEventListener("load", (e) => {
      const newImage = new Image();
      newImage.addEventListener("load", () => resolve(newImage));
      newImage.src = e.target.result;
    });
  })
);
