"""Xuất KML (WGS84) cho Google Earth: 25 cây bổ sung cần kéo vào cây thật (tên = ma_cay) và 308 cây tham chiếu."""
import os
from osgeo import gdal, ogr
gdal.UseExceptions()
HERE = os.path.dirname(os.path.abspath(__file__))
GPKG = os.path.join(HERE, '..', 'Tree.gpkg')
for out, where, layer_name in (('11_25_cay_can_so_hoa.kml', 'ma_cay >= 357', '25 cay can so hoa'),
                               ('11_308_cay_tham_chieu.kml', 'ma_cay < 357', '308 cay da so hoa')):
    p = os.path.join(HERE, out)
    if os.path.exists(p):
        os.remove(p)
    gdal.VectorTranslate(p, GPKG, format='KML', layers=['cay_xanh'], where=where, dstSRS='EPSG:4326',
                         SQLStatement=None, layerName=layer_name,
                         options=['-dsco', 'NameField=ma_cay', '-dim', 'XY', '-select', 'ma_cay,ma_loai,ma_khu_vuc'])
    ds = ogr.Open(p); print(out, ds.GetLayer(0).GetFeatureCount()); ds = None
