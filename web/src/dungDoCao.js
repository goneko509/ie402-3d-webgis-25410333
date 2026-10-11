// Hook đo chiều cao nội dung của cửa sổ thông tin (cây / loài) để cửa sổ và Chú giải cao bằng nhau, vừa đủ (chieuCaoChung.js).
// Chiều cao cần = nội dung + lề trong thật của khung ArcGIS (đo khoảng cách nội dung tới mép khung, đi ngược qua shadow DOM).
// rieng = true (vd. đang sửa cây): cửa sổ tự cao theo nội dung (--chieu-cao-sua), không kéo Chú giải theo.
import { useEffect, useRef } from 'react';
import { baoCuaSo, xoaCuaSo } from './chieuCaoChung.js';

export function useDoCaoCuaSo(rieng = false) {
  const gocRef = useRef(null);
  const maRef = useRef(Symbol('cua-so'));
  useEffect(() => {
    const goc = gocRef.current;
    if (!goc) return undefined;
    let khung = goc;
    while (khung && !khung.classList?.contains('esri-popup__main-container')) khung = khung.parentElement ?? khung.getRootNode?.().host;
    const do_ = () => {
      const le = khung ? 2 * Math.max(0, goc.getBoundingClientRect().top - khung.getBoundingClientRect().top) : 24;
      const h = Math.ceil(goc.offsetHeight + le);
      if (rieng) { document.documentElement.style.setProperty('--chieu-cao-sua', `${h}px`); baoCuaSo(maRef.current, 0); }
      else baoCuaSo(maRef.current, h);
    };
    do_();
    const ro = new ResizeObserver(do_); ro.observe(goc);
    return () => ro.disconnect();
  }, [rieng]);
  useEffect(() => () => xoaCuaSo(maRef.current), []);   // gỡ: chỉ xóa nếu vẫn là nội dung hiện tại
  return gocRef;
}
