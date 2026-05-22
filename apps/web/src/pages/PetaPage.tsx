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
  if (status === 'Hati-hati') return '#FBA806';
  return '#EC1C24';
}

function scoreClass(score: number): string {
  if (score >= 100) return 'good';
  if (score >= 95) return 'warn';
  return 'bad';
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

  return (
    <div className="page peta-page">
      <div className="page-header">
        <h1 className="page-title">Peta Geografis UPMK</h1>
        <p className="page-subtitle">
          Sebaran Kantor Induk &amp; 5 Unit Pelaksana Manajemen Konstruksi
        </p>
      </div>

      <div className="two-col-grid wide-left">
        <div className="card p-0">
          <div className="card-header compact">
            <div className="card-title">Peta Geografis UPMK</div>
            <span className="card-meta">{units.length} unit</span>
          </div>
          <MapContainer
            center={[d.center.lat, d.center.lng]}
            zoom={d.zoom}
            style={{ height: 440, width: '100%' }}
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
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          <div className="upmk-legend">
            <span className="upmk-legend-item">
              <span className="upmk-legend-dot" style={{ background: '#46BD0D' }} />
              Baik (≥100)
            </span>
            <span className="upmk-legend-item">
              <span className="upmk-legend-dot" style={{ background: '#FBA806' }} />
              Hati-hati (95–99)
            </span>
            <span className="upmk-legend-item">
              <span className="upmk-legend-dot" style={{ background: '#EC1C24' }} />
              Buruk (&lt;95)
            </span>
          </div>
        </div>

        <div className="card p-0">
          <div className="card-header compact">
            <div className="card-title">Detail Unit &amp; Wilayah</div>
          </div>
          <div className="table-wrap">
            <table className="unit-detail-table">
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Wilayah &amp; Tim Lapangan</th>
                  <th>Proyek</th>
                  <th>Pegawai</th>
                  <th>Nilai</th>
                </tr>
              </thead>
              <tbody>
                {units.map((u) => (
                  <tr key={u.code}>
                    <td>
                      <span className="unit-detail-code">{u.code}</span>
                    </td>
                    <td>
                      <div>{u.wilayah}</div>
                      <div className="unit-detail-teams">
                        <span className="team-chip">EM {u.fieldTeams.elektromekanik}</span>
                        <span className="team-chip">Sipil {u.fieldTeams.sipil}</span>
                        <span className="team-chip">Jar {u.fieldTeams.jaringan}</span>
                        <span className="team-chip">Adm {u.fieldTeams.admKontrak}</span>
                      </div>
                    </td>
                    <td>{u.projects}</td>
                    <td>{u.headcount}</td>
                    <td>
                      <span className={`unit-detail-score ${scoreClass(u.score)}`}>
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
    </div>
  );
}
