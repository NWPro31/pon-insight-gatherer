
import React from 'react';
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MacAddressTableProps {
  deviceId: string;
}

const MacAddressTable: React.FC<MacAddressTableProps> = ({ deviceId }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  // This would be fetched from an API in a real implementation
  const macAddresses = [
    { mac: '00:1A:2B:3C:4D:5E', port: 1, lastSeen: '2023-04-14 10:15:22', vendor: 'Cisco Systems', status: 'active' },
    { mac: '11:22:33:44:55:66', port: 1, lastSeen: '2023-04-14 10:14:56', vendor: 'Huawei', status: 'active' },
    { mac: 'AA:BB:CC:DD:EE:FF', port: 2, lastSeen: '2023-04-14 10:13:45', vendor: 'ZTE', status: 'active' },
    { mac: 'F0:9F:C2:D1:E5:A8', port: 3, lastSeen: '2023-04-14 10:10:12', vendor: 'Nokia', status: 'active' },
    { mac: '45:67:89:AB:CD:EF', port: 4, lastSeen: '2023-04-14 09:58:33', vendor: 'Juniper', status: 'active' },
    { mac: 'A1:B2:C3:D4:E5:F6', port: 5, lastSeen: '2023-04-14 09:45:21', vendor: 'HP', status: 'active' },
    { mac: '98:76:54:32:10:AB', port: 6, lastSeen: '2023-04-14 09:32:08', vendor: 'Apple', status: 'inactive' },
    { mac: 'FE:DC:BA:98:76:54', port: 7, lastSeen: '2023-04-14 09:15:45', vendor: 'Dell', status: 'active' },
    { mac: '01:23:45:67:89:AB', port: 8, lastSeen: '2023-04-14 08:58:12', vendor: 'Samsung', status: 'active' },
    { mac: 'AB:CD:EF:12:34:56', port: 9, lastSeen: '2023-04-14 08:45:33', vendor: 'Ericsson', status: 'inactive' },
  ];
  
  const filteredMacs = macAddresses.filter(item => 
    item.mac.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.vendor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search MAC or vendor..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      
      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>MAC Address</TableHead>
              <TableHead>Port</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMacs.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-mono">{item.mac}</TableCell>
                <TableCell>{item.port}</TableCell>
                <TableCell>{item.lastSeen}</TableCell>
                <TableCell>{item.vendor}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default MacAddressTable;
