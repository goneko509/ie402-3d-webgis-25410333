// Tình trạng cây: màu trạng thái chuẩn + biểu tượng, dùng chung cho Thống kê cây xanh và cửa sổ thông tin cây
// (luôn đi kèm chữ, không dùng màu đơn thuần).
export const TINH_TRANG = [
  { ten: 'Bình thường', mau: '#0ca30c', bieuTuong: '✓' },
  { ten: 'Suy yếu', mau: '#e09a00', bieuTuong: '!' },
  { ten: 'Nguy hiểm', mau: '#d03b3b', bieuTuong: '⚠' },
];
export const timTinhTrang = (ten) => TINH_TRANG.find((t) => t.ten === ten);
