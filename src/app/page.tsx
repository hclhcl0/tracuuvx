'use client';

import { useState } from 'react';

type RecordType = {
  id: number;
  customer_code: string;
  customer_name: string;
  dob: string;
  address: string;
  phone: string;
  vaccine_name: string;
  vaccination_date: string;
  dose: string;
  price: string;
};

type PatientInfo = {
  name: string;
  code: string;
  dob: string;
  phone: string;
  address: string;
};

type PatientData = {
  info: PatientInfo;
  history: RecordType[];
};

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    code: '',
    dob: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [selectedPatientIdx, setSelectedPatientIdx] = useState<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name && !formData.phone && !formData.code && !formData.dob) return;
    
    setLoading(true);
    setSelectedPatientIdx(null);
    try {
      const params = new URLSearchParams();
      if (formData.name) params.append('name', formData.name);
      if (formData.phone) params.append('phone', formData.phone);
      if (formData.code) params.append('code', formData.code);
      if (formData.dob) params.append('dob', formData.dob);

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      const records: RecordType[] = data.records || [];
      
      const patientsMap = new Map<string, PatientData>();
      records.forEach(record => {
        const key = record.customer_code ? record.customer_code : `${record.customer_name}-${record.dob}-${record.phone}`;
        if (!patientsMap.has(key)) {
          patientsMap.set(key, {
            info: {
              name: record.customer_name,
              code: record.customer_code,
              dob: record.dob,
              phone: record.phone,
              address: record.address
            },
            history: []
          });
        }
        patientsMap.get(key)!.history.push(record);
      });
      
      const patientsList = Array.from(patientsMap.values());
      // Sort history inside each patient
      patientsList.forEach(p => {
        p.history.sort((a, b) => {
          if (a.vaccination_date > b.vaccination_date) return -1;
          if (a.vaccination_date < b.vaccination_date) return 1;
          return 0;
        });
      });
      setPatients(patientsList);
      if (patientsList.length > 0) {
        setSelectedPatientIdx(0);
      }
    } catch (err) {
      console.error(err);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === 'nan') return '';
    if (dateStr.length === 4) return `Năm ${dateStr}`;
    if (dateStr.includes('-')) {
      const parts = dateStr.split(' ')[0].split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return dateStr;
  };

  const selectedPatient = selectedPatientIdx !== null ? patients[selectedPatientIdx] : null;

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden text-slate-800 font-sans">
      {/* Left Sidebar */}
      <div className="w-[380px] min-w-[380px] flex flex-col bg-white border-r border-slate-200 shadow-sm z-10">
        
        {/* Search Section */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mr-3 shadow-sm">
              TC
            </div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">Tra Cứu Lịch Sử Tiêm Chủng</h1>
          </div>
          
          <form onSubmit={handleSearch} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Mã khách hàng</label>
              <input type="text" name="code" value={formData.code} onChange={handleInputChange} className="w-full border border-slate-200 rounded px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="Nhập mã..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Họ tên khách hàng</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full border border-slate-200 rounded px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="Nhập tên..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Ngày sinh</label>
                <input type="text" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full border border-slate-200 rounded px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="DD/MM/YYYY" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Số điện thoại</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border border-slate-200 rounded px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="Nhập SĐT..." />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded text-sm transition-colors flex items-center justify-center">
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Đang tìm kiếm...
                </>
              ) : 'Tìm Kiếm'}
            </button>
          </form>
        </div>

        {/* Patient List */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 sticky top-0 flex justify-between items-center z-10 shadow-sm">
            <span className="text-sm font-bold text-slate-700">Danh sách khách hàng</span>
            <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">{patients.length}</span>
          </div>
          
          {patients.length === 0 && !loading && (
            <div className="p-8 text-center text-slate-400 text-sm">
              Không có dữ liệu
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {patients.map((p, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedPatientIdx(idx)}
                className={`p-3 cursor-pointer transition-colors ${selectedPatientIdx === idx ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm text-slate-800">{p.info.name || 'Chưa cập nhật'}</span>
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{p.info.code || 'N/A'}</span>
                </div>
                <div className="flex text-xs text-slate-500 gap-3">
                  <span className="flex items-center"><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>{p.info.dob || '--'}</span>
                  <span className="flex items-center"><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>{p.info.phone || '--'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-center shrink-0">
          <p className="text-xs text-slate-500 font-medium">Phát triển bởi tổ CNTT - phòng KHNV</p>
        </div>
      </div>

      {/* Right Main Area */}
      <div className="flex-1 flex flex-col h-full bg-slate-50/50">
        {selectedPatient ? (
          <>
            {/* Patient Info Header */}
            <div className="p-5 border-b border-slate-200 bg-white shadow-sm shrink-0">
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Thông tin khách hàng</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-6">
                <div>
                  <span className="block text-xs text-slate-500 mb-1">Họ tên khách hàng</span>
                  <span className="text-sm font-bold text-slate-800">{selectedPatient.info.name || '--'}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-500 mb-1">Mã khách hàng</span>
                  <span className="text-sm font-mono font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded inline-block">{selectedPatient.info.code || '--'}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-500 mb-1">Ngày sinh</span>
                  <span className="text-sm font-medium text-slate-800">{selectedPatient.info.dob || '--'}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-500 mb-1">Số điện thoại</span>
                  <span className="text-sm font-medium text-slate-800">{selectedPatient.info.phone || '--'}</span>
                </div>
                {selectedPatient.info.address && (
                  <div className="col-span-2">
                    <span className="block text-xs text-slate-500 mb-1">Địa chỉ</span>
                    <span className="text-sm font-medium text-slate-800">{selectedPatient.info.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Vaccination History Table */}
            <div className="flex-1 p-5 overflow-hidden flex flex-col">
              <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-3 shrink-0">Danh sách thuốc / Lịch sử tiêm</h2>
              <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-auto flex-1">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="text-xs text-slate-600 bg-slate-100 sticky top-0 z-10 shadow-sm border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-semibold w-12 text-center border-r border-slate-200">STT</th>
                        <th className="px-4 py-3 font-semibold whitespace-nowrap border-r border-slate-200">Ngày tiêm</th>
                        <th className="px-4 py-3 font-semibold border-r border-slate-200">Tên vắc xin / Huyết thanh</th>
                        <th className="px-4 py-3 font-semibold whitespace-nowrap border-r border-slate-200 text-center">Mũi thứ</th>
                        <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">Chi phí</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedPatient.history.length > 0 ? (
                        selectedPatient.history.map((record, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-4 py-2.5 text-center text-slate-400 border-r border-slate-200">{selectedPatient.history.length - rIdx}</td>
                            <td className="px-4 py-2.5 font-medium text-slate-700 whitespace-nowrap border-r border-slate-200">{formatDate(record.vaccination_date)}</td>
                            <td className="px-4 py-2.5 font-semibold text-blue-700 border-r border-slate-200">
                              {record.vaccine_name || '--'}
                            </td>
                            <td className="px-4 py-2.5 text-center border-r border-slate-200">
                              {record.dose && record.dose !== 'nan' ? (
                                <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded font-bold whitespace-nowrap">
                                  {record.dose}
                                </span>
                              ) : '--'}
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono text-slate-600">
                              {record.price && record.price !== 'nan' ? parseInt(record.price).toLocaleString('vi-VN') : '--'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-400">Không có dữ liệu tiêm chủng</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <svg className="w-16 h-16 mb-4 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <p className="text-lg">Chọn một khách hàng để xem chi tiết</p>
          </div>
        )}
      </div>
    </div>
  );
}
