import { Line } from 'react-chartjs-2';
import '../lib/charts';

interface Props { data: Record<string, unknown>; }

export function CapacityChart({ data }: Props) {
  if (!data) return null;
  const months = (data.months as string[]) ?? [];
  const pembangkit = (data.pembangkit as number[]) ?? [];
  const gi = (data.gi as number[]) ?? [];

  const chartData = {
    labels: months,
    datasets: [
      {
        label: 'Pembangkit (MW)',
        data: pembangkit,
        borderColor: '#125D72',
        backgroundColor: 'rgba(18,93,114,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
      },
      {
        label: 'GI (MVA)',
        data: gi,
        borderColor: '#F9AF1C',
        backgroundColor: 'rgba(249,175,28,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const, labels: { font: { size: 10 }, boxWidth: 10, padding: 12 } } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 10 } } },
    },
  };

  return (
    <div style={{ height: 240 }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
