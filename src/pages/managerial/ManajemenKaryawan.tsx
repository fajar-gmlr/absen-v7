import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { Employee, SafetyCertificate } from '../../types';

export function ManajemenKaryawan() {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useAppStore();
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form fields
  const [initial, setInitial] = useState('');
  const [fullName, setFullName] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [mcuDate, setMcuDate] = useState('');
  const [certificates, setCertificates] = useState<SafetyCertificate[]>([]);
  
  const [newCertName, setNewCertName] = useState('');
  const [newCertDate, setNewCertDate] = useState('');

  const resetForm = () => {
    setInitial('');
    setFullName('');
    setJabatan('');
    setEmergencyName('');
    setEmergencyRelation('');
    setEmergencyPhone('');
    setMcuDate('');
    setCertificates([]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (employee: Employee) => {
    setEditingId(employee.id);
    setInitial(employee.initial);
    setFullName(employee.fullName);
    setJabatan(employee.jabatan || '');
    setEmergencyName(employee.emergencyContact?.name || '');
    setEmergencyRelation(employee.emergencyContact?.relationship || '');
    setEmergencyPhone(employee.emergencyContact?.phone || '');
    setMcuDate(employee.mcuDate || '');
    setCertificates(employee.safetyCertificates || []);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus karyawan ini?')) {
      await deleteEmployee(id);
    }
  };

  const handleAddCertificate = () => {
    if (newCertName && newCertDate) {
      setCertificates([
        ...certificates,
        { id: crypto.randomUUID(), name: newCertName, expirationDate: newCertDate },
      ]);
      setNewCertName('');
      setNewCertDate('');
    }
  };

  const handleRemoveCertificate = (certId: string) => {
    setCertificates(certificates.filter((c) => c.id !== certId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const employeeData: Employee = {
      id: editingId || crypto.randomUUID(),
      initial: initial.toUpperCase(),
      fullName,
      role: 'employee',
      safetyCertificates: certificates,
    };

    if (emergencyName) {
      employeeData.emergencyContact = {
        name: emergencyName,
        relationship: emergencyRelation || '',
        phone: emergencyPhone || ''
      };
    }
    
    if (mcuDate) {
      employeeData.mcuDate = mcuDate;
    }

    if (jabatan) {
      employeeData.jabatan = jabatan;
    }

    if (editingId) {
      await updateEmployee(editingId, employeeData);
    } else {
      await addEmployee(employeeData);
    }

    resetForm();
  };

  const checkMCUExpired = (mcuDateStr: string): boolean => {
    const mcu = new Date(mcuDateStr);
    const now = new Date();
    const elevenMonthsAgo = new Date();
    elevenMonthsAgo.setMonth(now.getMonth() - 11);
    return mcu < elevenMonthsAgo;
  };

  return (
    <div>
      {/* Add/Edit Button */}
      <button
        onClick={() => {
          if (showForm) resetForm();
          else setShowForm(true);
        }}
        className="w-full py-4 mb-5 bg-cyan-500/20 border border-cyan-500/50 rounded-xl text-cyan-400 text-base font-bold hover:bg-cyan-500/30 transition-all"
      >
        {showForm ? 'Batal' : '+ Tambah Karyawan'}
      </button>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-black/40 border border-white/5 p-6 mb-5 rounded-2xl space-y-5">
          <h3 className="text-lg font-bold text-white">
            {editingId ? 'Edit Karyawan' : 'Karyawan Baru'}
          </h3>
          
          <div>
            <label className="block text-base font-medium text-white/70 mb-3">Inisial</label>
            <input
              type="text"
              value={initial}
              onChange={(e) => setInitial(e.target.value)}
              placeholder="Contoh: JD"
              className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 text-white placeholder-white/30 focus:border-cyan-500 outline-none text-base"
              required
            />
          </div>
          
          <div>
            <label className="block text-base font-medium text-white/70 mb-3">Nama Lengkap</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nama lengkap"
              className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 text-white placeholder-white/30 focus:border-cyan-500 outline-none text-base"
              required
            />
          </div>

          <div>
            <label className="block text-base font-medium text-white/70 mb-3">Jabatan</label>
            <input
              type="text"
              value={jabatan}
              onChange={(e) => setJabatan(e.target.value)}
              placeholder="Contoh: Supervisor, Operator, dll"
              className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 text-white placeholder-white/30 focus:border-cyan-500 outline-none text-base"
            />
          </div>

          <div className="border-t border-white/10 pt-5">
            <h4 className="text-base font-medium text-white/70 mb-3">Kontak Darurat</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="Nama"
                className="px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-white/30 focus:border-cyan-500 outline-none text-base"
              />
              <input
                type="text"
                value={emergencyRelation}
                onChange={(e) => setEmergencyRelation(e.target.value)}
                placeholder="Status (Istri/Suami/dll)"
                className="px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-white/30 focus:border-cyan-500 outline-none text-base"
              />
              <input
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="No. HP"
                className="px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-white/30 focus:border-cyan-500 outline-none text-base md:col-span-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-base font-medium text-white/70 mb-3">
              MCU Terakhir
            </label>
            <input
              type="date"
              value={mcuDate}
              onChange={(e) => setMcuDate(e.target.value)}
              className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 text-white placeholder-white/30 focus:border-cyan-500 outline-none text-base"
            />
          </div>

          {/* Safety Certificates - FIXED SECTION */}
          <div>
            <label className="block text-base font-medium text-white/70 mb-3">Sertifikat Safety</label>
            <div className="flex gap-3 mb-3">
              <input
                type="text"
                value={newCertName}
                onChange={(e) => setNewCertName(e.target.value)}
                placeholder="Nama Sertifikat"
                className="flex-1 px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-white/30 focus:border-cyan-500 outline-none text-base"
              />
              <input
                type="date"
                value={newCertDate}
                onChange={(e) => setNewCertDate(e.target.value)}
                className="px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white focus:border-cyan-500 outline-none text-base"
              />
              <button
                type="button"
                onClick={handleAddCertificate}
                className="px-5 py-3 bg-cyan-500/20 border border-cyan-500/50 rounded-xl text-cyan-400 font-bold hover:bg-cyan-500/30 transition-all"
              >
                +
              </button>
            </div>
            <div className="space-y-2">
              {certificates.map((cert) => (
                <div key={cert.id} className="flex justify-between items-center p-4 bg-black/30 border border-white/5 rounded-xl">
                  <span className="text-base text-white">{cert.name} - {cert.expirationDate}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCertificate(cert.id)}
                    className="text-red-400 text-lg"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-cyan-500/20 border border-cyan-500/50 rounded-xl text-cyan-400 text-base font-bold hover:bg-cyan-500/30 transition-all"
          >
            {editingId ? 'Simpan Perubahan' : 'Tambah Karyawan'}
          </button>
        </form>
      )}

      {/* Employee List */}
      <div className="space-y-4">
        {employees.length === 0 ? (
          <p className="text-center text-white/40 py-10 text-lg">Belum ada karyawan</p>
        ) : (
          employees.map((emp) => (
            <div key={emp.id} className="bg-black/40 border border-white/5 p-5 rounded-2xl">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-white">
                    {emp.initial} - {emp.fullName}
                  </h4>
                  {emp.jabatan && (
                    <p className="text-base text-cyan-400 mt-2">
                      Jabatan: {emp.jabatan}
                    </p>
                  )}
                  {emp.mcuDate && (
                    <p className={`text-base mt-1 ${checkMCUExpired(emp.mcuDate) ? 'text-red-400' : 'text-white/50'}`}>
                      MCU: {emp.mcuDate} {checkMCUExpired(emp.mcuDate) && '⚠️'}
                    </p>
                  )}
                  {emp.emergencyContact && (
                    <p className="text-base text-white/50 mt-1">
                      Kontak: {emp.emergencyContact.name} ({emp.emergencyContact.relationship}) - {emp.emergencyContact.phone}
                    </p>
                  )}
                  {emp.safetyCertificates && emp.safetyCertificates.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-white/40">Sertifikat:</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {emp.safetyCertificates.map((cert) => (
                          <span key={cert.id} className="text-sm bg-blue-500/20 text-blue-400 px-3 py-2 rounded-xl border border-blue-500/30">
                            {cert.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 ml-4">
                  <button
                    onClick={() => handleEdit(emp)}
                    className="text-cyan-400 text-xl hover:scale-110 transition-transform"
                    aria-label="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(emp.id)}
                    className="text-red-400 text-xl hover:scale-110 transition-transform"
                    aria-label="Hapus"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}