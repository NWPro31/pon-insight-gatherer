
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SignalChartProps {
  deviceId: string;
}

const SignalChart: React.FC<SignalChartProps> = ({ deviceId }) => {
  // This would be fetched from an API in a real implementation
  const signalData = [
    { time: '00:00', rx: -22.5, tx: -3.2 },
    { time: '01:00', rx: -22.7, tx: -3.2 },
    { time: '02:00', rx: -22.6, tx: -3.1 },
    { time: '03:00', rx: -22.8, tx: -3.3 },
    { time: '04:00', rx: -23.0, tx: -3.4 },
    { time: '05:00', rx: -23.2, tx: -3.4 },
    { time: '06:00', rx: -23.1, tx: -3.3 },
    { time: '07:00', rx: -22.9, tx: -3.2 },
    { time: '08:00', rx: -22.7, tx: -3.1 },
    { time: '09:00', rx: -22.5, tx: -3.0 },
    { time: '10:00', rx: -22.3, tx: -3.0 },
    { time: '11:00', rx: -22.4, tx: -3.1 },
  ];

  const currentSignal = {
    rx: -22.4,
    tx: -3.1,
    rxStatus: 'Good',
    txStatus: 'Good',
    lineLength: '2.34 km'
  };

  const getSignalStatusColor = (value: number, isRx: boolean) => {
    if (isRx) {
      // RX thresholds
      if (value > -25) return 'text-green-600';
      if (value > -28) return 'text-yellow-500';
      return 'text-red-500';
    } else {
      // TX thresholds
      if (value > -5) return 'text-green-600';
      if (value > -7) return 'text-yellow-500';
      return 'text-red-500';
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">RX Power</div>
            <div className={`text-2xl font-bold ${getSignalStatusColor(currentSignal.rx, true)}`}>
              {currentSignal.rx} dBm
            </div>
            <div className="text-sm mt-1">{currentSignal.rxStatus}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">TX Power</div>
            <div className={`text-2xl font-bold ${getSignalStatusColor(currentSignal.tx, false)}`}>
              {currentSignal.tx} dBm
            </div>
            <div className="text-sm mt-1">{currentSignal.txStatus}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Line Length</div>
            <div className="text-2xl font-bold text-pon-dark">{currentSignal.lineLength}</div>
            <div className="text-sm mt-1">Estimated</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="h-[300px] mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={signalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="time" />
            <YAxis domain={[-30, 0]} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="rx" 
              name="RX Power (dBm)" 
              stroke="#1a9989" 
              strokeWidth={2} 
              dot={{ strokeWidth: 2 }} 
            />
            <Line 
              type="monotone" 
              dataKey="tx" 
              name="TX Power (dBm)" 
              stroke="#1e5f74" 
              strokeWidth={2} 
              dot={{ strokeWidth: 2 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SignalChart;
