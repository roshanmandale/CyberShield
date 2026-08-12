import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, FileText, Trash2 } from 'lucide-react';

const ComplaintsList = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const { data } = await api.get('/complaints');
                setComplaints(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchComplaints();
    }, []);

    const handleDelete = async (e, id) => {
        e.preventDefault(); // Prevent navigating to generic Link 
        if (!window.confirm('Are you certain you wish to delete this complaint permanently?')) return;

        try {
            await api.delete(`/complaints/${id}`);
            setComplaints(prev => prev.filter(c => c._id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Encountered error while deleting');
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">My Complaints</h1>

            {loading ? (
                <div className="text-center text-slate-500 py-10">Loading...</div>
            ) : complaints.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-200">
                    <p className="text-slate-500 mb-4">You have not created any complaints yet.</p>
                    <Link to="/complaint/new" className="text-blue-600 hover:underline font-medium">Create a new complaint</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {complaints.map(comp => (
                        <Link key={comp._id} to={`/complaint/${comp._id}`} className="block bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition p-6 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <span className="font-mono text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                                    {comp.complaintId}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${comp.status === 'Draft' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                                    {comp.status}
                                </span>
                            </div>

                            <h3 className="font-semibold text-lg text-slate-900 mb-2 truncate" title={comp.crimeType}>{comp.crimeType}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-grow">
                                {comp.originalDescription}
                            </p>

                            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 mt-auto">
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(comp.createdAt).toLocaleDateString()}</span>
                                <div className="flex items-center space-x-3">
                                    <button onClick={(e) => handleDelete(e, comp._id)} className="text-red-500 hover:text-red-600 transition flex items-center p-1 rounded hover:bg-red-50" title="Delete Complaint"><Trash2 className="w-4 h-4" /></button>
                                    <span className="flex items-center text-blue-500 font-medium hover:underline">View<ChevronRight className="w-3 h-3 ml-0.5" /></span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ComplaintsList;
