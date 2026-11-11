import { useState, useRef } from "react";
import { apiService, API_ENDPOINTS } from "../../services/api";

/**
 * ImageUploader Component (Reusable)
 * Upload images to Cloudinary with automatic compression (< 9MB).
 * Converts files to base64 client-side and sends via JSON POST.
 *
 * Props:
 *   onUploadComplete(urlOrUrls) - URL string (single) or array (multiple)
 *   multiple - allow selecting multiple files
 *   folder - Cloudinary folder (e.g., "gallery", "hero", "jerseys")
 *   className - wrapper CSS class
 *   label - custom button label
 *   compact - smaller variant
 */
const ImageUploader = ({
  onUploadComplete,
  multiple = false,
  folder = "general",
  className = "",
  label,
  compact = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const inputId = useRef(`img-up-${Math.random().toString(36).slice(2, 9)}`).current;

  // Compress image to ensure it's under 9MB
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const MAX_SIZE = 9 * 1024 * 1024;
      if (file.size <= MAX_SIZE) { resolve(file); return; }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const scaleFactor = Math.sqrt(MAX_SIZE / file.size) * 0.9;
          canvas.width = Math.floor(img.width * scaleFactor);
          canvas.height = Math.floor(img.height * scaleFactor);
          canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);

          let quality = 0.9;
          const tryCompress = () => {
            canvas.toBlob((blob) => {
              if (!blob) { reject(new Error("Compression failed")); return; }
              if (blob.size <= MAX_SIZE || quality <= 0.5) {
                resolve(new File([blob], file.name, { type: file.type, lastModified: Date.now() }));
              } else { quality -= 0.1; tryCompress(); }
            }, file.type, quality);
          };
          tryCompress();
        };
        img.onerror = () => reject(new Error("Failed to load image"));
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
    });
  };

  // Convert file to base64 data URI
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.readAsDataURL(file);
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(new Error("Failed to convert to base64"));
    });

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setError("");
    setProgress(0);

    try {
      // Compress
      const compressed = await Promise.all(
        files.map(async (f) => { try { return await compressImage(f); } catch { return f; } })
      );
      setProgress(30);

      if (multiple && compressed.length > 1) {
        // Bulk upload
        const base64Images = await Promise.all(compressed.map((f) => fileToBase64(f)));
        setProgress(60);
        const response = await apiService.post(API_ENDPOINTS.UPLOAD_IMAGES, {
          images: base64Images.map((img) => ({ image: img, folder })),
        });
        setProgress(100);
        onUploadComplete?.(response.results?.map((r) => r.url) || response.urls || []);
      } else {
        // Single upload
        const base64 = await fileToBase64(compressed[0]);
        setProgress(60);
        const response = await apiService.post(API_ENDPOINTS.UPLOAD_IMAGE, {
          image: base64,
          folder,
        });
        setProgress(100);
        onUploadComplete?.(response.url || response.imageUrl || "");
      }

      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err.message || "Upload failed");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const buttonLabel = label || `Upload Image${multiple ? "s" : ""}`;

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
        id={inputId}
      />
      <label
        htmlFor={inputId}
        className={`inline-flex items-center gap-2 border-2 border-dashed rounded-lg font-medium transition-colors cursor-pointer ${
          compact ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm"
        } ${
          uploading
            ? "border-gray-300 bg-gray-50 text-gray-400 cursor-not-allowed"
            : "border-red-300 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-400"
        }`}
      >
        <svg className={compact ? "w-4 h-4" : "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        {uploading ? `Uploading... ${progress}%` : buttonLabel}
      </label>
      {uploading && progress > 0 && (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
          <div className="bg-red-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      )}
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      {!compact && <p className="text-xs text-gray-500 mt-1">Images auto-compressed to under 9MB</p>}
    </div>
  );
};

export default ImageUploader;
