import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GoogleMap,
  useJsApiLoader,
  OverlayView,
  StandaloneSearchBox,
  InfoWindow,
  DrawingManager,
  Marker,
  HeatmapLayer,
} from "@react-google-maps/api";
import Papa from "papaparse";
import { useSearchParams } from "react-router-dom";
import {
  Satellite,
  Layers,
  Flame,
  TreePine,
  Users,
  MapPin,
  View,
  Axe,
  TriangleAlert,
  Play,
  LandPlot,
  Mountain,
  Sprout,
  CloudRain,
  Droplet,
  Globe,
  Brain,
  BarChart3,
  ShieldAlert,
  TreeDeciduous,
  Info,
  Trash,
  RotateCcw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import NGODashboard from "./NGODashboard";
import BiomeLegend from "./BiomeLegend";
import FileUpload from "./FileUpload";
import { API_ENDPOINTS } from "./endpoints";
import {
  BiomeLegendItem,
  DataPoint,
  LatLng,
  MapViewProps,
  MapViewRef,
  RegionAnalysis,
  Report,
} from "./DataTypes";

const containerStyle = { width: "100%", height: "100%" };
const center = { lat: 38.0, lng: -119.5 };
const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = [
  "places",
  "drawing",
  "geometry",
  "visualization",
];

const getPixelPositionOffset = (width: number, height: number) => ({
  x: -(width / 2),
  y: -(height / 2),
});

const MapView = forwardRef<MapViewRef, MapViewProps>((props, ref) => {
  const [year, setYear] = useState(2023);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFires, setShowFires] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [fireData, setFireData] = useState<
    { id: string; lat: number; lng: number }[]
  >([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [isTilted, setIsTilted] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [pendingReportCoords, setPendingReportCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [reportDescription, setReportDescription] = useState("");
  const [reportType, setReportType] = useState<
    "logging" | "wildfire" | "land_clearing"
  >("logging");
  const [hoveredReport, setHoveredReport] = useState<Report | null>(null);
  const [showDeforestation, setShowDeforestation] = useState(false);
  const [showReforestation, setShowReforestation] = useState(false);
  const [showWater, setShowWater] = useState(false);
  const [showClimate, setShowClimate] = useState(false);
  const [showSoil, setShowSoil] = useState(false);
  const [showEcosystems, setShowEcosystems] = useState(false);
  const [showBiomass, setShowBiomass] = useState(false);
  const [showCarbon, setShowCarbon] = useState(false);
  const [isPlayingTimelapse, setIsPlayingTimelapse] = useState(false);
  const [showNGODashboard, setShowNGODashboard] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showDrawingManager, setShowDrawingManager] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState<google.maps.Polygon[]>(
    []
  );
  const [regionAnalyses, setRegionAnalyses] = useState<RegionAnalysis[]>([]);
  const [aiOverlays, setAiOverlays] = useState<google.maps.Circle[]>([]);
  const [biomeLegend, setBiomeLegend] = useState<BiomeLegendItem[]>([]);
  const [uploadedDataLayers, setUploadedDataLayers] = useState<
    google.maps.Data[]
  >([]);
  const [alertCount, setAlertCount] = useState(0);
  const [alertsDialogOpen, setAlertsDialogOpen] = useState(false);
  const [alerts, setAlerts] = useState<
    Array<{ id: string; message: string; timestamp: Date }>
  >([]);
  const [alertMarkers, setAlertMarkers] = useState<google.maps.Marker[]>([]);
  const mapRef = useRef<google.maps.Map | null>(null);
  const geeOverlayRef = useRef<google.maps.ImageMapType | null>(null);
  const [csvData, setCsvData] = useState<DataPoint[]>([]);
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;

    // Check for uploaded data from analytics
    const analyticsData = localStorage.getItem("analyticsUploadedData");
    const fileName = localStorage.getItem("analyticsDataFileName");

    if (analyticsData && fileName) {
      // Process the uploaded data and add to map
      try {
        const lines = analyticsData.split("\n");
        const headers = lines[0].split(",");
        const latIndex = headers.findIndex((h) =>
          h.toLowerCase().includes("lat")
        );
        const lngIndex = headers.findIndex(
          (h) =>
            h.toLowerCase().includes("lng") || h.toLowerCase().includes("lon")
        );

        if (latIndex !== -1 && lngIndex !== -1) {
          const features = lines
            .slice(1)
            .map((line) => {
              const values = line.split(",");
              const lat = parseFloat(values[latIndex]);
              const lng = parseFloat(values[lngIndex]);

              if (!isNaN(lat) && !isNaN(lng)) {
                return {
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: [lng, lat],
                  },
                  properties: headers.reduce((props, header, index) => {
                    props[header.trim()] = values[index]?.trim() || "";
                    return props;
                  }, {} as any),
                };
              }
              return null;
            })
            .filter(Boolean);

          const geoJsonData = {
            type: "FeatureCollection",
            features,
          };

          const dataLayer = new google.maps.Data();
          dataLayer.addGeoJson(geoJsonData);
          dataLayer.setMap(map);

          // Style the data layer based on forest coverage
          dataLayer.setStyle((feature) => {
            const coverage = parseFloat(
              String(feature.getProperty("forest_coverage_percent") || "0")
            );
            const opacity = Math.max(0.3, coverage / 100);

            return {
              fillColor:
                coverage > 80
                  ? "#10B981"
                  : coverage > 60
                  ? "#F59E0B"
                  : "#EF4444",
              fillOpacity: opacity,
              strokeColor: "#000000",
              strokeWeight: 1,
            };
          });

          setUploadedDataLayers((prev) => [...prev, dataLayer]);

          localStorage.removeItem("analyticsUploadedData");
          localStorage.removeItem("analyticsDataFileName");

          setTimeout(() => {
            toast({
              title: "Analytics data loaded",
              description: `${fileName} has been added to the map with forest coverage styling`,
            });
          }, 1000);
        }
      } catch (error) {
        console.error("Error processing analytics data:", error);
      }
    }
  }, []);
  const { toast } = useToast();

  // --- API & ENDPOINT SETUP ---
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: libraries,
  });

  // ===================================== STATS CALCULATION ==========================================
  const stats = useMemo(() => {
    if (regionAnalyses.length === 0) return null;

    const forestLoss = regionAnalyses.reduce(
      (sum, r) => sum + (r.analysis?.forest_loss_pixels ?? 0) * 0.09,
      0
    );

    const carbonEmissions = regionAnalyses.reduce(
      (sum, r) => sum + (r.analysis?.biomass_mean_MgC_ha ?? 0) * 3.67,
      0
    );

    const communityReports = regionAnalyses.length * 2; // Mocked value for now
    const restorationProgress = "78%"; // Mocked value for now
    const alertsGenerated = 10 + regionAnalyses.length;
    const activeCampaigns = 3 + Math.floor(regionAnalyses.length / 2);

    return {
      forestLoss: `${Math.round(forestLoss).toLocaleString()} hectares`,
      carbonEmissions: `${Math.round(
        carbonEmissions
      ).toLocaleString()} tons CO2`,
      communityReports,
      restorationProgress,
      alertsGenerated,
      activeCampaigns,
    };
  }, [regionAnalyses]);
  // ==================================================================================================

  // --- SEARCH BOX HANDLING ---
  const onSearchBoxLoad = useCallback((ref: google.maps.places.SearchBox) => {
    searchBoxRef.current = ref;
  }, []);

  const onPlacesChanged = useCallback(() => {
    if (!searchBoxRef.current) return;

    const places = searchBoxRef.current.getPlaces();
    if (!places || places.length === 0) return;

    const place = places[0];
    if (!place.geometry || !place.geometry.location) return;

    // Pan to the place location
    mapRef.current?.panTo(place.geometry.location);

    // If the place has a viewport, fit the map to it
    if (place.geometry.viewport) {
      mapRef.current?.fitBounds(place.geometry.viewport);
    }
  }, []);

  // =====================================  DATA FETCHING =============================================

  const fetchInsights = async (regions: RegionAnalysis[]) => {
    const res = await fetch("http://localhost:3000/generate-insights", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ regions }),
    });

    const insights = await res.json();
    return insights;
  };

  const getInsights = async () => {
    const insights = await fetchInsights(regionAnalyses);

    const newOverlays: google.maps.Circle[] = [];

    insights.forEach((region) => {
      region.restoration_zones.forEach((zone) => {
        // Create beautiful restoration overlay with gradient and glow
        const marker = new google.maps.Marker({
          position: { lat: zone.lat, lng: zone.lng },
          map: mapRef.current,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: zone.radius_km * 2,
            fillColor: "#10B981",
            fillOpacity: 0.4,
            strokeColor: "#059669",
            strokeWeight: 2,
          },
        });

        // Add inner glow circle
        const innerCircle = new window.google.maps.Circle({
          map: mapRef.current,
          center: { lat: zone.lat, lng: zone.lng },
          radius: zone.radius_km * 500,
          fillColor: "#34D399",
          fillOpacity: 0.6,
          strokeColor: "#10B981",
          strokeWeight: 0,
        });

        // Add outer restoration boundary
        const outerCircle = new window.google.maps.Circle({
          map: mapRef.current,
          center: { lat: zone.lat, lng: zone.lng },
          radius: zone.radius_km * 1000,
          fillColor: "transparent",
          fillOpacity: 0,
          strokeColor: "#059669",
          strokeWeight: 2,
          strokeOpacity: 0.8,
        });

        newOverlays.push(innerCircle, outerCircle);
      });
    });

    setAiOverlays(newOverlays);
  };

  const fetchLayerDataForPolygon = async (coords: LatLng[]) => {
    try {
      const response = await fetch(API_ENDPOINTS.ANALYZE_REGION_API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          geometry: {
            type: "Polygon",
            coordinates: [coords.map(({ lng, lat }) => [lng, lat])],
          },
        }),
      });
      if (!response.ok) throw new Error("Failed to fetch analysis");
      return await response.json();
    } catch (error) {
      console.error("Error fetching layer data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch region analysis",
        variant: "destructive",
      });
      return {};
    }
  };
  // ==================================================================================================

  // ===================================== FOR DEMO PURPOSES ONLY =====================================
  const triggerDeforestationAlert = () => {
    setAlertsDialogOpen(true);

    // Generate mock alerts 4 seconds apart
    const alertMessages = [
      "🔥 High fire risk detected in Amazon sector 4-A. Immediate attention required!",
      "🌲 Illegal logging activity spotted in protected reserve. Coordinates: -3.4567, -62.1234",
    ];

    alertMessages.forEach((message, index) => {
      setTimeout(() => {
        const newAlert = {
          id: `alert-${Date.now()}-${index}`,
          message,
          timestamp: new Date(),
        };
        setAlerts((prev) => [...prev, newAlert]);
        setAlertCount((prev) => prev + 1);

        toast({
          title: "⚠️ New Alert Generated!",
          description: message,
          duration: 5000,
        });
      }, index * 4000);
    });
  };
  const demoBeforeAfter = async () => {
    // Before = burned
    setShowFires(true);
    setShowReforestation(false);
    toast({
      title: "🔥 Before: Burned forest",
      description: "This zone was completely lost.",
    });

    // After 3s, show restored
    setTimeout(() => {
      setShowFires(false);
      setShowReforestation(true);
      toast({
        title: "🌱 After: Restoration success!",
        description: "Forest regrowth detected!",
      });
    }, 3000);
  };

  const currentYearRef = useRef(2015);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const playTimelapse = () => {
    if (isPlayingTimelapse) return;
    if (!showDeforestation) setShowDeforestation(true);

    setIsPlayingTimelapse(true);
    currentYearRef.current = 2015;

    intervalRef.current = setInterval(() => {
      const nextYear = currentYearRef.current;
      setYear(nextYear);

      if (nextYear >= 2024) {
        clearInterval(intervalRef.current!);
        setIsPlayingTimelapse(false);
      } else {
        currentYearRef.current += 1;
      }
    }, 1000);
  };

  // ==================================================================================================

  // ===================================== ALERT FUNCTIONS ==========================================

  const addAlertMarker = useCallback(
    (
      lat: number,
      lng: number,
      title: string,
      type: "deforestation" | "fire"
    ) => {
      if (!mapRef.current) return;

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: mapRef.current,
        title: title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: type === "fire" ? "#EF4444" : "#F59E0B",
          fillOpacity: 0.8,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
        },
      });

      const pulseCircle = new google.maps.Circle({
        center: { lat, lng },
        radius: 1000,
        map: mapRef.current,
        fillColor: type === "fire" ? "#EF4444" : "#F59E0B",
        fillOpacity: 0.3,
        strokeColor: type === "fire" ? "#DC2626" : "#D97706",
        strokeWeight: 2,
        strokeOpacity: 0.8,
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
        <div class="p-2">
          <h3 class="font-bold text-sm">${
            type === "fire" ? "🔥 Fire Alert" : "🚨 Deforestation Alert"
          }</h3>
          <p class="text-xs text-gray-600">${title}</p>
          <p class="text-xs text-gray-500 mt-1">Click marker for details</p>
        </div>
      `,
      });

      marker.addListener("click", () => {
        infoWindow.open(mapRef.current, marker);
      });

      setAlertMarkers((prev) => [...prev, marker]);
    },
    []
  );

  const centerMapOnLocation = useCallback((lat: number, lng: number) => {
    if (!mapRef.current) return;

    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(15);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      addAlertMarker,
      centerMapOnLocation,
    }),
    [addAlertMarker, centerMapOnLocation]
  );

  // ==================================================================================================

  // ===================================== HELPER FUNCTIONS ===========================================

  // Function to load a tile overlay from an API
  async function loadTileOverlay(
    apiUrl: string,
    map: google.maps.Map,
    slotIndex: number,
    layerName: string,
    opacity = 0.6
  ) {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error(`Failed to fetch ${layerName} tiles`);

    const tileData = await response.json();
    const { mapid } = tileData;
    const urlFormat = `https://earthengine.googleapis.com/v1alpha/${mapid}/tiles/{z}/{x}/{y}`;

    const overlay = new google.maps.ImageMapType({
      getTileUrl: (coord, zoom) =>
        urlFormat
          .replace("{x}", coord.x.toString())
          .replace("{y}", coord.y.toString())
          .replace("{z}", zoom.toString()),
      tileSize: new google.maps.Size(256, 256),
      opacity,
      name: layerName,
    });

    map.overlayMapTypes.setAt(slotIndex, overlay);

    return tileData;
  }

  // Function to confirm report submission
  const confirmReport = () => {
    if (!pendingReportCoords || !reportDescription.trim()) {
      setReportDialogOpen(false);
      return;
    }

    const newReport: Report = {
      id: `report-${new Date().getTime()}`,
      lat: pendingReportCoords.lat,
      lng: pendingReportCoords.lng,
      description: reportDescription.trim(),
      type: reportType,
    };

    setReports((prevReports) => [...prevReports, newReport]);
    setShowReports(true);

    // Reset
    setPendingReportCoords(null);
    setReportDescription("");
    setReportType("logging");
    setReportDialogOpen(false);
  };

  // ==================================================================================================

  // ===================================== MAP LAYERS =================================================
  // Carbon Emissions Layer
  useEffect(() => {
    const geeMap = mapRef.current;
    if (!isLoaded || !geeMap) return;

    if (!showCarbon) {
      geeMap.overlayMapTypes.setAt(7, null);
      return;
    }

    loadTileOverlay(
      API_ENDPOINTS.CARBON_API_ENDPOINT,
      geeMap,
      7,
      "Carbon Emissions",
      0.6
    ).catch((err) => {
      console.error("Could not load carbon emissions layer", err);
      setError("Could not load carbon emissions layer.");
    });
  }, [showCarbon, isLoaded]);

  // Climate Rainfall Layer
  useEffect(() => {
    const geeMap = mapRef.current;
    if (!isLoaded || !geeMap) return;

    if (!showClimate) {
      geeMap.overlayMapTypes.setAt(2, null);
      return;
    }

    loadTileOverlay(
      API_ENDPOINTS.CLIMATE_API_ENDPOINT,
      geeMap,
      2,
      "Climate Rainfall",
      0.5
    ).catch((err) => {
      console.error(err);
      setError("Could not load climate layer");
    });
  }, [showClimate, isLoaded]);

  // Soil Organic Carbon Layer
  useEffect(() => {
    const geeMap = mapRef.current;
    if (!isLoaded || !geeMap) return;

    if (!showSoil) {
      geeMap.overlayMapTypes.setAt(3, null);
      return;
    }

    loadTileOverlay(
      API_ENDPOINTS.SOIL_API_ENDPOINT,
      geeMap,
      3,
      "Soil Carbon",
      0.5
    ).catch((err) => {
      console.error(err);
      setError("Could not load soil layer");
    });
  }, [showSoil, isLoaded]);

  // Protected Ecosystems Layer
  useEffect(() => {
    const geeMap = mapRef.current;
    if (!isLoaded || !geeMap) return;

    if (!showEcosystems) {
      geeMap.overlayMapTypes.setAt(4, null);
      setBiomeLegend([]);
      return;
    }

    loadTileOverlay(
      API_ENDPOINTS.ECOSYSTEM_API_ENDPOINT,
      geeMap,
      4,
      "Protected Areas",
      0.6
    )
      .then((data) => {
        if (data?.legend) {
          setBiomeLegend(data?.legend);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load ecosystem layer");
        setBiomeLegend([]);
      });
  }, [showEcosystems, isLoaded]);

  // Forest Biomass Layer
  useEffect(() => {
    const geeMap = mapRef.current;
    if (!isLoaded || !geeMap) return;

    if (!showBiomass) {
      geeMap.overlayMapTypes.setAt(5, null);
      return;
    }

    loadTileOverlay(
      API_ENDPOINTS.BIOMASS_API_ENDPOINT,
      geeMap,
      5,
      "Forest Biomass",
      0.6
    ).catch((err) => {
      console.error(err);
      setError("Could not load biomass layer");
    });
  }, [showBiomass, isLoaded]);

  // Surface Water Layer
  useEffect(() => {
    const geeMap = mapRef.current;
    if (!isLoaded || !geeMap) return;

    if (!showWater) {
      geeMap.overlayMapTypes.setAt(6, null); // slot 6 for water
      return;
    }

    loadTileOverlay(
      API_ENDPOINTS.WATER_API_ENDPOINT,
      geeMap,
      6,
      "Surface Water",
      0.5
    ).catch((err) => {
      console.error("Error updating Water overlay:", err);
      setError("Could not load Surface Water layer.");
    });
  }, [showWater, isLoaded]);

  // Deforestation Layer
  useEffect(() => {
    const geeMap = mapRef.current;
    if (!isLoaded || !geeMap) return;
    if (!showDeforestation) {
      if (geeOverlayRef.current) geeMap.overlayMapTypes.setAt(0, null);
      return;
    }
    const updateGeeOverlay = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(API_ENDPOINTS.GEE_API_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ year }),
        });
        if (!response.ok) throw new Error(`Failed to fetch GEE tiles`);
        const tileData = await response.json();
        const { mapid } = tileData;
        // Build Earth Engine v1alpha tile URL
        const urlFormat = `https://earthengine.googleapis.com/v1alpha/${mapid}/tiles/{z}/{x}/{y}`;

        const newOverlay = new google.maps.ImageMapType({
          getTileUrl: (coord, zoom) =>
            urlFormat
              .replace("{x}", coord.x.toString())
              .replace("{y}", coord.y.toString())
              .replace("{z}", zoom.toString()),
          tileSize: new google.maps.Size(256, 256),
          opacity: 0.7,
          name: "Deforestation Layer",
        });

        geeMap.overlayMapTypes.setAt(0, newOverlay);
        geeOverlayRef.current = newOverlay;
      } catch (error) {
        console.error("Error updating GEE overlay:", error);
      } finally {
        setIsLoading(false);
      }
    };
    updateGeeOverlay();
  }, [year, isLoaded, showDeforestation, API_ENDPOINTS.GEE_API_ENDPOINT]);

  // Restoration Layer (recently lost forest = potential reforestation)
  useEffect(() => {
    const geeMap = mapRef.current;
    if (!isLoaded || !geeMap) return;

    if (!showReforestation) {
      geeMap.overlayMapTypes.setAt(1, null); // slot 1 for restoration
      return;
    }

    loadTileOverlay(
      API_ENDPOINTS.RESTORATION_API_ENDPOINT,
      geeMap,
      1,
      "Restoration Zones",
      0.6
    )
      .catch((err) => {
        console.error("Error updating Restoration overlay:", err);
        setError("Could not load restoration layer.");
      })
      .finally(() => {
        setIsLoading(false);
      });

    setIsLoading(true);
    setError(null);
  }, [showReforestation, isLoaded]);

  useEffect(() => {
    const csvUrl = searchParams.get("csv");
    if (!csvUrl) return;

    fetch(csvUrl)
      .then((res) => res.text())
      .then((text) => {
        Papa.parse<DataPoint>(text, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            setCsvData(result.data);
            console.log("CSV data loaded:", result.data);
          },
        });
      })
      .catch((err) => {
        console.error("Error loading CSV:", err);
      });
  }, [searchParams]);

  // ==================================================================================================

  // =====================================  Handler functions ==============================================
 
   // Function to handle file upload
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;

      try {
        let geoJsonData;

        if (file.name.endsWith(".csv")) {
          const lines = content.split("\n");
          const headers = lines[0].split(",");
          const latIndex = headers.findIndex((h) =>
            h.toLowerCase().includes("lat")
          );
          const lngIndex = headers.findIndex(
            (h) =>
              h.toLowerCase().includes("lng") || h.toLowerCase().includes("lon")
          );

          if (latIndex !== -1 && lngIndex !== -1) {
            const features = lines
              .slice(1)
              .map((line) => {
                const values = line.split(",");
                const lat = parseFloat(values[latIndex]);
                const lng = parseFloat(values[lngIndex]);

                if (!isNaN(lat) && !isNaN(lng)) {
                  return {
                    type: "Feature",
                    geometry: {
                      type: "Point",
                      coordinates: [lng, lat],
                    },
                    properties: headers.reduce((props, header, index) => {
                      props[header] = values[index];
                      return props;
                    }, {} as any),
                  };
                }
                return null;
              })
              .filter(Boolean);

            geoJsonData = {
              type: "FeatureCollection",
              features,
            };
          }
        } else {
          geoJsonData = JSON.parse(content);
        }

        if (geoJsonData && mapRef.current) {
          const dataLayer = new google.maps.Data();
          dataLayer.addGeoJson(geoJsonData);
          dataLayer.setMap(mapRef.current);

          dataLayer.setStyle({
            fillColor: "#FF0000",
            fillOpacity: 0.6,
            strokeColor: "#FF0000",
            strokeWeight: 2,
          });

          setUploadedDataLayers((prev) => [...prev, dataLayer]);

          toast({
            title: "Data visualized successfully",
            description: `${file.name} has been added to the map`,
          });
        }
      } catch (error) {
        toast({
          title: "Error processing file",
          description: "Please check the file format and try again",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(file);
  };
 

  // Function to handle toggling AND loading the fire data
  const handleToggleFires = async () => {
    const isTurningOn = !showFires;
    setShowFires(isTurningOn);
    setError(null);
    if (isTurningOn && fireData.length === 0) {
      setIsLoading(true);
      try {
        const response = await fetch(`/fire_archive_M-C61_641013.csv`);
        if (!response.ok) {
          throw new Error("Fire data file not found in /public folder.");
        }
        const csvText = await response.text();
        const lines = csvText.trim().split("\n");
        if (lines.length < 2) return;
        const headers = lines[0].split(",");
        const latIndex = headers.indexOf("latitude");
        const lonIndex = headers.indexOf("longitude");
        const data = lines
          .slice(1)
          .map((line, i) => {
            const values = line.split(",");
            return {
              id: `fire-${i}`,
              lat: parseFloat(values[latIndex]),
              lng: parseFloat(values[lonIndex]),
            };
          })
          .filter((p) => p.lat && p.lng);
        setFireData(data);
      } catch (err: any) {
        console.error("Error fetching local fire data:", err);
        setShowFires(false);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };
  // Handler for adding a new community report via map click
  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;

    // Save coords, then open dialog
    setPendingReportCoords({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    });
    setReportDescription("");
    setReportDialogOpen(true);
  }, []);

  const onPolygonComplete = useCallback(
    (polygon: google.maps.Polygon) => {
      setSelectedRegions((prev) => [...prev, polygon]);
      const bounds = new google.maps.LatLngBounds();
      polygon.getPath().forEach((coord) => bounds.extend(coord));
      const center = {
        lat: bounds.getCenter().lat(),
        lng: bounds.getCenter().lng(),
      };
      const coordinates = polygon
        .getPath()
        .getArray()
        .map((coord) => ({ lat: coord.lat(), lng: coord.lng() }));

      toast({
        title: "Region Selected",
        description: `Selected area: ${bounds
          .getNorthEast()
          .lat()
          .toFixed(4)}, ${bounds.getSouthWest().lng().toFixed(4)}`,
        duration: 3000,
      });

      fetchLayerDataForPolygon(coordinates).then((analysis) => {
        setRegionAnalyses((prev) => [
          ...prev,
          { id: Date.now().toString(), coordinates, analysis, center },
        ]);
      });
    },
    [toast]
  );

  // Clear all regions and analyses
  const handleRemoveRegions = () => {
    setRegionAnalyses([]);
    selectedRegions.forEach((polygon) => polygon.setMap(null));
    setSelectedRegions([]);
    toast({
      title: "Regions Cleared",
      description: "All selected regions have been removed",
      duration: 2000,
    });
  };

  // Reset all map data and overlays
  const handleResetMap = () => {
    // Clear all overlays and data layers
    if (mapRef.current) {
      mapRef.current.overlayMapTypes.clear();
    }

    // Clear uploaded data layers
    uploadedDataLayers.forEach((dataLayer) => {
      dataLayer.setMap(null);
    });

    // Clear selected regions
    selectedRegions.forEach((polygon) => {
      polygon.setMap(null);
    });

    // Reset all state variables
    setShowFires(false);
    setShowReports(false);
    setFireData([]);
    setReports([]);
    setShowDeforestation(false);
    setShowReforestation(false);
    setShowWater(false);
    setShowClimate(false);
    setShowSoil(false);
    setShowEcosystems(false);
    setShowBiomass(false);
    setShowCarbon(false);
    setSelectedRegions([]);
    setRegionAnalyses([]);
    setUploadedDataLayers([]);
    setBiomeLegend([]);
    setHoveredReport(null);
    setYear(2023);
    setAlertCount(0);
    setAlerts([]);

    // Close all dialogs
    setReportDialogOpen(false);
    setShowNGODashboard(false);
    setShowAIInsights(false);
    setShowDrawingManager(false);

    aiOverlays.forEach((overlay) => overlay.setMap(null));
    setAiOverlays([]);

    // Clear alert markers
    alertMarkers.forEach((marker) => marker.setMap(null));
    setAlertMarkers([]);

    // Reset map center and zoom
    if (mapRef.current) {
      mapRef.current.setCenter({ lat: 37.7749, lng: -122.4194 });
      mapRef.current.setZoom(8);
    }

    setCsvData([]);
    window.location.href = "/?view=map";

    toast({
      title: "Map Reset",
      description: "All data and overlays have been cleared",
      duration: 2000,
    });
  };

  // Close single info window by id
  const handleCloseInfoWindow = (id: string) => {
    setRegionAnalyses((prev) => prev.filter((item) => item.id !== id));
  };

  // =======================================================================================================

  if (!isLoaded)
    return <div className="text-center p-10">Loading Forest Sentinel...</div>;

  return (
    <div className="relative w-full h-screen">
      <GoogleMap
        mapContainerClassName="w-full h-full"
        mapContainerStyle={containerStyle}
        center={center}
        zoom={8}
        options={{
          mapId: import.meta.env.VITE_GOOGLE_MAPS_ID,
          disableDefaultUI: true,
          tilt: isTilted ? 60 : 0,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            position: google.maps.ControlPosition.TOP_CENTER,
            mapTypeIds: ["roadmap", "satellite", "hybrid", "terrain"],
          },
        }}
        onLoad={onLoad}
        onClick={handleMapClick}
      >
        {csvData.map((point) => (
          <Marker
            key={`hover-${point.id}`}
            position={{
              lat: parseFloat(point.latitude.toString()),
              lng: parseFloat(point.longitude.toString()),
            }}
            opacity={0} // hide marker visually
            onMouseOver={() => setHoveredMarkerId(point.id)}
            onMouseOut={() => setHoveredMarkerId(null)}
          >
            {hoveredMarkerId === point.id && (
              <InfoWindow
                position={{
                  lat: parseFloat(point.latitude.toString()),
                  lng: parseFloat(point.longitude.toString()),
                }}
                onCloseClick={() => setHoveredMarkerId(null)}
              >
                <div className="text-sm">
                  <strong>{point.region}</strong>
                  <br />
                  Forest: {point.forest_coverage_percent}%<br />
                  Deforestation: {point.deforestation_rate_percent}%<br />
                  CO₂: {point.co2_emissions_tons} tons
                  <br />
                  Restoration: {point.restoration_hectares} ha
                  <br />
                  Date: {point.date}
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}

        {csvData.length > 0 && (
          <HeatmapLayer
            data={csvData.map((point) => ({
              location: new google.maps.LatLng(point.latitude, point.longitude),
              weight: parseFloat(point.deforestation_rate_percent.toString()),
            }))}
            options={{
              radius: 20,
              opacity: 0.6,
              gradient: [
                "rgba(0, 255, 0, 0)",
                "rgba(0, 255, 0, 1)",
                "rgba(255, 255, 0, 1)",
                "rgba(255, 165, 0, 1)",
                "rgba(255, 0, 0, 1)",
              ],
            }}
          />
        )}

        {/* Fire Markers */}
        {showFires &&
          fireData.map((fire) => (
            <OverlayView
              key={fire.id}
              position={{ lat: fire.lat, lng: fire.lng }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              getPixelPositionOffset={() => getPixelPositionOffset(16, 16)}
            >
              <div
                className="w-10 h-10 bg-orange-400 border border-white rounded-full animate-pulse cursor-pointer flex items-center justify-center"
                title="Historical Fire"
              >
                <Flame className="w-8 h-8 text-white" />
              </div>
            </OverlayView>
          ))}

        {showReports &&
          reports.map((report) => {
            let iconElement;

            if (report.type === "logging") {
              iconElement = (
                <div className="w-10 h-10 bg-yellow-800 border border-white rounded-full animate-pulse cursor-pointer flex items-center justify-center">
                  <Axe className="w-8 h-8 text-white" />
                </div>
              );
            } else if (report.type === "wildfire") {
              iconElement = (
                <div className="w-10 h-10 bg-red-400 border border-white rounded-full animate-pulse cursor-pointer flex items-center justify-center">
                  <Flame className="w-8 h-8 text-white" />
                </div>
              );
            } else if (report.type === "land_clearing") {
              iconElement = (
                <div className="w-10 h-10 bg-yellow-400 border border-white rounded-full animate-pulse cursor-pointer flex items-center justify-center">
                  <TriangleAlert className="w-8 h-8 text-white" />
                </div>
              );
            }

            return (
              <OverlayView
                key={report.id}
                position={{ lat: report.lat, lng: report.lng }}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                getPixelPositionOffset={() => getPixelPositionOffset(24, 24)}
              >
                <div
                  onMouseEnter={() => setHoveredReport(report)}
                  onMouseLeave={() => setHoveredReport(null)}
                >
                  {iconElement}
                </div>
              </OverlayView>
            );
          })}

        {regionAnalyses.map(({ id, analysis, center }) => (
          <InfoWindow
            key={id}
            position={center}
            onCloseClick={() => handleCloseInfoWindow(id)}
          >
            <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-200 w-72 text-sm space-y-2">
              <div className="flex items-center space-x-2 font-semibold text-gray-800">
                <Info className="w-4 h-4 text-blue-500" />
                <span>Region Analysis</span>
              </div>

              <div className="flex items-center space-x-2">
                <TreeDeciduous className="w-4 h-4 text-green-600" />
                <p>
                  <strong>Biomass:</strong>{" "}
                  {analysis?.biomass_mean_MgC_ha?.toFixed(2)} MgC/ha
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-red-500" />
                <p>
                  <strong>Forest Loss:</strong>{" "}
                  {(analysis?.forest_loss_pixels! * 0.09).toFixed(0)} ha
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Droplet className="w-4 h-4 text-amber-700" />
                <p>
                  <strong>Soil Carbon:</strong>{" "}
                  {analysis?.soil_carbon_mean?.toFixed(2)}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <CloudRain className="w-4 h-4 text-blue-400" />
                <p>
                  <strong>Rainfall:</strong>{" "}
                  {analysis?.rainfall_mean_mm?.toFixed(2)} mm
                </p>
              </div>
            </div>
          </InfoWindow>
        ))}

        {hoveredReport && (
          <InfoWindow
            position={{ lat: hoveredReport.lat, lng: hoveredReport.lng }}
            onCloseClick={() => setHoveredReport(null)} // still closable
          >
            <div className="p-2 text-sm max-w-xs">
              <p className="font-bold">
                {hoveredReport.type === "logging" && "🌲 Illegal Logging"}
                {hoveredReport.type === "wildfire" && "🔥 Wildfire"}
                {hoveredReport.type === "land_clearing" && "🏗️ Land Clearing"}
              </p>
              <p className="mt-1">{hoveredReport.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                Lat: {hoveredReport.lat.toFixed(4)}, Lng:{" "}
                {hoveredReport.lng.toFixed(4)}
              </p>
            </div>
          </InfoWindow>
        )}

        {/* Drawing Manager for Region Selection */}
        {showDrawingManager && (
          <DrawingManager
            onPolygonComplete={onPolygonComplete}
            options={{
              drawingControl: true,
              drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [google.maps.drawing.OverlayType.POLYGON],
              },
              polygonOptions: {
                fillColor: "#2563eb",
                fillOpacity: 0.2,
                strokeColor: "#2563eb",
                strokeWeight: 2,
                clickable: true,
                editable: true,
                draggable: true,
              },
            }}
          />
        )}
      </GoogleMap>

      {/* --- UI OVERLAYS --- */}
      <div className="absolute top-5 right-4 z-10 space-y-2 p-3 rounded-xl bg-white/70 backdrop-blur-md shadow-md w-60 text-sm">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start px-3 bg-white/80 text-foreground border border-border"
          onClick={playTimelapse}
        >
          <Play className="w-4 h-4 mr-2" /> Forest Loss Time‑lapse
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start px-3 bg-white/80 text-foreground border border-border"
          onClick={getInsights}
          disabled={aiOverlays.length === 0 && regionAnalyses.length === 0}
        >
          <Brain className="w-4 h-4 mr-2 text-green-500" />
          AI Insights
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start px-3 bg-white/80 text-foreground border border-border"
          onClick={() => setShowNGODashboard(true)}
        >
          <BarChart3 className="w-4 h-4 mr-2 text-blue-500" />
          NGO Dashboard
        </Button>

        <FileUpload onFileUpload={handleFileUpload} />

        <Button
          variant={showDrawingManager ? "secondary" : "outline"}
          size="sm"
          className="w-full justify-start px-3 bg-white/80 text-foreground border border-border"
          onClick={() => setShowDrawingManager(!showDrawingManager)}
        >
          <MapPin className="w-4 h-4 mr-2 text-amber-500" />
          {showDrawingManager ? "Exit Selection" : "Select Regions"}
        </Button>

        {selectedRegions.length > 0 && (
          <Button
            onClick={handleRemoveRegions}
            className="w-full justify-start px-3 bg-white/80 text-foreground border border-border"
          >
            <Trash className="w-4 h-4 mr-2 text-black-500" />
            Clear Regions ({selectedRegions.length})
          </Button>
        )}

        <Button
          variant="outline"
          onClick={handleResetMap}
          className="w-full justify-start px-3 bg-white/80 text-foreground border border-border"
        >
          <RotateCcw className="w-4 h-4 mr-2 text-red-500" />
          Reset Map
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start px-3 bg-white/80 text-foreground border border-border"
          onClick={() => setIsTilted(!isTilted)}
        >
          <View className="w-4 h-4 mr-2 text-purple-500" /> Tilt Map
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start px-3 bg-white/80 text-foreground border border-border"
          onClick={() => setOpen(true)}
        >
          <ShieldAlert className="w-4 h-4 mr-2  text-red-500" /> Submit a Report
        </Button>
      </div>

      {/* Legend overlay */}
      {biomeLegend.length > 0 && (
        <div className="legend absolute w-60 right-4 h-40 z-10">
          <BiomeLegend legend={biomeLegend} />
        </div>
      )}

      <div className="absolute top-10 left-4 z-10 w-80 space-y-4">
        {/* --- Analysis Controls --- */}
        <Card className="bg-background/40 backdrop-blur-md shadow-lg rounded-xl p-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 font-semibold">
              <Satellite className="w-5 h-5 text-blue-500" />
              Search locations
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Search Box */}
            {isLoaded && (
              <div className="relative">
                <StandaloneSearchBox
                  onLoad={onSearchBoxLoad}
                  onPlacesChanged={onPlacesChanged}
                >
                  <input
                    type="text"
                    placeholder="Search locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md shadow-sm bg-white/90 border border-gray-300 placeholder:text-gray-500"
                    ref={searchInputRef}
                  />
                </StandaloneSearchBox>
              </div>
            )}

            {/* Year Slider */}
            <div>
              <label className="text-xs font-medium flex justify-between mb-1">
                <span>Analysis Year</span>
                <span className="font-bold text-blue-600">{year}</span>
              </label>
              <input
                type="range"
                min="2005"
                max="2024"
                step="1"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                disabled={isLoading || !showDeforestation}
                className="w-full h-2 bg-secondary rounded-lg cursor-pointer accent-blue-500 disabled:opacity-50"
              />
            </div>
          </CardContent>
        </Card>

        {/* --- Map Layers --- */}
        <Card className="bg-background/40 backdrop-blur-md shadow-lg rounded-xl p-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 font-semibold">
              <Layers className="w-5 h-5 text-green-500" />
              Map Layers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={showDeforestation ? "secondary" : "outline"}
                size="lg"
                className="flex flex-col items-center gap-1 py-3"
                onClick={() => setShowDeforestation(!showDeforestation)}
              >
                <Axe className="w-5 h-5 text-brown-600" />
                <span className="text-xs">Deforestation</span>
              </Button>

              <Button
                variant={showReforestation ? "secondary" : "outline"}
                size="lg"
                className="flex flex-col items-center gap-1 py-3"
                onClick={() => setShowReforestation(!showReforestation)}
              >
                <TreePine className="w-5 h-5 text-green-600" />
                <span className="text-xs">Restoration</span>
              </Button>

              <Button
                variant={showWater ? "secondary" : "outline"}
                size="lg"
                className="flex flex-col items-center gap-1 py-3"
                onClick={() => setShowWater(!showWater)}
              >
                <Droplet className="w-5 h-5 text-blue-500" />
                <span className="text-xs">Surface Water</span>
              </Button>

              <Button
                variant={showClimate ? "secondary" : "outline"}
                size="lg"
                className="flex flex-col items-center gap-1 py-3"
                onClick={() => setShowClimate(!showClimate)}
              >
                <CloudRain className="w-5 h-5 text-blue-400" />
                <span className="text-xs">Climate</span>
              </Button>

              <Button
                variant={showSoil ? "secondary" : "outline"}
                size="lg"
                className="flex flex-col items-center gap-1 py-3"
                onClick={() => setShowSoil(!showSoil)}
              >
                <LandPlot className="w-5 h-5 text-amber-700" />
                <span className="text-xs">Soil Carbon</span>
              </Button>

              <Button
                variant={showEcosystems ? "secondary" : "outline"}
                size="lg"
                className="flex flex-col items-center gap-1 py-3"
                onClick={() => setShowEcosystems(!showEcosystems)}
              >
                <Mountain className="w-5 h-5 text-green-500" />
                <span className="text-xs">Ecosystems</span>
              </Button>

              <Button
                variant={showBiomass ? "secondary" : "outline"}
                size="lg"
                className="flex flex-col items-center gap-1 py-3"
                onClick={() => setShowBiomass(!showBiomass)}
              >
                <Sprout className="w-5 h-5 text-green-700" />
                <span className="text-xs">Biomass</span>
              </Button>

              <Button
                variant={showFires ? "secondary" : "outline"}
                size="lg"
                className="flex flex-col items-center gap-1 py-3"
                onClick={handleToggleFires}
              >
                <Flame className="w-5 h-5 text-orange-600" />
                <span className="text-xs">Fires</span>
              </Button>

              <Button
                variant={showReports ? "secondary" : "outline"}
                size="lg"
                className="flex flex-col items-center gap-1 py-3"
                onClick={() => setShowReports(!showReports)}
              >
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-xs">Reports</span>
              </Button>

              <Button
                variant={showCarbon ? "secondary" : "outline"}
                size="lg"
                className="flex flex-col items-center gap-1 py-3"
                onClick={() => setShowCarbon(!showCarbon)}
              >
                <Globe className="w-5 h-5 text-gray-500" />
                <span className="text-xs">Carbon Emissions</span>
              </Button>
            </div>

            {/* Error Text */}
            {error && (
              <p className="text-xs text-red-500 pt-2 text-center">{error}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reporting Mode</DialogTitle>
            <DialogDescription>
              Click anywhere on the map to add a new report pin.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Community Report</DialogTitle>
            <DialogDescription>
              Mark the type of issue and provide a brief description.
            </DialogDescription>
          </DialogHeader>

          {/* --- Report Type Dropdown --- */}
          <label className="text-sm font-medium">Report Type</label>
          <select
            className="w-full p-2 border rounded mt-1 mb-3"
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
          >
            <option value="logging">Illegal Logging</option>
            <option value="wildfire">Wildfire</option>
            <option value="land_clearing">Land Clearing</option>
          </select>

          {/* Description Textarea */}
          <textarea
            className="w-full p-2 border rounded mt-2"
            placeholder="Describe your report..."
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReportDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmReport}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Insights Dialog */}
      <Dialog open={showAIInsights} onOpenChange={setShowAIInsights}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-500" />
              AI Forest Insights
            </DialogTitle>
            <DialogDescription>
              Machine learning analysis of current forest conditions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">🔍 Pattern Analysis</h3>
              <p className="text-sm text-muted-foreground">
                AI detected increased deforestation activity in the northern
                regions. Pattern suggests coordinated logging operations across
                3 separate zones.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">📊 Risk Assessment</h3>
              <p className="text-sm text-muted-foreground">
                High probability (87%) of continued forest loss in marked areas
                over next 30 days. Recommend immediate intervention and enhanced
                monitoring.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">
                🌱 Restoration Opportunities
              </h3>
              <p className="text-sm text-muted-foreground">
                Identified 12 optimal zones for reforestation based on soil
                quality, water access, and recovery potential. Success rate
                prediction: 94%.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAIInsights(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alerts Dialog */}
      <Dialog open={alertsDialogOpen} onOpenChange={setAlertsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TriangleAlert className="w-5 h-5 text-red-500" />
              Forest Alerts ({alertCount})
            </DialogTitle>
            <DialogDescription>
              Real-time monitoring alerts from AI detection systems
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {alerts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No alerts yet
              </p>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-muted/50 rounded-lg p-3 border-l-4 border-red-500"
                >
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {alert.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAlertsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NGO Dashboard or Fallback Dialog */}
      {stats ? (
        <NGODashboard
          isOpen={showNGODashboard}
          onClose={() => setShowNGODashboard(false)}
          stats={stats}
        />
      ) : (
        <Dialog open={showNGODashboard} onOpenChange={setShowNGODashboard}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>How to View Region Stats</DialogTitle>
              <DialogDescription>
                To analyze a region:
                <ol className="list-decimal ml-4 mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>
                    Click the <strong>Select Regions</strong> button.
                  </li>
                  <li>
                    Draw a polygon on the map by clicking and outlining your
                    desired area.
                  </li>
                  <li>Once complete, Insights and stats will be computed.</li>
                  <li>
                    Click the NGO Dashboard button again to view the report
                  </li>
                </ol>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
});

MapView.displayName = "MapView";

export default MapView;
