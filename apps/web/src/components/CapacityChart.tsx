import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

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
        backgroundColor: 'rgba(18,93,114,0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'GI (MVA)',
        data: gi,
        borderColor: '#F9AF1C',
        backgroundColor: 'rgba(249,175,28,0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const } },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <div style={{ height: 220 }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
