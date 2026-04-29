import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

function Home({ userLocation, locationError, mockParkingLots, setSelectedParkingLot, setActiveTab, resetBookingStatus }) {
  const [selectedLocation, setSelectedLocation] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false); // Track API load status
  const mapRef = useRef(null);

  const updatedMockParkingLots = [
    { id: 1, name: "Viviana Mall", available: 4, total: 4, airQuality: "Good", price: "150", coordinates: { lat: 19.2087, lng: 72.9716 } },
    { id: 2, name: "Korum Mall", available: 4, total: 4, airQuality: "Moderate", price: "120", coordinates: { lat: 19.2035, lng: 72.9652 } },
    { id: 3, name: "R Mall", available: 4, total: 4, airQuality: "Good", price: "100", coordinates: { lat: 19.2215, lng: 72.9785 } },
    { id: 4, name: "Lake City Mall", available: 4, total: 4, airQuality: "Good", price: "130", coordinates: { lat: 19.1887, lng: 72.9635 } },
  ];

  useEffect(() => {
    if (!userLocation) {
      console.log("userLocation is not available yet");
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => {
      console.log("Google Maps API loaded successfully");
      setMapLoaded(true); // Set flag when API is loaded
    };
    script.onerror = () => console.error("Error loading Google Maps script");
    document.head.appendChild(script);

    return () => {
      const scripts = document.getElementsByTagName("script");
      for (let script of scripts) {
        if (script.src.includes("maps.googleapis.com")) {
          document.head.removeChild(script);
          break;
        }
      }
    };
  }, []); // Run only once on mount

  useEffect(() => {
    if (!mapLoaded || !userLocation) return;

    console.log("Initializing map with userLocation:", userLocation);
    const mapInstance = new window.google.maps.Map(document.getElementById("parkingMap"), {
      center: userLocation,
      zoom: 13,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
      ],
    });
    mapRef.current = mapInstance;

    new window.google.maps.Marker({
      position: userLocation,
      map: mapInstance,
      icon: {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
          <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
            <text x="50%" y="50%" font-size="30" fill="#8B5CF6" text-anchor="middle" dominant-baseline="middle">🚗</text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(40, 40),
      },
      title: "Your Location",
    });

    updatedMockParkingLots.forEach((spot) => {
      const marker = new window.google.maps.Marker({
        position: spot.coordinates,
        map: mapInstance,
        icon: { url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png", scaledSize: new window.google.maps.Size(32, 32) },
        title: spot.name,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="color: black; padding: 8px;">
            <h3 style="font-weight: bold; margin-bottom: 4px;">${spot.name}</h3>
            <p style="margin: 0;">Available: ${spot.available}/${spot.total}</p>
            <p style="margin: 4px 0;">₹${spot.price}/hour</p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        resetBookingStatus();
        setSelectedParkingLot(spot);
        setActiveTab("slots");
      });
      marker.addListener("mouseover", () => infoWindow.open(mapInstance, marker));
      marker.addListener("mouseout", () => infoWindow.close());
    });
  }, [mapLoaded, userLocation, setSelectedParkingLot, setActiveTab, resetBookingStatus]);

  const handleLocationSearch = (input) => {
    setSelectedLocation(input);
    if (!input) {
      if (mapRef.current && userLocation) {
        mapRef.current.setCenter(userLocation);
        mapRef.current.setZoom(13);
      }
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    if (input.length > 2 && window.google && window.google.maps && window.google.maps.places) {
      const autocompleteService = new window.google.maps.places.AutocompleteService();
      autocompleteService.getPlacePredictions(
        { input, types: ["geocode"], radius: 500, location: new window.google.maps.LatLng(userLocation?.lat || 19.2183, userLocation?.lng || 72.9781), strictbounds: true },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setPredictions(predictions);
            setShowPredictions(true);
          } else {
            setPredictions([]);
            setShowPredictions(false);
          }
        }
      );
    } else {
      setPredictions([]);
      setShowPredictions(false);
    }
  };

  const handlePredictionSelect = (prediction) => {
    setSelectedLocation(prediction.description);
    setPredictions([]);
    setShowPredictions(false);
  };

  const handleSearchClick = () => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: selectedLocation }, (results, status) => {
      if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
        const location = results[0].geometry.location;
        const newCenter = { lat: location.lat(), lng: location.lng() };

        if (mapRef.current) {
          mapRef.current.setCenter(newCenter);
          mapRef.current.setZoom(15);

          new window.google.maps.Marker({
            position: newCenter,
            map: mapRef.current,
            icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: "#8B5CF6", fillOpacity: 1, strokeColor: "#FFFFFF", strokeWeight: 2 },
          });
        }
      } else {
        console.error("Geocode failed:", status);
      }
    });
  };

  const handleBookNow = (lot) => {
    resetBookingStatus();
    setSelectedParkingLot(lot);
    setActiveTab("slots");
  };

  return (
    <motion.div className="flex flex-col md:flex-row gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="w-full md:w-1/2">
        <motion.div
          className="bg-gradient-to-br from-[#1C1C1E] to-[#2C2C2E] rounded-3xl p-4 md:p-6 mb-6 shadow-lg border border-[#2D2D2D]"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-xl md:text-2xl font-bold mb-4 text-white tracking-tight">Find Your Parking Space</h1>
          <div className="h-[400px] bg-[#2C2C2E] rounded-2xl mb-6 relative shadow-inner">
            {locationError ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-2">
                  <i className="fas fa-location-slash text-[#FFD60A] text-4xl"></i>
                  <p className="text-gray-300 px-4">{locationError}</p>
                </div>
              </div>
            ) : !userLocation ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-2">
                  <i className="fas fa-spinner fa-spin text-[#FFD60A] text-4xl"></i>
                  <p className="text-gray-300">Getting your location...</p>
                </div>
              </div>
            ) : !mapLoaded ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-2">
                  <i className="fas fa-spinner fa-spin text-[#FFD60A] text-4xl"></i>
                  <p className="text-gray-300">Loading map...</p>
                </div>
              </div>
            ) : (
              <div id="parkingMap" className="w-full h-full rounded-2xl"></div>
            )}
          </div>
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search location"
              className="w-full p-3 md:p-4 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl text-white text-sm md:text-base placeholder-gray-500 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all shadow-sm"
              value={selectedLocation}
              onChange={(e) => handleLocationSearch(e.target.value)}
              name="location"
            />
            <motion.button
              onClick={handleSearchClick}
              className="ml-2 bg-gradient-to-r from-[#FFD60A] to-[#FF9900] text-black px-3 py-1.5 rounded-2xl text-sm md:text-base shadow-md"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              Search
            </motion.button>
            {showPredictions && (
              <motion.div
                className="absolute z-10 w-full mt-1 top-full bg-gradient-to-br from-[#1C1C1E] to-[#2C2C2E] border border-[#2C2C2E] rounded-2xl max-h-60 overflow-y-auto shadow-lg text-gray-200"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {predictions.length > 0 ? (
                  predictions.map((prediction) => (
                    <div
                      key={prediction.place_id}
                      className="p-3 hover:bg-[#2C2C2E] cursor-pointer"
                      onClick={() => handlePredictionSelect(prediction)}
                    >
                      {prediction.description}
                    </div>
                  ))
                ) : (
                  <div className="p-3">No suggestions found</div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
      <div className="w-full md:w-1/2">
        <motion.div
          className="bg-gradient-to-br from-[#1C1C1E] to-[#2C2C2E] rounded-3xl p-4 md:p-6 shadow-lg border border-[#2D2D2D]"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-white tracking-tight">Nearby Spots</h2>
          <div className="space-y-4">
            {updatedMockParkingLots.map((lot) => (
              <motion.div
                key={lot.id}
                className="bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E] hover:border-[#8B5CF6] transition-colors shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#FFD60A] to-[#FF9900] rounded-2xl flex items-center justify-center shadow-sm">
                      <i className="fas fa-parking text-black text-lg md:text-xl"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-base md:text-lg text-white">{lot.name}</h3>
                      <p className="text-gray-300 text-xs md:text-sm">{lot.available} spots available</p>
                    </div>
                  </div>
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2 md:gap-0">
                    <p className="text-[#FFD60A] font-bold text-base md:text-lg">₹{lot.price}</p>
                    <motion.button
                      onClick={() => handleBookNow(lot)}
                      className="bg-gradient-to-r from-[#8B5CF6] to-[#7B61FF] text-white px-3 md:px-4 py-1.5 md:py-2 rounded-2xl text-sm md:text-base shadow-md"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      Book Now
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Home;