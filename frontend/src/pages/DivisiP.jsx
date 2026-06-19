// src/pages/DivisiP.jsx
import { useState, useEffect } from "react";
import api from "../utils/api";
import Skeleton from "../components/Skeleton";
import { ClipboardList, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { io } from "socket.io-client";

export default function DivisiP() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlannerData = async () => {
      try {
        const response = await api.get("/divisi-p");
        setData(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Gagal mengambil data Divisi P:", error);
        setIsLoading(false);
      }
    };
    fetchPlannerData();

    const socket = io("http://localhost:3000");

    socket.on("updateDataPlanner", (dataTerbaru) => {
      console.log("⚡ [Real-Time] Data baru masuk!", dataTerbaru);
      setData(dataTerbaru);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Dashboard Planner (Divisi P)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Tarik data mentahnya saja
  const { dataLogs } = data;
  const totalWorkOrder = dataLogs.length;

  
  // Kita pastikan menghapus spasi ekstra (trim) agar kebal dari salah ketik spasi di Firebase
  const siapEksekusi = dataLogs.filter(
    (log) => log.status.trim() === "Ready to Execute",
  ).length;
  const menungguSparepart = dataLogs.filter(
    (log) => log.status.trim() === "Waiting Sparepart",
  ).length;
  const tertunda = dataLogs.filter(
    (log) => log.status.trim() === "Delayed",
  ).length;

  const persentaseKesiapan =
    totalWorkOrder > 0
      ? Math.round((siapEksekusi / totalWorkOrder) * 100) + "%"
      : "0%";

  // Mesin Agregasi Data untuk Grafik
  const woPerArea = dataLogs.reduce((acc, log) => {
    const area = acc.find((item) => item.name === log.area);
    if (area) area.jumlah += 1;
    else acc.push({ name: log.area, jumlah: 1 });
    return acc;
  }, []);

  const kategoriWO = dataLogs.reduce((acc, log) => {
    const kategori = acc.find((item) => item.name === log.kategori);
    if (kategori) kategori.value += 1;
    else acc.push({ name: log.kategori, value: 1 });
    return acc;
  }, []);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Dashboard Planner (Divisi P)
        </h2>
        <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-500">
          Kesiapan Pabrik: {persentaseKesiapan}
        </span>
      </div>

      {/* Kartu Analitik Planner (Sekarang Menggunakan Variabel Frontend) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardList className="text-gray-500" size={24} />
            <p className="text-sm font-medium text-gray-500">
              Total Work Order
            </p>
          </div>
          <h3 className="text-3xl font-bold text-gray-800">{totalWorkOrder}</h3>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center border-b-4 border-b-green-500 transition-all duration-500">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-green-500" size={24} />
            <p className="text-sm font-medium text-gray-500">Siap Eksekusi</p>
          </div>
          <h3 className="text-3xl font-bold text-gray-800">{siapEksekusi}</h3>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center border-b-4 border-b-orange-500 transition-all duration-500">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-orange-500" size={24} />
            <p className="text-sm font-medium text-gray-500">
              Menunggu Sparepart
            </p>
          </div>
          <h3 className="text-3xl font-bold text-gray-800">
            {menungguSparepart}
          </h3>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center border-b-4 border-b-red-500 transition-all duration-500">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="text-red-500" size={24} />
            <p className="text-sm font-medium text-gray-500">
              Tertunda / Delayed
            </p>
          </div>
          <h3 className="text-3xl font-bold text-gray-800">{tertunda}</h3>
        </div>
      </div>

      {/* Area Visualisasi Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Sebaran Work Order per Area
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={1}
              minHeight={1}
            >
              <BarChart
                data={woPerArea}
                margin={{ top: 5, right: 30, left: -20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <RechartsTooltip
                  cursor={{ fill: "#F3F4F6" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="jumlah"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Rasio Kategori Pekerjaan
          </h3>
          <div className="h-72 w-full flex justify-center items-center">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={1}
              minHeight={1}
            >
              <PieChart>
                <Pie
                  data={kategoriWO}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {kategoriWO.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Area Tabel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Daftar Work Order Terbaru
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">ID WO</th>
                <th className="px-4 py-3">Area Pabrik</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Status Sparepart</th>
                <th className="px-4 py-3">Status WO</th>
              </tr>
            </thead>
            <tbody>
              {dataLogs.map((log, index) => (
                <tr key={log.id || `log-${index}`} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {log.id}
                  </td>
                  <td className="px-4 py-3 font-bold text-blue-600">
                    {log.area}
                  </td>
                  <td className="px-4 py-3">{log.kategori || "Umum"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${log.status_sparepart === "Tersedia" ? "bg-green-100 text-green-700" : log.status_sparepart === "Indent" ? "bg-orange-100 text-orange-700" : log.status_sparepart === "Kosong" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}
                    >
                      {log.status_sparepart || "Belum Dicek"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{log.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
