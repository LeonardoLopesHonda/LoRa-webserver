'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetch_ = () =>
      fetch('/api/data').then(r => r.json()).then(setData);
    fetch_();
    const id = setInterval(fetch_, 15000);
    return () => clearInterval(id);
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <main style={{ fontFamily: 'monospace', padding: 32 }}>
      <h1>{data.distance_m} m</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
