
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";

interface Device {
  id: string;
  name: string;
  ipAddress: string;
  status: 'online' | 'offline' | 'warning';
}

interface DeviceListProps {
  onSelectDevice: (deviceId: string) => void;
  selectedDeviceId: string | null;
}

const DeviceList: React.FC<DeviceListProps> = ({ onSelectDevice, selectedDeviceId }) => {
  // This would be fetched from an API in a real implementation
  const devices: Device[] = [
    { id: '1', name: 'OLT-Main-01', ipAddress: '192.168.1.1', status: 'online' },
    { id: '2', name: 'OLT-Branch-02', ipAddress: '192.168.1.2', status: 'online' },
    { id: '3', name: 'OLT-Remote-03', ipAddress: '192.168.1.3', status: 'warning' },
    { id: '4', name: 'OLT-Office-04', ipAddress: '192.168.1.4', status: 'offline' },
    { id: '5', name: 'OLT-Backup-05', ipAddress: '192.168.1.5', status: 'online' },
  ];

  const getStatusColor = (status: Device['status']) => {
    switch (status) {
      case 'online': 
        return 'bg-green-500';
      case 'offline': 
        return 'bg-red-500';
      case 'warning': 
        return 'bg-yellow-500';
      default: 
        return 'bg-gray-500';
    }
  };

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-2">
        {devices.map(device => (
          <div
            key={device.id}
            className={`p-3 border rounded-md cursor-pointer transition-colors ${
              selectedDeviceId === device.id 
                ? 'bg-pon-light border-pon-teal' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onSelectDevice(device.id)}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium">{device.name}</span>
              <span className={`h-2 w-2 rounded-full ${getStatusColor(device.status)} ${
                device.status === 'online' ? 'animate-pulse-light' : ''
              }`} />
            </div>
            <div className="text-sm text-gray-500">{device.ipAddress}</div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default DeviceList;
