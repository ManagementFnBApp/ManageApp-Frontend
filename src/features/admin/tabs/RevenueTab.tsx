"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  getSubscriptionReport,
  type SubscriptionReportByDate,
} from "@/apis/adminApi";

const now = new Date();
const CURRENT_YEAR = now.getFullYear();
const CURRENT_MONTH = now.getMonth() + 1;

const yearOptions = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);
const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const shortCurrencyFormatter = (value: number): string => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
  return String(value);
};

function toDateLabel(dateIso: string): string {
  const d = new Date(dateIso);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

type ChartRow = SubscriptionReportByDate & { dateLabel: string; shortDate: string };

const CHART_VIEWS = [
  { key: "area", label: "Biểu đồ vùng" },
  { key: "bar", label: "Biểu đồ cột" },
  { key: "line", label: "Biểu đồ đường" },
] as const;

type ChartView = (typeof CHART_VIEWS)[number]["key"];

export function RevenueTab() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numberOfPayments, setNumberOfPayments] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [rows, setRows] = useState<ChartRow[]>([]);
  const [chartView, setChartView] = useState<ChartView>("area");

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSubscriptionReport(year, month);
      setNumberOfPayments(data.numberOfPayments);
      setTotalAmount(data.totalAmount);
      const sorted = [...data.reportByDate].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setRows(
        sorted.map((item) => ({
          ...item,
          dateLabel: toDateLabel(item.date),
          shortDate: toDateLabel(item.date),
        }))
      );
    } catch (err: unknown) {
      setRows([]);
      setNumberOfPayments(0);
      setTotalAmount(0);
      setError(err instanceof Error ? err.message : "Không thể tải báo cáo.");
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const avgDaily = useMemo(() => {
    const activeDays = rows.filter((r) => r.totalAmount > 0).length;
    return activeDays > 0 ? totalAmount / activeDays : 0;
  }, [rows, totalAmount]);

  const peakDay = useMemo(
    () => rows.reduce<ChartRow | null>((max, r) => (!max || r.totalAmount > max.totalAmount ? r : max), null),
    [rows]
  );

  const chartData = rows;

  const tooltipStyle = {
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  };

  return (
    <div className="space-y-6">
      {/* Header + Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Báo cáo doanh thu Subscription</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Thống kê doanh thu từ các thanh toán gói subscription theo tháng
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 font-medium">Năm</span>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 font-medium">Tháng</span>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            >
              {monthOptions.map((m) => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-transparent select-none">.</span>
            <button
              onClick={fetchReport}
              disabled={loading}
              className="h-9 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-95 transition disabled:opacity-60 flex items-center gap-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>↻</span>
              )}
              Tải báo cáo
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5">
          <p className="text-xs font-medium text-gray-500">Tổng doanh thu</p>
          <p className="mt-1.5 text-2xl font-bold text-emerald-700">
            {loading ? "—" : currencyFormatter.format(totalAmount)}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Tháng {month}/{year}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5">
          <p className="text-xs font-medium text-gray-500">Tổng thanh toán</p>
          <p className="mt-1.5 text-2xl font-bold text-blue-700">
            {loading ? "—" : numberOfPayments}
          </p>
          <p className="mt-1 text-xs text-gray-400">Giao dịch thành công</p>
        </div>

        <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-5">
          <p className="text-xs font-medium text-gray-500">TB / ngày có doanh thu</p>
          <p className="mt-1.5 text-2xl font-bold text-violet-700">
            {loading ? "—" : currencyFormatter.format(avgDaily)}
          </p>
          <p className="mt-1 text-xs text-gray-400">Trung bình mỗi ngày hoạt động</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5">
          <p className="text-xs font-medium text-gray-500">Ngày cao nhất</p>
          <p className="mt-1.5 text-2xl font-bold text-amber-700">
            {loading || !peakDay ? "—" : peakDay.dateLabel}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {!loading && peakDay ? currencyFormatter.format(peakDay.totalAmount) : ""}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">
            Doanh thu theo ngày — Tháng {month}/{year}
          </h3>
          <div className="flex gap-1 rounded-lg border border-gray-200 p-0.5 bg-gray-50 w-fit">
            {CHART_VIEWS.map((v) => (
              <button
                key={v.key}
                onClick={() => setChartView(v.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  chartView === v.key
                    ? "bg-white shadow-sm text-blue-600 border border-blue-100"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="h-72 flex items-center justify-center text-gray-400 text-sm">
            <span className="inline-block w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mr-2" />
            Đang tải...
          </div>
        ) : rows.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center text-gray-400 gap-2">
            <span className="text-4xl">📊</span>
            <p className="text-sm">Không có dữ liệu trong tháng {month}/{year}</p>
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === "bar" ? (
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="shortDate" stroke="#94a3b8" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={shortCurrencyFormatter} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v) => [currencyFormatter.format(Number(v)), "Doanh thu"]}
                    labelFormatter={(l) => `Ngày ${l}`}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="totalAmount" name="Doanh thu" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : chartView === "line" ? (
                <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="shortDate" stroke="#94a3b8" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={shortCurrencyFormatter} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v) => [currencyFormatter.format(Number(v)), "Doanh thu"]}
                    labelFormatter={(l) => `Ngày ${l}`}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="totalAmount" name="Doanh thu" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: "#10b981" }} activeDot={{ r: 5 }} />
                </LineChart>
              ) : (
                <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="shortDate" stroke="#94a3b8" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={shortCurrencyFormatter} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v) => [currencyFormatter.format(Number(v)), "Doanh thu"]}
                    labelFormatter={(l) => `Ngày ${l}`}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="totalAmount" name="Doanh thu" stroke="#10b981" strokeWidth={2.5} fill="url(#revenueGrad)" dot={{ r: 3, fill: "#10b981" }} activeDot={{ r: 5 }} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Second chart: number of payments */}
      {!loading && rows.some((r) => r.numberOfPayments > 0) && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Số giao dịch theo ngày — Tháng {month}/{year}
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="shortDate" stroke="#94a3b8" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => [v, "Số giao dịch"]}
                  labelFormatter={(l) => `Ngày ${l}`}
                />
                <Bar dataKey="numberOfPayments" name="Số giao dịch" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detail table */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Chi tiết theo ngày</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ngày</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Số giao dịch</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Doanh thu</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">% tổng</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-gray-400">
                    <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mr-2" />
                    Đang tải...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-gray-400">
                    Không có dữ liệu trong tháng {month}/{year}
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const pct = totalAmount > 0 ? (row.totalAmount / totalAmount) * 100 : 0;
                  const isActive = row.totalAmount > 0;
                  return (
                    <tr
                      key={row.date}
                      className={`border-b border-gray-100 last:border-none transition-colors ${
                        isActive ? "hover:bg-emerald-50/50" : "opacity-50"
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-700 font-medium">{row.dateLabel}</td>
                      <td className="px-4 py-3 text-center">
                        {row.numberOfPayments > 0 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                            {row.numberOfPayments}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                        {row.totalAmount > 0 ? currencyFormatter.format(row.totalAmount) : (
                          <span className="text-gray-300 font-normal">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {pct > 0 ? (
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-10 text-right">
                              {pct.toFixed(1)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {!loading && rows.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td className="px-4 py-3 text-sm font-bold text-gray-700">Tổng cộng</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold">
                      {numberOfPayments}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-700 text-base">
                    {currencyFormatter.format(totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-gray-400">100%</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
