import React, { useState, useEffect } from 'react';

const SimpleGeoTest = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('SimpleGeoTest mounted');
    
    const fetchData = async () => {
      try {
        console.log('Fetching from http://localhost:8080/api/geo-data');
        const response = await fetch('http://localhost:8080/api/geo-data');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Data received:', result);
        setData(result);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading geo data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ background: 'white', padding: '20px', margin: '20px', border: '1px solid #ccc' }}>
      <h3>Geo Data Test</h3>
      <p>Data length: {data ? data.length : 'No data'}</p>
      <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '12px' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default SimpleGeoTest;
