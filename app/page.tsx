import TripForm from '@/components/TripForm';

export default function HomePage() {
  return (
    <main>
      <h1>LeaveTime</h1>
      <p className="small">Best leave-home time for transit with transfer buffers and risk-aware backup planning.</p>
      <TripForm />
    </main>
  );
}
