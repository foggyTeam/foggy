export default function resizeImage(
  image: File,
  minSize: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(image);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context is not available'));
        return;
      }

      let width = img.width;
      let height = img.height;
      const aspectRatio = width / height;

      // Определяем новые размеры
      if (width > height) {
        height = minSize;
        width = minSize * aspectRatio;
      } else {
        width = minSize;
        height = minSize / aspectRatio;
      }

      // Устанавливаем размеры холста
      canvas.width = minSize;
      canvas.height = minSize;

      // Очищаем холст и рисуем изображение в центре
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const offsetX = (minSize - width) / 2;
      const offsetY = (minSize - height) / 2;
      ctx.drawImage(img, offsetX, offsetY, width, height);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Blob creation failed'));
        }
      }, image.type);
    };
    img.onerror = reject;
  });
}
