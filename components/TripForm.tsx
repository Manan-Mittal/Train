'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getHomeAddress, saveHomeAddress } from '@/lib/storage/local';

function nextWeekdayDateISO() {
  const now = new Date();
  const day = now.getDay();
  const add = day === 5 ? 3 : day === 6 ? 2 : 1;
  now.setDate(now.getDate() + add);
  return now.toISOString().slice(0, 10);
}

export default function TripForm() {
  const router = useRouter();
  const [home, setHome] = useState('Jersey City, NJ');
  const [origin, setOrigin] = useState('Jersey City, NJ');
  const [destination, setDestination] = useState('College Ave Student Center, New Brunswick, NJ');
  const [date, setDate] = useState(nextWeekdayDateISO());
  const [arrivalTime, setArrivalTime] = useState('09:00');
  const [transferBufferMinutes, setTransferBufferMinutes] = useState(8);
  const [uncertaintyBufferMinutes, setUncertaintyBufferMinutes] = useState(10);

  useEffect(() => {
    const saved = getHomeAddress();
    setHome(saved);
    setOrigin(saved);
  }, []);

  function applyPreset(preset: 'rutgers' | 'christopher') {
    setOrigin(home);
    if (preset === 'rutgers') {
      setDestination('College Ave Student Center, New Brunswick, NJ');
      setArrivalTime('09:00');
    } else {
      setDestination('Christopher St Station, New York, NY');
      setArrivalTime('08:30');
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveHomeAddress(home);
    const payload = {
      origin,
      destination,
      date,
      arrivalTime,
      transferBufferMinutes,
      uncertaintyBufferMinutes,
      maxWalkingDistanceMeters: 1200,
      avoidModes: []
    };

    const res = await fetch('/api/compute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    sessionStorage.setItem('leavetime.result', JSON.stringify(data));
    router.push('/results');
  }

  return (
    <form className="grid" onSubmit={onSubmit}>
      <button type="button" className="preset" onClick={() => applyPreset('rutgers')}>Abigail → Rutgers 9:00 AM</button>
      <button type="button" className="preset" onClick={() => applyPreset('christopher')}>Me → Christopher St</button>
      <div className="card">
        <label>Home Address</label>
        <input value={home} onChange={(e) => setHome(e.target.value)} />
      </div>
      <div className="card">
        <label>Origin</label>
        <input value={origin} onChange={(e) => setOrigin(e.target.value)} />
        <label>Destination</label>
        <input value={destination} onChange={(e) => setDestination(e.target.value)} />
      </div>
      <div className="card">
        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <label>Arrival time</label>
        <input type="time" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} />
      </div>
      <div className="card">
        <h3>Commute settings</h3>
        <label>Transfer buffer (minutes)</label>
        <input type="number" min={0} value={transferBufferMinutes} onChange={(e) => setTransferBufferMinutes(Number(e.target.value))} />
        <label>Uncertainty buffer (minutes)</label>
        <input type="number" min={0} value={uncertaintyBufferMinutes} onChange={(e) => setUncertaintyBufferMinutes(Number(e.target.value))} />
      </div>
      <button type="submit">Compute Leave Time</button>
    </form>
  );
}
