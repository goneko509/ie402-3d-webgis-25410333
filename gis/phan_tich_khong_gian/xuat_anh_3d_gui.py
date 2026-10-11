# Chạy trong QGIS (giao diện): qgis-ltr-bin --project DuAn_3D.qgz --code xuat_anh_3d_gui.py
# Đợi cảnh 3D trong layout "Anh canh 3D" dựng xong, xuất canh_3d.png rồi thoát.
import os
from qgis.PyQt.QtCore import QTimer
from qgis.core import QgsProject, QgsLayoutExporter, QgsApplication

OUT = os.path.join(os.path.dirname(QgsProject.instance().fileName()), 'canh_3d.png')
LOG = os.path.join(os.path.dirname(QgsProject.instance().fileName()), 'xuat_anh_3d.log')


def export():
    try:
        lay = QgsProject.instance().layoutManager().layoutByName('Anh canh 3D')
        st = QgsLayoutExporter.ImageExportSettings(); st.dpi = 200
        r = QgsLayoutExporter(lay).exportToImage(OUT, st)
        open(LOG, 'w').write('export %s\n' % r)
    except Exception as e:
        open(LOG, 'w').write('error %r\n' % e)
    QTimer.singleShot(1000, QgsApplication.instance().quit)


QTimer.singleShot(25000, export)
