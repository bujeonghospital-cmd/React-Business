"use client";
import { useState, useEffect } from "react";
import {
  ChevronLeft,
  Save,
  User,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Stethoscope,
  Scissors,
  Clock,
  UserCircle,
  Mail,
  Home,
  Car,
} from "lucide-react";
import { useRouter } from "next/navigation";
interface CustomerData {
  [key: string]: any;
}
const EditCustomerPage = () => {
  const router = useRouter();
  const [customerData, setCustomerData] = useState<CustomerData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusOptions, setStatusOptions] = useState<
    Array<{ value: string; label: string; color: string }>
  >([]);

  const fetchStatusOptions = async () => {
    try {
      const response = await fetch("/api/status-options");
      const result = await response.json();
      if (result.success && result.data) {
        setStatusOptions(result.data);
      } else {
        console.error("Failed to fetch status options:", result.error);
      }
    } catch (error) {
      console.error("Error fetching status options:", error);
    }
  };

  useEffect(() => {
    // ดึงข้อมูลจาก URL params หรือ localStorage
    const params = new URLSearchParams(window.location.search);
    const customerId = params.get("id");
    if (customerId) {
      // ในอนาคต: ดึงข้อมูลจาก API
      const savedData = localStorage.getItem(`customer_${customerId}`);
      if (savedData) {
        setCustomerData(JSON.parse(savedData));
      }
    }

    // โหลดรายการสถานะ
    fetchStatusOptions();

    setIsLoading(false);
  }, []);
  const handleFieldChange = (fieldName: string, value: any) => {
    setCustomerData({
      ...customerData,
      [fieldName]: value,
    });
  };
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: บันทึกข้อมูลไปยัง API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      localStorage.setItem(
        `customer_${customerData.id}`,
        JSON.stringify(customerData)
      );
      router.back();
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSaving(false);
    }
  };
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-600 font-medium">กำลังโหลดข้อมูล...</div>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
                <User className="w-8 h-8" />
                แก้ไขข้อมูลลูกค้า
              </h1>
              <p className="text-blue-100 mt-1">
                กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง
              </p>
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="space-y-6">
          {/* Section 1: ข้อมูลพื้นฐาน */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transform transition-all duration-200 hover:shadow-xl">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <UserCircle className="w-6 h-6" />
                ข้อมูลพื้นฐาน
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    รหัสลูกค้า (HN)
                  </label>
                  <input
                    type="text"
                    value={customerData.id || ""}
                    onChange={(e) => handleFieldChange("id", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 group-hover:border-gray-300"
                    placeholder="HN-XXXX"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" />
                    ชื่อลูกค้า
                  </label>
                  <input
                    type="text"
                    value={customerData.name || ""}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 group-hover:border-gray-300"
                    placeholder="กรอกชื่อ-นามสกุล"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-500" />
                    ชื่อเล่น
                  </label>
                  <input
                    type="text"
                    value={customerData.nickname || ""}
                    onChange={(e) =>
                      handleFieldChange("nickname", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 group-hover:border-gray-300"
                    placeholder="กรอกชื่อเล่น"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Section 2: ข้อมูลติดต่อ */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transform transition-all duration-200 hover:shadow-xl">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Phone className="w-6 h-6" />
                ข้อมูลติดต่อ
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-green-500" />
                    ผู้ติดต่อ
                  </label>
                  <input
                    type="text"
                    value={customerData.contact || ""}
                    onChange={(e) =>
                      handleFieldChange("contact", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 group-hover:border-gray-300"
                    placeholder="ชื่อผู้ติดต่อ"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-500" />
                    เบอร์โทร
                  </label>
                  <input
                    type="tel"
                    value={customerData.phone || ""}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 group-hover:border-gray-300"
                    placeholder="0XX-XXX-XXXX"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-pink-500" />
                    เพศ
                  </label>
                  <select
                    value={customerData.gender || ""}
                    onChange={(e) =>
                      handleFieldChange("gender", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 group-hover:border-gray-300 bg-white"
                  >
                    <option value="">เลือกเพศ</option>
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                  </select>
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    อายุ
                  </label>
                  <input
                    type="number"
                    value={customerData.age || ""}
                    onChange={(e) => handleFieldChange("age", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 group-hover:border-gray-300"
                    placeholder="อายุ (ปี)"
                  />
                </div>
                <div className="group md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    บ้านจากจังหวัด
                  </label>
                  <input
                    type="text"
                    value={customerData["บ้านจากจังหวัด"] || ""}
                    onChange={(e) =>
                      handleFieldChange("บ้านจากจังหวัด", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 group-hover:border-gray-300"
                    placeholder="ระบุจังหวัด"
                  />
                </div>
                <div className="group md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Car className="w-4 h-4 text-indigo-500" />
                    จะเดินทางมารพ.ยังไง
                  </label>
                  <input
                    type="text"
                    value={customerData["จะเดินทางมารพ.ยังไง"] || ""}
                    onChange={(e) =>
                      handleFieldChange("จะเดินทางมารพ.ยังไง", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:border-gray-300"
                    placeholder="รถส่วนตัว / รถไฟ / เครื่องบิน"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Section 3: สถานะ Consult */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transform transition-all duration-200 hover:shadow-xl">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Stethoscope className="w-6 h-6" />
                สถานะ Consult
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    วันที่ได้ชื่อ เบอร์
                  </label>
                  <input
                    type="date"
                    value={customerData["วันที่ได้ชื่อ เบอร์"] || ""}
                    onChange={(e) =>
                      handleFieldChange("วันที่ได้ชื่อ เบอร์", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-purple-200 bg-purple-50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 group-hover:border-purple-300"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-500" />
                    วันที่ได้นัด Consult
                  </label>
                  <input
                    type="date"
                    value={customerData["วันที่ได้นัด Consult"] || ""}
                    onChange={(e) =>
                      handleFieldChange("วันที่ได้นัด Consult", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-red-200 bg-red-50 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 group-hover:border-red-300"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-500" />
                    วันที่ Consult
                  </label>
                  <input
                    type="date"
                    value={customerData["วันที่ Consult"] || ""}
                    onChange={(e) =>
                      handleFieldChange("วันที่ Consult", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-red-200 bg-red-50 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 group-hover:border-red-300"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-500" />
                    ยอดนำเสนอ
                  </label>
                  <input
                    type="text"
                    value={customerData["ยอดนำเสนอ"] || ""}
                    onChange={(e) =>
                      handleFieldChange("ยอดนำเสนอ", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-purple-200 bg-purple-50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 group-hover:border-purple-300"
                    placeholder="ระบุยอดเงิน"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Section 4: สถานะผ่าตัด */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transform transition-all duration-200 hover:shadow-xl">
            <div className="bg-gradient-to-r from-red-500 to-orange-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Scissors className="w-6 h-6" />
                สถานะผ่าตัด
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-500" />
                    วันที่ได้นัดผ่าตัด
                  </label>
                  <input
                    type="date"
                    value={customerData["วันที่ได้นัดผ่าตัด"] || ""}
                    onChange={(e) =>
                      handleFieldChange("วันที่ได้นัดผ่าตัด", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-red-200 bg-red-50 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 group-hover:border-red-300"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-500" />
                    วันที่ผ่าตัด
                  </label>
                  <input
                    type="date"
                    value={customerData["วันที่ผ่าตัด"] || ""}
                    onChange={(e) =>
                      handleFieldChange("วันที่ผ่าตัด", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-red-200 bg-red-50 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 group-hover:border-red-300"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-red-500" />
                    เวลาที่นัด
                  </label>
                  <input
                    type="time"
                    value={customerData["เวลาที่นัด"] || ""}
                    onChange={(e) =>
                      handleFieldChange("เวลาที่นัด", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-red-200 bg-red-50 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 group-hover:border-red-300"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-orange-500" />
                    หมอ
                  </label>
                  <input
                    type="text"
                    value={customerData["หมอ"] || ""}
                    onChange={(e) => handleFieldChange("หมอ", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-orange-200 bg-orange-50 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 group-hover:border-orange-300"
                    placeholder="ชื่อแพทย์ผู้ผ่าตัด"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: ข้อมูลเพิ่มเติม */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transform transition-all duration-200 hover:shadow-xl">
            <div className="bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-6 h-6" />
                ข้อมูลเพิ่มเติม
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    สถานะ ⭐
                  </label>
                  <select
                    value={customerData["สถานะ"] || ""}
                    onChange={(e) => handleFieldChange("สถานะ", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-indigo-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:border-indigo-400 bg-white font-medium"
                  >
                    <option value="">เลือกสถานะ</option>
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {customerData["สถานะ"] && statusOptions.length > 0 && (
                    <div className="mt-3">
                      {(() => {
                        const selectedStatus = statusOptions.find(
                          (opt) => opt.value === customerData["สถานะ"]
                        );
                        return selectedStatus ? (
                          <span
                            className="inline-block px-4 py-2 rounded-full text-sm font-semibold text-white shadow-md"
                            style={{ backgroundColor: selectedStatus.color }}
                          >
                            {selectedStatus.label}
                          </span>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: หมายเหตุ */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transform transition-all duration-200 hover:shadow-xl">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-6 h-6" />
                หมายเหตุ
              </h2>
            </div>
            <div className="p-6">
              <textarea
                value={customerData.notes || ""}
                onChange={(e) => handleFieldChange("notes", e.target.value)}
                className="w-full px-4 py-3 border-2 border-yellow-200 bg-yellow-50 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 min-h-[180px] transition-all duration-200 resize-none"
                placeholder="พิมพ์หมายเหตุเพิ่มเติม..."
              />
            </div>
          </div>
          {/* Action Buttons - Fixed at bottom */}
          <div className="sticky bottom-4 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 flex justify-end gap-4">
            <button
              onClick={() => router.back()}
              disabled={isSaving}
              className="px-8 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  บันทึกข้อมูล
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default EditCustomerPage;
