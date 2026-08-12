import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Sparkles, Save, Edit3, ArrowLeft } from 'lucide-react';

const CreateComplaint = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form Data
    const [formData, setFormData] = useState({
        crimeType: 'Online Financial Fraud',
        language: 'English',
        incidentDate: '',
        amount: '',
        originalDescription: '',
        generatedComplaint: ''
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGenerateAI = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/complaints/draft', {
                description: formData.originalDescription,
                language: formData.language,
                crimeType: formData.crimeType
            });

            const ai = res.data;
            const combinedString = `SUBJECT: ${ai.title}\n\nCRIME CLASSIFICATION: ${ai.crimeType}\n\nINCIDENT SUMMARY:\n${ai.incidentSummary}\n\nSUSPECTED METHOD:\n${ai.suspectedMethod}\n\nFINANCIAL LOSS:\n${ai.financialLoss}\n\nREQUESTED ACTION:\n${ai.requestedAction}\n\nFORMAL DRAFT:\n${ai.complaintDraft}`;

            setFormData({ ...formData, generatedComplaint: combinedString });
            setStep(2); // move to review step
        } catch (err) {
            setError(err.response?.data?.message || 'Error generating AI Draft');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveComplaint = async () => {
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/complaints', {
                ...formData,
                status: 'Draft' // Still a draft, can be edited later
            });
            navigate(`/complaint/${res.data._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving complaint');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            {/* Title */}
            <div className="flex items-center space-x-4 mb-8">
                <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-50 transition">
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <h1 className="text-3xl font-bold text-slate-900">Create New Complaint</h1>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100">
                    {error}
                </div>
            )}

            {step === 1 && (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                    <div className="flex items-center space-x-2 mb-6">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
                        <h2 className="text-xl font-semibold text-slate-800">Incident Details</h2>
                    </div>

                    <form onSubmit={handleGenerateAI} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Crime Type</label>
                                <select name="crimeType" value={formData.crimeType} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 outline-none">
                                    <option>Online Financial Fraud</option>
                                    <option>UPI Fraud</option>
                                    <option>Phishing</option>
                                    <option>Social Media Scam</option>
                                    <option>Account Hacking</option>
                                    <option>Cyber Bullying</option>
                                    <option>Identity Theft</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Draft Language</label>
                                <select name="language" value={formData.language} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 outline-none">
                                    <option>English</option>
                                    <option>Hindi</option>
                                    <option>Marathi</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Incident Date</label>
                                <input type="date" name="incidentDate" required value={formData.incidentDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 outline-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Amount Lost (INR) - If applicable</label>
                                <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Incident Description</label>
                            <p className="text-xs text-slate-500 mb-2">Describe what happened in your own words. It's perfectly fine to mix English, Hindi, or Marathi here. Our AI will fix the formatting and language for you.</p>
                            <textarea
                                name="originalDescription"
                                required
                                rows="6"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                placeholder="E.g., I received a message on WhatsApp claiming I won a lottery..."
                                value={formData.originalDescription}
                                onChange={handleInputChange}
                            ></textarea>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-500/30 disabled:opacity-70"
                            >
                                {loading ? <span>Generating Draft...</span> : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        <span>Generate AI Draft</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {step === 2 && (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">2</div>
                            <h2 className="text-xl font-semibold text-slate-800">Review AI Draft</h2>
                        </div>
                        <button onClick={() => setStep(1)} className="flex items-center text-sm text-slate-500 hover:text-blue-600 transition">
                            <Edit3 className="w-4 h-4 mr-1" /> Edit Original Info
                        </button>
                    </div>

                    <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100 mb-8">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Generated Complaint Draft</label>
                        <p className="text-xs text-slate-500 mb-4">Please review and edit the generated draft to ensure all facts are accurate before saving.</p>
                        <textarea
                            name="generatedComplaint"
                            rows="15"
                            className="w-full px-5 py-4 bg-white border border-indigo-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 outline-none resize-none font-serif leading-relaxed text-slate-800 shadow-inner"
                            value={formData.generatedComplaint}
                            onChange={handleInputChange}
                        ></textarea>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                            onClick={handleSaveComplaint}
                            disabled={loading}
                            className="flex items-center space-x-2 bg-blue-600 text-white font-medium px-8 py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 disabled:opacity-70"
                        >
                            {loading ? <span>Saving...</span> : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>Save Complaint Draft</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateComplaint;
