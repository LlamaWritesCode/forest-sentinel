
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import MapView, { MapViewRef } from '@/components/MapView';
import { Button } from '@/components/ui/button';
import { Map, Home } from 'lucide-react';

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentView, setCurrentView] = useState<'home' | 'map'>('home');
  const mapViewRef = useRef<MapViewRef | null>(null);

  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'map') {
      setCurrentView('map');
    } else {
      setCurrentView('home');
    }
  }, [searchParams]);

  const handleMapClick = () => {
    setCurrentView('map');
    setSearchParams({ view: 'map' });
  };

  const handleHomeClick = () => {
    setCurrentView('home');
    setSearchParams({});
  };

  if (currentView === 'map') {
    return (
      <div className="mapview relative h-screen w-screen">
        <Header 
          showHomeButton={true} 
          onHomeClick={handleHomeClick}
          onMapClick={handleMapClick}
          isMapActive={true}
          onAddAlertMarker={(lat, lng, title, type) => mapViewRef.current?.addAlertMarker(lat, lng, title, type)}
          onCenterMap={(lat, lng) => mapViewRef.current?.centerMapOnLocation(lat, lng)}
        />
        <MapView ref={mapViewRef} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onMapClick={handleMapClick} />
      <HeroSection />
      <FeaturesSection />
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-forest text-primary-foreground text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">Ready to Protect Our Forests?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of environmental guardians monitoring deforestation in real-time
          </p>
          <Button 
            variant="earth" 
            size="lg" 
            onClick={handleMapClick}
            className="shadow-glow"
          >
            <Map className="w-5 h-5 mr-2" />
            Launch Forest Monitor
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
