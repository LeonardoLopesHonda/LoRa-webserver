export async function GET() {
  const res = await fetch(`https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}/latest`, {
    headers: { 'X-Master-Key': process.env.JSONBIN_API_KEY }
  });

  console.log('KEY:', process.env.JSONBIN_API_KEY?.slice(0, 6));
  console.log('JSONBin status:', res.status);
  const text = await res.text();
  console.log('JSONBin body:', text);
  
  const json = JSON.parse(text);
  const record = json.record;

  const dist = haversine(
    record.sender.lat, record.sender.lon,
    record.receiver.lat, record.receiver.lon
  );

  return Response.json({ ...record, distance_m: dist });
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = x => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.asin(Math.sqrt(a)));
}