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
    
    // Build employee data without undefined values for Firebase
    const employeeData: Employee = {
      id: editingId || crypto.randomUUID(),
      initial: initial.toUpperCase(),
      fullName,
      role: 'employee',
      safetyCertificates: certificates,
    };

    // Only add optional fields if they have values (Firebase doesn't allow undefined)
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


  // Helper to check if MCU is expired (11 months from last MCU)
  const checkMCUExpired = (mcuDateStr: string): boolean => {
    const mcu = new Date(mcuDateStr);
    const now = new Date();
    const elevenMonthsAgo = new Date(now.setMonth(now.getMonth() - 11));
    return mcu < elevenMonthsAgo;
  };

  return (
    <div>
      {/* Add/Edit Button */}
      <div className="btn-wrapper w-full mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn w-full py-3"
        >
          <span className="btn-letter">
            {showForm ? 'Batal' : '+ Tambah Karyawan'}
          </span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card-3d p-4 mb-4 space-y-4">
          <h3 className="font-semibold text-gray-100">
            {editingId ? 'Edit Karyawan' : 'Karyawan Baru'}
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Inisial</label>
            <input
              type="text"
              value={initial}
              onChange={(e) => setInitial(e.target.value)}
              placeholder="Contoh: JD"
              className="w-full px-4 py-3 border border-gray-700 rounded-card focus:outline-none focus:ring-2 focus:ring-primary min-h-touch input-3d text-gray-100"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nama Lengkap</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nama lengkap"
              className="w-full px-4 py-3 border border-gray-700 rounded-card focus:outline-none focus:ring-2 focus:ring-primary min-h-touch input-3d text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Jabatan</label>
            <input
              type="text"
              value={jabatan}
              onChange={(e) => setJabatan(e.target.value)}
              placeholder="Contoh: Supervisor, Operator, dll"
              className="w-full px-4 py-3 border border-gray-700 rounded-card focus:outline-none focus:ring-2 focus:ring-primary min-h-touch input-3d text-gray-100"
            />
          </div>

          {/* Emergency Contact */}
          <div className="border-t border-gray-700 pt-4">
            <h4 className="font-medium text-gray-300 mb-2">Kontak Darurat</h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="Nama"
                className="px-3 py-2 border border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-primary input-3d text-gray-100"
              />
              <input
                type="text"
                value={emergencyRelation}
                onChange={(e) => setEmergencyRelation(e.target.value)}
                placeholder="Status (Istri/Suami/dll)"
                className="px-3 py-2 border border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-primary input-3d text-gray-100"
              />
              <input
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="No. HP"
                className="px-3 py-2 border border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-primary col-span-2 input-3d text-gray-100"
              />
            </div>
          </div>

          {/* MCU Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              MCU Terakhir
            </label>
            <input
              type="date"
              value={mcuDate}
              onChange={(e) => setMcuDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-700 rounded-card focus:outline-none focus:ring-2 focus:ring-primary min-h-touch input-3d text-gray-100"
            />
          </div>

          {/* Safety Certificates */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Sertifikat Safety</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newCertName}
                onChange={(e) => setNewCertName(e.target.value)}
                placeholder="Nama Sertifikat"
                className="flex-1 px-3 py-2 border border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-primary input-3d text-gray-100"
              />
              <input
                type="date"
                value={newCertDate}
                onChange={(e) => setNewCertDate(e.target.value)}
                className="px-3 py-2 border border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-primary input-3d text-gray-100"
              />
              <div className="btn-wrapper">
                <button
                  type="button"
                  onClick={handleAddCertificate}
                  className="btn px-3 py-2"
                >
                  <span className="btn-letter">+</span>
                </button>
              </div>
            </div>
            <div className="space-y-1">
              {certificates.map((cert) => (
                <div key={cert.id} className="flex justify-between items-center bg-gray-800 px-3 py-2 rounded">
                  <span className="text-sm text-gray-100">{cert.name} - {cert.expirationDate}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCertificate(cert.id)}
                    className="text-danger text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="btn-wrapper w-full">
            <button
              type="submit"
              className="btn w-full py-3"
            >
              <span className="btn-letter">
                {editingId ? 'Simpan Perubahan' : 'Tambah Karyawan'}
              </span>
            </button>
          </div>
        </form>
      )}

      {/* Employee List */}
      <div className="space-y-3">
        {employees.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Belum ada karyawan</p>
        ) : (
          employees.map((emp) => (
            <div key={emp.id} className="card-3d p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-100">
                    {emp.initial} - {emp.fullName}
                  </h4>
                  {emp.jabatan && (
                    <p className="text-sm text-primary">
                      Jabatan: {emp.jabatan}
                    </p>
                  )}
                  {emp.mcuDate && (
                    <p className={`text-sm ${checkMCUExpired(emp.mcuDate) ? 'text-danger' : 'text-gray-500'}`}>
                      MCU: {emp.mcuDate} {checkMCUExpired(emp.mcuDate) && '⚠️'}
                    </p>
                  )}
                  {emp.emergencyContact && (
                    <p className="text-sm text-gray-400">
                      Kontak: {emp.emergencyContact.name} ({emp.emergencyContact.relationship}) - {emp.emergencyContact.phone}
                    </p>
                  )}
                  {emp.safetyCertificates && emp.safetyCertificates.length > 0 && (

                    <div className="mt-2">
                      <p className="text-xs text-gray-500">Sertifikat:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {emp.safetyCertificates.map((cert) => (
                          <span key={cert.id} className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded border border-blue-500/30">
                            {cert.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(emp)}
                    className="text-primary hover:text-sky-400"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(emp.id)}
                    className="text-danger hover:text-red-400"
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
