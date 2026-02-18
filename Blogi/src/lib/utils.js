import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString("fi-FI", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

export const convertLargeImageToWebP = (file, maxWidth = 1600, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const scale = maxWidth / img.width;
      const newWidth = maxWidth;
      const newHeight = img.height * scale;

      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject("WebP conversion failed");
            return;
          }
          resolve(blob);
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => reject("Image load error");

    img.src = URL.createObjectURL(file);
  });
};




