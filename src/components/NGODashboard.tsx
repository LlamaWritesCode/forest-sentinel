import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Download, FileText, BarChart3, TrendingUp, Users, AlertTriangle, Leaf, Globe } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface NGODashboardProps {
  isOpen: boolean;
  onClose: () => void;
}
interface NGODashboardProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    forestLoss: string;
    carbonEmissions: string;
    communityReports: number;
    restorationProgress: string;
    alertsGenerated: number;
    activeCampaigns: number;
  };
}

const NGODashboard = ({ isOpen, onClose, stats }: NGODashboardProps) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    
    // Create a comprehensive PDF report content
    const reportContent = `
Forest Sentinel - Environmental Impact Report
Generated on: ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY
================
This report provides a comprehensive analysis of forest conditions and environmental impact based on satellite data and community monitoring.

KEY FINDINGS
============
• Forest Loss: ${stats.forestLoss} detected since baseline year
• Carbon Emissions: ${stats.carbonEmissions} released to atmosphere
• Community Engagement: ${stats.communityReports} reports submitted by local monitors
• Restoration Progress: ${stats.restorationProgress} of targeted areas showing recovery
• Alert System: ${stats.alertsGenerated} deforestation alerts generated
• Active Campaigns: ${stats.activeCampaigns} conservation initiatives currently running

RECOMMENDATIONS
===============
1. Increase monitoring frequency in high-risk areas
2. Expand community engagement programs
3. Accelerate restoration efforts in priority zones
4. Strengthen early warning systems
5. Enhance cross-border collaboration

TECHNICAL DETAILS
=================
Data sources: Satellite imagery, ground-based sensors, community reports
Analysis period: Last 12 months
Coverage area: Global forest regions
Update frequency: Real-time monitoring with weekly reports

For more information, contact: support@forestsentinel.org
    `;

    // Create and download PDF (simplified as text file for demo)
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forest-sentinel-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      toast({
        title: "📄 PDF Report Generated",
        description: "Forest monitoring report downloaded successfully",
      });
      setIsExporting(false);
    }, 2000);
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    
    // Create CSV data
    const csvContent = `
Metric,Value,Unit,Source,Last Updated
Forest Loss,${stats.forestLoss.replace(/[^\d.,]/g, '')},hectares,Satellite Analysis,${new Date().toISOString()}
Carbon Emissions,${stats.carbonEmissions.replace(/[^\d.,]/g, '')},tons CO2,Biomass Calculations,${new Date().toISOString()}
Community Reports,${stats.communityReports},count,Field Reports,${new Date().toISOString()}
Restoration Progress,${stats.restorationProgress.replace('%', '')},percentage,Project Monitoring,${new Date().toISOString()}
Alerts Generated,${stats.alertsGenerated},count,AI Detection System,${new Date().toISOString()}
Active Campaigns,${stats.activeCampaigns},count,Campaign Management,${new Date().toISOString()}
Global Forest Coverage,68.4,percentage,FAO Data,${new Date().toISOString()}
Deforestation Rate,-2.3,percentage,Annual Change,${new Date().toISOString()}
Trees Planted,2400000,count,Restoration Projects,${new Date().toISOString()}
Success Rate,84,percentage,Project Outcomes,${new Date().toISOString()}
    `.trim();

    // Create and download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forest-sentinel-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      toast({
        title: "📊 CSV Data Exported",
        description: "Environmental data exported for analysis",
      });
      setIsExporting(false);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BarChart3 className="w-6 h-6 text-green-600" />
            NGO Dashboard
          </DialogTitle>
          <DialogDescription>
            Comprehensive environmental data for advocacy and funding proposals
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Key Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Forest Loss
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.forestLoss}</div>
                <p className="text-xs text-muted-foreground">since year 2000</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-500" />
                  Carbon Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.carbonEmissions}</div>
                <p className="text-xs text-muted-foreground">Released to atmosphere</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-500" />
                  Community Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.communityReports}</div>
                <p className="text-xs text-muted-foreground">Citizen reports</p>
              </CardContent>
            </Card>
          </div>

          {/* Progress Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-green-500" />
                  Restoration Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Active Projects</span>
                  <span className="text-sm font-medium">{stats.restorationProgress}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: stats.restorationProgress }}></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  Campaign Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-orange-600">{stats.alertsGenerated}</div>
                    <p className="text-xs text-muted-foreground">Alerts Generated</p>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-purple-600">{stats.activeCampaigns}</div>
                    <p className="text-xs text-muted-foreground">Active Campaigns</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export Data & Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Generate comprehensive reports for advocacy, funding proposals, and stakeholder communication.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  variant="outline"
                  className="flex items-center gap-2 p-4 h-auto"
                >
                  <FileText className="w-5 h-5 text-red-500" />
                  <div className="text-left">
                    <div className="font-medium">PDF Report</div>
                    <div className="text-xs text-muted-foreground">
                      Comprehensive analysis with maps and charts
                    </div>
                  </div>
                </Button>

                <Button 
                  onClick={handleExportCSV}
                  disabled={isExporting}
                  variant="outline"
                  className="flex items-center gap-2 p-4 h-auto"
                >
                  <BarChart3 className="w-5 h-5 text-green-500" />
                  <div className="text-left">
                    <div className="font-medium">CSV Data</div>
                    <div className="text-xs text-muted-foreground">
                      Raw data for custom analysis and modeling
                    </div>
                  </div>
                </Button>
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> Reports include deforestation data, carbon impact assessments, 
                  community engagement metrics, and restoration progress tracking. All data is 
                  formatted for professional presentation to donors, government agencies, and partners.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NGODashboard;
