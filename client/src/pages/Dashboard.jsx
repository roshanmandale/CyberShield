import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { PlusCircle, FileText, Calendar, ChevronRight } from 'lucide-react';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({
        totalComplaints: 0,
        totalEvidence: 0,
        totalReports: 0,
        recentComplaints: []
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchStats = async () => {
            try {
                const { data } = await api.get('/complaints/stats');
                setStats(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user, navigate]);

    return (
        <div className="max-w-6xl mx-auto py-8">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 mt-1">Welcome back, {user?.name}</p>
                </div>
                <Link
                    to="/complaint/new"
                    className="flex items-center space-x-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-md"
                >
                    <PlusCircle className="w-5 h-5" />
                    <span>New Complaint</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center items-center">
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Complaints</p>
                    <p className="text-3xl font-bold text-slate-800">{stats.totalComplaints}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center items-center">
                    <p className="text-sm font-medium text-slate-500 mb-1">Evidence Files</p>
                    <p className="text-3xl font-bold text-slate-800">{stats.totalEvidence}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center items-center">
                    <p className="text-sm font-medium text-slate-500 mb-1">Reports Available</p>
                    <p className="text-3xl font-bold text-slate-800">{stats.totalReports}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-slate-400" />
                        Recent Activity
                    </h2>
                </div>

                <div className="p-0">
                    {loading ? (
                        <div className="p-10 text-center text-slate-500">Loading dash...</div>
                    ) : stats.recentComplaints.length === 0 ? (
                        <div className="p-16 text-center flex flex-col items-center">
                            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                                <FileText className="w-10 h-10 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 mb-2">No complaints yet</h3>
                            <p className="text-slate-500 mb-6 max-w-sm">Create your first cyber crime complaint draft using our AI assistant.</p>
                            <Link to="/complaint/new" className="text-blue-600 font-semibold hover:underline">Get Started &rarr;</Link>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {stats.recentComplaints.map(complaint => (
                                <li key={complaint._id} className="hover:bg-slate-50 transition">
                                    <Link to={`/complaint/${complaint._id}`} className="flex items-center justify-between p-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="font-semibold text-slate-900">{complaint.complaintId}</span>
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${complaint.status === 'Draft' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                                                    {complaint.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 mb-2">{complaint.crimeType}</p>
                                            <div className="flex items-center text-xs text-slate-400 gap-4">
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Incident: {new Date(complaint.incidentDate).toLocaleDateString()}</span>
                                                <span>Amount: ₹{complaint.amount}</span>
                                            </div>
                                        </div>
                                        <div className="text-slate-400">
                                            <ChevronRight className="w-6 h-6" />
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
