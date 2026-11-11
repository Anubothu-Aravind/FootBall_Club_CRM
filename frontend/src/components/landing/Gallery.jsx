import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { apiService, API_ENDPOINTS } from "../../services/api";

/**
 * Football Gallery Component
 *
 * Fetches gallery images from backend API with fallback to Unsplash images.
 * Features a responsive masonry grid layout with full-screen lightbox
 * slideshow and keyboard navigation.
 *
 * @component
 */

// Fallback football-themed Unsplash images
const FALLBACK_IMAGES = [
  { id: 1, url: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&q=80", alt: "Football stadium under lights", caption: "Under the Lights" },
  { id: 2, url: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80", alt: "Football match action shot", caption: "Match Day Action" },
  { id: 3, url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80", alt: "Football on the pitch", caption: "The Beautiful Game" },
  { id: 4, url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80", alt: "Football players training", caption: "Training Ground" },
  { id: 5, url: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&q=80", alt: "Football boots on grass", caption: "Ready to Play" },
  { id: 6, url: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80", alt: "Football in the net", caption: "Goal!" },
  { id: 7, url: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&q=80", alt: "Football fans celebrating", caption: "Fan Passion" },
  { id: 8, url: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80", alt: "Youth football practice", caption: "Youth Development" },
  { id: 9, url: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&q=80", alt: "Football stadium panoramic view", caption: "The Arena" },
  { id: 10, url: "https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=800&q=80", alt: "Football player dribbling", caption: "Skill & Flair" },
  { id: 11, url: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&q=80", alt: "Football goalkeeper diving save", caption: "The Save" },
  { id: 12, url: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&q=80", alt: "Green football pitch aerial view", caption: "The Pitch" },
  { id: 13, url: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&q=80", alt: "Football team huddle", caption: "Team Spirit" },
  { id: 14, url: "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=800&q=80", alt: "Football trophy celebration", caption: "Champions" },
  { id: 15, url: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800&q=80", alt: "Football player silhouette at sunset", caption: "Golden Hour" },
  { id: 16, url: "https://images.unsplash.com/photo-1600679472829-3044539ce8ed?w=800&q=80", alt: "Football academy kids training", caption: "Future Stars" },
  { id: 17, url: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800&q=80", alt: "Football corner kick action", caption: "Set Piece" },
  { id: 18, url: "https://images.unsplash.com/photo-1570498839593-e565b39455fc?w=800&q=80", alt: "Football pitch markings close up", caption: "Field of Dreams" },
];

export default function Gallery() {
  const [images, setImages] = useState(FALLBACK_IMAGES);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  // Fetch gallery images from backend
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const data = await apiService.get(API_ENDPOINTS.GALLERY, { limit: 50 });
        const galleryImages = data?.images || data?.gallery || [];
        if (galleryImages.length > 0) {
          setImages(galleryImages.map((img, i) => ({
            id: img._id || i + 1,
            url: img.imageUrl || img.url,
            alt: img.altText || img.title || img.alt || `Gallery image ${i + 1}`,
            caption: img.caption || img.title || "",
          })));
        }
      } catch {
        // Keep fallback images
      }
    };
    fetchGallery();
  }, []);

  const handlePrevious = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1,
    );
  };

  const handleNext = () => {
    setSelectedImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <section className="min-h-screen bg-linear-to-b from-orange-50/30 to-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative radials */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-200/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-orange-300/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* ==================== HEADER ==================== */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.span
            className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/20 text-red-600 py-2 px-5 rounded-full text-sm font-semibold tracking-wide mb-6 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Camera className="w-4 h-4" />
            Our Gallery
          </motion.span>

          <motion.h2
            className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Moments on the{" "}
            <span className="bg-gradient-to-r from-red-500 via-red-400 to-orange-400 bg-clip-text text-transparent">
              Pitch
            </span>
          </motion.h2>

          <motion.p
            className="text-lg text-gray-500 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            From the training ground to match day - relive the passion, grit,
            and glory of the beautiful game.
          </motion.p>
        </motion.div>

        {/* ==================== MASONRY GRID (3x3) ==================== */}
        <div className="columns-3 gap-2 sm:gap-3 lg:gap-4 space-y-2 sm:space-y-3 lg:space-y-4">
          {images.map((image, index) => (
            <GalleryItem
              key={image.id}
              image={image}
              index={index}
              onClick={() => setSelectedImageIndex(index)}
            />
          ))}
        </div>

        {/* ==================== LIGHTBOX ==================== */}
        <AnimatePresence>
          {selectedImageIndex !== null && (
            <Lightbox
              images={images}
              currentIndex={selectedImageIndex}
              onClose={() => setSelectedImageIndex(null)}
              onPrevious={handlePrevious}
              onNext={handleNext}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   GalleryItem - individual masonry tile
   ────────────────────────────────────────────── */
function GalleryItem({ image, index, onClick }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 50); // Faster stagger for masonry
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [index]);

  return (
    <div
      ref={ref}
      className={`break-inside-avoid mb-4 group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-700 ${
        isVisible
          ? "opacity-100 blur-0 scale-100 translate-y-0"
          : "opacity-0 blur-md scale-95 translate-y-4"
      }`}
      onClick={onClick}
    >
      {/* Skeleton Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-red-500 rounded-full animate-spin opacity-20" />
        </div>
      )}

      {/* Image */}
      <img
        src={image.url}
        alt={image.alt}
        className={`w-full h-auto object-cover transition-all duration-700 ease-out group-hover:scale-110 ${
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
        }`}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
      />

      {/* Dark gradient overlay (always visible at bottom) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Hover glass overlay with icon */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
        <div className="transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
          <Expand
            className="w-8 h-8 text-white drop-shadow-lg"
            strokeWidth={1.5}
          />
        </div>
      </div>

      {/* Caption at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
        <p className="text-white font-semibold text-sm sm:text-base drop-shadow-lg translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          {image.caption}
        </p>
      </div>

      {/* Accent border glow on hover */}
      <div className="absolute inset-0 border-2 border-red-500/0 group-hover:border-red-500/40 rounded-2xl transition-all duration-300" />
    </div>
  );
}

/* ──────────────────────────────────────────────
   Lightbox - fullscreen image viewer
   ────────────────────────────────────────────── */
function Lightbox({ images, currentIndex, onClose, onPrevious, onNext }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrevious();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onPrevious, onNext]);

  const current = images[currentIndex];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />

      {/* Container */}
      <motion.div
        className="relative max-w-6xl max-h-[90vh] w-full"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-10 sm:-top-12 right-0 text-white hover:text-red-400 transition-colors p-2 z-10"
          aria-label="Close lightbox"
        >
          <X className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>

        {/* Previous */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
          className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full p-2 sm:p-3 transition-all z-10"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
        </button>

        {/* Next */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full p-2 sm:p-3 transition-all z-10"
          aria-label="Next image"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
        </button>

        {/* Image */}
        <img
          src={current.url}
          alt={current.alt}
          className="max-w-full max-h-[90vh] w-full object-contain rounded-lg sm:rounded-2xl shadow-2xl"
          key={currentIndex}
        />

        {/* Caption & counter */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-6 rounded-b-lg sm:rounded-b-2xl">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-white font-semibold text-sm sm:text-lg">
                {current.caption}
              </p>
              <p className="text-white/60 text-xs sm:text-sm mt-0.5">
                {current.alt}
              </p>
            </div>
            <p className="text-white/70 text-xs sm:text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Keyboard hint */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-xs sm:text-sm hidden sm:block">
        Use arrow keys to navigate • ESC to close
      </div>
    </motion.div>
  );
}
