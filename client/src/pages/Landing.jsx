import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, Lock, CheckCircle } from 'lucide-react';

const Landing = () => {
    return (
        <div className="flex flex-col items-center">
            {/* Hero Section */}
            <section className="w-full py-20 lg:py-32 flex flex-col items-center text-center px-4">
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 drop-shadow-sm">
                    Secure Your Digital <span className="text-blue-600">Identity</span>
                </h1>
                <p className="max-w-2xl text-lg md:text-xl text-slate-600 mb-10">
                    CyberShield is an intelligent, AI-powered platform designed to help you transform fragmented cyber crime incidents into formal, structured complaints effortlessly.
                </p>
                <div className="flex space-x-4">
                    <Link to="/register" className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
                        Get Started
                    </Link>
                    <Link to="/login" className="px-8 py-3 bg-white text-slate-800 border border-slate-300 font-semibold rounded-lg hover:bg-slate-50 transition shadow-sm">
                        Sign In
                    </Link>
                </div>
            </section>

            {/* Features */}
            <section className="w-full max-w-6xl mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center transform transition duration-300 hover:-translate-y-2 hover:shadow-md">
                    <div className="bg-blue-50 p-4 rounded-full mb-6">
                        <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-800">AI Complaint Drafts</h3>
                    <p className="text-slate-500">Describe your incident naturally in English, Hindi, or Marathi, and let our Gemini AI convert it into a formal legal draft.</p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center transform transition duration-300 hover:-translate-y-2 hover:shadow-md">
                    <div className="bg-indigo-50 p-4 rounded-full mb-6">
                        <Lock className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-800">Evidence Vault</h3>
                    <p className="text-slate-500">Securely upload digital evidence (images, PDFs) with cryptographic SHA-256 hashing to guarantee file integrity.</p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center transform transition duration-300 hover:-translate-y-2 hover:shadow-md">
                    <div className="bg-green-50 p-4 rounded-full mb-6">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-800">Instant Reports</h3>
                    <p className="text-slate-500">Generate and download comprehensive PDF reports containing your AI drafts and evidence manifest in seconds.</p>
                </div>
            </section>

            {/* Notice */}
            <section className="mt-20 mb-10 max-w-4xl px-4 text-center">
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-xl text-sm font-medium shadow-sm">
                    Disclaimer: This system is an academic project demonstrator. The AI generated drafts do NOT constitute a legally binding First Information Report (FIR) and should be manually submitted to local authorities.
                </div>
            </section>
        </div>
    );
};

export default Landing;
