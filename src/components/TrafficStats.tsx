
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface TrafficStatsProps {
  deviceId: string;
}

const TrafficStats: React.FC<TrafficStatsProps> = ({ deviceId }) => {
  // This would be fetched from an API in a real implementation
  const bandwidthData = [
    { time: '00:00', download: 12.5, upload: 3.2 },
    { time: '01:00', download: 10.7, upload: 2.8 },
    { time: '02:00', download: 8.2, upload: 2.1 },
    { time: '03:00', download: 6.8, upload: 1.7 },
    { time: '04:00', download: 5.4, upload: 1.4 },
    { time: '05:00', download: 7.6, upload: 2.0 },
    { time: '06:00', download: 15.1, upload: 3.9 },
    { time: '07:00', download: 22.9, upload: 5.7 },
    { time: '08:00', download: 32.7, upload: 8.1 },
    { time: '09:00', download: 42.5, upload: 10.5 },
    { time: '10:00', download: 38.3, upload: 9.7 },
    { time: '11:00', download: 35.4, upload: 9.1 },
  ];

  const packetData = [
    { name: 'Unicast', value: 128456 },
    { name: 'Multicast', value: 24680 },
    { name: 'Broadcast', value: 8765 },
    { name: 'Unknown', value: 1245 },
  ];

  const currentTraffic = {
    downloadSpeed: 35.4, // Mbps
    uploadSpeed: 9.1,    // Mbps
    packetLoss: 0.02,    // %
    latency: 12.3,       // ms
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Download</div>
            <div className="text-2xl font-bold text-pon-dark">{currentTraffic.downloadSpeed} Mbps</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Upload</div>
            <div className="text-2xl font-bold text-pon-dark">{currentTraffic.uploadSpeed} Mbps</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Packet Loss</div>
            <div className="text-2xl font-bold text-pon-dark">{currentTraffic.packetLoss}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Latency</div>
            <div className="text-2xl font-bold text-pon-dark">{currentTraffic.latency} ms</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Bandwidth Usage</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bandwidthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="download" 
                  name="Download (Mbps)" 
                  stroke="#1a9989" 
                  strokeWidth={2} 
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="upload" 
                  name="Upload (Mbps)" 
                  stroke="#1e5f74" 
                  strokeWidth={2}
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Packet Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={packetData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Packets" fill="#4ecdc4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficStats;
