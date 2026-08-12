import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { FileText, Calendar, Lock, CheckCircle, Download, ArrowLeft } from 'lucide-react';

const ComplaintDetail = () => {
    const { id } = useParams();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const { data } = await api.get(`/complaints/${id}`);
                setComplaint(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const handleDownloadPDF = async () => {
        setDownloading(true);
        setErrorMsg('');
        try {
            const res = await api.get(`/reports/${id}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.setAttribute('download', `CyberShield-${complaint.complaintId}.pdf`);
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error('Download failed:', error);
            setErrorMsg('Failed to generate secure PDF Download.');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (!complaint) return <div className="text-center py-20">Complaint not found</div>;

    return (
        <div className="max-w-5xl mx-auto py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link to="/dashboard" className="p-1.5 bg-white rounded-full shadow-sm hover:bg-slate-50 transition border border-slate-200">
                            <ArrowLeft className="w-4 h-4 text-slate-600" />
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-900">{complaint.complaintId}</h1>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${complaint.status === 'Draft' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                            {complaint.status}
                        </span>
                    </div>
                    <p className="text-slate-500 ml-10 flex items-center gap-2"><Calendar className="w-4 h-4" /> Filed on: {new Date(complaint.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="flex flex-wrap gap-3 ml-10 md:ml-0">
                    <Link
                        to={`/complaint/${complaint._id}/evidence`}
                        className="flex items-center space-x-2 bg-white border border-slate-300 text-slate-700 font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition shadow-sm"
                    >
                        <Lock className="w-4 h-4 text-indigo-600" />
                        <span>Evidence Vault</span>
                    </Link>

                    <button
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        className="flex items-center space-x-2 bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-75"
                    >
                        <Download className="w-4 h-4" />
                        <span>{downloading ? 'Generating...' : 'Download PDF'}</span>
                    </button>
                    {errorMsg && <p className="text-xs text-red-500 mt-2 absolute">{errorMsg}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex items-center bg-slate-50 gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <h2 className="text-lg font-semibold text-slate-800">Final Complaint Draft</h2>
                        </div>
                        <div className="p-6 bg-slate-50/50">
                            <div className="whitespace-pre-wrap font-serif text-slate-800 leading-relaxed max-w-none text-[15px] p-6 bg-white border border-slate-200 rounded-xl shadow-inner min-h-[400px]">
                                {complaint.generatedComplaint || "Draft generation failed or not found."}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-md font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" />
                            Metadata
                        </h3>

                        <dl className="space-y-4 text-sm">
                            <div>
                                <dt className="text-slate-500 font-medium">Crime Type</dt>
                                <dd className="text-slate-900 font-semibold mt-1">{complaint.crimeType}</dd>
                            </div>
                            <div className="h-px bg-slate-100"></div>
                            <div>
                                <dt className="text-slate-500 font-medium">Incident Date</dt>
                                <dd className="text-slate-900 font-semibold mt-1">{new Date(complaint.incidentDate).toLocaleDateString()}</dd>
                            </div>
                            <div className="h-px bg-slate-100"></div>
                            <div>
                                <dt className="text-slate-500 font-medium">Amount Involved</dt>
                                <dd className="text-slate-900 font-semibold mt-1">₹ {complaint.amount}</dd>
                            </div>
                            <div className="h-px bg-slate-100"></div>
                            <div>
                                <dt className="text-slate-500 font-medium">Language Profile</dt>
                                <dd className="text-slate-900 font-semibold mt-1">{complaint.language}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-md font-semibold text-slate-800 mb-3">Original Description</h3>
                        <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100 italic">
                            "{complaint.originalDescription}"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplaintDetail;
