// Gọi API (đặc tả mục 4). Khi phát triển, Vite chuyển /api tới cổng 3001.
const BASE = (import.meta.env.VITE_API_URL || '') + '/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.loi || `Lỗi ${res.status}`);
    err.status = res.status;
    err.detail = data.chi_tiet;
    throw err;
  }
  return data;
}

export const api = {
  khuVuc: () => request('/khu-vuc'),
  loaiCay: () => request('/loai-cay'),
  cay: (params = {}) => request('/cay?' + new URLSearchParams(params)),
  layCay: (ma) => request(`/cay/${ma}`),
  lopNen: (lop) => request(`/lop-nen/${lop}`),
  thongKe: () => request('/thong-ke'),
  cayNguyCo: (params = {}) => request('/phan-tich/cay-nguy-co?' + new URLSearchParams(params)),
  dangNhap: (ten_dang_nhap, mat_khau) => request('/dang-nhap', { method: 'POST', body: { ten_dang_nhap, mat_khau } }),
  themCay: (body, token) => request('/cay', { method: 'POST', body, token }),
  suaCay: (ma, body, token) => request(`/cay/${ma}`, { method: 'PUT', body, token }),
  xoaCay: (ma, token) => request(`/cay/${ma}`, { method: 'DELETE', token }),
  khoiPhucXemTruoc: (token) => request('/khoi-phuc', { token }),
  khoiPhuc: (token) => request('/khoi-phuc', { method: 'POST', token }),
  nhatKy: (token) => request('/nhat-ky', { token }),
  hoanTacNhatKy: (maNk, token) => request(`/nhat-ky/${maNk}/hoan-tac`, { method: 'POST', token }),
};
