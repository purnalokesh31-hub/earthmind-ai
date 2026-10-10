// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — OCR Service
// ──────────────────────────────────────────────────────────────
// Document text extraction, entity parsing (dates, geo-tags,
// case numbers), and municipal report intake.
// ──────────────────────────────────────────────────────────────

import { useAppStore } from '../../stores/app-store';
import type { OCRResult, EvidenceItem } from '../../types';

const mockDelay = (ms = 200): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class OCRService {
  /**
   * Processes document OCR text extraction and entity parsing.
   */
  static async processDocumentOCR(evidenceId: string): Promise<OCRResult> {
    await mockDelay(300);

    const store = useAppStore.getState();
    const item = store.evidenceList.find((e) => e.id === evidenceId);

    const result: OCRResult = {
      extractedText: item?.aiAnalysis?.ocrText ||
        `MUNICIPAL WATER & ROAD INFRASTRUCTURE INSPECTION REPORT\nDate: Aug 5, 2026\nLocation: Benz Circle Sector 4, Ward 12\nObservation: Cast-iron main 300mm pipe fatigue with active groundwater seepage.\nPriority: HIGH\nAssigned Department: Public Works Department`,
      language: 'en',
      confidence: 98.6,
      entities: [
        { key: 'Case Number', value: 'INTAKE-2026-0805' },
        { key: 'Location', value: 'Benz Circle Sector 4, Ward 12' },
        { key: 'Pipe Diameter', value: '300mm Cast-Iron' },
        { key: 'Priority Level', value: 'P1 CRITICAL' },
        { key: 'Inspecting Officer', value: 'Inspector M. R. Rao' },
      ],
    };

    store.logAuditEvent({
      event: 'OCR_PROCESSING_COMPLETED',
      actor: 'EarthMind OCR Engine',
      incidentId: item?.linkedIncidentId || 'UNLINKED',
      details: `Processed OCR document intake for ${item?.name || 'Inspection_Report.pdf'}. Confidence: ${result.confidence}%.`,
    });

    return result;
  }
}

export default OCRService;
