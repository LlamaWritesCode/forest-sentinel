
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Globe, TreePine, Flame, Upload, Map } from 'lucide-react';
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  forestCoverage: number;
  deforestationRate: number;
  co2Emissions: number;
  restorationProgress: number;
  regionalData: Array<{region: string, deforestation: number, coverage: number}>;
  temporalData: Array<{month: string, coverage: number, loss: number}>;
}

const Analytics = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const processUploadedData = (csvText: string) => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    const data = lines.slice(1).map(line => {
      const values = line.split(',');
      return headers.reduce((obj, header, index) => {
        obj[header.trim()] = values[index]?.trim();
        return obj;
      }, {} as any);
    }).filter(row => row.latitude && row.longitude);

    // Calculate analytics from data
    const avgForestCoverage = data.reduce((sum, row) => sum + parseFloat(row.forest_coverage_percent || '0'), 0) / data.length;
    const avgDeforestationRate = data.reduce((sum, row) => sum + parseFloat(row.deforestation_rate_percent || '0'), 0) / data.length;
    const totalCO2 = data.reduce((sum, row) => sum + parseFloat(row.co2_emissions_tons || '0'), 0);
    const totalRestoration = data.reduce((sum, row) => sum + parseFloat(row.restoration_hectares || '0'), 0);

    // Regional analysis
    const regionGroups = data.reduce((groups, row) => {
      const region = row.region || 'Unknown';
      if (!groups[region]) groups[region] = [];
      groups[region].push(row);
      return groups;
    }, {} as any);

    const regionalData = Object.keys(regionGroups).map(region => ({
      region,
      deforestation: parseFloat(Math.abs(regionGroups[region].reduce((sum: number, row: any) => sum + parseFloat(row.deforestation_rate_percent || '0'), 0) / regionGroups[region].length).toFixed(1)),
      coverage: parseFloat((regionGroups[region].reduce((sum: number, row: any) => sum + parseFloat(row.forest_coverage_percent || '0'), 0) / regionGroups[region].length).toFixed(1))
    }));

    // Temporal analysis
    const monthGroups = data.reduce((groups, row) => {
      const month = new Date(row.date || '2024-01-01').toLocaleString('default', { month: 'short' });
      if (!groups[month]) groups[month] = [];
      groups[month].push(row);
      return groups;
    }, {} as any);

    const temporalData = Object.keys(monthGroups).map(month => ({
      month,
      coverage: parseFloat(
        (monthGroups[month].reduce((sum: number, row: any) => sum + parseFloat(row.forest_coverage_percent || '0'), 0) / monthGroups[month].length).toFixed(1)
      ),
      loss: parseFloat(
        (Math.abs(monthGroups[month].reduce((sum: number, row: any) => sum + parseFloat(row.deforestation_rate_percent || '0'), 0) / monthGroups[month].length)).toFixed(1)
      )
    }));

    return {
      forestCoverage: avgForestCoverage,
      deforestationRate: avgDeforestationRate,
      co2Emissions: totalCO2,
      restorationProgress: totalRestoration,
      regionalData,
      temporalData
    };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target?.result as string;
        const analytics = processUploadedData(csvText);
        setAnalyticsData(analytics);
        
        toast({
          title: "File uploaded successfully",
          description: `${file.name} is ready for visualization`,
        });
      };
      reader.readAsText(file);
    }
  };

  const addToMap = () => {
  if (!uploadedFile) return;

  const fileName = uploadedFile.name;
  const fileUrl = `/${fileName}`; 

  toast({
    title: "Data added to map",
    description: "The uploaded dataset has been added to the map visualization",
  });
  window.location.href = `/?view=map&csv=${encodeURIComponent(fileUrl)}`;
};


  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Forest Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive analysis of deforestation patterns and environmental data</p>
        </div>

        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Data Upload & Visualization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button onClick={handleUploadClick} variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload Dataset
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.geojson,.json,.shp"
                onChange={handleFileUpload}
                className="hidden"
              />
              {uploadedFile && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Uploaded: {uploadedFile.name}
                  </span>
                  <Button onClick={addToMap} size="sm" className="ml-2">
                    <Map className="w-4 h-4 mr-2" />
                    Add to Map
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-muted-foreground">
                Supported formats: CSV, GeoJSON, JSON, Shapefile
              </p>
              <Button variant="link" size="sm" onClick={() => window.open('/sample_analytics_data.csv', '_blank')}>
                Download Sample Dataset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TreePine className="w-4 h-4 text-green-500" />
                Forest Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {analyticsData ? `${analyticsData.forestCoverage.toFixed(1)}%` : '68.4%'}
              </div>
              <p className="text-xs text-muted-foreground">
                {analyticsData ? 'Uploaded data coverage' : 'Global forest coverage'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-500" />
                Deforestation Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {analyticsData ? `${analyticsData.deforestationRate.toFixed(1)}%` : '-2.3%'}
              </div>
              <p className="text-xs text-muted-foreground">
                {analyticsData ? 'Avg deforestation rate' : 'Annual change'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                CO2 Emissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {analyticsData ? `${(analyticsData.co2Emissions / 1000).toFixed(1)}K` : '1.2B'}
              </div>
              <p className="text-xs text-muted-foreground">
                {analyticsData ? 'tons from data' : 'tons annually'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                Restoration Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {analyticsData ? `${(analyticsData.restorationProgress / 1000).toFixed(1)}K` : '15.8M'}
              </div>
              <p className="text-xs text-muted-foreground">
                {analyticsData ? 'hectares from data' : 'hectares restored'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Regional Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {analyticsData?.regionalData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.regionalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="region" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="deforestation" fill="#ef4444" name="Deforestation %" />
                      <Bar dataKey="coverage" fill="#10b981" name="Forest Coverage %" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Upload data to see regional analysis</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Temporal Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {analyticsData?.temporalData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.temporalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="coverage" stroke="#10b981" name="Forest Coverage %" strokeWidth={2} />
                      <Line type="monotone" dataKey="loss" stroke="#ef4444" name="Forest Loss %" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Upload data to see temporal trends</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
