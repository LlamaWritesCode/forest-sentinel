
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MessageCircle, Upload, AlertTriangle, Camera } from 'lucide-react';
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

const Community = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast({
        title: "Community report uploaded",
        description: `${file.name} will be processed and visualized on the map`,
      });
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Community Hub</h1>
          <p className="text-muted-foreground">Connect with environmental guardians worldwide</p>
        </div>

        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Community Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button onClick={handleUploadClick} variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload Report Data
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.geojson,.json,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
              />
              {uploadedFile && (
                <span className="text-sm text-muted-foreground">
                  Uploaded: {uploadedFile.name}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Share field reports, photos, or community monitoring data
            </p>
          </CardContent>
        </Card>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Active Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">8,247</div>
              <p className="text-xs text-muted-foreground">Global community</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Reports Submitted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">1,523</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Camera className="w-4 h-4 text-green-500" />
                Photo Evidence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">12.4K</div>
              <p className="text-xs text-muted-foreground">Images collected</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-purple-500" />
                Discussions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">892</div>
              <p className="text-xs text-muted-foreground">Active threads</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Illegal logging detected</p>
                    <p className="text-xs text-muted-foreground">Amazon Basin • 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Wildlife corridor blocked</p>
                    <p className="text-xs text-muted-foreground">Borneo • 4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Land clearing activity</p>
                    <p className="text-xs text-muted-foreground">Congo Basin • 1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Discussions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Best practices for field monitoring</p>
                    <p className="text-xs text-muted-foreground">24 replies • Active now</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Drone technology for forest surveys</p>
                    <p className="text-xs text-muted-foreground">18 replies • 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Community alert system improvements</p>
                    <p className="text-xs text-muted-foreground">31 replies • 1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Community;
