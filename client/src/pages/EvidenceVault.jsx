import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Lock, Upload, Link as LinkIcon, ShieldAlert, CheckCircle, RefreshCw, ArrowLeft, Trash2 } from 'lucide-react';

const EvidenceVault = () => {
    const { id } = useParams();
    const [evidenceList, setEvidenceList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);

    // Verification State
    const [verifyFile, setVerifyFile] = useState(null);
    const [verifyResult, setVerifyResult] = useState(null);
    const [verifying, setVerifying] = useState(false);
    const [verifyId, setVerifyId] = useState(null);

    const fetchEvidence = async () => {
        try {
            const { data } = await api.get(`/evidence/${id}`);
            setEvidenceList(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvidence();
    }, [id]);

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!uploadFile) return;

        const formData = new FormData();
        formData.append('file', uploadFile);

        setUploading(true);
        try {
            await api.post(`/evidence/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUploadFile(null);
            await fetchEvidence(); // Refresh list
        } catch (err) {
            console.error(err);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleVerifySubmit = async (evId, fileObj) => {
        if (!fileObj) return;
        const formData = new FormData();
        formData.append('file', fileObj);

        setVerifyId(evId);
        setVerifying(true);
        setVerifyResult(null);

        try {
            const { data } = await api.post(`/evidence/verify/${evId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setVerifyResult({ id: evId, ...data });
        } catch (err) {
            console.error(err);
            setVerifyResult({ id: evId, error: 'Verification failed.' });
        } finally {
            setVerifying(false);
        }
    };

    const handleDeleteEvidence = async (evId) => {
        if (!window.confirm('Do you really want to permanently delete this evidence from the vault and cloud?')) return;
        try {
            await api.delete(`/evidence/${evId}`);
            setEvidenceList(prev => prev.filter(e => e._id !== evId));
        } catch (err) {
            console.error(err);
            alert('Failed to delete evidence');
        }
    }

    if (loading) return <div className="text-center py-20">Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto py-8">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-8">
                <Link to={`/complaint/${id}`} className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-50 transition border border-slate-200">
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Lock className="w-8 h-8 text-indigo-600" />
                        Evidence Vault
                    </h1>
                    <p className="text-slate-500 mt-1">Cryptographic secure storage mapped to your complaint.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Pane */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden sticky top-24">
                        <div className="p-5 border-b border-indigo-50 bg-indigo-50/30">
                            <h2 className="font-semibold text-slate-800 flex items-center">
                                <Upload className="w-5 h-5 mr-2 text-indigo-500" /> Upload New Evidence
                            </h2>
                        </div>
                        <form onSubmit={handleUploadSubmit} className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Select File (Image, PDF)</label>
                                <input
                                    type="file"
                                    onChange={(e) => setUploadFile(e.target.files[0])}
                                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={uploading || !uploadFile}
                                className="w-full mt-2 flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:bg-indigo-400 transition"
                            >
                                {uploading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                {uploading ? 'Processing & Hashing...' : 'Secure Upload'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Evidence List */}
                <div className="lg:col-span-2">
                    {evidenceList.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200">
                            <Lock className="w-12 h-12 text-slate-300 mb-4 mx-auto" />
                            <p className="text-slate-500">The vault is currently empty.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {evidenceList.map((ev, index) => (
                                <div key={ev._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-900">{ev.originalFileName}</h3>
                                                <p className="text-xs text-slate-500">{(ev.fileSize / 1024).toFixed(2)} KB • {ev.fileType}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <a href={ev.fileUrl} target="_blank" rel="noreferrer" className="flex items-center space-x-1 text-sm font-medium text-blue-600 hover:underline">
                                                    <LinkIcon className="w-4 h-4" /> <span>View Cloud File</span>
                                                </a>
                                                <button onClick={() => handleDeleteEvidence(ev._id)} className="flex items-center space-x-1 text-xs font-semibold text-red-500 hover:text-red-700 hover:underline bg-red-50 px-2 py-1 rounded">
                                                    <Trash2 className="w-3 h-3" /> <span>Delete</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between mb-4 mt-2">
                                            <div className="min-w-0 pr-4">
                                                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">SHA-256 System Hash</span>
                                                <p className="font-mono text-xs text-slate-800 truncate" title={ev.sha256Hash}>{ev.sha256Hash}</p>
                                            </div>
                                            <ShieldAlert className="w-6 h-6 text-indigo-400 flex-shrink-0" />
                                        </div>

                                        {/* Verification Panel */}
                                        <div className="mt-4 pt-4 border-t border-slate-100">
                                            <p className="text-sm font-medium text-slate-700 mb-2">Verify integrity against local copy</p>
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="file"
                                                    onChange={(e) => {
                                                        if (e.target.files[0]) handleVerifySubmit(ev._id, e.target.files[0]);
                                                    }}
                                                    className="flex-1 text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-600 hover:file:bg-slate-200"
                                                />
                                                {verifying && verifyId === ev._id && <RefreshCw className="w-4 h-4 text-slate-400 animate-spin" />}
                                            </div>

                                            {/* Result */}
                                            {verifyResult && verifyResult.id === ev._id && (
                                                <div className={`mt-4 p-3 rounded-xl border ${verifyResult.isValid ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        {verifyResult.isValid ? <CheckCircle className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                                                        <span className="font-bold text-sm tracking-wide uppercase">{verifyResult.isValid ? "Verified" : "Compromised"}</span>
                                                    </div>
                                                    <p className="text-xs opacity-90">{verifyResult.message}</p>
                                                    {!verifyResult.isValid && (
                                                        <p className="font-mono text-[10px] mt-2 opacity-75 truncate" title={verifyResult.currentHash}>Local Hash: {verifyResult.currentHash}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EvidenceVault;
