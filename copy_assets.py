import shutil
import os

source_dir = r"C:\Users\LENOVO\.gemini\antigravity\brain\204e49f8-6b36-48cf-8180-9711c337faec"
dest_dir = r"c:\Users\LENOVO\OneDrive - ESPRIT\Bureau\frontConnect\frontConnect\src\assets"

files = [
    "camping_gear_card_1772128533145.png",
    "camping_services_hero_1772128397082.png",
    "hiking_service_card_1772128464172.png",
    "medical_service_card_1772128661389.png",
    "transport_service_card_1772128728920.png"
]

for f in files:
    src = os.path.join(source_dir, f)
    dst = os.path.join(dest_dir, f)
    print(f"Copying {src} to {dst}")
    try:
        shutil.copy2(src, dst)
        print("Success")
    except Exception as e:
        print(f"Failed: {e}")
