# test_vision_pipeline.py - Verification suite for EarthMind AI Computer Vision Pipeline
# Tests genuine PIL heuristic inference, all 10 detection tasks, corrupt input handling,
# coordinate normalization, confidence thresholds, and simulation demarcation.

import os
import sys
import io
import json
import base64
import unittest
from PIL import Image

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from apps.api.app.api.vision_v1 import (
    handle_evidence_upload,
    handle_vision_analyze,
    _create_bounding_box,
    TASK_ALIASES,
)


class TestVisionPipeline(unittest.TestCase):
    """
    Test suite for EarthMind AI Computer Vision Pipeline.
    Verifies genuine PIL heuristic inference, task coverage, error resilience,
    and schema compliance without relying on external cloud APIs or unverified models.
    """

    @classmethod
    def setUpClass(cls):
        # Generate synthetic test images with distinct visual profiles
        cls.test_images = {}

        # 1. Road Damage: dark, high-contrast texture simulating cracked asphalt
        img_road = Image.new('RGB', (100, 100), color=(40, 40, 40))
        for x in range(30, 70):
            img_road.putpixel((x, x), (220, 220, 220))
        cls.test_images['road_damage'] = cls._img_to_bytes(img_road)

        # 2. Flood: dominant blue channel simulating standing water
        img_flood = Image.new('RGB', (100, 100), color=(20, 50, 210))
        cls.test_images['flood'] = cls._img_to_bytes(img_flood)

        # 3. Fire: dominant red/orange channel simulating active flames
        img_fire = Image.new('RGB', (100, 100), color=(240, 60, 10))
        cls.test_images['fire'] = cls._img_to_bytes(img_fire)

        # 4. Tree Damage: dominant green channel simulating arbor canopy
        img_tree = Image.new('RGB', (100, 100), color=(30, 180, 40))
        cls.test_images['tree_damage'] = cls._img_to_bytes(img_tree)

        # 5. Crop Disease: high red/brown necrosis relative to blue
        img_crop = Image.new('RGB', (100, 100), color=(160, 130, 30))
        cls.test_images['crop_disease'] = cls._img_to_bytes(img_crop)

        # 6. Water Leakage: wet surface with blue-shift
        img_leak = Image.new('RGB', (100, 100), color=(35, 75, 175))
        cls.test_images['water_leakage'] = cls._img_to_bytes(img_leak)

        # 7. Garbage / Debris: heterogeneous high variance colors
        img_garbage = Image.new('RGB', (100, 100), color=(128, 128, 128))
        for x in range(0, 100, 10):
            for y in range(0, 100, 10):
                img_garbage.putpixel((x, y), (x * 2 % 255, y * 3 % 255, (x + y) * 4 % 255))
        cls.test_images['garbage'] = cls._img_to_bytes(img_garbage)

        # 8. Building Damage: high contrast masonry cracks
        img_building = Image.new('RGB', (100, 100), color=(100, 100, 100))
        for i in range(100):
            img_building.putpixel((i, 50), (250, 250, 250))
            img_building.putpixel((50, i), (10, 10, 10))
        cls.test_images['building_damage'] = cls._img_to_bytes(img_building)

        # 9. Electric Pole: vertical edge contrast
        img_pole = Image.new('RGB', (100, 100), color=(80, 80, 80))
        for y in range(100):
            img_pole.putpixel((50, y), (240, 240, 240))
        cls.test_images['electric_pole_damage'] = cls._img_to_bytes(img_pole)

        # 10. Illegal Dumping
        cls.test_images['illegal_dumping'] = cls.test_images['garbage']

    @staticmethod
    def _img_to_bytes(img: Image.Image, format='JPEG') -> bytes:
        buf = io.BytesIO()
        img.save(buf, format=format)
        return buf.getvalue()

    def test_01_coordinate_normalization(self):
        """Verify bounding box normalization satisfies UI percentages and ratio limits."""
        box = _create_bounding_box("test-box", "Pothole Defect", 95.5, 20, 30, 40, 35)

        self.assertEqual(box["x"], 20)
        self.assertEqual(box["y"], 30)
        self.assertEqual(box["width"], 40)
        self.assertEqual(box["height"], 35)
        self.assertAlmostEqual(box["xMin"], 0.20, places=2)
        self.assertAlmostEqual(box["yMin"], 0.30, places=2)
        self.assertAlmostEqual(box["xMax"], 0.60, places=2)
        self.assertAlmostEqual(box["yMax"], 0.65, places=2)
        self.assertEqual(box["areaPercent"], 14.0)
        self.assertEqual(box["confidence"], 95.5)

    def test_02_task_aliases_mapping(self):
        """Verify all task aliases resolve to canonical domain keys."""
        self.assertEqual(TASK_ALIASES["flood_detection"], "flood")
        self.assertEqual(TASK_ALIASES["crop_health"], "crop_disease")
        self.assertEqual(TASK_ALIASES["electric_pole"], "electric_pole_damage")
        self.assertEqual(TASK_ALIASES["fire_detection"], "fire")
        self.assertEqual(TASK_ALIASES["waste"], "garbage")
        self.assertEqual(TASK_ALIASES["building"], "building_damage")

    def test_03_genuine_pil_inference_all_10_tasks(self):
        """Run genuine PIL heuristic inference across all 10 hazard tasks with real image bytes."""
        expected_departments = {
            "road_damage": "Public Works Department",
            "flood": "Disaster Emergency Grid",
            "garbage": "Municipal Solid Waste Management",
            "illegal_dumping": "Municipal Enforcement & Sanitation",
            "water_leakage": "Urban Hydro Division",
            "fire": "Fire Services & Disaster Response",
            "building_damage": "Municipal Safety Board",
            "tree_damage": "Urban Forestry & Parks Board",
            "crop_disease": "Agricultural Extension Office",
            "electric_pole_damage": "State Energy Grid Command",
        }

        for task, img_bytes in self.test_images.items():
            b64_data = base64.b64encode(img_bytes).decode('utf-8')
            payload = {
                "evidenceId": f"test-ev-{task}",
                "modelTask": task,
                "imageBase64": f"data:image/jpeg;base64,{b64_data}",
            }
            res = handle_vision_analyze(payload)

            self.assertTrue(res.get("success"), f"Failed inference for task {task}: {res.get('error')}")
            d = res["data"]

            # Verify schema compliance
            self.assertEqual(d["analysisEngine"], "PIL-LocalCV")
            self.assertFalse(d["isSimulated"], "Genuine image inference must not be marked simulated")
            self.assertIn("detected", d)
            self.assertIn("riskScore", d)
            self.assertGreaterEqual(d["riskScore"], 0)
            self.assertLessEqual(d["riskScore"], 100)
            self.assertIn("confidenceScore", d)
            self.assertGreaterEqual(d["confidenceScore"], 0)
            self.assertLessEqual(d["confidenceScore"], 100)
            self.assertIn("damageSeverity", d)
            self.assertIn(d["damageSeverity"], ["low", "medium", "high", "critical"])
            self.assertTrue(len(d["boundingBoxes"]) > 0, f"Task {task} should return at least 1 bounding box")

            # Check department mapping
            expected_dept = expected_departments[task]
            self.assertEqual(d["suggestedDepartment"], expected_dept, f"Department mismatch for {task}")

            # Check risk assessment dictionary
            risk = d["riskAssessment"]
            self.assertEqual(risk["riskScore"], d["riskScore"])
            self.assertEqual(risk["recommendedDepartment"], expected_dept)
            self.assertIn(risk["priorityLevel"], ["P1", "P2", "P3", "P4"])

    def test_04_corrupt_image_rejection(self):
        """Verify corrupt / non-image input produces understandable errors and does NOT fake an incident."""
        corrupt_bytes = b"This is a text string masquerading as a JPEG binary!"
        b64_corrupt = base64.b64encode(corrupt_bytes).decode('utf-8')

        payload = {
            "evidenceId": "test-corrupt-1",
            "modelTask": "road_damage",
            "imageBase64": f"data:image/jpeg;base64,{b64_corrupt}",
        }
        res = handle_vision_analyze(payload)

        self.assertFalse(res.get("success"), "Corrupt image must not produce successful inference")
        self.assertEqual(res.get("code"), "CORRUPT_IMAGE")
        self.assertIn("corrupt", res.get("error", "").lower())

    def test_05_empty_image_rejection(self):
        """Verify 0-byte image payload is rejected."""
        payload = {
            "evidenceId": "test-empty-1",
            "modelTask": "road_damage",
            "imageBase64": "",
        }
        res = handle_vision_analyze(payload)
        # Empty base64 with non-existent evidenceId should fail
        self.assertFalse(res.get("success"))
        self.assertEqual(res.get("code"), "EVIDENCE_NOT_FOUND")

    def test_06_non_existent_evidence_id(self):
        """Verify unknown evidenceId returns explicit 404/not-found code."""
        payload = {
            "evidenceId": "non-existent-uuid-99999",
            "modelTask": "flood",
        }
        res = handle_vision_analyze(payload)
        self.assertFalse(res.get("success"))
        self.assertEqual(res.get("code"), "EVIDENCE_NOT_FOUND")

    def test_07_offline_studio_simulation_demarcation(self):
        """Verify requests without an image payload are clearly flagged as simulated demonstration."""
        payload = {
            "evidenceId": "",
            "modelTask": "fire",
        }
        res = handle_vision_analyze(payload)
        self.assertTrue(res.get("success"))
        d = res["data"]

        self.assertTrue(d["isSimulated"], "Preset requests without image must be explicitly flagged as simulated")
        self.assertEqual(d["analysisEngine"], "Mock-Simulation")
        self.assertIn("Simulated", d["aiVisionSummary"])
        self.assertEqual(d["suggestedDepartment"], "Fire Services & Disaster Response")

    def test_08_evidence_upload_valid_image(self):
        """Verify multipart evidence upload with valid JPEG calculates SHA-256 and persists asset."""
        img_bytes = self.test_images['road_damage']
        boundary = "---------------------------974767299852498929531610575"
        body = (
            f"--{boundary}\r\n"
            f'Content-Disposition: form-data; name="file"; filename="pothole_site_1.jpg"\r\n'
            f"Content-Type: image/jpeg\r\n\r\n"
        ).encode('utf-8') + img_bytes + f"\r\n--{boundary}--\r\n".encode('utf-8')

        content_type = f"multipart/form-data; boundary={boundary}"
        res = handle_evidence_upload(body, content_type)

        self.assertTrue(res.get("success"), f"Upload failed: {res.get('error')}")
        self.assertIn("evidenceId", res["data"])
        self.assertIn("sha256Hash", res["data"])
        self.assertEqual(res["data"]["fileName"], "pothole_site_1.jpg")

        # Now analyze that uploaded evidence
        evidence_id = res["data"]["evidenceId"]
        analyze_res = handle_vision_analyze({"evidenceId": evidence_id, "modelTask": "road_damage"})
        self.assertTrue(analyze_res.get("success"))
        self.assertEqual(analyze_res["data"]["analysisEngine"], "PIL-LocalCV")
        self.assertFalse(analyze_res["data"]["isSimulated"])

    def test_09_evidence_upload_corrupt_file_rejected(self):
        """Verify upload of corrupt non-image bytes is rejected at intake."""
        corrupt_bytes = b"NOT AN IMAGE FILE AT ALL"
        boundary = "---------------------------974767299852498929531610575"
        body = (
            f"--{boundary}\r\n"
            f'Content-Disposition: form-data; name="file"; filename="corrupt.jpg"\r\n'
            f"Content-Type: image/jpeg\r\n\r\n"
        ).encode('utf-8') + corrupt_bytes + f"\r\n--{boundary}--\r\n".encode('utf-8')

        content_type = f"multipart/form-data; boundary={boundary}"
        res = handle_evidence_upload(body, content_type)

        self.assertFalse(res.get("success"))
        self.assertEqual(res.get("code"), "INVALID_IMAGE")


if __name__ == '__main__':
    unittest.main()
