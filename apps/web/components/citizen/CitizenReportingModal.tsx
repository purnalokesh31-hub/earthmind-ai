'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Citizen Issue Reporting Modal Component
// Public Citizen Impact Intake with AI Advisory Classification
// ──────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CitizenReportingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type LocationSource = 'DEVICE_GPS' | 'EXIF' | 'MANUAL' | 'UNKNOWN';

export const CitizenReportingModal: React.FC<CitizenReportingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [category, setCategory] = useState('ROAD_DAMAGE');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('Ward 12, Benz Circle Junction');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [locationSource, setLocationSource] = useState<LocationSource>('UNKNOWN');
  const [locationStatus, setLocationStatus] = useState('No device location captured yet.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [analysisSummary, setAnalysisSummary] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  const resetAttachment = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setLatitude(null);
    setLongitude(null);
    setAccuracyMeters(null);
    setLocationSource('UNKNOWN');
    setLocationStatus('No device location captured yet.');
    setAnalysisSummary(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSubmitError(null);

    if (!file) {
      resetAttachment();
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setLatitude(null);
    setLongitude(null);
    setAccuracyMeters(null);
    setLocationSource('UNKNOWN');

    if (!navigator.geolocation) {
      setLocationStatus('Device location unavailable. Report can still be submitted.');
      return;
    }

    setLocationStatus('Capturing high-accuracy device location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setAccuracyMeters(position.coords.accuracy);
        setLocationSource('DEVICE_GPS');
        setLocationStatus(`Device GPS captured within ${Math.round(position.coords.accuracy)}m.`);
      },
      (error) => {
        setLatitude(null);
        setLongitude(null);
        setAccuracyMeters(null);
        setLocationSource('UNKNOWN');

        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus('Location permission denied. Report will be submitted without verified device coordinates.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationStatus('Device location unavailable. Report can still be submitted.');
        } else if (error.code === error.TIMEOUT) {
          setLocationStatus('Location request timed out. Report can still be submitted.');
        } else {
          setLocationStatus('Device location could not be captured. Report can still be submitted.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const evidenceIds: string[] = [];

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadRes = await fetch('/api/v1/evidence/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadJson = await uploadRes.json().catch(() => null);

        if (!uploadRes.ok || !uploadJson?.success || !uploadJson?.data?.evidenceId) {
          throw new Error(uploadJson?.error?.message || uploadJson?.error || 'Evidence photo upload failed.');
        }

        evidenceIds.push(uploadJson.data.evidenceId);

        const analyzeRes = await fetch('/api/v1/vision/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            evidenceId: uploadJson.data.evidenceId,
            modelTask: 'road_damage',
          }),
        });
        const analyzeJson = await analyzeRes.json().catch(() => null);

        if (!analyzeRes.ok || !analyzeJson?.success) {
          throw new Error(analyzeJson?.error?.message || analyzeJson?.error || 'Evidence photo analysis failed.');
        }

        const detectedCount = analyzeJson.data?.detectedObjectsCount ?? 0;
        const riskScore = analyzeJson.data?.riskAssessment?.riskScore;
        setAnalysisSummary(
          `Evidence analyzed: ${detectedCount} hazard object${detectedCount === 1 ? '' : 's'} detected${riskScore !== undefined ? `, risk score ${riskScore}/100` : ''}.`
        );
      }

      const res = await fetch('/api/v1/citizen/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          title,
          description,
          locationName,
          latitude: latitude ?? undefined,
          longitude: longitude ?? undefined,
          accuracyMeters: accuracyMeters ?? undefined,
          locationSource,
          evidenceIds,
        }),
      });
      const json = await res.json().catch(() => null);

      if (res.ok && json?.success) {
        setIsSubmitted(true);
        if (onSuccess) onSuccess();
      } else {
        throw new Error(json?.error?.message || json?.error || 'Report submission failed.');
      }
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'Report submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0B1528] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>📢 Citizen Public Impact Reporting Portal</span>
            </h2>
            <p className="text-xs text-slate-400">Report civic hazards directly to Municipal Emergency Command</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 text-lg">
            ✕
          </button>
        </div>

        {isSubmitted ? (
          <div className="text-center py-8 space-y-3">
            <div className="text-4xl">🎉</div>
            <h3 className="text-base font-bold text-emerald-400">Report Submitted Successfully</h3>
            <p className="text-xs text-slate-300">
              Your report has been logged and queued for AI advisory classification & Departmental Verification.
            </p>
            {analysisSummary && (
              <p className="text-xs text-cyan-300 font-semibold">
                {analysisSummary}
              </p>
            )}
            <button
              onClick={() => {
                setIsSubmitted(false);
                resetAttachment();
                onClose();
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {submitError && (
              <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
                {submitError}
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Issue Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#050B14] border border-slate-700 rounded-lg text-slate-200 font-medium text-xs focus:border-cyan-500"
              >
                <option value="ROAD_DAMAGE">Road Damage / Pothole</option>
                <option value="FLOODING">Flooding / Water Inundation</option>
                <option value="WATER_LEAKAGE">Water Pipeline Leakage</option>
                <option value="FIRE">Fire / Thermal Anomaly</option>
                <option value="GARBAGE">Garbage Overflow / Waste</option>
                <option value="ELECTRICITY">Electrical Pole / Transformer Spark</option>
                <option value="DRAINAGE">Drainage Blockage</option>
                <option value="PUBLIC_SAFETY">Public Safety Hazard</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Report Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Deep Pothole near School Junction"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#050B14] border border-slate-700 rounded-lg text-slate-200 text-xs focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Location Details</label>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-3 py-2 bg-[#050B14] border border-slate-700 rounded-lg text-slate-200 text-xs focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Detailed Description</label>
              <textarea
                rows={3}
                placeholder="Describe the issue, urgency, and any immediate safety hazards..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-[#050B14] border border-slate-700 rounded-lg text-slate-200 text-xs focus:border-cyan-500"
              />
            </div>

            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1">
              <span className="text-[11px] font-mono text-cyan-400 font-bold">📷 Evidence Attachment (Optional)</span>
              <p className="text-[11px] text-slate-400">Photos will be processed by SHA-256 Chain-of-Custody & AI Vision Engine.</p>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="block w-full text-slate-400 text-[11px] file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-cyan-600/20 file:text-cyan-300"
              />
              {previewUrl && (
                <div className="pt-2 space-y-2">
                  <img src={previewUrl} alt="Selected evidence preview" className="h-32 w-full object-cover rounded-lg border border-slate-700" />
                  <button
                    type="button"
                    onClick={resetAttachment}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded"
                  >
                    Clear Photo
                  </button>
                </div>
              )}
              <p className="text-[11px] text-slate-400">{locationStatus}</p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  resetAttachment();
                  onClose();
                }}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs shadow-md"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
