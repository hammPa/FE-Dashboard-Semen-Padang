// src/components/Header.jsx
import { Calendar, User, ChevronDown } from "lucide-react";
import { useState } from "react"; // Import useState untuk mengatur interaktivitas

export default function Header() {
  // State untuk membuka/menutup dropdown kalender
  const [isOpen, setIsOpen] = useState(false);
  // State untuk menyimpan teks tanggal yang dipilih
  const [selectedDate, setSelectedDate] = useState("01 Jun - 07 Jun 2026");

  // Fungsi saat opsi tanggal dipilih
  const handleSelectDate = (dateString) => {
    setSelectedDate(dateString);
    setIsOpen(false); // Tutup dropdown setelah memilih
  };

  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10 shrink-0">
      <h2 className="text-xl font-semibold text-gray-800">Overview Kinerja</h2>

      <div className="flex items-center gap-4">
        {/* Wraper Relative untuk Dropdown */}
        <div className="relative">
          {/* Tombol Utama */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
          >
            <Calendar size={18} className="text-blue-600" />
            {selectedDate}
            <ChevronDown
              size={16}
              className={`text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Menu Dropdown akan muncul jika isOpen === true */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="p-1 flex flex-col">
                <button
                  onClick={() => handleSelectDate("Hari Ini")}
                  className="text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                >
                  Hari Ini
                </button>
                <button
                  onClick={() => handleSelectDate("01 Jun - 07 Jun 2026")}
                  className="text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                >
                  Minggu Ini
                </button>
                <button
                  onClick={() => handleSelectDate("Bulan Ini (Juni)")}
                  className="text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                >
                  Bulan Ini (Juni)
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold border border-blue-200 cursor-pointer">
          <User size={20} />
        </div>
      </div>
    </header>
  );
}
