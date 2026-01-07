import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { ImageData } from '@/types';

interface ImageUploadProps {
  value?: ImageData;
  onChange: (data: ImageData | undefined) => void;
  className?: string;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const THUMBNAIL_SIZE = 200;

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback(
    async (file: File) => {
      setError(null);

      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      if (file.size > MAX_SIZE) {
        setError('Image must be less than 5MB');
        return;
      }

      try {
        const { base64, width, height, thumbnail, mimeType } = await readAndResizeImage(file);
        onChange({
          base64,
          mimeType,
          width,
          height,
          thumbnail,
        });
      } catch (err) {
        setError('Failed to process image');
        console.error(err);
      }
    },
    [onChange]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processImage(file);
      }
    },
    [processImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        processImage(file);
      }
    },
    [processImage]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            processImage(file);
            break;
          }
        }
      }
    },
    [processImage]
  );

  const handleRemove = useCallback(() => {
    onChange(undefined);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [onChange]);

  if (value) {
    return (
      <div className={cn('relative rounded-lg overflow-hidden border border-slate-200', className)}>
        <img
          src={value.base64}
          alt="Uploaded"
          className="w-full h-48 object-cover"
        />
        <button
          type="button"
          onClick={handleRemove}
          className={cn(
            'absolute top-2 right-2 p-1.5 rounded-full',
            'bg-black/50 text-white hover:bg-black/70 transition-colors'
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
        <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/50 text-white text-xs">
          {value.width} x {value.height}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        className={cn(
          'relative rounded-lg border-2 border-dashed p-6 text-center',
          'transition-colors duration-200 cursor-pointer',
          isDragging
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-slate-200 hover:border-slate-300'
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onPaste={handlePaste}
        onClick={() => inputRef.current?.click()}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="sr-only"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto mb-3 text-slate-400"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
        <p className="text-sm text-slate-600">
          Drop an image, paste from clipboard, or{' '}
          <span className="text-indigo-600 font-medium">browse</span>
        </p>
        <p className="mt-1 text-xs text-slate-400">PNG, JPG, GIF up to 5MB</p>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

async function readAndResizeImage(file: File): Promise<{
  base64: string;
  width: number;
  height: number;
  thumbnail: string;
  mimeType: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Create thumbnail
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // Calculate thumbnail dimensions
        let thumbWidth = THUMBNAIL_SIZE;
        let thumbHeight = THUMBNAIL_SIZE;

        if (img.width > img.height) {
          thumbHeight = (img.height / img.width) * THUMBNAIL_SIZE;
        } else {
          thumbWidth = (img.width / img.height) * THUMBNAIL_SIZE;
        }

        canvas.width = thumbWidth;
        canvas.height = thumbHeight;
        ctx.drawImage(img, 0, 0, thumbWidth, thumbHeight);
        const thumbnail = canvas.toDataURL('image/jpeg', 0.7);

        resolve({
          base64: e.target!.result as string,
          width: img.width,
          height: img.height,
          thumbnail,
          mimeType: file.type,
        });
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target!.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
