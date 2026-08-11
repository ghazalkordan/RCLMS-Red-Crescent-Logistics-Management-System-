import React, { useState } from 'react';
import { AuditLogEntry, UserRole, Language } from '../types';
import { getTranslation } from '../locales/i18n';
import { ShieldCheck, Activity, Users, Database, UserPlus, Edit3, Lock, CheckCircle2 } from 'lucide-react';

interface AdminGovernanceProps {
  language: Language;
  auditLogs: AuditLogEntry[];
  userRole: UserRole;
  onClearAuditLogs: () => void;
}

interface SystemUser {
  id: string;
  name: string;
  nationalCode: string;
  role: string;
  department: string;
  status: 'active' | 'suspended' | 'pending';
}

export const AdminGovernance: React.FC<AdminGovernanceProps> = ({
  language,
  auditLogs,
  userRole,
  onClearAuditLogs,
}) => {
  const isRtl = language === 'fa' || language === 'ar';

  // System Users Table State (#22)
  const [users, setUsers] = useState<SystemUser[]>([
    {
      id: 'u-101',
      name: 'دکتر محمد صابری',
      nationalCode: '0012345678',
      role: 'مدیر ستاد بحران (Crisis Manager)',
      department: 'فرماندهی ارشد ستاد کشوری',
      status: 'active',
    },
    {
      id: 'u-102',
      name: 'سرهنگ حسین موسوی',
      nationalCode: '0087654321',
      role: 'فرمانده یگان پروازی (Air Fleet Ops)',
      department: 'پایگاه هوانوردی هلال احمر',
      status: 'active',
    },
    {
      id: 'u-103',
      name: 'مهندس رضا کاظمی',
      nationalCode: '0055443322',
      role: 'سرپرست انبار مرکزی (Warehouse Admin)',
      department: 'انبار لجستیک کرمانشاه',
      status: 'active',
    },
    {
      id: 'u-104',
      name: 'مریم نوری',
      nationalCode: '0099887766',
      role: 'امدادگر ارشد (Field Rescuer)',
      department: 'تیم ارزیابی میدانی سرپل ذهاب',
      status: 'active',
    },
    {
      id: 'u-105',
      name: 'پیمان حسینی',
      nationalCode: '0033221144',
      role: 'ناظر سامانه (Auditor Observer)',
      department: 'بازرسی و نظارت ستاد',
      status: 'pending',
    },
  ]);

  const handleToggleStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'active' ? 'suspended' : 'active';
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const handleChangeRole = (userId: string, newRole: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#0c0c12] p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-colors">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[#D6001C]" />
          <span>{getTranslation(language, 'nav_adminGovernance')}</span>
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
          مدیریت کاربران، تخصیص سطوح دسترسی، مانیتورینگ ماتریس امنیتی و دفترچه غیرقابل تغییر تغییرات سیستم (Audit Log).
        </p>
      </div>

      {/* User Management & Access Table (#22) */}
      <div className="bg-white dark:bg-[#0c0c12] p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#D6001C]" />
            <span>جدول مدیریت کاربران، نقش‌ها و سطوح دسترسی سیستم</span>
          </h3>

          <span className="text-xs font-bold text-[#D6001C] bg-red-100 dark:bg-red-950/80 px-3 py-1 rounded-lg">
            {users.length} کاربر فعال در سیستم
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-xs text-right border-collapse font-mono">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900 text-[#D6001C] font-extrabold border-b border-slate-200 dark:border-slate-800">
                <th className="p-3">نام کاربر</th>
                <th className="p-3">کد ملی / شناسه</th>
                <th className="p-3">دپارتمان / بخش</th>
                <th className="p-3">نقش و سطح دسترسی</th>
                <th className="p-3">وضعیت حساب</th>
                <th className="p-3 text-center">عملیات دسترسی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{u.name}</td>
                  <td className="p-3 font-mono text-slate-500">{u.nationalCode}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{u.department}</td>
                  <td className="p-3 font-bold text-[#D6001C]">
                    <select
                      value={u.role}
                      onChange={(e) => handleChangeRole(u.id, e.target.value)}
                      className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs font-bold text-slate-900 dark:text-white outline-none"
                    >
                      <option value="مدیر ستاد بحران (Crisis Manager)">مدیر ستاد بحران (Crisis Manager)</option>
                      <option value="فرمانده یگان پروازی (Air Fleet Ops)">فرمانده یگان پروازی (Air Fleet Ops)</option>
                      <option value="سرپرست انبار مرکزی (Warehouse Admin)">سرپرست انبار مرکزی (Warehouse Admin)</option>
                      <option value="امدادگر ارشد (Field Rescuer)">امدادگر ارشد (Field Rescuer)</option>
                      <option value="ناظر سامانه (Auditor Observer)">ناظر سامانه (Auditor Observer)</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                        u.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : u.status === 'pending'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                      }`}
                    >
                      {u.status === 'active' ? 'فعال' : u.status === 'pending' ? 'در انتظار تایید' : 'معلق شده'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleToggleStatus(u.id)}
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg transition ${
                        u.status === 'active'
                          ? 'bg-red-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {u.status === 'active' ? 'تعلیق دسترسی' : 'فعال‌سازی کاربر'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-white dark:bg-[#0c0c12] p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-[#D6001C]" />
            <span>دفترچه ثبت تغییرات غیرقابل تغییر (Audit Trail Log)</span>
          </h3>

          <button
            onClick={onClearAuditLogs}
            className="text-xs text-slate-400 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-mono uppercase font-bold"
          >
            پاک‌سازی
          </button>
        </div>

        <div className="bg-slate-900 p-4 border border-slate-800 rounded-xl text-xs font-mono space-y-3 h-48 overflow-y-auto">
          {auditLogs.map((log) => (
            <div key={log.id} className="border-b border-slate-800 pb-2 space-y-1">
              <div className="flex justify-between text-slate-500 text-[10px]">
                <span>[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                <span className="text-[#D6001C] font-extrabold uppercase">{log.actorRole}</span>
              </div>
              <p className="text-slate-200">{isRtl ? log.actionFa : log.actionEn}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
