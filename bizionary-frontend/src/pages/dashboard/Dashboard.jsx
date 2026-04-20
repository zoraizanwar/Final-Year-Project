import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { formatPKR } from '../../utils/currency';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Wallet, Package, AlertTriangle, Receipt } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [data, setData] = useState({
        kpis: null,
        monthlyPerformance: [],
        dailyPerformance: [],
        recentSales: [],
        lowStock: []
    });

    useEffect(() => {
        const normalizeKpis = (raw = {}) => ({
            total_revenue: raw.total_revenue ?? 0,
            inventory_value: raw.total_inventory_value ?? 0,
            total_products: raw.total_products ?? 0,
            unpaid_invoices_count: raw.pending_company_payables ?? raw.unpaid_invoices ?? 0,
            low_stock_count: raw.low_stock_count ?? 0,
            total_invoices: raw.total_purchase_orders ?? raw.total_invoices ?? 0,
        });

        const fetchDashboardData = async () => {
            try {
                const [kpisRes, monthlyRes, salesRes, stockRes] = await Promise.allSettled([
                    api.get('dashboard/kpis/'),
                    api.get('dashboard/sales-performance/', {
                        params: { period: 'monthly' },
                    }),
                    api.get('dashboard/recent-sales/'),
                    api.get('dashboard/low-stock-products/')
                ]);

                const monthlyPerformance = monthlyRes.status === 'fulfilled' ? monthlyRes.value.data : [];
                const monthToDisplay = selectedMonth || monthlyPerformance[monthlyPerformance.length - 1]?.period || '';

                if (!selectedMonth && monthToDisplay) {
                    setSelectedMonth(monthToDisplay);
                }

                let dailyPerformance = [];
                if (/^\d{4}-\d{2}$/.test(monthToDisplay)) {
                    const [yearStr, monthStr] = monthToDisplay.split('-');
                    const year = Number(yearStr);
                    const month = Number(monthStr);
                    const from = new Date(year, month - 1, 1).toISOString().split('T')[0];
                    const to = new Date(year, month, 0).toISOString().split('T')[0];

                    const dailyRes = await api.get('dashboard/sales-performance/', {
                        params: {
                            period: 'daily',
                            start_date: from,
                            end_date: to,
                        },
                    });
                    dailyPerformance = dailyRes.data || [];
                }

                setData({
                    kpis: {
                        ...normalizeKpis(kpisRes.status === 'fulfilled' ? kpisRes.value.data : {}),
                    },
                    monthlyPerformance,
                    dailyPerformance,
                    recentSales: salesRes.status === 'fulfilled' ? salesRes.value.data : [],
                    lowStock: stockRes.status === 'fulfilled' ? stockRes.value.data : []
                });

                if ([kpisRes, monthlyRes, salesRes, stockRes].some(r => r.status === 'rejected')) {
                    console.warn('Some dashboard endpoints failed; rendered available data only.');
                }
            } catch (error) {
                console.warn('Dashboard API calls failed, rendering empty state values.');

                setData({
                    kpis: {
                        total_revenue: 0,
                        inventory_value: 0,
                        total_products: 0,
                        unpaid_invoices_count: 0,
                        low_stock_count: 0,
                        total_invoices: 0,
                    },
                    monthlyPerformance: [],
                    dailyPerformance: [],
                    recentSales: [],
                    lowStock: []
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();

        // Keep dashboard data in sync and recover automatically if backend starts later.
        const refreshTimer = setInterval(fetchDashboardData, 15000);
        return () => clearInterval(refreshTimer);
    }, [selectedMonth]);

    if (loading) {
        return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    }

    const { kpis, monthlyPerformance, dailyPerformance, recentSales, lowStock } = data;

    const latestRevenue = monthlyPerformance[monthlyPerformance.length - 1]?.revenue ?? 0;
    const selectedMonthLabel = selectedMonth || monthlyPerformance[monthlyPerformance.length - 1]?.period || 'N/A';

    const weekdayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekdayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekdayRevenue = dailyPerformance.reduce((acc, item) => {
        const date = new Date(item.period);
        if (Number.isNaN(date.getTime())) {
            return acc;
        }
        const key = weekdayMap[date.getDay()];
        acc[key] = (acc[key] || 0) + Number(item.revenue || 0);
        return acc;
    }, {});

    const weekdayStats = weekdayOrder.map((day) => ({
        day,
        revenue: weekdayRevenue[day] || 0,
    }));
    const maxWeekdayRevenue = Math.max(...weekdayStats.map((d) => d.revenue), 1);
    // Custom Tooltip for Area Chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#0e2140] p-3 rounded-lg border border-[#2d4f78] shadow-lg text-sm">
                    <p className="font-bold text-slate-100 mb-1">{label}</p>
                    <p className="font-semibold text-cyan-300">
                        {formatPKR(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    const handleMonthlyPointClick = (state) => {
        const monthKey = state?.activeLabel || state?.activePayload?.[0]?.payload?.period;
        if (!monthKey || !/^\d{4}-\d{2}$/.test(monthKey)) {
            return;
        }
        setSelectedMonth(monthKey);
    };

    return (
        <div className="space-y-8">
            {/* Header/Hero Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-textMain dark:text-slate-100">Business Overview</h1>
                    <p className="text-textMuted dark:text-slate-300 text-sm mt-1">Live business snapshot from your current ERP data.</p>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div onClick={() => navigate('/sales')} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group cursor-pointer hover:border-primary/30 transition-colors">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full"></div>
                    <p className="text-textMuted text-sm font-medium">Total Revenue</p>
                    <div className="flex flex-col items-start justify-between mt-3 gap-2">
                        <h3 className="text-2xl font-extrabold text-slate-900">{formatPKR(kpis.total_revenue)}</h3>
                        <span className="text-emerald-600 text-xs font-bold flex items-center justify-center bg-emerald-50 px-2 py-1 rounded-full w-max">
                            Latest month: {formatPKR(latestRevenue)}
                        </span>
                    </div>
                </div>

                <div onClick={() => navigate('/products')} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden cursor-pointer hover:border-primary/30 transition-colors">
                    <p className="text-textMuted text-sm font-medium">Inventory Value</p>
                    <div className="flex flex-col items-start justify-between mt-3 gap-2">
                        <h3 className="text-2xl font-extrabold text-slate-900">{formatPKR(kpis.inventory_value)}</h3>
                        <span className="text-amber-600 text-xs font-bold flex items-center justify-center bg-amber-50 px-2 py-1 rounded-full w-max">
                            <span className="material-symbols-outlined !text-xs mr-0.5">inventory</span>{kpis.total_products} Items
                        </span>
                    </div>
                </div>
            </div>

            {/* Middle Section: Styled Analytics Graphs */}
            <div className="grid grid-cols-1 gap-6">
                <div className="space-y-6">

                    {/* Graph 1: Monthly Selector */}
                    <div className="bg-gradient-to-br from-[#10284b] to-[#173961] p-6 rounded-2xl border border-[#2a4f78] shadow-xl text-slate-100">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h4 className="font-bold text-lg">Sales Performance</h4>
                                <p className="text-slate-300 text-xs">Monthly graph. Click any month to update daily graph below.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-cyan-300"></span>
                                    <span className="text-[10px] text-slate-300 font-bold">Revenue (Rs.)</span>
                                </div>
                                <span className="bg-[#0f2241] border border-[#2a4f78] rounded-lg text-xs font-bold py-1.5 px-3">
                                    {monthlyPerformance.length} Months
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
                            <div className="xl:col-span-3 min-h-[270px]">
                                <ResponsiveContainer width="100%" height={270}>
                                <BarChart data={monthlyPerformance} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} onClick={handleMonthlyPointClick}>
                                    <defs>
                                        <linearGradient id="monthlyBarGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#2fd3f6" />
                                            <stop offset="55%" stopColor="#7e63ff" />
                                            <stop offset="100%" stopColor="#f73ec8" />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#2d4f78" />
                                    <XAxis
                                        dataKey="period"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#b5cde8', fontSize: 10, fontWeight: 'bold' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#b5cde8', fontSize: 10, fontWeight: 'bold' }}
                                        tickFormatter={(val) => `Rs ${val / 1000}k`}
                                        orientation="left"
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="revenue"
                                        radius={[8, 8, 0, 0]}
                                        fill="url(#monthlyBarGradient)"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                            </div>

                            <div className="bg-[#0f2241] border border-[#2a4f78] rounded-xl p-4">
                                <p className="text-xs uppercase tracking-wide text-slate-300 font-bold mb-3">Selected Month</p>
                                <p className="text-xl font-extrabold text-cyan-300">{selectedMonthLabel}</p>
                                <p className="text-xs text-slate-300 mt-2">Month Revenue</p>
                                <p className="text-lg font-bold text-white">
                                    {formatPKR(monthlyPerformance.find((m) => m.period === selectedMonthLabel)?.revenue || 0)}
                                </p>

                                <div className="mt-4 pt-4 border-t border-[#2a4f78]">
                                    <p className="text-xs text-slate-300">Latest Month</p>
                                    <p className="text-sm font-bold text-white">{formatPKR(latestRevenue)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Graph 2: Daily Detail */}
                    <div className="bg-gradient-to-br from-[#12294a] to-[#1b3d66] p-6 rounded-2xl border border-[#2a4f78] shadow-xl text-slate-100">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h4 className="font-bold text-lg">Daily Sales Details</h4>
                                <p className="text-slate-300 text-xs">For {selectedMonthLabel}. Showing full daily data for the month.</p>
                            </div>
                            <span className="bg-[#0f2241] border border-[#2a4f78] rounded-lg text-xs font-bold py-1.5 px-3">
                                {dailyPerformance.length} Days
                            </span>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
                            <div className="xl:col-span-3 min-h-[270px]">
                            <ResponsiveContainer width="100%" height={270}>
                                <AreaChart data={dailyPerformance} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenueDaily" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2fd3f6" stopOpacity={0.32} />
                                            <stop offset="95%" stopColor="#2fd3f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#2d4f78" />
                                    <XAxis
                                        dataKey="period"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#b5cde8', fontSize: 10, fontWeight: 'bold' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#b5cde8', fontSize: 10, fontWeight: 'bold' }}
                                        tickFormatter={(val) => `Rs ${val / 1000}k`}
                                        orientation="left"
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#2fd3f6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorRevenueDaily)"
                                        activeDot={{ r: 6, fill: '#2fd3f6', stroke: '#fff', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                            </div>

                            <div className="bg-[#0f2241] border border-[#2a4f78] rounded-xl p-4">
                                <p className="text-xs uppercase tracking-wide text-slate-300 font-bold mb-3">Weekday Revenue Mix</p>
                                <div className="space-y-2.5">
                                    {weekdayStats.map((row) => (
                                        <div key={row.day}>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-200 font-semibold">{row.day}</span>
                                                <span className="text-cyan-300 font-bold">{formatPKR(row.revenue)}</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-[#25466e] mt-1 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-[#7e63ff] to-[#2fd3f6]"
                                                    style={{ width: `${Math.max(4, (row.revenue / maxWeekdayRevenue) * 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom 3 Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Cash Flow */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center gap-3 justify-between mb-4">
                        <h4 className="font-bold text-lg">Cash Flow Overview</h4>
                        <Wallet className="w-5 h-5 text-textMuted" />
                    </div>

                    <div className="space-y-4 flex-1">
                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex justify-between items-center text-xs font-bold w-full">
                                <span className="text-textMuted text-left">Inflow (Current Month)</span>
                                <span className="text-emerald-600 text-right">{formatPKR(latestRevenue)}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, latestRevenue > 0 ? 70 : 0)}%` }}></div>
                            </div>
                        </div>

                        <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
                            <p className="text-xs text-textMuted font-medium">Latest Month Revenue</p>
                            <p className="text-xl font-extrabold text-primary pt-1">{formatPKR(latestRevenue)}</p>
                            <p className="text-[10px] text-emerald-600 font-bold mt-1">Based on latest monthly revenue data</p>
                        </div>
                    </div>

                    <button 
                        onClick={() => navigate('/accounts')}
                        className="mt-6 w-full py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md hover:bg-slate-200"
                    >
                        Manage Accounts
                    </button>
                </div>

                {/* Inventory Summary */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm lg:col-span-1">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="font-bold text-lg">Inventory Summary</h4>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                <span className="text-[10px] text-textMuted font-medium uppercase">Low</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {lowStock.length === 0 && (
                            <div className="p-4 border border-dashed border-gray-200 rounded-lg text-center text-sm text-textMuted">
                                No inventory items available yet.
                            </div>
                        )}
                        {lowStock.map((item, idx) => (
                            <div key={idx} className="flex flex-col gap-3 p-3 border border-gray-100 rounded-lg sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 bg-primary/10 rounded flex flex-shrink-0 items-center justify-center text-primary">
                                        {item.isReorder ? <AlertTriangle className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold truncate">{item.product_name}</p>
                                        <p className="text-[10px] text-textMuted">{item.stock_quantity} Units • {item.product_code || item.sku}</p>
                                    </div>
                                </div>
                                <div className="text-left sm:text-right flex-shrink-0 sm:ml-2 min-w-0">
                                    {item.isReorder ? (
                                        <span className="text-[10px] font-bold text-rose-500 whitespace-nowrap">Reorder</span>
                                    ) : (
                                        <p className="text-sm font-bold text-black break-words sm:break-normal sm:whitespace-nowrap">{formatPKR(item.inventory_value)}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-lg">Recent Activities</h4>
                        <button onClick={() => navigate('/invoices')} className="text-primary text-xs font-bold hover:underline">View All</button>
                    </div>

                    <div className="space-y-4">
                        {recentSales.map((sale, idx) => (
                            <div key={idx} className={`flex items-center justify-between border-b border-slate-50 pb-2 ${idx === recentSales.length - 1 ? 'border-b-0 pb-0' : ''}`}>
                                <div className="flex items-center gap-3">
                                    <Receipt className="w-5 h-5 text-primary flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold truncate">Sale #{sale.sale_id} - {sale.customer_name}</p>
                                        <p className="text-[10px] text-textMuted">{sale.sale_date}</p>
                                    </div>
                                </div>
                                <p className="text-sm font-bold flex-shrink-0 ml-2 whitespace-nowrap text-black">
                                    {formatPKR(sale.total_price)}
                                </p>
                            </div>
                        ))}
                        {recentSales.length === 0 && (
                            <div className="text-sm text-textMuted">No recent sales found.</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
