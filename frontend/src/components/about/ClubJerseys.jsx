/**
 * ClubJerseys Component
 * Premium editorial showcase of club jerseys
 * Fetches jersey data from backend API with hardcoded fallbacks
 * Backend-integrated with real-time like tracking
 */

import { useState, useEffect } from "react";
import { apiService, API_ENDPOINTS } from "../../services/api";

// Generate or retrieve session ID for anonymous users
const getSessionId = () => {
  let sessionId = localStorage.getItem("jerseyLikeSessionId");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem("jerseyLikeSessionId", sessionId);
  }
  return sessionId;
};

// Hardcoded fallbacks in case API is unavailable
const FALLBACK_FEATURED = {
  season: "2025-26",
  type: "HOME JERSEY",
  colorway: "Red & White",
  description: "Our iconic stripes representing passion and purity in every match.",
  imageUrl: "https://res.cloudinary.com/doakquevf/image/upload/v1770738961/Tshirt_d11d9g.jpg",
};

const FALLBACK_ARCHIVE = [
  { season: "2024-25", type: "Home", colorway: "Red & Black", imageUrl: "https://images.unsplash.com/photo-1590273225427-f2644a9f3f7d?w=400&auto=format&fit=crop" },
  { season: "2023-24", type: "Home", colorway: "Classic Red", imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&auto=format&fit=crop" },
  { season: "2022-23", type: "Home", colorway: "Red & White", imageUrl: "https://images.unsplash.com/photo-1614632537239-d3d191a2e1c5?w=400&auto=format&fit=crop" },
  { season: "2021-22", type: "Home", colorway: "Crimson", imageUrl: "https://images.unsplash.com/photo-1577212017184-80cc0da11082?w=400&auto=format&fit=crop" },
  { season: "2020-21", type: "Home", colorway: "Deep Red", imageUrl: "https://images.unsplash.com/photo-1582142306909-195724d3f2b5?w=400&auto=format&fit=crop" },
];

const ClubJerseys = ({ cmsData }) => {
  const [sessionId] = useState(getSessionId());

  // Section text
  const sectionTitle = cmsData?.jerseys_title?.value || "OUR JERSEYS";
  const sectionSubtitle = cmsData?.jerseys_subtitle?.value || "Each season evolves. Our legacy remains.";
  const jerseyQuote = cmsData?.jerseys_quote?.value || "Every jersey tells our story.";

  // Jersey data from API
  const [currentJersey, setCurrentJersey] = useState(FALLBACK_FEATURED);
  const [jerseyArchive, setJerseyArchive] = useState(FALLBACK_ARCHIVE);

  // Like state
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [archiveLikes, setArchiveLikes] = useState({});
  const [archiveLoading, setArchiveLoading] = useState({});

  // Fetch jersey data from API
  useEffect(() => {
    const fetchJerseys = async () => {
      try {
        const data = await apiService.get(API_ENDPOINTS.ABOUT_JERSEYS);
        if (data?.featured) setCurrentJersey(data.featured);
        if (data?.archive?.length > 0) setJerseyArchive(data.archive);
      } catch {
        // Keep fallback defaults
      }
    };
    fetchJerseys();
  }, []);

  // Fetch like states for all jerseys using stable jersey IDs
  useEffect(() => {
    const fetchLikeStates = async () => {
      try {
        // Use stable jersey `id` (UUID) so likes stay with the jersey regardless of featured status
        const featuredLikeId = currentJersey.id || currentJersey.season;
        const jerseyIds = [featuredLikeId, ...jerseyArchive.map((j) => j.id || j.season)];

        const response = await apiService.post(
          API_ENDPOINTS.JERSEY_LIKE_BULK_STATUS,
          { jerseyIds, sessionId }
        );

        if (response.success) {
          const currentData = response.results[featuredLikeId];
          setIsLiked(currentData?.isLiked || false);
          setLikeCount(currentData?.likeCount || 0);

          const archiveData = {};
          jerseyArchive.forEach((jersey) => {
            const likeId = jersey.id || jersey.season;
            const data = response.results[likeId];
            archiveData[likeId] = {
              isLiked: data?.isLiked || false,
              likeCount: data?.likeCount || 0,
            };
          });
          setArchiveLikes(archiveData);
        }
      } catch {
        setLikeCount(0);
        setIsLiked(false);
      }
    };
    fetchLikeStates();
  }, [sessionId, currentJersey.id, currentJersey.season, jerseyArchive]);

  // Handle like/unlike toggle for current jersey
  const handleLike = async () => {
    if (isLoading) return;
    setIsLoading(true);

    const previousLiked = isLiked;
    const previousCount = likeCount;
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      const featuredLikeId = currentJersey.id || currentJersey.season;
      const response = await apiService.post(API_ENDPOINTS.JERSEY_LIKE_TOGGLE, {
        jerseyId: featuredLikeId,
        jerseyDetails: { season: currentJersey.season, type: currentJersey.type, colorway: currentJersey.colorway },
        sessionId,
      });

      if (response.success) {
        setIsLiked(response.isLiked);
        setLikeCount(response.likeCount);
      } else {
        setIsLiked(previousLiked);
        setLikeCount(previousCount);
      }
    } catch {
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle like/unlike toggle for archive jerseys using stable jersey ID
  const toggleArchiveLike = async (jerseyId) => {
    if (archiveLoading[jerseyId]) return;
    const jersey = jerseyArchive.find((j) => (j.id || j.season) === jerseyId);
    if (!jersey) return;

    setArchiveLoading((prev) => ({ ...prev, [jerseyId]: true }));
    const previousState = archiveLikes[jerseyId];
    setArchiveLikes((prev) => ({
      ...prev,
      [jerseyId]: {
        isLiked: !prev[jerseyId]?.isLiked,
        likeCount: prev[jerseyId]?.isLiked ? (prev[jerseyId]?.likeCount || 0) - 1 : (prev[jerseyId]?.likeCount || 0) + 1,
      },
    }));

    try {
      const response = await apiService.post(API_ENDPOINTS.JERSEY_LIKE_TOGGLE, {
        jerseyId,
        jerseyDetails: { season: jersey.season, type: jersey.type, colorway: jersey.colorway },
        sessionId,
      });
      if (response.success) {
        setArchiveLikes((prev) => ({ ...prev, [jerseyId]: { isLiked: response.isLiked, likeCount: response.likeCount } }));
      } else {
        setArchiveLikes((prev) => ({ ...prev, [jerseyId]: previousState }));
      }
    } catch {
      setArchiveLikes((prev) => ({ ...prev, [jerseyId]: previousState }));
    } finally {
      setArchiveLoading((prev) => ({ ...prev, [jerseyId]: false }));
    }
  };

  return (
    <section className="w-full bg-stone-50 py-24 px-8 max-md:py-16 max-md:px-5">
      <div className="max-w-[1440px] mx-auto">
        {/* HEADER */}
        <div className="text-center mb-20 max-md:mb-14">
          <h2 className="text-5xl font-serif font-bold text-gray-900 mb-3 tracking-tight max-md:text-4xl max-[480px]:text-3xl">
            {sectionTitle}
          </h2>
          <p className="text-sm text-gray-500 uppercase tracking-widest mb-6 max-[480px]:text-xs">
            {sectionSubtitle}
          </p>
          <div className="w-24 h-px bg-gray-300 mx-auto"></div>
        </div>

        {/* FEATURED JERSEY PANEL */}
        <div className="mb-24 max-md:mb-16">
          <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden max-w-5xl mx-auto shadow-sm">
            {/* Jersey Archive Badge */}
            <div className="absolute top-6 right-6 z-10">
              <span className="inline-block bg-red-600 text-white font-semibold text-xs py-2 px-4 uppercase tracking-wider max-[480px]:text-[10px] max-[480px]:py-1.5 max-[480px]:px-3">
                JERSEY ARCHIVE
              </span>
            </div>

            <div className="grid grid-cols-2 max-md:grid-cols-1">
              {/* LEFT: Jersey Image */}
              <div className="relative h-[500px] max-md:h-96 max-[480px]:h-80 bg-stone-100">
                <img
                  src={currentJersey.imageUrl}
                  alt={`${currentJersey.season} ${currentJersey.type}`}
                  className="w-full h-full object-contain p-12 max-md:p-8"
                />
              </div>

              {/* RIGHT: Jersey Details */}
              <div className="p-12 flex flex-col justify-center max-md:p-8 max-md:text-center max-[480px]:p-6">
                <div className="mb-2">
                  <p className="text-6xl font-bold text-gray-900 tracking-tight max-md:text-5xl max-[480px]:text-4xl">
                    {currentJersey.season}
                  </p>
                </div>
                <h3 className="text-xl font-semibold uppercase tracking-wider text-gray-700 mb-2 max-[480px]:text-lg">
                  {currentJersey.type}
                </h3>
                <p className="text-base text-gray-600 mb-6 max-[480px]:text-sm">
                  {currentJersey.colorway}
                </p>
                <div className="w-16 h-px bg-red-600 mb-6 max-md:mx-auto"></div>
                {currentJersey.description && (
                  <p className="text-sm text-gray-600 leading-relaxed mb-8 max-[480px]:text-xs">
                    {currentJersey.description}
                  </p>
                )}

                {/* Like Feature */}
                <div className="flex items-center gap-4 max-md:flex-col max-md:items-center">
                  <button
                    onClick={handleLike}
                    disabled={isLoading}
                    className={`flex items-center gap-3 py-3.5 px-6 font-semibold text-sm uppercase tracking-wide rounded transition-all duration-300 max-[480px]:py-3 max-[480px]:px-5 max-[480px]:text-xs ${
                      isLiked
                        ? "bg-red-600 text-white hover:bg-red-700 scale-105"
                        : "bg-white text-gray-900 border-2 border-gray-300 hover:border-red-600 hover:text-red-600"
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    aria-label={isLiked ? "Unlike this jersey" : "Like this jersey"}
                  >
                    <svg
                      className={`w-5 h-5 transition-transform duration-300 ${isLiked ? "scale-110" : ""} ${isLoading ? "animate-pulse" : ""}`}
                      fill={isLiked ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {isLiked ? "Liked" : "Like This Jersey"}
                  </button>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-2xl font-bold text-gray-900 max-[480px]:text-xl">
                      {likeCount.toLocaleString()}
                    </span>
                    <span className="text-sm max-[480px]:text-xs">
                      {likeCount === 1 ? "like" : "likes"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ARCHIVE / TIMELINE STRIP */}
        {jerseyArchive.length > 0 && (
          <div className="mb-20 max-md:mb-14">
            <div className="text-center mb-12 max-md:mb-8">
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4 tracking-tight max-md:text-xl max-[480px]:text-lg">
                JERSEY ARCHIVE
              </h3>
              <div className="w-16 h-px bg-gray-300 mx-auto"></div>
            </div>

            <div className="grid grid-cols-5 gap-6 max-lg:grid-cols-3 max-md:grid-cols-2 max-[480px]:grid-cols-1">
              {jerseyArchive.map((jersey) => {
                const likeId = jersey.id || jersey.season;
                return (
                <div key={likeId} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className="relative aspect-[4/5] bg-stone-50 overflow-hidden">
                    <div className="absolute top-3 right-3 z-10">
                      <span className="inline-block bg-white/95 backdrop-blur-sm text-gray-800 text-[10px] font-semibold py-1.5 px-3 rounded-full shadow-sm max-[480px]:text-[9px] max-[480px]:py-1 max-[480px]:px-2">
                        {jersey.type || "Home"} Kit
                      </span>
                    </div>
                    <img
                      src={jersey.imageUrl}
                      alt={`Anantapur FC ${jersey.type} Jersey ${jersey.season}`}
                      className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 max-[480px]:p-3.5">
                    <h4 className="text-lg font-bold text-gray-900 mb-1 leading-tight max-[480px]:text-base">
                      Anantapur FC {jersey.type} Jersey
                    </h4>
                    <p className="text-sm text-gray-500 mb-4 max-[480px]:text-xs">
                      {jersey.type} • {jersey.colorway}
                    </p>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3 max-[480px]:text-[10px]">
                      {jersey.season}
                    </p>
                    <div className="flex justify-center mt-2">
                      <button
                        onClick={() => toggleArchiveLike(likeId)}
                        disabled={archiveLoading[likeId]}
                        className={`w-full py-2.5 flex items-center justify-center gap-2 rounded-full transition-all duration-300 border ${
                          archiveLikes[likeId]?.isLiked
                            ? "bg-red-600 border-red-600 text-white"
                            : "bg-white border-gray-200 text-gray-600 hover:border-red-600 hover:text-red-600"
                        } ${archiveLoading[likeId] ? "opacity-50 cursor-not-allowed" : ""}`}
                        aria-label={archiveLikes[likeId]?.isLiked ? "Unlike jersey" : "Like jersey"}
                      >
                        <svg
                          className={`w-5 h-5 transition-transform duration-300 ${archiveLikes[likeId]?.isLiked ? "scale-110" : ""} ${archiveLoading[likeId] ? "animate-pulse" : ""}`}
                          fill={archiveLikes[likeId]?.isLiked ? "currentColor" : "none"}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="text-xs font-semibold">
                          {archiveLikes[likeId]?.isLiked ? "Liked" : "Like Jersey"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          </div>
        )}

        {/* QUOTE BLOCK */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center max-md:p-8 max-[480px]:p-6">
            <p className="text-2xl font-serif text-gray-900 italic leading-relaxed mb-6 max-md:text-xl max-[480px]:text-lg">
              &ldquo;{jerseyQuote}&rdquo;
            </p>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider max-[480px]:text-xs">
              - Anantapur Football Club
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClubJerseys;
