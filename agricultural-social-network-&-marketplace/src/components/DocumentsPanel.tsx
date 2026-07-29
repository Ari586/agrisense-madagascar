import React, { useState, useEffect } from 'react';
import { 
  FileText, ShieldCheck, ShieldAlert, UploadCloud, Plus, X, 
  Sparkles, RefreshCw, CheckSquare, AlertCircle, FileLock 
} from 'lucide-react';
import { TradeDocument, User } from '../types';

interface DocumentsPanelProps {
  currentUser: User | null;
}

export default function DocumentsPanel({ currentUser }: DocumentsPanelProps) {
  const [documents, setDocuments] = useState<TradeDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState<any>('Invoice');
  const [fileUrl, setFileUrl] = useState('');

  // AI auditor state
  const [auditingDoc, setAuditingDoc] = useState<TradeDocument | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditReport, setAuditReport] = useState<{
    readinessScore: number;
    status: string;
    missingClaus: string[];
    analysisText: string;
  } | null>(null);

  if (!currentUser) return null;

  const loadDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [currentUser]);

  const handleSubmitUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, docType, fileUrl })
      });
      const data = await res.json();
      setDocuments(prev => [...prev, data]);
      
      // Reset form
      setTitle('');
      setDocType('Invoice');
      setFileUrl('');
      setIsUploading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunAudit = async (doc: TradeDocument) => {
    setAuditingDoc(doc);
    setIsAuditing(true);
    setAuditReport(null);

    try {
      const res = await fetch('/api/ai/verify-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docTitle: doc.title, docType: doc.docType })
      });
      const data = await res.json();
      setAuditReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="w-full" id="documents-panel">
      
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 text-left">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-1.5">
            📁 Document Hub & AI Audits
          </h2>
          <p className="text-xs text-gray-500">
            Securely upload certificates of origin, phytosanitary permits, or invoices and pre-verify them for customs compliance.
          </p>
        </div>
        <button
          onClick={() => setIsUploading(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 transition-all text-xs font-bold text-white shadow-md shadow-red-100 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT: Documents List Archive */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider font-mono">
                Locked Certificate Archive ({documents.length})
              </span>
              <FileLock className="w-4 h-4 text-gray-400" />
            </div>

            {documents.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <FileText className="w-8 h-8 text-gray-300 mx-auto" />
                <h4 className="text-xs font-bold text-gray-700">No documents found</h4>
                <p className="text-[10px] text-gray-400">File invoices or certificates of origin to request compliance auditing.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 text-left">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50/40 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-800">{doc.title}</h4>
                        <span className="text-[9px] font-bold text-gray-400 font-mono block mt-0.5 uppercase">
                          TYPE: {doc.docType} · {doc.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRunAudit(doc)}
                        className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 font-black text-[10px] flex items-center gap-1 hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                        <span>AI Pre-Verify</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: AI Audit Report Results */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-gray-900 to-slate-900 rounded-2xl p-5 border border-slate-800 text-white shadow-xl h-full flex flex-col min-h-[350px]">
            <div className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-red-400 uppercase font-mono mb-4">
              <Sparkles className="w-4 h-4 animate-pulse text-red-400" />
              <span>Compliance Auditing Lab</span>
            </div>

            {isAuditing ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3.5">
                <RefreshCw className="w-9 h-9 text-red-500 animate-spin" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Running Regulatory Audit...</h4>
                  <p className="text-[10px] text-gray-400 mt-1">AI checking clauses for phytosanitary clearance, origin tracking, and invoice formulas against current WTO standards.</p>
                </div>
              </div>
            ) : auditReport ? (
              <div className="space-y-4 flex-1 text-left animate-in fade-in duration-300">
                
                {/* Gauge Readiness Score */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 block font-mono">READINESS SCORE</span>
                    <span className="text-3xl font-black text-rose-500">{auditReport.readinessScore}%</span>
                  </div>
                  <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-md tracking-wider ${
                    auditReport.status === 'passed' 
                      ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-400' 
                      : 'bg-amber-500/20 border border-amber-500 text-amber-400'
                  }`}>
                    {auditReport.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Audit Paragraph */}
                <div>
                  <span className="text-[9px] font-bold text-gray-400 block font-mono mb-1">ANALYSIS & FINDINGS</span>
                  <p className="text-[11px] text-gray-300 leading-relaxed font-medium">
                    {auditReport.analysisText}
                  </p>
                </div>

                {/* Missing clauses */}
                {auditReport.missingClaus.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <span className="text-[9px] font-bold text-rose-400 block font-mono uppercase">
                      ⚠️ Crucial Missing Compliance Points:
                    </span>
                    <ul className="space-y-1.5 pl-1">
                      {auditReport.missingClaus.map((clause, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[10px] text-gray-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                          <span>{clause}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-2">
                <UploadCloud className="w-10 h-10 text-slate-700" />
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Awaiting Document Audit</h4>
                <p className="text-[10px] text-slate-500">Click &quot;AI Pre-Verify&quot; next to any document file to check customs validity and detect missing clauses instantly.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ----------------- UPLOAD DOCUMENT DIALOG ----------------- */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-xs font-black text-gray-900 flex items-center gap-1.5 uppercase font-mono text-left">
                📁 File Trade Document
              </h3>
              <button onClick={() => setIsUploading(false)} className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitUpload} className="p-5 space-y-4 text-left">
              {/* Type selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase font-mono text-gray-400">Document Category:</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-750 focus:outline-hidden"
                >
                  <option value="Invoice">Invoices / Commercial Bills</option>
                  <option value="Organic Certificate">Organic Agricultural Certificates</option>
                  <option value="Import License">Import/Export Permits & Bonds</option>
                  <option value="Phytosanitary Certificate">Phytosanitary Inspection Certs</option>
                  <option value="Other">Other Declarations</option>
                </select>
              </div>

              {/* Title input */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase font-mono text-gray-400">Document Title/Name:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. EU commercial export invoice #2841"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-hidden"
                  required
                />
              </div>

              {/* URL or simulated path */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase font-mono text-gray-400">Draft Document URL (Simulated Link):</label>
                <input
                  type="text"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="e.g. https://example.com/drafts/invoice.pdf"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploading(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-xs font-bold text-white shadow-md shadow-red-100"
                >
                  File Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
