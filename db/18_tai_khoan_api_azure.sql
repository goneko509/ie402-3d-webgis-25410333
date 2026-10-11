-- Azure SQL: người dùng riêng cho API (contained user), quyền tối thiểu: đọc/ghi dữ liệu và chạy thủ tục trong schema dbo,
-- không có quyền DDL. Chạy bằng tài khoản admin: sqlcmd ... -v MAT_KHAU_API="<mật khẩu>" -i 18_tai_khoan_api_azure.sql
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'webgis_api')
    CREATE USER webgis_api WITH PASSWORD = '$(MAT_KHAU_API)';
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON SCHEMA::dbo TO webgis_api;
GO
SELECT dp.name AS nguoi_dung, pe.permission_name AS quyen, pe.class_desc AS pham_vi
FROM sys.database_permissions pe JOIN sys.database_principals dp ON dp.principal_id = pe.grantee_principal_id
WHERE dp.name = 'webgis_api' ORDER BY pe.permission_name;
