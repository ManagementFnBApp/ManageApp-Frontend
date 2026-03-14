"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Coins, FileText, Loader2, RefreshCw } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getOrderReport, type OrderReportByDate } from "@/apis/orderApi";
import { getStoredRoleNormalized } from "@/apis/auth";
import { Button } from "@/components/ui/button";

type ReportRow = {
  date: string;
  dateLabel: string;
  numberOfOrders: number;
  totalAmount: number;
};

const now = new Date();
const CURRENT_YEAR = now.getFullYear();
const CURRENT_MONTH = now.getMonth() + 1;

const yearOptions = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);
const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function toReadableDate(dateIso: string): string {
  const date = new Date(dateIso);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function mapAndSortRows(reportByDate: OrderReportByDate[]): ReportRow[] {
  return [...reportByDate]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((item) => ({
      date: item.date,
      dateLabel: toReadableDate(item.date),
      numberOfOrders: item.numberOfOrders,
      totalAmount: item.totalAmount,
    }));
}

export default function ManagerReportPage() {
  const router = useRouter();
  const [canAccess, setCanAccess] = useState<boolean | null>(null);
  const [year, setYear] = useState<number>(CURRENT_YEAR);
  const [month, setMonth] = useState<number>(CURRENT_MONTH);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [numberOfOrders, setNumberOfOrders] = useState(0);

  useEffect(() => {
    const isStaff = getStoredRoleNormalized() === "STAFF";
    setCanAccess(!isStaff);
    if (isStaff) {
      router.replace("/manager");
    }
  }, [router]);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrderReport(year, month);
      setNumberOfOrders(data?.numberOfOrders ?? 0);
      setRows(mapAndSortRows(data?.reportByDate ?? []));
    } catch (err: unknown) {
      setRows([]);
      setNumberOfOrders(0);
      setError(
        err instanceof Error ? err.message : "Failed to generate report.",
      );
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    if (canAccess) {
      fetchReport();
    }
  }, [canAccess, fetchReport]);

  if (canAccess === false) {
    return null;
  }

  const totalRevenue = useMemo(
    () => rows.reduce((sum, row) => sum + row.totalAmount, 0),
    [rows],
  );

  const chartData = useMemo(
    () => rows.map((row) => ({ ...row, shortDate: row.dateLabel.slice(0, 5) })),
    [rows],
  );

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-100 via-slate-50 to-white p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Monthly Order Report
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                View daily order and revenue performance by month.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 md:w-auto">
              <label className="flex flex-col gap-1.5 text-sm text-slate-600">
                <span className="font-medium">Select Year</span>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-sm text-slate-600">
                <span className="font-medium">Select Month</span>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500"
                >
                  {monthOptions.map((m) => (
                    <option key={m} value={m}>
                      Month {m}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={fetchReport}
                  disabled={loading}
                  className="h-10 w-full bg-slate-900 text-white hover:bg-slate-800"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Orders
                </p>
                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {numberOfOrders}
                </p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Revenue
                </p>
                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {currencyFormatter.format(totalRevenue)}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <Coins className="h-5 w-5" />
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <div className="mb-4 flex items-center gap-2 text-slate-700">
              <FileText className="h-4 w-4" />
              <h2 className="text-sm font-semibold md:text-base">
                Revenue per day
              </h2>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="105%">
                <LineChart
                  data={chartData}
                  margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="shortDate"
                    stroke="#64748b"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) =>
                      String(Math.round(Number(v) / 1000)) + "k"
                    }
                  />
                  <Tooltip
                    formatter={(value) => [
                      currencyFormatter.format(Number(value)),
                      "Revenue",
                    ]}
                    labelFormatter={(label) => "Date: " + label}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalAmount"
                    name="Revenue"
                    stroke="#059669"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-700 md:text-base">
            Report Details
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-3 py-2.5 font-medium">Date</th>
                  <th className="px-3 py-2.5 font-medium">Number of Orders</th>
                  <th className="px-3 py-2.5 font-medium">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && !loading ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-8 text-center text-slate-400"
                    >
                      No data available for selected month.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr
                      key={row.date}
                      className="border-b border-slate-100 last:border-none"
                    >
                      <td className="px-3 py-3 text-slate-700">
                        {row.dateLabel}
                      </td>
                      <td className="px-3 py-3 font-medium text-slate-900">
                        {row.numberOfOrders}
                      </td>
                      <td className="px-3 py-3 font-semibold text-emerald-700">
                        {currencyFormatter.format(row.totalAmount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
