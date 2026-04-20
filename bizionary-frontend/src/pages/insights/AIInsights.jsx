import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Package, AlertCircle, Zap, Brain } from 'lucide-react';
import { insightsApi } from '../../services/insightsApi';

const AIInsights = () => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchInsights = async (showLoader = false) => {
        try {
            if (showLoader) {
                setLoading(true);
            }
            const response = await insightsApi.getLiveInsights();
            const insightsData = response.data?.data;

            if (!insightsData) {
                throw new Error('No data returned from API');
            }

            setInsights(insightsData);
            setError('');
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message || 'Failed to load insights';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isAlive = true;

        const runFetch = async (showLoader = false) => {
            if (!isAlive) return;
            await fetchInsights(showLoader);
        };

        const handleRecommendationUpdate = () => {
            runFetch(false);
        };

        runFetch(true);
        const intervalId = setInterval(() => runFetch(false), 60000);
        window.addEventListener('insightsRecommendationUpdated', handleRecommendationUpdate);

        return () => {
            isAlive = false;
            clearInterval(intervalId);
            window.removeEventListener('insightsRecommendationUpdated', handleRecommendationUpdate);
        };
    }, []);

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 animate-spin">
                        <Brain className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-lg font-semibold text-textMain">Analyzing your data...</p>
                    <p className="text-sm text-textMuted mt-1">AI is generating insights</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-3xl bg-red-50 p-8 border border-red-200">
                <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    <div>
                        <h3 className="font-semibold text-red-900">Error Loading Insights</h3>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setError('');
                        fetchInsights(true);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!insights) {
        return (
            <div className="rounded-3xl bg-yellow-50 p-8 border border-yellow-200">
                <p className="text-yellow-800">No insights data available yet.</p>
            </div>
        );
    }

    const hotProductsChartData = insights.hot_products?.map(p => ({
        name: p.product_name?.substring(0, 12),
        sales: p.total_sales,
        revenue: p.total_revenue,
    })) || [];

    const coldProductsChartData = insights.cold_products?.map(p => ({
        name: p.product_name?.substring(0, 12),
        sales: p.total_sales,
        revenue: p.total_revenue,
    })) || [];

    const restockingChartData = insights.restocking_needed?.map(p => ({
        name: p.product_name?.substring(0, 12),
        current: p.stock_level,
        recommended: p.reorder_level,
    })) || [];

    const salesTrendData = insights.sales_trend || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="rounded-3xl bg-gradient-to-r from-primary/10 to-blue-500/10 p-8 border border-primary/20">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white">
                        <Brain className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-textMain">AI Insights Dashboard</h1>
                        <p className="text-textMuted mt-1">Powered by Advanced Analytics & AI</p>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-textMuted font-semibold">Total Revenue (30d)</p>
                            <p className="text-3xl font-bold text-primary mt-2">
                                ₨{(insights.total_revenue || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-textMuted font-semibold">Total Sales</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">{insights.total_sales || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <Zap className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-textMuted font-semibold">Avg Order Value</p>
                            <p className="text-3xl font-bold text-orange-600 mt-2">
                                ₨{(insights.average_order_value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Trend */}
                <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-textMain mb-4">Sales Trend (30 Days)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={salesTrendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                            <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Hot Selling Products */}
                <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-textMain mb-4">🔥 Hot Selling Products</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={hotProductsChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="sales" fill="#10B981" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cold Selling Products */}
                <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-textMain mb-4">❄️ Low Selling Products</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={coldProductsChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="sales" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Restocking Needed */}
                <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-textMain mb-4">⚠️ Products Needing Restocking</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={restockingChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="current" fill="#EF4444" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="recommended" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* AI Analysis */}
            <div className="rounded-3xl bg-gradient-to-br from-primary/5 via-blue-500/5 to-purple-500/5 p-8 border border-primary/20">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Brain className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-textMain mb-3">🤖 AI Recommendations</h3>
                        <p className="text-textMain leading-7 whitespace-pre-wrap">{insights.ai_insights}</p>
                    </div>
                </div>
            </div>

            {/* Product Details Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hot Products Table */}
                <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-textMain mb-4">Top Performers</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 text-textMuted font-semibold">Product</th>
                                    <th className="text-right py-3 text-textMuted font-semibold">Sales</th>
                                    <th className="text-right py-3 text-textMuted font-semibold">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {insights.hot_products?.map((product, idx) => (
                                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 text-textMain font-medium">{product.product_name}</td>
                                        <td className="text-right py-3 text-textMain">{product.total_sales}</td>
                                        <td className="text-right py-3 text-green-600 font-semibold">
                                            ₨{product.total_revenue?.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Restocking Table */}
                <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-textMain mb-4">Urgent: Low Stock</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 text-textMuted font-semibold">Product</th>
                                    <th className="text-center py-3 text-textMuted font-semibold">Current</th>
                                    <th className="text-center py-3 text-textMuted font-semibold">Min</th>
                                </tr>
                            </thead>
                            <tbody>
                                {insights.restocking_needed?.map((product, idx) => (
                                    <tr key={idx} className="border-b border-gray-100 hover:bg-red-50">
                                        <td className="py-3 text-textMain font-medium">{product.product_name}</td>
                                        <td className="text-center py-3 text-red-600 font-bold">{product.stock_level}</td>
                                        <td className="text-center py-3 text-textMuted">{product.reorder_level}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIInsights;
