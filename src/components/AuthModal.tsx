import React, { useState, useEffect } from 'react';
import { RedCrescentLogo } from './RedCrescentLogo';
import { UserProfile, UserRole, Language } from '../types';
import { getTranslation } from '../locales/i18n';
import { X, Lock, User, Mail, MapPin, IdCard, Briefcase, KeyRound, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { validatePassword, validateGmail } from '../lib/validation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  consoleType: 'rescuer' | 'public';
  language: Language;
  onAuthSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  consoleType,
  language,
  onAuthSuccess,
}) => {
  const isRtl = language === 'fa' || language === 'ar';
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');

  // Login form state
  const [loginUsername, setLoginUsername] = useState('5831-GK');
  const [loginPassword, setLoginPassword] = useState('Admin1234');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState<number | ''>(28);
  const [placeOfResidence, setPlaceOfResidence] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serviceLocation, setServiceLocation] = useState('شعبه مرکزی تهران');
  const [serviceType, setServiceType] = useState('امداد و نجات جاده‌ای');
  const [generatedUsername, setGeneratedUsername] = useState('');
  const [registerError, setRegisterError] = useState('');

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotUsername, setForgotUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  // Ensure default login credentials are provided whenever modal opens
  useEffect(() => {
    if (isOpen) {
      if (!loginUsername) setLoginUsername('5831-GK');
      if (!loginPassword) setLoginPassword('Admin1234');
    }
  }, [isOpen, consoleType]);

  // Auto-generate username whenever firstName or lastName changes
  useEffect(() => {
    if (firstName.trim() || lastName.trim()) {
      const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
      const picked: string[] = [];
      while (picked.length < 4) {
        const idx = Math.floor(Math.random() * digits.length);
        picked.push(digits.splice(idx, 1)[0]);
      }
      const fInit = (firstName.trim().charAt(0) || 'A').toUpperCase();
      const lInit = (lastName.trim().charAt(0) || 'B').toUpperCase();
      setGeneratedUsername(`${picked.join('')}-${fInit}${lInit}`);
    } else {
      setGeneratedUsername('5831-GK');
    }
  }, [firstName, lastName]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginUsername || !loginPassword) {
      setLoginError(
        language === 'fa'
          ? 'لطفاً نام کاربری و رمز عبور را وارد کنید'
          : language === 'ar'
          ? 'يرجى ادخال اسم المستخدم وكلمة المرور'
          : 'Please enter username and password'
      );
      return;
    }

    const defaultRole: UserRole = consoleType === 'rescuer' ? 'rescuer' : 'citizen';
    const user: UserProfile = {
      id: `usr_${Date.now()}`,
      username: loginUsername,
      firstName: loginUsername.split('-')[1] || 'کاربر',
      lastName: 'امداد',
      role: defaultRole,
      console: consoleType,
      serviceLocation: consoleType === 'rescuer' ? serviceLocation : undefined,
      serviceType: consoleType === 'rescuer' ? serviceType : undefined,
      verified: true,
    };

    onAuthSuccess(user);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');

    if (!firstName || !lastName || !nationalId || !email || !password) {
      setRegisterError(
        language === 'fa'
          ? 'لطفاً تمام فیلدهای ضروری را تکمیل فرمایید'
          : language === 'ar'
          ? 'يرجى إكمال جميع الحقول المطلوبة'
          : 'Please complete all required fields'
      );
      return;
    }

    if (!validateGmail(email)) {
      setRegisterError(
        language === 'fa'
          ? 'آدرس ایمیل باید حتماً پسوند @gmail.com داشته باشد'
          : language === 'ar'
          ? 'يجب أن ينتهي البريد الإلكتروني بـ @gmail.com'
          : 'Email must end with @gmail.com'
      );
      return;
    }

    const pwdVal = validatePassword(password);
    if (!pwdVal.isValid) {
      setRegisterError(
        language === 'fa'
          ? `رمز عبور معتبر نیست: ${pwdVal.errors.join(' | ')}`
          : language === 'ar'
          ? `كلمة المرور غير صالحة: ${pwdVal.errors.join(' | ')}`
          : `Invalid password requirements: ${pwdVal.errors.join(' | ')}`
      );
      return;
    }

    if (password !== confirmPassword) {
      setRegisterError(
        language === 'fa'
          ? 'رمز عبور و تکرار آن یکسان نیستند'
          : language === 'ar'
          ? 'كلمات المرور غیر متطابقة'
          : 'Passwords do not match'
      );
      return;
    }

    const finalRole: UserRole = consoleType === 'rescuer' ? 'rescuer' : 'citizen';
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      username: generatedUsername || '5831-GK',
      firstName,
      lastName,
      email,
      age: Number(age) || undefined,
      placeOfResidence,
      nationalId,
      role: finalRole,
      console: consoleType,
      serviceLocation: consoleType === 'rescuer' ? serviceLocation : undefined,
      serviceType: consoleType === 'rescuer' ? serviceType : undefined,
      verified: true,
    };

    onAuthSuccess(newUser);
    onClose();
  };

  const handleForgotStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmail || !forgotUsername) {
      setForgotError(
        language === 'fa'
          ? 'ایمیل و نام کاربری را وارد کنید'
          : language === 'ar'
          ? 'يرجى إدخال البريد الإلكتروني واسم المستخدم'
          : 'Please enter email and username'
      );
      return;
    }

    if (!validateGmail(forgotEmail)) {
      setForgotError(
        language === 'fa'
          ? 'ایمیل واردشده باید پسوند @gmail.com داشته باشد'
          : language === 'ar'
          ? 'يجب أن ينتهي البريد بـ @gmail.com'
          : 'Email must end with @gmail.com'
      );
      return;
    }

    setForgotStep(2);
  };

  const handleForgotStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!newPassword || !confirmNewPassword) {
      setForgotError(
        language === 'fa' ? 'رمز عبور جدید را وارد کنید' : 'Please enter new password'
      );
      return;
    }

    const pwdVal = validatePassword(newPassword);
    if (!pwdVal.isValid) {
      setForgotError(
        language === 'fa'
          ? `رمز عبور جدید معتبر نیست: ${pwdVal.errors.join(' | ')}`
          : `Invalid new password: ${pwdVal.errors.join(' | ')}`
      );
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setForgotError(
        language === 'fa' ? 'تکرار رمز عبور یکسان نیست' : 'Passwords do not match'
      );
      return;
    }

    setForgotSuccess(
      language === 'fa'
        ? 'رمز عبور با موفقیت تغییر یافت. اکنون می‌توانید وارد شوید.'
        : language === 'ar'
        ? 'تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.'
        : 'Password changed successfully. You can now log in.'
    );
    setTimeout(() => {
      setActiveTab('login');
      setForgotSuccess('');
      setForgotStep(1);
    }, 1500);
  };

  const regPwdVal = validatePassword(password);

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#262630] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] text-slate-900 dark:text-white">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-[#262630] flex items-center justify-between bg-slate-50 dark:bg-[#181820]">
          <div className="flex items-center gap-3">
            <RedCrescentLogo size={28} />
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {consoleType === 'rescuer'
                  ? getTranslation(language, 'rescuerConsoleTitle')
                  : getTranslation(language, 'publicConsoleTitle')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activeTab === 'login'
                  ? getTranslation(language, 'login')
                  : activeTab === 'register'
                  ? getTranslation(language, 'register')
                  : getTranslation(language, 'resetPassword')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-[#20202a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-[#262630] bg-slate-100 dark:bg-[#0e0e12] p-1">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'login'
                ? 'bg-white dark:bg-[#181820] text-[#D6001C] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {getTranslation(language, 'login')}
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'register'
                ? 'bg-white dark:bg-[#181820] text-[#D6001C] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {getTranslation(language, 'register')}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Default Pre-filled Credentials Notice */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2">
                <KeyRound className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <div className="font-bold">
                    {language === 'fa'
                      ? 'نام کاربری و رمز عبور پیش‌فرض قرار گرفته است:'
                      : 'Default credentials pre-filled:'}
                  </div>
                  <div className="font-mono text-[11px] mt-0.5 text-slate-700 dark:text-slate-300">
                    نام کاربری: <span className="font-bold text-[#D6001C]">5831-GK</span> | رمز عبور: <span className="font-bold text-[#D6001C]">Admin1234</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {getTranslation(language, 'username')} (مثال: 5831-GK)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute top-3 right-3 left-auto" />
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="مثال: 5831-GK"
                    className="w-full px-3 py-2.5 pr-10 bg-white dark:bg-[#1a1a22] border border-slate-300 dark:border-[#2e2e3d] text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:border-[#D6001C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {getTranslation(language, 'password')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 pr-10 pl-10 bg-white dark:bg-[#1a1a22] border border-slate-300 dark:border-[#2e2e3d] text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:border-[#D6001C]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute top-3 left-3 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab('forgot')}
                  className="text-xs font-medium text-[#D6001C] hover:underline"
                >
                  {getTranslation(language, 'forgotPassword')}
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#D6001C] hover:bg-[#b80018] text-white font-bold text-sm shadow-md transition-colors mt-2"
              >
                {getTranslation(language, 'login')}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {registerError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{registerError}</span>
                </div>
              )}

              {/* Auto-Generated Username Notice */}
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 text-xs">
                <div className="font-bold text-[#D6001C] flex items-center gap-1.5 mb-1">
                  <KeyRound className="w-4 h-4" />
                  <span>نام کاربری اختصاصی شما:</span>
                  <span className="font-mono text-sm bg-white dark:bg-[#1a1a22] px-2 py-0.5 rounded border border-red-200 dark:border-red-800 text-slate-900 dark:text-white">
                    {generatedUsername || '5831-GK'}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {getTranslation(language, 'generatedUsernameNotice')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {getTranslation(language, 'firstName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="علی / Ghazal"
                    className="w-full px-3 py-2 bg-white dark:bg-[#1a1a22] border border-slate-300 dark:border-[#2e2e3d] text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:border-[#D6001C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {getTranslation(language, 'lastName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="محمدی / Kordan"
                    className="w-full px-3 py-2 bg-white dark:bg-[#1a1a22] border border-slate-300 dark:border-[#2e2e3d] text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:border-[#D6001C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ایمیل (فقط پسوند @gmail.com) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute top-2.5 right-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full px-3 py-2 pr-9 bg-white dark:bg-[#1a1a22] border border-slate-300 dark:border-[#2e2e3d] text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:border-[#D6001C]"
                  />
                </div>
                {email && !validateGmail(email) && (
                  <p className="text-[11px] text-red-500 mt-1 font-medium">
                    ⚠️ ایمیل باید با @gmail.com پایان یابد
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {getTranslation(language, 'age')}
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 bg-white dark:bg-[#1a1a22] border border-slate-300 dark:border-[#2e2e3d] text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:border-[#D6001C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {getTranslation(language, 'placeOfResidence')}
                  </label>
                  <input
                    type="text"
                    value={placeOfResidence}
                    onChange={(e) => setPlaceOfResidence(e.target.value)}
                    placeholder="تهران / کرمانشاه"
                    className="w-full px-3 py-2 bg-white dark:bg-[#1a1a22] border border-slate-300 dark:border-[#2e2e3d] text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:border-[#D6001C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {getTranslation(language, 'nationalId')} *
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="0012345678"
                  className="w-full px-3 py-2 bg-white dark:bg-[#1a1a22] border border-slate-300 dark:border-[#2e2e3d] text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:border-[#D6001C]"
                />
              </div>

              {/* Extra Rescuer Fields */}
              {consoleType === 'rescuer' && (
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#181820] border border-slate-200 dark:border-[#262630] space-y-3">
                  <div className="text-xs font-bold text-[#D6001C] flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    <span>اطلاعات کادر امدادی هلال احمر</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {getTranslation(language, 'serviceLocation')}
                    </label>
                    <input
                      type="text"
                      value={serviceLocation}
                      onChange={(e) => setServiceLocation(e.target.value)}
                      placeholder="شعبه مرکزی کرمانشاه"
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#14141a] border border-slate-200 dark:border-[#2e2e3d] text-slate-900 dark:text-white rounded-lg text-xs focus:outline-none focus:border-[#D6001C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {getTranslation(language, 'serviceType')}
                    </label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#14141a] border border-slate-200 dark:border-[#2e2e3d] text-slate-900 dark:text-white rounded-lg text-xs focus:outline-none focus:border-[#D6001C]"
                    >
                      <option value="امداد و نجات جاده‌ای">امداد و نجات جاده‌ای</option>
                      <option value="تیم پزشکی و کادر درمان">تیم پزشکی و کادر درمان</option>
                      <option value="مدیریت انبار و لجستیک">مدیریت انبار و لجستیک</option>
                      <option value="یگان پروازی و بالگرد">یگان پروازی و بالگرد</option>
                      <option value="جستجو و نجات آوار">جستجو و نجات آوار</option>
                      <option value="فرماندهی و ستاد بحران">فرماندهی و ستاد بحران</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Password & Confirm Password */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {getTranslation(language, 'password')} *
                    </label>
                    <div className="relative">
                      <input
                        type={showRegisterPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="e.g. Abcd1234"
                        className="w-full px-3 py-2 pl-9 bg-white dark:bg-[#1a1a22] border border-slate-300 dark:border-[#2e2e3d] text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:border-[#D6001C]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute top-2.5 left-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      >
                        {showRegisterPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {getTranslation(language, 'confirmPassword')} *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="e.g. Abcd1234"
                        className="w-full px-3 py-2 pl-9 bg-white dark:bg-[#1a1a22] border border-slate-300 dark:border-[#2e2e3d] text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:border-[#D6001C]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute top-2.5 left-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Password Checklist */}
                <div className="p-3 bg-slate-50 dark:bg-[#181820] border border-slate-200 dark:border-[#262630] rounded-xl text-[11px] space-y-1">
                  <div className="font-bold text-slate-700 dark:text-slate-300 mb-1">
                    شرایط الزامی رمز عبور (Password Requirements):
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <div className={`flex items-center gap-1 ${regPwdVal.lengthValid ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                      <span>{regPwdVal.lengthValid ? '✓' : '✕'}</span>
                      <span>۸ تا ۲۰ کاراکتر (8-20 chars)</span>
                    </div>
                    <div className={`flex items-center gap-1 ${regPwdVal.hasUpper ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                      <span>{regPwdVal.hasUpper ? '✓' : '✕'}</span>
                      <span>حرف بزرگ انگلیسی (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1 ${regPwdVal.hasLower ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                      <span>{regPwdVal.hasLower ? '✓' : '✕'}</span>
                      <span>حرف کوچک انگلیسی (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1 ${regPwdVal.hasDigit ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                      <span>{regPwdVal.hasDigit ? '✓' : '✕'}</span>
                      <span>عدد انگلیسی (0-9)</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 pt-0.5 ${regPwdVal.onlyEnglishAlphanumeric ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-red-500'}`}>
                    <span>{regPwdVal.onlyEnglishAlphanumeric ? '✓' : '✕'}</span>
                    <span>فقط حروف و اعداد انگلیسی (بدون فاصله / نشانه / فارسی)</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#D6001C] hover:bg-[#b80018] text-white font-bold text-sm shadow-md transition-colors mt-2"
              >
                {getTranslation(language, 'register')}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {activeTab === 'forgot' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {getTranslation(language, 'resetPassword')}
              </h4>

              {forgotError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{forgotSuccess}</span>
                </div>
              )}

              {forgotStep === 1 && (
                <form onSubmit={handleForgotStep1} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      ایمیل ثبت‌شده (فقط @gmail.com)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        className="w-full px-3 py-2.5 pr-10 bg-white dark:bg-[#1a1a22] border border-slate-300 dark:border-[#2e2e3d] text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:border-[#D6001C]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {getTranslation(language, 'username')} (مثال: 5831-GK)
                    </label>
                    <input
                      type="text"
                      required
                      value={forgotUsername}
                      onChange={(e) => setForgotUsername(e.target.value)}
                      placeholder="5831-GK"
                      className="w-full px-3 py-2.5 bg-white dark:bg-[#1a1a22] border border-slate-300 dark:border-[#2e2e3d] text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:border-[#D6001C]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#D6001C] hover:bg-[#b80018] text-white font-bold text-sm shadow-md transition-colors"
                  >
                    تأیید و دریافت کد بازیابی
                  </button>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={handleForgotStep2} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      رمز عبور جدید (مطابق قوانین)
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="e.g. NewPass2026"
                        className="w-full px-3 py-2.5 pl-9 bg-white dark:bg-[#1a1a22] border border-slate-300 dark:border-[#2e2e3d] text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:border-[#D6001C]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute top-3 left-3 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      تکرار رمز عبور جدید
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="e.g. NewPass2026"
                      className="w-full px-3 py-2.5 bg-white dark:bg-[#1a1a22] border border-slate-300 dark:border-[#2e2e3d] text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:border-[#D6001C]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#D6001C] hover:bg-[#b80018] text-white font-bold text-sm shadow-md transition-colors"
                  >
                    ثبت رمز عبور جدید و ورود
                  </button>
                </form>
              )}

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  بازگشت به صفحه ورود
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
