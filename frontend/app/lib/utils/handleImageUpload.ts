import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';
import { uploadImage } from '@/app/lib/server/actions/handleImage';

function handleImageUpload(image: File, minSize: number): Promise<Blob> {
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

export default async function HandleImageUpload(event: any, minSize = 288) {
  const image = event.target.files[0];
  if (image) {
    if (!image.type.startsWith('image/')) {
      addToast({
        color: 'danger',
        severity: 'danger',
        title: settingsStore.t.toasts.image.notImage,
      });
      return null;
    }

    const resizedImage = await handleImageUpload(image, minSize).catch(() =>
      addToast({
        color: 'danger',
        severity: 'danger',
        title: settingsStore.t.toasts.image.resizeImageError,
      }),
    );
    if (!resizedImage) return null;

    return resizedImage;
  }
}

function resizeImage(file: File | Blob, maxSize: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      if (width <= maxSize && height <= maxSize) {
        resolve(file);
        return;
      }

      if (width > height) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      } else {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
        file.type || 'image/jpeg',
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image load failed'));
    };

    img.src = url;
  });
}

export async function HandleBoardImageElementUpload(
  imageFile: File | Blob,
  prefix: string = 'board_simple_',
  maxSize = 1920,
) {
  try {
    const blob = await resizeImage(imageFile, maxSize);
    const response = await uploadImage('board_images', blob, prefix, {
      type: 'random',
    });
    return 'url' in response ? (response.url as string) : null;
  } catch {
    return null;
  }
}
