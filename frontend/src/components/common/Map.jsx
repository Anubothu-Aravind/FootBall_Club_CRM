import { forwardRef, useEffect, useRef, useImperativeHandle } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const defaultStyle = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

export const Map = forwardRef(({ 
  center = [0, 0], 
  zoom = 13, 
  styles = defaultStyle,
  className = "",
  markers = [],
  ...props 
}, ref) => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  useImperativeHandle(ref, () => ({
    easeTo: (options) => {
      if (mapInstance.current) {
        mapInstance.current.easeTo(options);
      }
    },
    getMap: () => mapInstance.current,
  }));

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: styles.light,
      center: center,
      zoom: zoom,
      attributionControl: true,
    });

    mapInstance.current = map;

    // Add navigation controls
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    // Add markers if provided
    if (markers && markers.length > 0) {
      markers.forEach((marker) => {
        const el = document.createElement("div");
        el.className = "custom-marker";
        el.style.backgroundColor = marker.color || "#EF4444";
        el.style.width = "30px";
        el.style.height = "30px";
        el.style.borderRadius = "50%";
        el.style.border = "3px solid white";
        el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
        el.style.cursor = "pointer";

        const markerInstance = new maplibregl.Marker({ element: el })
          .setLngLat(marker.position)
          .addTo(map);

        if (marker.popup) {
          const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
            marker.popup
          );
          markerInstance.setPopup(popup);
        }

        markersRef.current.push(markerInstance);
      });
    }

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
    };
  }, [center, zoom, styles, markers]);

  return (
    <div
      ref={mapContainer}
      className={`w-full h-full ${className}`}
      {...props}
    />
  );
});

Map.displayName = "Map";
