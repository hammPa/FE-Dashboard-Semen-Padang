// src/pages/DivisiIP.jsx
import { useState, useEffect } from "react";
import api from "../utils/api";
import Skeleton from "../components/Skeleton";
import {
  ClipboardList,
  AlertOctagon,
  Activity,
  CheckSquare,
} from "lucide-react";
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

export default function DivisiIP() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Tarikan awal saat halaman direfresh
    const fetchIPData = async () => {
      try {
        const response = await api.get("/divisi-ip");
        console.log({response});
        
        setData(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Gagal mengambil data Divisi IP:", error);
        setIsLoading(false);
      }
    };
    fetchIPData();

    // 2. Nyalakan Antena Penangkap Sinyal IP
    const socket = io("http://localhost:3000");

    socket.on("updateDataIP", (dataTerbaru) => {
      console.log(
        "⚡ [Real-Time] Laporan baru dari lapangan (Google Sheets) masuk!",
        dataTerbaru,
      );
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
          Dashboard Inspeksi (Divisi IP)
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

  const { dataLogs } = data;

  // --- MESIN ANALITIK FRONTEND ---
  const totalInspeksi = dataLogs.length;
  const prioritasTinggi = dataLogs.filter(
    (log) => log.prioritas.trim() === "High",
  ).length;
  const menungguAnalisa = dataLogs.filter(
    (log) => log.status.trim() === "Menunggu Analisa",
  ).length;
  const sudahDianalisa = totalInspeksi - menungguAnalisa;

  // Mesin Agregasi Data untuk Grafik
  const temuanPerArea = dataLogs.reduce((acc, log) => {
    const area = acc.find((item) => item.name === log.area);
    if (area) area.jumlah += 1;
    else if (log.area) acc.push({ name: log.area, jumlah: 1 }); // Hindari baris kosong
    return acc;
  }, []);

  const rasioPrioritas = dataLogs.reduce((acc, log) => {
    const prioritas = acc.find((item) => item.name === log.prioritas);
    if (prioritas) prioritas.value += 1;
    else if (log.prioritas) acc.push({ name: log.prioritas, value: 1 });
    return acc;
  }, []);

  // Warna untuk Pie Chart (Merah untuk High, Kuning untuk Medium, Hijau untuk Low)
  const getPriorityColor = (priorityName) => {
    if (priorityName === "High") return "#EF4444"; // Red
    if (priorityName === "Medium") return "#F59E0B"; // Orange
    if (priorityName === "Low") return "#10B981"; // Green
    return "#6B7280"; // Gray default
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Dashboard Inspeksi (Divisi IP)
        </h2>
      </div>

      {/* Kartu Analitik IP */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardList className="text-gray-500" size={24} />
            <p className="text-sm font-medium text-gray-500">Total Temuan</p>
          </div>
          <h3 className="text-3xl font-bold text-gray-800">{totalInspeksi}</h3>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center border-b-4 border-b-red-500">
          <div className="flex items-center gap-3 mb-2">
            <AlertOctagon className="text-red-500" size={24} />
            <p className="text-sm font-medium text-gray-500">
              Prioritas Tinggi (High)
            </p>
          </div>
          <h3 className="text-3xl font-bold text-gray-800">
            {prioritasTinggi}
          </h3>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center border-b-4 border-b-orange-500">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="text-orange-500" size={24} />
            <p className="text-sm font-medium text-gray-500">
              Menunggu Analisa
            </p>
          </div>
          <h3 className="text-3xl font-bold text-gray-800">
            {menungguAnalisa}
          </h3>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center border-b-4 border-b-green-500">
          <div className="flex items-center gap-3 mb-2">
            <CheckSquare className="text-green-500" size={24} />
            <p className="text-sm font-medium text-gray-500">Sudah Dianalisa</p>
          </div>
          <h3 className="text-3xl font-bold text-gray-800">{sudahDianalisa}</h3>
        </div>
      </div>

      {/* Area Visualisasi Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Temuan Kerusakan per Area Pabrik
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={temuanPerArea}
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
                  fill="#8B5CF6"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Rasio Prioritas Temuan
          </h3>
          <div className="h-72 w-full flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rasioPrioritas}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {rasioPrioritas.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getPriorityColor(entry.name)}
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

      {/* Area Tabel Laporan */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Log Inspeksi Lapangan
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">ID Inspeksi</th>
                <th className="px-4 py-3">Area Pabrik</th>
                <th className="px-4 py-3">Deskripsi Temuan</th>
                <th className="px-4 py-3">Prioritas</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Status Laporan</th>
              </tr>
            </thead>
            <tbody>
              {dataLogs.map(
                (log, index) =>
                  log.id && ( // Hanya render jika ID tidak kosong
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {log.id}
                      </td>
                      <td className="px-4 py-3 font-bold text-purple-600">
                        {log.area}
                      </td>
                      <td className="px-4 py-3">{log.deskripsi}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${log.prioritas === "High" ? "bg-red-100 text-red-700" : log.prioritas === "Medium" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}
                        >
                          {log.prioritas}
                        </span>
                      </td>
                      <td className="px-4 py-3">{log.tanggal}</td>
                      <td className="px-4 py-3 font-semibold">{log.status}</td>
                    </tr>
                  ),
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
