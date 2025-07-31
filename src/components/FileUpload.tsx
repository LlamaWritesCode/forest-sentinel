
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      if (file) {
        setUploadedFiles(prev => [...prev, file]);
        onFileUpload(file);
        toast({
          title: "File uploaded successfully",
          description: `${file.name} will be visualized on the map`,
        });
      }
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start px-3 bg-white/80 text-foreground border border-border"
        onClick={() => setIsOpen(true)}
      >
        <Upload className="w-4 h-4 mr-2 text-blue-500" />
        Upload Data
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-500" />
              Upload Data for Visualization
            </DialogTitle>
            <DialogDescription>
              Upload datasets to visualize on the map. Supported formats: CSV, GeoJSON, JSON, Shapefile
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Button onClick={handleUploadClick} className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Select Files
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.geojson,.json,.shp,.kml"
              onChange={handleFileUpload}
              className="hidden"
              multiple
            />

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Uploaded Files:</p>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FileUpload;
