export interface LatLng {
  lat: number;
  lng: number;
}

export interface BiomeLegendItem {
  id: number;
  name: string;
  color: string;
}

export interface RegionAnalysis {
  id: string;
  coordinates: LatLng[];
  analysis: {
    biomass_mean_MgC_ha?: number;
    forest_loss_pixels?: number;
    soil_carbon_mean?: number;
    rainfall_mean_mm?: number;
  };
  center: LatLng;
}


export type DataPoint = {
  id: string;
  latitude: number;
  longitude: number;
  forest_coverage_percent: number;
  deforestation_rate_percent: number;
  co2_emissions_tons: number;
  restoration_hectares: number;
  date: string;
  region: string;
};

export type ReportType = "logging" | "wildfire" | "land_clearing";

export interface Report {
  id: string;
  lat: number;
  lng: number;
  description: string;
  type: ReportType;
}

export interface MapViewRef {
  addAlertMarker: (
    lat: number,
    lng: number,
    title: string,
    type: "deforestation" | "fire"
  ) => void;
  centerMapOnLocation: (lat: number, lng: number) => void;
}

export interface MapViewProps {
  csvUrl: string;
}