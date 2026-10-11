// Đổi tọa độ VN-2000 / UTM 48N (EPSG:3405) -> WGS84 kinh độ/vĩ độ (EPSG:4326), dùng cho liên kết Google Maps.
// Theo phép biến đổi "VN-2000 to WGS 84 (2)" của cơ sở dữ liệu EPSG (PROJ trong QGIS chọn mặc định, sai số ~1 m):
//   nghịch UTM 48N (elip WGS84) -> tọa độ địa tâm -> Helmert 7 tham số (quy ước coordinate frame) -> kinh/vĩ độ WGS84.
// Đã đối chiếu: trùng khớp pipeline PROJ (cct) của phép biến đổi này; cs2cs EPSG:3405 -> EPSG:4326 chọn đường khác, lệch ~0,8 m
// (trong sai số công bố 1 m).
const A = 6378137, F = 1 / 298.257223563, E2 = F * (2 - F);
const K0 = 0.9996, LON0 = (105 * Math.PI) / 180, FE = 500000;
const GIAY = Math.PI / (180 * 3600);
const H = { x: -191.90441429, y: -39.30318279, z: -111.45032835, rx: -0.00928836 * GIAY, ry: 0.01975479 * GIAY, rz: -0.00427372 * GIAY, s: 0.252906278e-6 };

/** Nghịch UTM (chuỗi Snyder) -> [vĩ độ, kinh độ] (radian) trên elip VN-2000 (= WGS84). */
function nghichUtm(x, y) {
  const e1 = (1 - Math.sqrt(1 - E2)) / (1 + Math.sqrt(1 - E2));
  const ep2 = E2 / (1 - E2);
  const m = y / K0;
  const mu = m / (A * (1 - E2 / 4 - (3 * E2 ** 2) / 64 - (5 * E2 ** 3) / 256));
  const p1 = mu + (3 * e1 / 2 - 27 * e1 ** 3 / 32) * Math.sin(2 * mu) + (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32) * Math.sin(4 * mu)
    + (151 * e1 ** 3 / 96) * Math.sin(6 * mu) + (1097 * e1 ** 4 / 512) * Math.sin(8 * mu);
  const [s1, c1, t1] = [Math.sin(p1), Math.cos(p1), Math.tan(p1)];
  const n1 = A / Math.sqrt(1 - E2 * s1 ** 2), r1 = (A * (1 - E2)) / (1 - E2 * s1 ** 2) ** 1.5;
  const tt = t1 ** 2, cc = ep2 * c1 ** 2, d = (x - FE) / (n1 * K0);
  const lat = p1 - ((n1 * t1) / r1) * (d ** 2 / 2 - ((5 + 3 * tt + 10 * cc - 4 * cc ** 2 - 9 * ep2) * d ** 4) / 24
    + ((61 + 90 * tt + 298 * cc + 45 * tt ** 2 - 252 * ep2 - 3 * cc ** 2) * d ** 6) / 720);
  const lon = LON0 + (d - ((1 + 2 * tt + cc) * d ** 3) / 6 + ((5 - 2 * cc + 28 * tt - 3 * cc ** 2 + 8 * ep2 + 24 * tt ** 2) * d ** 5) / 120) / c1;
  return [lat, lon];
}

/** VN-2000 / UTM 48N (x, y mét) -> { lat, lon } WGS84 (độ). */
export function vn2000SangWgs84(x, y) {
  const [phi, lam] = nghichUtm(x, y);
  // Tọa độ địa tâm trên elip (cao độ elip 0; ảnh hưởng tới kinh/vĩ độ không đáng kể)
  const n = A / Math.sqrt(1 - E2 * Math.sin(phi) ** 2);
  const X = n * Math.cos(phi) * Math.cos(lam), Y = n * Math.cos(phi) * Math.sin(lam), Z = n * (1 - E2) * Math.sin(phi);
  // Helmert, quy ước coordinate frame (góc xoay nhỏ)
  const k = 1 + H.s;
  const X2 = H.x + k * (X + H.rz * Y - H.ry * Z);
  const Y2 = H.y + k * (-H.rz * X + Y + H.rx * Z);
  const Z2 = H.z + k * (H.ry * X - H.rx * Y + Z);
  // Địa tâm -> trắc địa (lặp)
  const p = Math.hypot(X2, Y2);
  let lat = Math.atan2(Z2, p * (1 - E2));
  for (let i = 0; i < 6; i++) {
    const ni = A / Math.sqrt(1 - E2 * Math.sin(lat) ** 2);
    lat = Math.atan2(Z2 + E2 * ni * Math.sin(lat), p);
  }
  return { lat: (lat * 180) / Math.PI, lon: (Math.atan2(Y2, X2) * 180) / Math.PI };
}

/** Liên kết Google Maps tới điểm (WGS84). */
export const lienKetGoogleMaps = ({ lat, lon }) => `https://www.google.com/maps/search/?api=1&query=${lat.toFixed(7)},${lon.toFixed(7)}`;
