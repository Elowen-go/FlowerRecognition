import { useState, useRef, useCallback } from 'react';

function compressImage(file, maxWidth = 800, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;
                if (width > maxWidth) {
                    height = Math.round(height * maxWidth / width);
                    width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const base64 = canvas.toDataURL('image/jpeg', quality);
                const base64Data = base64.split(',')[1];
                resolve(base64Data);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function generateThumbnail(file, size = 100) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                const minEdge = Math.min(img.width, img.height);
                const sx = (img.width - minEdge) / 2;
                const sy = (img.height - minEdge) / 2;
                ctx.drawImage(img, sx, sy, minEdge, minEdge, 0, 0, size, size);
                resolve(canvas.toDataURL('image/jpeg', 0.5));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

export default function UploadArea({ onImageSelect, preview, disabled }) {
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef(null);

    const handleFile = useCallback(async (file) => {
        if (!file) return;
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            alert('仅支持 JPG 和 PNG 格式的图片');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            alert('图片大小不能超过 10MB');
            return;
        }
        try {
            const compressed = await compressImage(file);
            const thumbnail = await generateThumbnail(file);
            onImageSelect(compressed, thumbnail);
        } catch {
            alert('图片处理失败，请重试');
        }
    }, [onImageSelect]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFile(file);
    }, [handleFile]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragOver(false);
    }, []);

    const handleClick = () => {
        if (!disabled) {
            inputRef.current?.click();
        }
    };

    const handleInputChange = (e) => {
        const file = e.target.files[0];
        handleFile(file);
        e.target.value = '';
    };

    return (
        <div
            className={`relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragOver
                    ? 'border-green-500 bg-green-50'
                    : preview
                        ? 'border-gray-200 bg-white/50'
                        : 'border-gray-300 hover:border-green-400 hover:bg-green-50/30'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
        >
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={handleInputChange}
                disabled={disabled}
            />

            {preview ? (
                <div className="relative">
                    <img
                        src={preview}
                        alt="花卉预览"
                        className="max-h-72 mx-auto rounded-xl object-contain"
                    />
                    <button
                        className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-sm text-gray-600 px-3 py-1.5 rounded-lg shadow-sm hover:bg-white transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            onImageSelect(null, null);
                        }}
                        disabled={disabled}
                    >
                        重新选择
                    </button>
                </div>
            ) : (
                <div className="py-8">
                    <div className="text-5xl mb-4">🌺</div>
                    <p className="text-gray-600 text-lg font-medium">
                        点击或拖拽上传花卉图片
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                        支持 JPG/PNG，建议图片清晰
                    </p>
                </div>
            )}
        </div>
    );
}
