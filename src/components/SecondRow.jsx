import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid,  Legend } from 'recharts';

import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { FaBullseye, FaChartLine } from 'react-icons/fa';

// Professional color constants
const PLAN_COLOR = '#ef4444';  // Red
const ACTUAL_COLOR = '#16a34a'; // Rich green
const REJECT_COLOR = '#ef4444';  // Red for rejects

// Update the line colors and constants
const LINE_COLOR_1 = '#16a34a';  // Green
const LINE_COLOR_2 = '#ef4444';  // Red

function SecondRow() {

  const [partComparisonData, setPartComparisonData] = useState([]);

  const [oeeData, setOeeData] = useState([]);

  const [counts, setCounts] = useState({
    actual: 0,
    planned: 0
  });

  const pieData = [
    { name: 'Plan', value: 60, color: '#E97451' },
    { name: 'Actual', value: 40, color: '#FDB347' }
  ];

  

  useEffect(() => {
    // Function to fetch part comparison data
    const fetchPartData = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/parts/comparison');
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const data = await response.json();
        
        
        setPartComparisonData(data.map(part => ({
          name: part.partnumber,
          value: part.count , // unitsProduced minus unitsRejected
          color: part.partnumber === '9253020232' ? ACTUAL_COLOR : REJECT_COLOR // Adjust as needed
        })));

        console.log(`this is the data : ${partComparisonData}`);
      } catch (error) {
        console.error('Error fetching part comparison data:', error);
      }
    };
  
    // Function to fetch actual and planned counts
    const fetchCounts = async () => {
      try {
        const responseCounts = await fetch('http://localhost:3000/api/machine/counts');
        const counts = await responseCounts.json();
  
        if (responseCounts.ok) {
          setCounts({
            actual: counts.actual,
            planned: counts.planned
          });
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    const fetchOeeData = async () => {
      const response = await fetch('http://localhost:3000/api/oee/last-ten');
      if (response.ok) {
        const data = await response.json();
        setOeeData(data);
      } else {
        console.error('Failed to fetch OEE data');
      }
    };

    
  
    // Initial fetch for both part data and counts
    fetchPartData();
    fetchCounts();  
    fetchOeeData();
    
  
    // Set up the interval for updating counts
    const intervalId = setInterval(() => {
      fetchCounts();
      fetchPartData();
      fetchOeeData();
    }, 30000); // Refresh every 30 seconds
  
    // Clear the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);  // Dependencies array is empty to run only on component mount
  
  const lineData = [
    { name: '', value1: null, value2: null },
    { name: 'Mon', value1: 280, value2: 220 },
    { name: 'Tue', value1: 300, value2: 250 },
    { name: 'Wed', value1: 180, value2: 220 },
    { name: 'Thu', value1: 320, value2: 340 },
    { name: 'Fri', value1: 350, value2: 330 },
    { name: 'Sat', value1: 260, value2: 280 },
    { name: 'Sun', value1: 290, value2: 310 }
  ];

  const ValueBox = ({ title, value }) => {
    const boxColor = title === 'PLAN' ? '#16a34a' : '#ef4444'; // Green for PLAN, Red for ACTUAL
    
    return (
      <div className="bg-white h-full border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
        <div className={`border-b py-3 px-3 flex items-center justify-between bg-gradient-to-r from-white`}
             style={{ borderColor: boxColor }}>
          <span className="text-xs font-medium flex items-center gap-2" style={{ color: boxColor }}>
            {title === 'PLAN' ? <FaBullseye /> : <FaChartLine />}
            {title}
          </span>
        </div>
        <div className="h-[150px] flex items-center justify-center p-4">
          <div className="text-center w-full">
            <div className="rounded-lg p-4 shadow-inner" 
                 style={{ backgroundColor: `${boxColor}10` }}>
              <span className="text-4xl font-bold block mb-1" style={{ color: boxColor }}>{value}</span>
              <div className="text-xs text-gray-500">Units per Shift</div>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: boxColor }}></div>
              <span className="text-xs font-medium" style={{ color: boxColor }}>
                {title === 'PLAN' ? 'Target Rate' : 'Current Rate'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PieChartSection = () => {
    return (
      <div className="col-span-3">
        <div className="bg-white p-2 h-[210px] border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
          <div className="px-2 flex items-center justify-between">
            <span className="text-[#2563eb] text-xs font-medium">PARTS COMPARISON</span>
            <div className="flex items-center gap-4">
              {partComparisonData.map(part => (
                <div key={part.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: part.color }}></div>
                  <span className="text-xs text-gray-500">{part.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-grow flex items-center justify-center">
            <PieChart width={200} height={180}>
              <Pie
                data={partComparisonData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={3}
                dataKey="value"
                label={({ cx, cy, midAngle, innerRadius, outerRadius, value, index }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = 25 + innerRadius + (outerRadius - innerRadius);
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  return (
                    <text
                      x={x}
                      y={y}
                      fill={partComparisonData[index].color}
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline="central"
                    >
                      {`${value}`}
                    </text>
                  );
                }}
              >
                {partComparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2 border border-gray-200 rounded-md shadow-sm">
                        <p className="text-xs font-medium" style={{ color: payload[0].payload.color }}>
                          {payload[0].name}: {payload[0].value}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </div>
        </div>
      </div>
    );
};

  return (
    <div className="px-4 py-2">
      <div className="grid grid-cols-12 gap-3">
        {/* Pie Chart */}
        <PieChartSection />

        {/* Plan/Actual */}
        <div className="col-span-3 grid grid-cols-2 gap-2">
          <div className="h-[210px]">
            <ValueBox title="ACTUAL" value={counts.actual} />
          </div>
          <div className="h-[210px]">
            <ValueBox title="PLAN" value={counts.planned} />
          </div>
        </div>

        {/* Line Chart */}
        <div className="col-span-6">
          <div className="bg-white p-2 h-[287px] border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 -mt-[75px]">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-[#2563eb]/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#2563eb]" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                <span className="text-[#2563eb] text-xs font-medium">OEE METRICS</span>
              </div>

              <div className="flex items-center gap-4 px-4 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#2563eb]"></div>
                  <span className="text-xs font-medium text-gray-600">OEE</span>
                </div>
                <div className="w-px h-4 bg-gray-200"></div>
                <div className="flex items-center gap-1.5">
                  {/* <div className="w-2 h-2 rounded-full bg-[#ef4444]"></div>
                  <span className="text-xs font-medium text-gray-600">ACTUAL</span> */}
                </div>
              </div>
            </div>

            <div className="h-[200px] mt-4">
            <LineChart
              width={600}
              height={250}
              data={oeeData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="oee" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecondRow;