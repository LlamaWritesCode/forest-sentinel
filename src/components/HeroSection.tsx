import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Play, MapPin, AlertTriangle, TreePine, Globe } from 'lucide-react';
import forestHero from '@/assets/forest-hero.jpg';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${forestHero})` }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-6xl mx-auto px-4">
        {/* Status Badge */}
        <Badge 
          variant="secondary" 
          className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          Live Satellite Monitoring Active
        </Badge>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="block">Forest</span>
          <span className="block bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
            Sentinel
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
          Real-time deforestation detection through satellite intelligence and community reporting
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button variant="forest" 
          size="lg" 
          className="shadow-glow"
          onClick={() => window.location.href = '/?view=map'}>
            <MapPin className="w-5 h-5 mr-2" />
            Explore Live Map
          </Button>
          <Button variant="outline" size="lg" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">
            <Play className="w-5 h-5 mr-2" />
            Watch Demo
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">1,247</div>
              <div className="text-sm text-white/70">Active Alerts</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6 text-center">
              <Globe className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">15,890</div>
              <div className="text-sm text-white/70">Hectares Monitored</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6 text-center">
              <TreePine className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">3,456</div>
              <div className="text-sm text-white/70">Trees Saved</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6 text-center">
              <MapPin className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">892</div>
              <div className="text-sm text-white/70">Community Reports</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;