import React from 'react';
import BarChart from '@/components/Graph/Graph';
import { Button, Card, CardContent } from '@mui/material';
import { format } from 'date-fns';

export default function Session(id: String) {
  
  const browsingHistory = [
    { site: 'gmail.com', category: 'Work', time: '9:00 AM', duration: '45m' },
    { site: 'docs.google.com', category: 'Work', time: '9:45 AM', duration: '30m' },
    { site: 'twitter.com', category: 'Social Media', time: '10:15 AM', duration: '15m' },
    { site: 'github.com', category: 'Work', time: '10:30 AM', duration: '1h 15m' },
    { site: 'youtube.com', category: 'Entertainment', time: '11:45 AM', duration: '25m' },
    { site: 'slack.com', category: 'Work', time: '12:10 PM', duration: '35m' },
  ];
  const modes = ["bar", "string"]
  const history = {
    data: [{
      category: "Programming",
      time: 4
    },
    {
      category: "Mathematics",
      time: 4
    }],
    mode: "bar" as ("bar" | "pie")
  };

  return (
    <div className="flex flex-col justify-between p-6 max-w-6xl h-full my-16 mx-auto">
     
      {/* Hero Text */}
      <h1 className="text-2xl font-bold mb-4">Productivity Assistant</h1>
      <p className="text-gray-600 mb-6">Track your habits and focus from your most recent session</p>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card><CardContent><p className="text-lg font-semibold">Total Session Time</p><p>3h 45m</p></CardContent></Card>
        <Card><CardContent><p className="text-lg font-semibold">Target Task Time</p><p>2h 30m</p></CardContent></Card>
      </div>

      {/* Analytics */}
      <div className="flex flex-row h-full">

        {/* Graphs */}
        <div className="flex flex-col w-1/2 p-4 gap-2 justify-left items-start">
          <BarChart request={history}/>
        </div>

        {/* Browsing History */}
        <div className="flex flex-col w-1/2 p-4 gap-2 justify-left items-start">
          <h2 className="text-xl font-semibold">Browsing History</h2>
          <p className="text-sm mb-1">Timestamped breakdown of your session</p>
          <div className="flex flex-col justify-between h-full w-full divide-y divide-gray-300">
            {browsingHistory.map((entry, index) => (
              <div key={index} className="flex flex-row w-full justify-between py-2">
                <div className="flex items-center w-1/3 gap-2">
                  <span className={`w-3 h-3 rounded-full ${entry.category === 'Work' ? 'bg-green-500' : entry.category === 'Social Media' ? 'bg-red-500' : 'bg-gray-500'}`}></span>
                  <span className="font-medium">{entry.site}</span>
                </div>
                <span className="w-1/3 text-gray-500 text-right">{entry.time}</span>
                <span className="w-1/3 text-gray-500 text-right">{entry.duration}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
    </div>
  );
};