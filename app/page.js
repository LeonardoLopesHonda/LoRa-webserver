"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false },
);
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
  ssr: false,
});
const Polyline = dynamic(
  () => import("react-leaflet").then((m) => m.Polyline),
  { ssr: false },
);
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), {
  ssr: false,
});

export default function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const L = require("leaflet");
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const fetchData = () =>
      fetch("/api/data")
        .then((r) => r.json())
        .then(setData);
    fetchData();
    const id = setInterval(fetchData, 15000);
    return () => clearInterval(id);
  }, []);

  if (!data)
    return <p style={{ fontFamily: "monospace", padding: 32 }}>Loading...</p>;

  const sender = [data.sender.lat, data.sender.lon];
  const receiver = [data.receiver.lat, data.receiver.lon];
  const center = [
    (data.sender.lat + data.receiver.lat) / 2,
    (data.sender.lon + data.receiver.lon) / 2,
  ];

  return (
    <main style={{ fontFamily: "monospace", padding: 32 }}>
      {/* Stats bar */}
      <div style={{ marginBottom: 16, display: "flex", gap: 32 }}>
        <span>
          <b>Distance:</b> {data.distance_m} m
        </span>
        <span>
          <b>RSSI:</b> {data.rssi} dBm
        </span>
        <span>
          <b>SNR:</b> {data.snr} dB
        </span>
        <span>
          <b>Sats:</b> {data.sender.sats}
        </span>
        <span>
          <b>HDOP:</b> {data.sender.hdop}
        </span>
        <span>
          <b>Packet:</b> #{data.sender.id}
        </span>
      </div>

      {/* Map */}
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: "500px", width: "100%", borderRadius: 8 }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={sender}>
          <Popup>
            Sender
            <br />
            {data.sender.lat}, {data.sender.lon}
          </Popup>
        </Marker>
        <Marker position={receiver}>
          <Popup>
            Receiver (home)
            <br />
            {data.receiver.lat}, {data.receiver.lon}
          </Popup>
        </Marker>
        <Polyline positions={[sender, receiver]} color="blue" />
      </MapContainer>
    </main>
  );
}
