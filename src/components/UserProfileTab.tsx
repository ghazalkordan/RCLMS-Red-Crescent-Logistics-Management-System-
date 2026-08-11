import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Phone,
  MapPin,
  IdCard,
  Building,
  CheckCircle2,
  Clock,
  Key,
  Award,
  Activity,
  Edit3,
  Save,
  AlertCircle,
  QrCode,
  FileText,
  UserCheck,
  Mail,
} from 'lucide-react';
import { Language, UserProfile, UserRole } from '../types';
import { getTranslation } from '../locales/i18n';

interface UserProfileTabProps {
  language: Language;
  user: UserProfile | null;
  userRole: UserRole;
  onUserRoleChange?: (role: UserRole) => void;
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
  consoleType: 'rescuer' | 'public';
}

export const UserProfileTab: React.FC<UserProfileTabProps> = ({
  language,
  user,
  userRole,
  onUserRoleChange,
  onUpdateProfile,
  consoleType,
}) => {
  const isRtl = language === 'fa' || language === 'ar';

  // Female Relief Worker Ghazal Kordan Profile
  const defaultUser: UserProfile = {
    id: user?.id || 'usr_ghazal_kordan',
    username: 'IRC-RESCUER-0902',
    firstName: 'غزل',
    lastName: 'کردان',
    name: 'Ghazal Kordan',
    email: 'ghazalkordan14@gmail.com',
    phone: '09020560395',
    age: 26,
    placeOfResidence: 'تهران، ولنجک',
    nationalId: '0021849302',
    role: userRole || 'rescuer',
    serviceLocation: 'تهران - ستاد و شعب عملیاتی هلال احمر',
    serviceType: 'سرپرست تیم هماهنگی امداد و نجات',
    membershipId: 'RC-GHAZAL-0902',
    verified: true,
    mfaEnabled: true,
    assignedBranch: 'ستاد مرکزی جمعیت هلال احمر تهران',
  };

  const profile = { ...defaultUser, ...user };

  // Editable Profile States (#23)
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [nationalId, setNationalId] = useState(profile.nationalId);
  const [residence, setResidence] = useState(profile.placeOfResidence);
  const [serviceLocation, setServiceLocation] = useState(profile.serviceLocation);
  const [serviceType, setServiceType] = useState(profile.serviceType);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile({
        firstName,
        lastName,
        phone,
        email,
        nationalId,
        placeOfResidence: residence,
        serviceLocation,
        serviceType,
      });
    }
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-6 max-w-5xl mx-auto">
      {/* Toast Alert */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>تغییرات شناسنامه کاربری با موفقیت به روزرسانی شد.</span>
        </div>
      )}

      {/* Hero Profile Banner with Female Relief Worker Avatar (#23) */}
      <div className="bg-white dark:bg-[#0c0c12] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Female Cartoon Avatar for Ghazal Kordan */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-slate-900 via-blue-950 to-red-950 border-2 border-cyan-400 p-1 flex items-center justify-center shadow-xl">
                <img
                  src="https://api.dicebear.com/7.x/bottts/svg?seed=GhazalKordanRedCrescent&backgroundColor=0284c7"
                  alt="آواتار کارتونی داوطلب هلال احمر"
                  className="w-full h-full rounded-xl object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-white rounded-full border-2 border-white dark:border-slate-900 shadow-md">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            {/* Title Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {firstName} {lastName}
                </h2>
                <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/80 text-[#D6001C] dark:text-red-300 text-xs font-extrabold border border-red-200 dark:border-red-900/60">
                  امدادگر رسمی هلال احمر (کادر زن)
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap font-mono">
                <span>کد پرسنلی: {profile.username}</span>
                <span className="flex items-center gap-1 font-sans">
                  <Building className="w-3.5 h-3.5 text-[#D6001C]" />
                  {profile.assignedBranch}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-5 py-2.5 rounded-xl bg-[#D6001C] hover:bg-red-700 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditing ? 'انصراف' : 'ویرایش پروفایل'}</span>
          </button>
        </div>
      </div>

      {/* Main Form & Details (#23) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#0c0c12] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <User className="w-5 h-5 text-[#D6001C]" />
            <span>اطلاعات هویتی، تماس و محل خدمت</span>
          </h3>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">نام *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:border-[#D6001C]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">نام خانوادگی *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:border-[#D6001C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">کد ملی *</label>
                  <input
                    type="text"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-[#D6001C]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">شماره همراه *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-[#D6001C]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">پست الکترونیکی (ایمیل)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-[#D6001C]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">آدرس دقیق محل سکونت</label>
                <input
                  type="text"
                  value={residence}
                  onChange={(e) => setResidence(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:border-[#D6001C]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">محل خدمت / پایگاه</label>
                  <input
                    type="text"
                    value={serviceLocation}
                    onChange={(e) => setServiceLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:border-[#D6001C]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان تخصص و رده خدمت</label>
                  <input
                    type="text"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:border-[#D6001C]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D6001C] hover:bg-red-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>ذخیره تغییرات</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-4">
                <div>
                  <span className="text-slate-400 block mb-1">نام و نام خانوادگی:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">{firstName} {lastName}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">کد ملی:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{nationalId}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">شماره همراه:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{phone}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">پست الکترونیکی:</span>
                  <span className="font-mono font-bold text-[#D6001C]">{email}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-slate-400 block mb-1">آدرس سکونت:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{residence}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">محل خدمت (پایگاه):</span>
                  <span className="font-bold text-[#D6001C]">{serviceLocation}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">تخصص و رده خدمت:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{serviceType}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">شناسه عضویت داوطلبان:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{profile.membershipId}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security & Role Status Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0c0c12] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>احراز هویت و مجوزها</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900">
                <span className="text-slate-600 dark:text-slate-300">شناسایی دو عاملی (MFA):</span>
                <span className="font-bold text-emerald-600">فعال 🔒</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900">
                <span className="text-slate-600 dark:text-slate-300">استعلام ثبت‌احوال:</span>
                <span className="font-bold text-emerald-600">تأیید شده ✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
