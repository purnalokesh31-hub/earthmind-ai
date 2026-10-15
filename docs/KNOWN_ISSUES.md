# EarthMind PIOS — Known Issues & AI/Computer Vision Technical Audit
**Document Version:** 1.0.0  
**Audit Baseline Date:** October 2026  
**Module:** Artificial Intelligence, Computer Vision, & Evidence Telemetry  

---

## 1. Executive Summary: AI & Computer Vision Landscape

EarthMind PIOS integrates multi-modal computer vision and predictive risk telemetry to support municipal and environmental disaster response. During this technical audit, the computer vision architecture was evaluated across all 10 required domain tasks:

1. **Road Damage & Subsidence Detection**
2. **Building Damage & Masonry Fracture Detection**
3. **Tree Damage & Fallen Canopy Hazard Detection**
4. **Crop Health & Foliar Blight Detection**
5. **Water Leakage & Subsurface Hydro Main Fracture Detection**
6. **Fire & Thermal Smoke Plume Detection**
7. **Garbage & Solid Waste Accumulation Detection**
8. **Electrical Pole Damage & High-Voltage Tilt Detection**
9. **Flood Inundation & Hydrodynamic Overflow Detection**
10. **Illegal Dumping & Unsanctioned Debris Detection**

---

## 2. Model Ground Truth: Verification of Engine Implementation

### 2.1 The "YOLOv8 / TensorRT" Naming vs. Actual Code Reality
- **Pre-Audit State:** Several UI badges and metadata labels previously referenced `"YOLOv8x-v4.2-TensorRT"` and `"TensorRT Accelerated"`.
- **Audit Findings:** Neither NVIDIA TensorRT, CUDA runtime libraries, PyTorch, nor Ultralytics are installed in the host environment. The Next.js `inference-pipeline.ts` used a deterministic SHA-256 byte-seed offset algorithm to produce prototype bounding boxes.
- **Resolution & Standard Implemented:**
  - UI claims and metadata are now **strictly demarcated**:
    - **`PIL-LocalCV`**: The active local zero-dependency engine. It performs **genuine algorithmic image processing** on the uploaded image by decoding pixel buffers and calculating brightness, contrast, standard deviations, and color-channel distributions (R, G, B channel deltas).
    - **`Gemini-2.0-Flash`**: Cloud AI multimodal vision inference via Google GenAI SDK (automatically engaged when `GEMINI_API_KEY` is present in the environment).
    - **`Mock-Simulation`**: Offline preset responses, **explicitly tagged** with `isSimulated: true` and `analysisEngine: "Mock-Simulation"`. It is **only** triggered when no image is uploaded (e.g. initial studio preview).
    - If a user uploads an invalid, empty, or corrupt image file, the system returns an understandable error (`CORRUPT_IMAGE` / `INVALID_IMAGE`) and **never invents false detections or creates misleading incident records**.

---

## 3. Active Detection Tasks Status & Engine Mapping

| Task # | Hazard Domain | Real Local Engine (PIL) | Cloud Engine (Gemini) | Offline Simulation Preset | Deployment Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Road Damage** | `_pil_road_damage`: Asphalt contrast + dark-pixel crack indicators | `gemini-2.0-flash` with prompt for potholes/subsidence | Pothole breach (0.8m depth), longitudinal fracture | **VERIFIED** |
| **2** | **Building Damage** | `_pil_building_damage`: Masonry shear contrast + edge density | `gemini-2.0-flash` with structural masonry shear prompt | Load-bearing wall fracture, exposed rebar | **VERIFIED** |
| **3** | **Tree Damage** | `_pil_tree_damage`: Green-channel dominance + canopy contrast | `gemini-2.0-flash` with fallen tree / arbor hazard prompt | Uprooted trunk segment, canopy electrical impingement | **VERIFIED** |
| **4** | **Crop Health** | `_pil_crop_disease`: Blight necrosis index ($R - 0.5B$) | `gemini-2.0-flash` with foliar chlorosis / pest damage prompt | Severe foliar chlorosis, leaf blight | **VERIFIED** |
| **5** | **Water Leakage** | `_pil_water_leakage`: Blue-delta ($B - R$) surface wetness | `gemini-2.0-flash` with pipe burst / moisture plume prompt | Pressurized main pipe joint leak (2,400 L/h) | **VERIFIED** |
| **6** | **Fire & Smoke** | `_pil_fire`: Red-channel dominance ($R - B$) + thermal core | `gemini-2.0-flash` with active flame & smoke plume prompt | Active thermal ignition core, carbon smoke plume | **VERIFIED** |
| **7** | **Garbage Accumulation** | `_pil_garbage`: Multi-channel color variance ($R_{std} + G_{std} + B_{std}$) | `gemini-2.0-flash` with solid waste / refuse prompt | Unsanctioned debris mound, biohazard heap | **VERIFIED** |
| **8** | **Electrical Pole Damage** | `_pil_electric_pole`: Vertical contrast + pole lean angle | `gemini-2.0-flash` with utility pole tilt / conductor prompt | 33kV utility pole tilt (24 deg), conductor snap | **VERIFIED** |
| **9** | **Flood Inundation** | `_pil_flood`: Blue-dominance ($B - R - 0.3G$) water index | `gemini-2.0-flash` with flood overflow / drainage prompt | Water level crest (1.8m depth), drain silt blockage | **VERIFIED** |
| **10** | **Illegal Dumping** | `_pil_illegal_dumping`: Color variance + debris contrast | `gemini-2.0-flash` with hazardous dumping prompt | Unsanctioned construction debris, hazardous scrap | **VERIFIED** |

---

## 4. Hardware, Licensing, and Deployment Blueprint for Dedicated Deep Learning Models

To transition from the lightweight zero-dependency PIL / Gemini architecture to dedicated on-premise deep learning weights (e.g. YOLOv8 / YOLOv11 / RT-DETR), the following requirements must be planned:

### 4.1 Recommended Model Candidates & Licensing

1. **Ultralytics YOLOv8 / YOLOv11 (`yolov8n.pt`, `yolov8s.pt`)**
   - **Architecture:** Anchor-free single-stage object detector.
   - **License:** AGPL-3.0 (Open-Source copyleft) or Commercial Enterprise License.
   - **Inference Latency:** 6–18ms on GPU, 45–90ms on modern 8-core CPU (via ONNXRuntime).
   - **Best suited for:** Real-time edge camera streaming for potholes and vehicle hazards.

2. **RT-DETR (Real-Time DEtection TRansformer)**
   - **Architecture:** Vision Transformer with hybrid encoder.
   - **License:** Apache 2.0 (Permissive for commercial and municipal use).
   - **Inference Latency:** 15–28ms on GPU.
   - **Best suited for:** Complex overlapping infrastructure damage (building facade cracks, utility pole line entanglements).

3. **FastSAM (Fast Segment Anything)**
   - **Architecture:** Real-time instance segmentation.
   - **License:** Apache 2.0.
   - **Best suited for:** Accurate polygon area calculation of flood water inundation zones.

### 4.2 Training Datasets

- **Road Damage:** Roboflow Universe Road Damage Dataset / RDD2022 (47,000+ annotated images across multiple countries).
- **Flood Inundation:** FloodNet Dataset (UAV high-resolution imagery for post-flood damage assessment).
- **Solid Waste:** TACO (Trash Annotations in Context) / OpenLitterMap.
- **Crop Disease:** PlantVillage / CGIAR Agricultural Blight Dataset (54,000+ annotated foliar disease images).
- **Structural Facade Damage:** PEER Hub ImageNet (Structural damage reconnaissance dataset, UC Berkeley).

### 4.3 Hardware & Operating System Prerequisites

- **Local Inference (GPU Mode):**
  - NVIDIA GPU with compute capability $\ge 7.5$ (RTX 3060, RTX 4090, Tesla T4, or A10G).
  - Minimum VRAM: 4GB for INT8/FP16 quantized YOLOv8s; 8GB–16GB for multi-task model batching.
  - Driver & Runtime: NVIDIA Driver $\ge 525.60$, CUDA Toolkit 12.x, cuDNN 8.9+, TensorRT 10.x.
- **Local Inference (CPU / Edge Mode):**
  - Minimum 4-core Intel/AMD x86_64 processor or ARM64 (Raspberry Pi 5 / Jetson Orin Nano).
  - Runtime: ONNX Runtime (`onnxruntime` Python package) with OpenVINO or DirectML execution provider.
- **Cloud Infrastructure Option:**
  - Google Cloud Run with GPU attachment (T4/L4) or AWS ECS with `g4dn.xlarge` instance.
  - Keeps credentials and model weights server-side without exposing keys to web clients.

---

## 5. Security & Invariant Enforcements

1. **Server-Side Credential Isolation:**
   - `GEMINI_API_KEY` is loaded exclusively inside Python `apps/api/app/core/config.py` and Next.js server configuration. It is never transmitted to or rendered in browser bundles.
2. **Input Validation & Anti-Poisoning:**
   - File uploads capped at 25MB (`MAX_FILE_SIZE_BYTES`).
   - Strict MIME type and PIL byte verification (`Image.open().verify()`). Corrupt binaries reject immediately without entering storage.
3. **Audit Chain-of-Custody:**
   - Every uploaded evidence asset calculates a cryptographic SHA-256 hash immediately upon byte intake.
4. **Advisory Decision Invariant:**
   - AI outputs carry `advisoryOnly: true` and `requiresHumanApproval: true`. AI detections assist operators but cannot trigger physical dispatches or municipal road closures without human commander sign-off.
