import React, { useState, useEffect } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { Save, Building, Phone, FileText, MapPin, Database, Key } from 'lucide-react';

const Settings = () => {
    const { settings, setSettings } = usePharmacy();
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        license: '',
        invoiceNotes: ''
    });

    useEffect(() => {
        if (settings) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData(prev => {
                if (JSON.stringify(prev) !== JSON.stringify(settings)) {
                    return settings;
                }
                return prev;
            });
        }
    }, [settings]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSettings(formData);
        alert('Settings saved successfully!');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500">Configure your pharmacy details.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 max-w-2xl">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <Building size={16} />
                            Pharmacy Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Al-Shifa Pharmacy"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <MapPin size={16} />
                            Address
                        </label>
                        <textarea
                            rows="3"
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. 123 Main Street, Lahore"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <Phone size={16} />
                                Phone Number
                            </label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. 0300-1234567"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <FileText size={16} />
                                License Number
                            </label>
                            <input
                                type="text"
                                value={formData.license}
                                onChange={e => setFormData({ ...formData, license: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. L-123456"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <FileText size={16} />
                            Invoice Notes
                        </label>
                        <textarea
                            rows="2"
                            value={formData.invoiceNotes || ''}
                            onChange={e => setFormData({ ...formData, invoiceNotes: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Thank you for your business!"
                        />
                        <p className="text-xs text-gray-500 mt-1">This message will appear on all invoices</p>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                            Database Configuration
                        </h2>

                        {/* Status Indicator */}
                        <div className="mb-6">
                            {formData.dbUrl && formData.apiKey ? (
                                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm flex justify-between items-center">
                                    <div>
                                        <strong>Using Custom Database:</strong> You are connected to your own database.
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, dbUrl: '', apiKey: '' })}
                                        className="text-blue-700 underline hover:text-blue-900 text-xs"
                                    >
                                        Reset to Default
                                    </button>
                                </div>
                            ) : import.meta.env.VITE_SUPABASE_URL ? (
                                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                                    <strong>Using Default Database:</strong> Connected via secure environment variables.
                                </div>
                            ) : (
                                <div className="bg-gray-50 border border-gray-200 text-gray-600 px-4 py-3 rounded-lg text-sm">
                                    <strong>Offline Mode:</strong> Using local storage. Enter database details below to connect.
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <Database size={16} />
                                    Database URL (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.dbUrl || ''}
                                    onChange={e => setFormData({ ...formData, dbUrl: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={import.meta.env.VITE_SUPABASE_URL ? "Using Default URL (Enter to override)" : "e.g. https://your-project.supabase.co"}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {import.meta.env.VITE_SUPABASE_URL ? "Leave empty to use the default secure database." : "Leave empty to use local storage."}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <Key size={16} />
                                    API Key (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.apiKey || ''}
                                    onChange={e => setFormData({ ...formData, apiKey: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={import.meta.env.VITE_SUPABASE_URL ? "Using Default Key (Enter to override)" : "e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
                                />
                                <p className="text-xs text-gray-500 mt-1">Required if Database URL is provided.</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Save size={20} />
                            Save Settings
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
