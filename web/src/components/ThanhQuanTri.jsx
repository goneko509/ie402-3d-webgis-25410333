// Thành phần 7 (UC05): nút Thêm cây trên thanh tiêu đề, sát thẻ tài khoản; chỉ hiện sau khi đăng nhập.
// Mặc định bị làm mờ; chỉ bật khi khu đang chọn (bảng Thống kê) là khu tài khoản phụ trách.
// Sửa / Xóa nằm trong cửa sổ thông tin cây (ThongTinCay). Tài khoản kỹ thuật (admin) có thêm nút Khôi phục DL mặc định.
export default function ThanhQuanTri({ dangThem, onThem, duocPhep, goiY, kyThuat, onKhoiPhuc }) {
  return (
    <div className={'thanh-quan-tri' + (duocPhep ? '' : ' mo')} id="thanh-quan-tri" title={goiY} data-duoc-phep={duocPhep}>
      <button className={'nut nho' + (dangThem ? ' dang-chon' : '')} onClick={() => onThem(!dangThem)} data-che-do="them"
        disabled={!duocPhep} title={goiY}>＋ Thêm cây</button>
      {kyThuat && <button className="nut nho khoi-phuc" onClick={onKhoiPhuc} id="nut-khoi-phuc"
        title="Hoàn tác thêm / sửa / xóa cây của người quản lý, giữ thay đổi của admin">↺ Khôi phục DL mặc định</button>}
    </div>
  );
}
