// Kho trạng thái nhỏ dùng chung giữa App và nội dung cửa sổ thông tin cây.
// Cửa sổ thông tin do ArcGIS dựng (ngoài cây React của App) nên không nhận props thường; đọc kho qua useSyncExternalStore.
export function taoKho(banDau) {
  let trangThai = banDau;
  const nghe = new Set();
  return {
    get: () => trangThai,
    set: (thayDoi) => { trangThai = { ...trangThai, ...thayDoi }; nghe.forEach((f) => f()); },
    subscribe: (f) => { nghe.add(f); return () => nghe.delete(f); },
  };
}
