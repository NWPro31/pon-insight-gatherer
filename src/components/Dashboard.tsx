
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeviceList from './DeviceList';
import DeviceDetail from './DeviceDetail';
import SignalChart from './SignalChart';
import TrafficStats from './TrafficStats';
import MacAddressTable from './MacAddressTable';
import { useToast } from '@/components/ui/use-toast';

const Dashboard = () => {
  const { toast } = useToast();
  const [selectedDeviceId, setSelectedDeviceId] = React.useState<string | null>(null);

  // In a real app, this would be fetched from an API
  const refreshData = () => {
    toast({
      title: "Refreshing data",
      description: "Data would be fetched from SNMP in a real implementation",
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-pon-blue">PON Insight Gatherer</h1>
          <p className="text-muted-foreground">Monitor and analyze your PON devices</p>
        </div>
        <button 
          onClick={refreshData}
          className="mt-2 md:mt-0 bg-pon-teal hover:bg-pon-blue text-white px-4 py-2 rounded-md transition-colors"
        >
          Refresh Data
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Devices</CardTitle>
            <CardDescription>Connected PON devices</CardDescription>
          </CardHeader>
          <CardContent>
            <DeviceList onSelectDevice={setSelectedDeviceId} selectedDeviceId={selectedDeviceId} />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Device Details</CardTitle>
            <CardDescription>
              {selectedDeviceId ? 'Detailed information' : 'Select a device to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDeviceId ? (
              <DeviceDetail deviceId={selectedDeviceId} />
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Select a device from the list to view details
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedDeviceId && (
        <Tabs defaultValue="signal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="signal">Signal Levels</TabsTrigger>
            <TabsTrigger value="traffic">Traffic Stats</TabsTrigger>
            <TabsTrigger value="macs">MAC Addresses</TabsTrigger>
          </TabsList>
          <TabsContent value="signal">
            <Card>
              <CardHeader>
                <CardTitle>Signal Strength</CardTitle>
                <CardDescription>Current signal levels and history</CardDescription>
              </CardHeader>
              <CardContent>
                <SignalChart deviceId={selectedDeviceId} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="traffic">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Statistics</CardTitle>
                <CardDescription>Bandwidth usage and packet information</CardDescription>
              </CardHeader>
              <CardContent>
                <TrafficStats deviceId={selectedDeviceId} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="macs">
            <Card>
              <CardHeader>
                <CardTitle>MAC Addresses</CardTitle>
                <CardDescription>Connected MAC addresses</CardDescription>
              </CardHeader>
              <CardContent>
                <MacAddressTable deviceId={selectedDeviceId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Dashboard;
