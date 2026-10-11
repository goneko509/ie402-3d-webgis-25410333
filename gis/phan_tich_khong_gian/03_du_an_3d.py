"""Tạo dự án QGIS (DuAn_3D.qgz) cấu hình sẵn cảnh 3D và xuất ảnh cảnh 3D cho Chương 4.

Chạy sau 01_phan_tich_che_phu.py, bằng Python của QGIS:
    python-qgis-ltr.bat 03_du_an_3d.py
Xuất ảnh (cần QGIS giao diện, chạy ngầm sẽ lỗi OpenGL):
    qgis-ltr-bin --project DuAn_3D.qgz --code xuat_anh_3d_gui.py
Demo: mở DuAn_3D.qgz, View > New 3D Map View, hoặc mở layout "Anh canh 3D".
"""
import math
import os
import sys

from qgis.PyQt.QtCore import QSize, QTimer, QEventLoop
from qgis.PyQt.QtGui import QColor
from qgis.core import (QgsApplication, QgsProject, QgsVectorLayer, QgsCoordinateReferenceSystem, QgsRectangle,
                       QgsFillSymbol, QgsLineSymbol, QgsMarkerSymbol, QgsSingleSymbolRenderer, QgsRuleBasedRenderer,
                       QgsPrintLayout, QgsLayoutExporter, QgsLayoutPoint, QgsLayoutSize, QgsUnitTypes, QgsVector3D,
                       QgsPalLayerSettings, QgsVectorLayerSimpleLabeling, QgsTextFormat)

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'Tree.gpkg')
RES = os.path.join(HERE, 'KetQua.gpkg')
IMGS = os.path.join(HERE, '..', '..', 'imgs')
qgs = QgsApplication([], True); qgs.initQgis()
from qgis._3d import (Qgs3DMapSettings, QgsPolygon3DSymbol, QgsPhongMaterialSettings, QgsVectorLayer3DRenderer,  # noqa: E402
                      QgsRuleBased3DRenderer, QgsLayoutItem3DMap, QgsCameraPose, QgsFlatTerrainSettings,
                      QgsDirectionalLightSettings)
from qgis.core import Qgis, QgsAbstract3DSymbol  # noqa: E402,F401

prj = QgsProject.instance(); prj.clear()
crs = QgsCoordinateReferenceSystem('EPSG:3405'); prj.setCrs(crs)
SPECIES = {1: ('Bàng', '#6aa84f'), 2: ('Sao đen', '#2e6b30'), 3: ('Lim xẹt', '#b5c934'), 4: ('Me tây', '#3d9970')}


def add(path, layer, name):
    lyr = QgsVectorLayer('%s|layername=%s' % (path, layer), name, 'ogr')
    assert lyr.isValid(), name
    prj.addMapLayer(lyr)
    return lyr


def phong(color, amb=0.45):
    m = QgsPhongMaterialSettings(); c = QColor(color)
    m.setDiffuse(c); m.setAmbient(QColor(int(c.red() * amb), int(c.green() * amb), int(c.blue() * amb))); m.setShininess(0)
    return m


# ---- lớp 2D (được phủ lên mặt đất trong cảnh 3D) ----
khu = add(SRC, 'khu_vuc', 'Khu vực')
khu.setRenderer(QgsSingleSymbolRenderer(QgsFillSymbol.createSimple({'color': '#efeee6', 'outline_color': '#52514e', 'outline_width': '0.5', 'outline_style': 'dash'})))
pal = QgsPalLayerSettings(); pal.fieldName = 'ten_khu_vuc'; tf = QgsTextFormat(); tf.setSize(9); pal.setFormat(tf)
khu.setLabeling(QgsVectorLayerSimpleLabeling(pal)); khu.setLabelsEnabled(True)
roads = add(SRC, 'roads', 'Đường (OSM)')
roads.setRenderer(QgsSingleSymbolRenderer(QgsLineSymbol.createSimple({'color': '#d4d0c6', 'width': '0.8'})))
canopy = add(RES, 'vung_che_phu', 'Vùng che phủ (Dissolve)')
canopy.setRenderer(QgsSingleSymbolRenderer(QgsFillSymbol.createSimple({'color': '0,131,0,110', 'outline_color': '#008300', 'outline_width': '0.3'})))
bound = add(SRC, 'VNUHCM_Boundary', 'Ranh giới vùng nghiên cứu')
bound.setRenderer(QgsSingleSymbolRenderer(QgsFillSymbol.createSimple({'style': 'no', 'outline_color': '#0b0b0b', 'outline_width': '0.8'})))
trees2d = add(SRC, 'cay_xanh', 'Cây xanh (điểm, CSDL)')
rules = QgsRuleBasedRenderer.Rule(None)
for ma, (ten, col) in SPECIES.items():
    r = QgsRuleBasedRenderer.Rule(QgsMarkerSymbol.createSimple({'color': col, 'size': '2', 'outline_color': 'white'}), filterExp='"ma_loai" = %d' % ma, label=ten)
    rules.appendChild(r)
trees2d.setRenderer(QgsRuleBasedRenderer(rules))

# ---- lớp 3D ----
bld = add(SRC, 'buildings', 'Tòa nhà (đùn theo chiều cao)')
bld.setRenderer(QgsSingleSymbolRenderer(QgsFillSymbol.createSimple({'color': '#c9c6be', 'outline_color': '#a9a69e'})))
s = QgsPolygon3DSymbol(); s.setMaterialSettings(phong('#c4c0b6', 0.55)); s.setExtrusionHeight(10)
props = s.dataDefinedProperties()
from qgis.core import QgsProperty  # noqa: E402
props.setProperty(QgsAbstract3DSymbol.Property.ExtrusionHeight, QgsProperty.fromExpression('min("chieu_cao", 45)'))
s.setDataDefinedProperties(props)
bld.setRenderer3D(QgsVectorLayer3DRenderer(s))


def tree3d(layer, name, by_species, trunk_color='#7b5a3c'):
    lyr = add(RES, layer, name)
    lyr.setRenderer(QgsSingleSymbolRenderer(QgsFillSymbol.createSimple({'style': 'no', 'outline_style': 'no'})))
    root = QgsRuleBased3DRenderer.Rule(None)
    for ma, (ten, col) in SPECIES.items():
        sym = QgsPolygon3DSymbol(); sym.setMaterialSettings(phong(col if by_species else trunk_color))
        sym.setAltitudeClamping(Qgis.AltitudeClamping.Absolute); sym.setExtrusionHeight(0)
        sym.setCullingMode(Qgs3DTypes_culling_none())
        root.appendChild(QgsRuleBased3DRenderer.Rule(sym, '"ma_loai" = %d' % ma, ten))
    lyr.setRenderer3D(QgsRuleBased3DRenderer(root))
    return lyr


def Qgs3DTypes_culling_none():
    from qgis._3d import Qgs3DTypes
    return Qgs3DTypes.NoCulling


than = tree3d('cay_than_3d', 'Thân cây 3D (lăng trụ)', False)
tan = tree3d('cay_tan_3d', 'Tán cây 3D (ellipsoid B-rep)', True)

# ---- cấu hình cảnh 3D ----
canvas_layers = [tan, than, bld, trees2d, bound, canopy, roads, khu]
ms = Qgs3DMapSettings()
ms.setCrs(crs)
ext = khu.extent(); ms.setExtent(ext)
ms.setOrigin(QgsVector3D(ext.center().x(), ext.center().y(), 0))
ms.setLayers(canvas_layers)
ms.setTerrainRenderingEnabled(True)
ts = QgsFlatTerrainSettings(); ms.setTerrainSettings(ts)
ms.setBackgroundColor(QColor('#e9eef3'))
light = QgsDirectionalLightSettings(); light.setDirection(QgsVector3D(0.5, -0.6, -1)); light.setIntensity(0.6)
ms.setLightSources([light])
ms.setFieldOfView(40)

# camera: nhìn về cụm cây quanh cây #25 (Khu Trung tâm Marie Curie - Isaac Newton), hướng Đông Nam - Tây Bắc
TARGET = (696600.0, 1203090.0)
pose = QgsCameraPose()
pose.setCenterPoint(QgsVector3D(TARGET[0] - ext.center().x(), TARGET[1] - ext.center().y(), 0))
pose.setDistanceFromCenterPoint(250); pose.setPitchAngle(60); pose.setHeadingAngle(205)

# ---- lưu dự án (kèm một khung nhìn 3D) ----
layout = QgsPrintLayout(prj); layout.initializeDefaults(); layout.setName('Anh canh 3D')
page = layout.pageCollection().page(0); page.setPageSize(QgsLayoutSize(320, 200, QgsUnitTypes.LayoutMillimeters))
item = QgsLayoutItem3DMap(layout)
item.setMapSettings(ms); item.setCameraPose(pose)
item.attemptMove(QgsLayoutPoint(0, 0, QgsUnitTypes.LayoutMillimeters)); item.attemptResize(QgsLayoutSize(320, 200, QgsUnitTypes.LayoutMillimeters))
item.setFrameEnabled(False)
layout.addLayoutItem(item)
prj.layoutManager().addLayout(layout)
prj.write(os.path.join(HERE, 'DuAn_3D.qgz'))
print('project saved')

qgs.exitQgis()
