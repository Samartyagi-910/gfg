import {
    BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, PieChart, Pie, Cell, Legend, ResponsiveContainer
} from "recharts";

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '12px',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '0.85rem'
            }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
                {payload.map((p, idx) => (
                    <p key={idx} style={{ margin: 0, color: p.color || p.fill }}>
                        {p.name}: {p.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function ChartRenderer({ data, chart }) {
    if (!chart || !data) return null;

    const renderChart = () => {
        if (chart.type === "bar") {
            return (
                <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <XAxis dataKey={chart.x} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey={chart.y} fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                    <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                    </defs>
                </BarChart>
            );
        }

        if (chart.type === "line") {
            return (
                <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <XAxis dataKey={chart.x} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                        type="monotone" 
                        dataKey={chart.y} 
                        stroke="#6366f1" 
                        strokeWidth={4} 
                        dot={{ r: 6, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
                        activeDot={{ r: 8 }}
                    />
                </LineChart>
            );
        }

        if (chart.type === "pie") {
            return (
                <PieChart>
                    <Pie
                        data={data}
                        dataKey={chart.y}
                        nameKey={chart.x}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        fill="#8884d8"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            );
        }
        return null;
    };

    return (
        <div style={{ width: "100%", height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
}