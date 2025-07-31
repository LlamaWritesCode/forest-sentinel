import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Camera, Flame, TreePine, Satellite, Users } from 'lucide-react';

interface DeforestationAlert {
  id: string;
  lat: number;
  lng: number;
  severity: 'low' | 'medium' | 'high';
  type: 'fire' | 'logging' | 'clearing';
  date: string;
  area: number;
  verified: boolean;
}

interface CommunityReport {
  id: string;
  lat: number;
  lng: number;
  description: string;
  photo?: string;
  severity: 'low' | 'medium' | 'high';
  date: string;
  verified: boolean;
  votes: number;
}

const MapView = () => {
  const [activeLayer, setActiveLayer] = useState<'current' | 'historical' | 'fires' | 'reports'>('current');
  const [timeRange, setTimeRange] = useState(2024);
  const [showReportModal, setShowReportModal] = useState(false);

  // Mock data for demonstration
  const alerts: DeforestationAlert[] = [
    {
      id: '1',
      lat: -3.4653,
      lng: -62.2159,
      severity: 'high',
      type: 'fire',
      date: '2024-01-15',
      area: 12.5,
      verified: true
    },
    {
      id: '2',
      lat: -8.7832,
      lng: -63.0235,
      severity: 'medium',
      type: 'logging',
      date: '2024-01-14',
      area: 8.2,
      verified: false
    }
  ];

  const reports: CommunityReport[] = [
    {
      id: '1',
      lat: -3.4653,
      lng: -62.2159,
      description: 'Large burning area spotted near village',
      severity: 'high',
      date: '2024-01-15',
      verified: true,
      votes: 12
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'fire': return <Flame className="w-4 h-4" />;
      case 'logging': return <TreePine className="w-4 h-4" />;
      default: return <Satellite className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative w-full h-screen bg-gradient-earth">
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <Card className="bg-background/80 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Satellite className="w-4 h-4 text-primary" />
              Layer Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={activeLayer === 'current' ? 'forest' : 'outline'}
                size="sm"
                onClick={() => setActiveLayer('current')}
              >
                Current Loss
              </Button>
              <Button
                variant={activeLayer === 'historical' ? 'forest' : 'outline'}
                size="sm"
                onClick={() => setActiveLayer('historical')}
              >
                Historical
              </Button>
              <Button
                variant={activeLayer === 'fires' ? 'alert' : 'outline'}
                size="sm"
                onClick={() => setActiveLayer('fires')}
              >
                <Flame className="w-3 h-3 mr-1" />
                Fires
              </Button>
              <Button
                variant={activeLayer === 'reports' ? 'earth' : 'outline'}
                size="sm"
                onClick={() => setActiveLayer('reports')}
              >
                <Users className="w-3 h-3 mr-1" />
                Reports
              </Button>
            </div>
            
            {/* Time Range Slider */}
            <div className="pt-2">
              <label className="text-xs text-muted-foreground mb-1 block">
                Time Range: {timeRange}
              </label>
              <input
                type="range"
                min="2019"
                max="2024"
                value={timeRange}
                onChange={(e) => setTimeRange(parseInt(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mock Map Area */}
      <div className="w-full h-full bg-green-100 relative overflow-hidden">
        {/* Background pattern to simulate satellite imagery */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-green-200 via-green-300 to-green-400"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        {/* Alert Markers */}
        {(activeLayer === 'current' || activeLayer === 'fires') && alerts.map((alert) => (
          <div
            key={alert.id}
            className={`absolute w-6 h-6 rounded-full ${getSeverityColor(alert.severity)} animate-pulse-forest cursor-pointer transform -translate-x-1/2 -translate-y-1/2`}
            style={{
              left: `${(alert.lng + 180) / 360 * 100}%`,
              top: `${(90 - alert.lat) / 180 * 100}%`
            }}
            title={`${alert.type} alert - ${alert.area} hectares`}
          >
            <div className="w-full h-full rounded-full flex items-center justify-center text-white text-xs">
              {getTypeIcon(alert.type)}
            </div>
          </div>
        ))}

        {/* Community Report Markers */}
        {activeLayer === 'reports' && reports.map((report) => (
          <div
            key={report.id}
            className="absolute w-8 h-8 bg-blue-500 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 border-2 border-white shadow-lg"
            style={{
              left: `${(report.lng + 180) / 360 * 100}%`,
              top: `${(90 - report.lat) / 180 * 100}%`
            }}
            title={report.description}
          >
            <div className="w-full h-full rounded-full flex items-center justify-center text-white">
              <Camera className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Alert Panel */}
      <div className="absolute top-4 right-4 z-10 w-80">
        <Card className="bg-background/80 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Flame className="w-4 h-4 text-destructive" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-60 overflow-y-auto">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-2 bg-card rounded-lg border border-border/50">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                    {alert.severity}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{alert.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {getTypeIcon(alert.type)}
                  <span>{alert.area} hectares lost</span>
                </div>
                {alert.verified && (
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">Verified</span>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Report Button */}
      <div className="absolute bottom-6 right-6 z-10">
        <Button
          variant="forest"
          size="lg"
          onClick={() => setShowReportModal(true)}
          className="shadow-forest animate-float"
        >
          <MapPin className="w-5 h-5 mr-2" />
          Report Deforestation
        </Button>
      </div>

      {/* Stats Overlay */}
      <div className="absolute bottom-6 left-6 z-10">
        <Card className="bg-background/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-destructive">245</div>
                <div className="text-xs text-muted-foreground">Hectares Lost</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">89</div>
                <div className="text-xs text-muted-foreground">Active Alerts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">156</div>
                <div className="text-xs text-muted-foreground">Community Reports</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MapView;