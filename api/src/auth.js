// Xác thực JWT cho các thao tác của Quản trị viên (UC05). Token do /api/dang-nhap phát (UC06).
import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { HttpError } from './errors.js';

export function signToken(acc) {
  return jwt.sign(
    { ma_tk: acc.ma_tk, ma_nql: acc.ma_nql, vai_tro: acc.vai_tro, ten_dang_nhap: acc.ten_dang_nhap },
    config.jwtSecret,
    { expiresIn: config.jwtExpires },
  );
}

export function requireAuth(req, _res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) return next(new HttpError(401, 'Cần đăng nhập để thực hiện thao tác này.'));
  try {
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    next(new HttpError(401, 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn, vui lòng đăng nhập lại.'));
  }
}
