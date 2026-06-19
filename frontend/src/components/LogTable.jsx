// src/components/LogTable.jsx
import { useState } from "react";
import { List, Search, ChevronLeft, ChevronRight } from "lucide-react";

export default function LogTable({ data }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter menggunakan 'data' dari server
  const filteredLogs = data.filter(
    (log) =>
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.divisi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.sumber.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <List size={20} className="text-blue-600" /> Log Data Terbaru
        </h3>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Cari ID, Divisi, Platform..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
          />
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-t-lg">
            <tr>
              <th className="px-4 py-3">ID Log</th>
              <th className="px-4 py-3">Divisi</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.length > 0 ? (
              paginatedLogs.map((log, index) => (
                <tr key={log.id || log._id || `log-${index}`} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {log.id}
                  </td>
                  <td className="px-4 py-3 font-bold text-blue-600">
                    {log.divisi}
                  </td>
                  <td className="px-4 py-3">{log.sumber}</td>
                  <td className="px-4 py-3">{log.tanggal}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        log.status === "Sukses"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                  Data tidak ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
          <span className="text-sm text-gray-500">
            Halaman{" "}
            <span className="font-medium text-gray-900">{currentPage}</span>{" "}
            dari <span className="font-medium text-gray-900">{totalPages}</span>
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border ${currentPage === 1 ? "border-gray-200 text-gray-300 cursor-not-allowed" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border ${currentPage === totalPages ? "border-gray-200 text-gray-300 cursor-not-allowed" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
