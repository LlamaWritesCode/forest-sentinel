
import { Button } from '@/components/ui/button';
import { TreePine, Satellite, Bell, Settings, Menu, Home } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  showHomeButton?: boolean;
  onHomeClick?: () => void;
  onMapClick?: () => void;
  isMapActive?: boolean;
  onAddAlertMarker?: (lat: number, lng: number, title: string, type: 'deforestation' | 'fire') => void;
  onCenterMap?: (lat: number, lng: number) => void;
}

const Header = ({ showHomeButton = false, onHomeClick, onMapClick, isMapActive = false, onAddAlertMarker, onCenterMap }: HeaderProps) => {
  const [notifications, setNotifications] = useState(0); // Mock notification count starting at 0
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleMapClick = () => {
    if (onMapClick) {
      onMapClick();
    } else {
      navigate('/?view=map');
    }
  };

  const handleHomeClick = () => {
    if (onHomeClick) {
      onHomeClick();
    } else {
      navigate('/');
    }
  };

  const isOnSubPage = location.pathname !== '/';

  const handleGetAlerts = () => {
    setIsAlertDialogOpen(true);
    
    const alert1Location = { lat:  38.7414, lng: -120.3309, title: "Eldorado National Forest" }; 
    const alert2Location = { lat: 34.0335, lng: -116.9561, title: "San Bernardino National Forest" };
    
    setTimeout(() => {
      const showAlert1 = () => {
        if (onCenterMap) {
          onCenterMap(alert1Location.lat, alert1Location.lng);
        }
      };
      
      if (onAddAlertMarker) {
        onAddAlertMarker(alert1Location.lat, alert1Location.lng, alert1Location.title, 'deforestation');
      }
      
      toast({
        title: "🚨 Deforestation Alert",
        description: `High deforestation activity detected in ${alert1Location.title}. Immediate attention required.`,
        action: (
          <Button size="sm" onClick={showAlert1}>
            Show me
          </Button>
        ),
      });
      setNotifications(prev => prev + 1);
    }, 2000);
    
    setTimeout(() => {
      const showAlert2 = () => {
        if (onCenterMap) {
          onCenterMap(alert2Location.lat, alert2Location.lng);
        }
      };
      
      if (onAddAlertMarker) {
        onAddAlertMarker(alert2Location.lat, alert2Location.lng, alert2Location.title, 'fire');
      }
      
      toast({
        title: "⚠️ Forest Fire Alert", 
        description: `Multiple fire hotspots identified in ${alert2Location.title}. Monitoring situation closely.`,
        action: (
          <Button size="sm" onClick={showAlert2}>
            Show me
          </Button>
        ),
      });
      setNotifications(prev => prev + 1);
    }, 6000);
  };

  return (
    <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-forest rounded-lg flex items-center justify-center">
              <TreePine className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Forest Sentinel</h1>
              <p className="text-xs text-muted-foreground">See it. Map it. Save it.</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <Button 
              variant={isMapActive ? "forest" : "ghost"} 
              size="sm" 
              onClick={handleMapClick}
            >
              <Satellite className="w-4 h-4 mr-2" />
              Live Map
            </Button>
            <Button 
              variant={location.pathname === '/analytics' ? "forest" : "ghost"} 
              size="sm" 
              onClick={() => navigate('/analytics')}
            >
              Analytics
            </Button>
            <Button 
              variant={location.pathname === '/restoration' ? "forest" : "ghost"} 
              size="sm" 
              onClick={() => navigate('/restoration')}
            >
              Restoration
            </Button>
            <Button 
              variant={location.pathname === '/community' ? "forest" : "ghost"} 
              size="sm" 
              onClick={() => navigate('/community')}
            >
              Community
            </Button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {(showHomeButton || isOnSubPage) && (
              <Button variant="outline" size="sm" onClick={handleHomeClick}>
                <Home className="w-4 h-4" />
              </Button>
            )}
            <Button variant="outline" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              {notifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
                >
                  {notifications}
                </Badge>
              )}
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="forest" size="sm" onClick={handleGetAlerts}>
              Get Alerts
            </Button>
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Alert Setup Dialog */}
      <Dialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>🌲 Forest Alert System Activated</DialogTitle>
            <DialogDescription>
              You will now receive real-time notifications for deforestation events, forest fires, and environmental changes in your selected regions. 
              Watch the notification badge for incoming alerts!
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setIsAlertDialogOpen(false)}>
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
