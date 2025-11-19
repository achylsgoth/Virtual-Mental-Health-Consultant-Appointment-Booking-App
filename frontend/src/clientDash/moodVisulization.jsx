import React, { useMemo } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';

// Mood scale: 1 = Very Negative, 2 = Negative, 3 = Neutral, 4 = Positive, 5 = Very Positive
const moodLabels = {
  1: 'Very Negative',
  2: 'Negative',
  3: 'Neutral',
  4: 'Positive',
  5: 'Very Positive'
};

// Custom tooltip that shows the date and mood
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const moodValue = payload[0].value;
    const moodText = moodLabels[moodValue] || 'Unknown';
    const description = payload[0].payload.description || '';
    
    return (
      <Box sx={{ 
        bgcolor: 'background.paper', 
        p: 1.5, 
        border: '1px solid #ccc',
        borderRadius: 1,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Typography variant="body2">{`Date: ${dayjs(label).format('MMM D, YYYY')}`}</Typography>
        <Typography variant="body2" sx={{ 
          color: getMoodColor(moodValue),
          fontWeight: 'bold'
        }}>
          {`Mood: ${moodText}`}
        </Typography>
        {description && (
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
        )}
      </Box>
    );
  }
  return null;
};

// Helper function to get color based on mood value
const getMoodColor = (mood) => {
  switch (Number(mood)) {
    case 1: return '#D32F2F'; // Red for very negative
    case 2: return '#F57C00'; // Orange for negative
    case 3: return '#FFC107'; // Yellow for neutral
    case 4: return '#4CAF50'; // Green for positive
    case 5: return '#2196F3'; // Blue for very positive
    default: return '#9E9E9E'; // Grey for unknown
  }
};

const MoodTimeline = ({ moodData, isLoading, error, daysToShow = 14 }) => {
  // Process mood data for the visualization
  const chartData = useMemo(() => {
    if (!moodData || moodData.length === 0) return [];
    
    // Create a map to store the most recent mood entry for each day
    const moodsByDate = new Map();
    
    // Get the mood data from the mood tracker
    moodData.forEach(entry => {
      // Extract date and mood value
      const date = dayjs(entry.timestamp).format('YYYY-MM-DD');
      const mood = Number(entry.mood) || 3; // Default to neutral if no mood
      
      // Only keep the most recent entry for each day
      if (!moodsByDate.has(date) || 
          dayjs(entry.timestamp).isAfter(dayjs(moodsByDate.get(date).timestamp))) {
        moodsByDate.set(date, { 
          date, 
          mood, 
          timestamp: entry.timestamp,
          description: entry.description
        });
      }
    });
    
    // Convert map to array and sort by date
    let processedMoodData = Array.from(moodsByDate.values())
      .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
    
    // Limit to last X days
    const startDate = dayjs().subtract(daysToShow - 1, 'day').format('YYYY-MM-DD');
    const endDate = dayjs().format('YYYY-MM-DD');
    
    // Fill in missing dates with null values
    const filledData = [];
    let currentDate = dayjs(startDate);
    
    while (currentDate.isBefore(dayjs(endDate).add(1, 'day'))) {
      const dateStr = currentDate.format('YYYY-MM-DD');
      const existingData = processedMoodData.find(d => d.date === dateStr);
      
      filledData.push({
        date: dateStr,
        mood: existingData ? existingData.mood : null,
        description: existingData ? existingData.description : null
      });
      
      currentDate = currentDate.add(1, 'day');
    }
    
    return filledData;
  }, [moodData, daysToShow]);

  // If loading or error, display appropriate message
  if (isLoading) {
    return (
      <Box sx={{ height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="body1" color="error">{error}</Typography>
      </Box>
    );
  }
  
  // If no data, display a message
  if (chartData.length === 0) {
    return (
      <Box sx={{ height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          No mood data available. Start tracking your mood to see trends!
        </Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="date" 
          tickFormatter={(date) => dayjs(date).format('MM/DD')}
          interval="preserveStartEnd"
        />
        <YAxis 
          domain={[1, 5]}
          ticks={[1, 2, 3, 4, 5]}
          tickFormatter={(value) => value === 3 ? 'Neutral' : ''}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="mood"
          stroke="#8884d8"
          strokeWidth={2}
          dot={{ 
            stroke: '#8884d8', 
            strokeWidth: 2,
            r: 4,
            fill: 'white' 
          }}
          activeDot={{ 
            stroke: '#8884d8',
            strokeWidth: 2,
            r: 6,
            fill: '#8884d8'
          }}
          connectNulls={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MoodTimeline;