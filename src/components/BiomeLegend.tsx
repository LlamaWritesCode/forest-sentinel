import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface BiomeLegendItem {
  id: number;
  name: string;
  color: string;
}

interface BiomeLegendProps {
  legend: BiomeLegendItem[];
}

const BiomeLegend: React.FC<BiomeLegendProps> = ({ legend }) => {
  return (
<Card className="bg-background/40 backdrop-blur-md shadow-lg rounded-xl p-4">
  <CardHeader className="pb-3">
    <CardTitle className="text-sm flex items-center gap-2 font-semibold">
      Biome Legend
    </CardTitle>
  </CardHeader>
  <CardContent className='overflow-y-auto max-h-40'>
    <ul className="space-y-2">
      {legend.map(({ id, name, color }) => (
        <li key={id} className="flex items-center space-x-2">
          <span
            className="w-4 min-h-4 rounded border border-gray-500"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs text-gray-700">{name}</span>
        </li>
      ))}
    </ul>
  </CardContent>
</Card>

  );
};

export default BiomeLegend;
