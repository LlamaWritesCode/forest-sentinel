import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Satellite, 
  MapPin, 
  Bell, 
  TreePine, 
  BarChart3, 
  Camera,
  Shield
} from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Satellite className="w-8 h-8" />,
      title: "Real-time Satellite Detection",
      description: "Analyzes satellite imagery to detect deforestation as it happens",
      highlight: "NASA FIRMS + Google Earth Engine",
      color: "text-blue-500"
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Community Reporting",
      description: "Local communities can report and verify deforestation with GPS-tagged photos",
      highlight: "Crowdsourced Verification",
      color: "text-green-500"
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: "Smart Alerts",
      description: "Subscribe to regions and get instant notifications when forest loss is detected",
      highlight: "Push + Email Notifications",
      color: "text-orange-500"
    },
    {
      icon: <TreePine className="w-8 h-8" />,
      title: "AI Restoration Mapping",
      description: "AI identifies optimal areas for reforestation with recommendations",
      highlight: "Suitability Analysis",
      color: "text-emerald-500"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "NGO Dashboard",
      description: "Export data and generate reports for advocacy and funding proposals",
      highlight: "PDF + CSV Export",
      color: "text-purple-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "  Area Monitoring",
      description: "Special focus on national parks and protected reserves with enhanced alerts",
      highlight: "Government Integration",
      color: "text-red-500"
    }
  ];

  return (
    <section className="py-20 bg-gradient-earth">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Core Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Complete Forest
            <span className="text-primary"> Monitoring</span> Ecosystem
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From satellite detection to community action - everything you need to protect our forests
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-forest transition-all duration-300 border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <div className={`${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <Badge variant="outline" className="w-fit text-xs">
                  {feature.highlight}
                </Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How It Works Timeline */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">
            How Forest Sentinel Works
          </h3>
          
          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex items-center gap-6 p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                1
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <Satellite className="w-5 h-5 text-blue-500" />
                  Satellite Monitoring
                </h4>
                <p className="text-muted-foreground">
                  Our AI continuously analyzes satellite imagery from NASA and ESA to detect vegetation changes in real-time
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-6 p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
              <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                2
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-green-500" />
                  Community Verification
                </h4>
                <p className="text-muted-foreground">
                  Local communities and NGOs verify alerts with ground-truth photos and reports
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-6 p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
              <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                3
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-500" />
                  Instant Alerts
                </h4>
                <p className="text-muted-foreground">
                  Stakeholders receive immediate notifications to respond quickly to threats
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-center gap-6 p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                4
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <TreePine className="w-5 h-5 text-emerald-500" />
                  Restoration Action
                </h4>
                <p className="text-muted-foreground">
                  Coordinate reforestation efforts using our suitability maps and species recommendations
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA 
        <div className="text-center mt-16">
          <Button variant="forest" size="lg" className="shadow-glow">
            <Globe className="w-5 h-5 mr-2" />
            Start Monitoring Your Forest
          </Button>
        </div>*/}
      </div>
    </section>
  );
};

export default FeaturesSection;