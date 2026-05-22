import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { peta } from '../lib/api';

interface FieldTeams {
  elektromekanik: number;
  sipil: number;
  jaringan: number;
  admKontrak: number;
}

interface PetaUnit {
  code: string;
  label: string;
  name: string;
  short: string;
  wilayah: string;
  lat: number;
  lng: number;
  headcount: number;
  projects: number;
  score: number;
  status: string;
  fieldTeams: FieldTeams;
}

interface PetaData {
  center: { lat: number; lng: number };
  zoom: number;
  units: PetaUnit[];
}

function statusColor(status: string): string {
  if (status === 'Baik') return '#46BD0D';
  if (status === 'Hati-hati') return '#F9AF1C';
  return '#EC1C24';
}

function makeIcon(label: string, color: string): L.DivIcon {
  return L.divIcon({
    className: 'peta-marker',
    html:
      `<div style="background:${color};color:#fff;width:30px;height:30px;` +
      `border-radius:50%;display:flex;align-items:center;justify-content:center;` +
      `font-weight:700;font-size:12px;border:2px solid #fff;` +
      `box-shadow:0 1px 4px rgba(0,0,0,.45)">${label}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

export function PetaPage() {
  const [data, setData] = useState<{ data: PetaData | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    peta.get().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Memuat…</div>;
  const d = data?.data;
  if (!d) return <div className="page-loading">Data tidak tersedia.</div>;

  const units = d.units ?? [];
  const upmkOnly = units.filter((u) => u.code !== 'KP');

  return (
    <div className="page peta-page">
      <div className="page-header">
        <h1 className="page-title">Peta Geografis UPMK</h1>
        <p className="page-subtitle">
          Sebaran Kantor Induk &amp; 5 Unit Pelaksana Manajemen Konstruksi
        </p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
        <MapContainer
          center={[d.center.lat, d.center.lng]}
          zoom={d.zoom}
          style={{ height: 480, width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {units.map((u) => (
            <Marker
              key={u.code}
              position={[u.lat, u.lng]}
              icon={makeIcon(u.label, statusColor(u.status))}
            >
              <Popup>
                <strong>{u.name}</strong>
                <br />
                {u.wilayah}
                <br />
                Proyek aktif: {u.projects} · Pegawai: {u.headcount}
                <br />
                Skor kinerja: {u.score} ({u.status})
                <br />
                Tim lapangan — EM {u.fieldTeams.elektromekanik} · Sipil{' '}
                {u.fieldTeams.sipil} · Jaringan {u.fieldTeams.jaringan} · Adm{' '}
                {u.fieldTeams.admKontrak}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Detail 5 UPMK</h3>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Unit</th>
                <th>Wilayah</th>
                <th>Proyek</th>
                <th>Pegawai</th>
                <th>Tim Lapangan (EM/Sipil/Jar/Adm)</th>
                <th>Skor</th>
              </tr>
            </thead>
            <tbody>
              {upmkOnly.map((u) => (
                <tr key={u.code}>
                  <td>{u.short}</td>
                  <td>{u.wilayah}</td>
                  <td>{u.projects}</td>
                  <td>{u.headcount}</td>
                  <td>
                    {u.fieldTeams.elektromekanik}/{u.fieldTeams.sipil}/
                    {u.fieldTeams.jaringan}/{u.fieldTeams.admKontrak}
                  </td>
                  <td>
                    <span
                      className="risk-score"
                      style={{ backgroundColor: statusColor(u.status) }}
                    >
                      {u.score}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
