// Chuyển hình học SQL Server (WKT từ STAsText) sang GeoJSON. Tọa độ giữ EPSG:3405 (đặc tả mục 4).
import wellknown from 'wellknown';

export const CRS = 'EPSG:3405';

export function feature(row, geomField = 'wkt', idField) {
  const { [geomField]: wkt, ...props } = row;
  return {
    type: 'Feature',
    ...(idField ? { id: row[idField] } : {}),
    geometry: wkt ? wellknown.parse(wkt) : null,
    properties: props,
  };
}

export function featureCollection(rows, geomField = 'wkt', idField) {
  return { type: 'FeatureCollection', crs: CRS, features: rows.map((r) => feature(r, geomField, idField)) };
}

/** Kiểm tra và chuẩn hóa tham số bbox "minx,miny,maxx,maxy" -> mảng 4 số hoặc null. */
export function parseBbox(text) {
  if (!text) return null;
  const v = String(text).split(',').map(Number);
  if (v.length !== 4 || v.some((n) => !Number.isFinite(n)) || v[0] >= v[2] || v[1] >= v[3]) return undefined;
  return v;
}
