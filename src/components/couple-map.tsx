import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";

export type MapPerson = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  avatarUrl: string | null;
  mine: boolean;
  updatedLabel: string;
};

function personIcon(p: MapPerson) {
  const initials = p.name.slice(0, 2).toUpperCase();
  const ring = p.mine ? "var(--primary)" : "var(--gold)";
  const inner = p.avatarUrl
    ? `<img src="${p.avatarUrl}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:9999px" />`
    : `<span style="font:600 13px Inter,sans-serif;color:var(--foreground)">${initials}</span>`;
  return L.divIcon({
    className: "",
    iconSize: [48, 56],
    iconAnchor: [24, 52],
    popupAnchor: [0, -50],
    html: `
      <div style="position:relative;width:48px;height:56px">
        <div style="position:absolute;left:4px;top:0;width:40px;height:40px;border-radius:9999px;background:var(--card);display:flex;align-items:center;justify-content:center;border:3px solid ${ring};box-shadow:0 6px 18px rgba(0,0,0,.45);overflow:hidden">${inner}</div>
        <div style="position:absolute;left:19px;top:38px;width:10px;height:10px;background:${ring};transform:rotate(45deg);border-radius:2px"></div>
        <div style="position:absolute;left:16px;top:47px;width:16px;height:6px;border-radius:9999px;background:rgba(0,0,0,.45);filter:blur(2px)"></div>
      </div>`,
  });
}

function FitPeople({ people }: { people: MapPerson[] }) {
  const map = useMap();
  useEffect(() => {
    if (people.length === 0) return;
    if (people.length === 1) {
      map.setView([people[0]!.lat, people[0]!.lng], 13, { animate: true });
      return;
    }
    const bounds = L.latLngBounds(people.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [56, 56], maxZoom: 15, animate: true });
  }, [map, people]);
  return null;
}

export default function CoupleMap({ people }: { people: MapPerson[] }) {
  const center: [number, number] = people[0] ? [people[0].lat, people[0].lng] : [-2.17, -79.92];
  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom={false}
      className="h-full w-full"
      attributionControl={false}
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        className="map-dark-tiles"
      />
      {people.length === 2 && (
        <Polyline
          positions={people.map((p) => [p.lat, p.lng] as [number, number])}
          pathOptions={{ color: "oklch(0.685 0.105 38)", weight: 3, dashArray: "6 8", opacity: 0.9 }}
        />
      )}
      {people.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={personIcon(p)}>
          <Popup>
            <strong>{p.mine ? "Tú" : p.name}</strong>
            <br />
            {p.updatedLabel}
          </Popup>
        </Marker>
      ))}
      <FitPeople people={people} />
    </MapContainer>
  );
}
