// Hộp bối cảnh bản đồ trên thanh tiêu đề (cạnh ô tìm kiếm): tóm tắt NGẮN bản đồ đang hiển thị gì, không tiêu đề / biểu tượng:
//   Khu đang xem (số cây) / Loài (số cây trong khu) | Tình trạng (số cây · %), kèm nút Đặt lại.
// Khu đang xem = khu đang chọn; đang ở toàn vùng mà có chọn loài / tình trạng -> khu nhiều cây thỏa điều kiện nhất (bản đồ đã căn tới).
// Chọn cả loài và tình trạng: số cây tình trạng = cây thuộc loài đó VÀ tình trạng đó, % tính trên số cây loài trong khu.
// Không chọn mà đang dùng Lọc cây: dòng 2 ghi số cây còn hiện. Đặt lại: bỏ chọn và xóa lọc (giữ khu, camera).
// Hai dòng; hẹp chỗ thì mỗi dòng cắt "…" ở cuối, rê chuột xem đủ.
const so1 = (v) => v.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
// Tên khu rút gọn, giữ chữ "Khu" (tên đầy đủ khi rê chuột)
const gonKhu = (t) => t.replace('Trung tâm Marie Curie - Isaac Newton', 'Trung tâm MC – IN').replace('Quảng trường Sáng tạo', 'QT Sáng tạo');

export default function BoiCanhBanDo({ dsCay, loaiCay, thongKe, khuChon, tapTrung, khuNhieu, dangLoc, ketQuaLoc, onDatLai }) {
  const khu = khuChon ?? khuNhieu?.ma_khu_vuc ?? null;
  const cay = khu === null ? dsCay : dsCay.filter((c) => c.ma_khu_vuc === khu);
  const tenKhu = khu === null ? 'Toàn vùng nghiên cứu' : thongKe.find((r) => r.ma_khu_vuc === khu)?.ten_khu_vuc ?? `Khu ${khu}`;
  const loai = tapTrung?.loai != null ? loaiCay.find((l) => l.ma_loai === tapTrung.loai) : null;
  const cayLoai = loai ? cay.filter((c) => c.ma_loai === loai.ma_loai) : cay;
  const tt = tapTrung?.tinhTrang ?? null;
  const nTt = tt ? cayLoai.filter((c) => c.tinh_trang === tt).length : 0;
  const pTt = so1(cayLoai.length ? (nTt / cayLoai.length) * 100 : 0);
  const chuKhu = `${gonKhu(tenKhu)} (${cay.length})`;
  const chuLoai = loai ? `Loài ${loai.ten_loai} (${cayLoai.length})` : 'Tất cả loài';
  const chuTt = tt ? `${tt} (${nTt} · ${pTt} %)` : 'Tất cả tình trạng';
  const dong2 = !tapTrung && dangLoc
    ? <span className="bc-loc" title="Lọc cây đang ẩn bớt cây trên bản đồ">Đang lọc: {ketQuaLoc?.hien ?? '…'} / {ketQuaLoc?.tong ?? '…'} cây</span>
    : (<>
      <span title={loai ? `${loai.ten_loai} (${loai.ten_khoa_hoc}): ${cayLoai.length} cây trong ${tenKhu}` : chuLoai}>{chuLoai}</span>
      <span className="bc-ngan" aria-hidden="true">|</span>
      <span title={tt ? `${nTt} / ${cayLoai.length} cây${loai ? ` ${loai.ten_loai}` : ''} của ${tenKhu} ở tình trạng ${tt}` : chuTt}>{chuTt}</span>
    </>);
  return (
    <div className="boi-canh" id="boi-canh">
      <div className="bc-chu">
        <div className="bc-khu" title={khuChon === null && khuNhieu ? `${tenKhu}: khu có nhiều cây thỏa điều kiện chọn nhất (toàn vùng ${khuNhieu.tong} cây)` : tenKhu}>{chuKhu}</div>
        <div className="bc-dong2">{dong2}</div>
      </div>
      <button type="button" className="bc-dat-lai" id="nut-dat-lai" onClick={onDatLai} disabled={!tapTrung && !dangLoc}
        title="Bỏ chọn loài / tình trạng và xóa Lọc cây (giữ khu đang xem)">Đặt lại</button>
    </div>
  );
}
