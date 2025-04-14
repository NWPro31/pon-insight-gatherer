
import React from 'react';
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DeviceDetailProps {
  deviceId: string;
}

const DeviceDetail: React.FC<DeviceDetailProps> = ({ deviceId }) => {
  // In a real implementation, this data would come from an API call
  const deviceData = {
    id: deviceId,
    name: `OLT-Device-${deviceId}`,
    model: 'GPON-4820',
    firmware: 'v2.5.6',
    uptime: '18 days, 7 hours',
    temperature: '42°C',
    location: 'Main Server Room',
    ipAddress: `192.168.1.${deviceId}`,
    ports: 16,
    activeLines: 12,
  };

  // OID examples for the device - in a real implementation these would be queried via SNMP
  const oidExamples = [
    { name: 'System Name', oid: '.1.3.6.1.4.1.34592.1.3.1.1.1', value: deviceData.name },
    { name: 'System Description', oid: '.1.3.6.1.4.1.34592.1.1.3', value: `${deviceData.model} GPON OLT` },
    { name: 'Line Status', oid: '.1.3.6.1.4.1.34592.1.3.3.1.6', value: 'Active' },
    { name: 'Signal Level', oid: '.1.3.6.1.4.1.17409.2.3.4.1.1.5', value: '-23.4 dBm' },
    { name: 'Line Length', oid: '.1.3.6.1.4.1.17409.2.3.4.1.1.9', value: '2.34 km' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Device Information</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm font-medium">Model:</div>
            <div className="text-sm">{deviceData.model}</div>
            
            <div className="text-sm font-medium">Firmware:</div>
            <div className="text-sm">{deviceData.firmware}</div>
            
            <div className="text-sm font-medium">Uptime:</div>
            <div className="text-sm">{deviceData.uptime}</div>
            
            <div className="text-sm font-medium">Temperature:</div>
            <div className="text-sm">{deviceData.temperature}</div>
            
            <div className="text-sm font-medium">IP Address:</div>
            <div className="text-sm">{deviceData.ipAddress}</div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Status Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-pon-light">
              <div className="text-sm text-muted-foreground">Ports</div>
              <div className="text-2xl font-bold text-pon-dark">{deviceData.ports}</div>
            </Card>
            
            <Card className="p-4 bg-pon-light">
              <div className="text-sm text-muted-foreground">Active Lines</div>
              <div className="text-2xl font-bold text-pon-dark">{deviceData.activeLines}</div>
            </Card>
            
            <Card className="p-4 bg-pon-light">
              <div className="text-sm text-muted-foreground">Utilization</div>
              <div className="text-2xl font-bold text-pon-dark">{Math.round((deviceData.activeLines / deviceData.ports) * 100)}%</div>
            </Card>
            
            <Card className="p-4 bg-pon-light">
              <div className="text-sm text-muted-foreground">Health</div>
              <div className="text-2xl font-bold text-green-600">Good</div>
            </Card>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">SNMP Information</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Parameter</TableHead>
              <TableHead>OID</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {oidExamples.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.name}</TableCell>
                <TableCell className="font-mono text-xs">{item.oid}</TableCell>
                <TableCell>{item.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DeviceDetail;
