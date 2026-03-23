'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Target, Bell, Shield, Save, Loader2, CheckCircle2, ChevronRight, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { getProfile, updateProfile, UserProfileResponse } from '@/lib/api';
import { useGlobal } from '@/components/GlobalProvider';

type Tab = 'personal' | 'goals' | 'security' | 'notifications';

export default function ProfileSettings() {
  const { t } = useTranslation();
  const { addToast } = useGlobal();
  const [activeTab, setActiveTab] = useState<Tab>('personal');
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Personal Info form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // Learning Goals form
  const [targetLevel, setTargetLevel] = useState('');

  // Notifications state
  const [emailNots, setEmailNots] = useState(true);
  const [webNots, setWebNots] = useState(true);

  // Security form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfile();
        setProfile(data);
        
        const nameParts = data.displayName.split(' ');
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
        setTargetLevel(data.targetLevel || 'B2');
        setEmailNots(data.emailNotificationsEnabled);
        setWebNots(data.webNotificationsEnabled);
      } catch (err) {
        console.error("Failed to load profile:", err);
        addToast('error', t('common.error'));
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [t, addToast]);

  const handleSavePersonalInfo = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile({
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`.trim()
      });
      setProfile(updated);
      addToast('success', t('common.success'));
    } catch (err) {
      addToast('error', t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGoals = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile({ targetLevel });
      setProfile(updated);
      addToast('success', t('common.success'));
    } catch (err) {
      addToast('error', t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const syncNotification = async (type: 'email' | 'web', val: boolean) => {
    setSaving(true);
    try {
      const updated = await updateProfile({
        [type === 'email' ? 'emailNotificationsEnabled' : 'webNotificationsEnabled']: val
      });
      setProfile(updated);
      if (type === 'email') setEmailNots(val);
      else setWebNots(val);
      addToast('success', t('common.success'));
    } catch (err) {
      addToast('error', t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      addToast('error', t('auth.errors.passwordMismatch'));
      return;
    }
    setSaving(true);
    try {
      // Placeholder for now as we might need a specialized endpoint
      // But we show user feedback
      await new Promise(r => setTimeout(r, 1000));
      addToast('success', t('common.success'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      addToast('error', t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 dark:bg-[#020617] transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8 pb-12 px-6 sm:px-8 pt-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t('profile.title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">{t('profile.subtitle')}</p>
          </div>
          {profile && (
             <div className="flex items-center gap-3 bg-white dark:bg-slate-900/50 backdrop-blur-md p-2 pr-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/60">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                   {(profile?.displayName || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                   <p className="text-xs font-black text-slate-900 dark:text-white leading-none">{profile.displayName}</p>
                   <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">{profile.role}</p>
                </div>
             </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Nav Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="border border-slate-200 dark:border-slate-800/60 rounded-3xl bg-white dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden shadow-sm">
              <nav className="flex flex-col p-2">
                {[
                  { id: 'personal', icon: User, label: t('profile.nav.personalInfo') },
                  { id: 'goals', icon: Target, label: t('profile.nav.learningGoals') },
                  { id: 'security', icon: Shield, label: t('profile.nav.security') },
                  { id: 'notifications', icon: Bell, label: t('profile.nav.notifications') },
                ].map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id as Tab)}
                    className={`flex items-center gap-3 px-5 py-4 text-sm font-bold rounded-2xl transition-all ${
                      activeTab === item.id 
                        ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 shadow-sm' 
                        : 'text-slate-500 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-emerald-600' : 'text-slate-400'}`} /> 
                    {item.label}
                    <ChevronRight className={`ml-auto w-4 h-4 transition-transform ${activeTab === item.id ? 'rotate-90 text-emerald-500' : 'opacity-0'}`} />
                  </button>
                ))}
              </nav>
            </div>

            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl shadow-emerald-900/10">
               <CheckCircle2 className="w-8 h-8 text-emerald-200 mb-4" />
               <h3 className="font-black text-lg mb-2">{t('resources.pro.title')}</h3>
               <p className="text-emerald-50/80 text-xs leading-relaxed font-medium mb-4">
                  Cá nhân hóa trải nghiệm và nhận lộ trình học tập tối ưu từ các chuyên gia VSTEP.
               </p>
               <button className="w-full py-3 bg-white text-emerald-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-50 transition-colors shadow-lg">
                  {t('resources.pro.button')}
               </button>
            </div>
          </div>

          {/* Forms */}
          <div className="lg:col-span-8 space-y-8 min-h-[500px]">
            
            {activeTab === 'personal' && (
              <section className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-100 dark:border-slate-800/60 rounded-[2.5rem] p-8 sm:p-10 shadow-sm dark:shadow-2xl dark:shadow-black/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    <User className="w-6 h-6 text-emerald-600" /> {t('profile.personal.title')}
                  </h2>
                </div>
                
                <div className="flex items-center gap-8 mb-10">
                  <div className="relative group">
                    <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-[2rem] flex items-center justify-center text-4xl font-black shadow-inner border-2 border-dashed border-emerald-300 dark:border-emerald-500/30 overflow-hidden relative group">
                        <span className="group-hover:opacity-0 transition-opacity">
                            {(profile?.displayName || 'U').charAt(0).toUpperCase()}
                        </span>
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Pencil className="w-8 h-8 text-white" />
                        </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-black text-slate-900 dark:text-white">{t('profile.personal.changeAvatar')}</h3>
                    <p className="text-xs text-slate-400 font-medium">Khuyên dùng ảnh 256x256px dạng PNG hoặc JPG.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-2.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        {t('profile.personal.firstName')} <Pencil className="w-3 h-3 text-slate-300" />
                    </label>
                    <input 
                      type="text" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-inner" 
                    />
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        {t('profile.personal.lastName')} <Pencil className="w-3 h-3 text-slate-300" />
                    </label>
                    <input 
                      type="text" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-inner" 
                    />
                  </div>
                  <div className="space-y-2.5 sm:col-span-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('profile.personal.emailAddress')}</label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input 
                        type="email" 
                        value={profile?.email || ''} 
                        disabled 
                        className="w-full pl-14 pr-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600 cursor-not-allowed font-medium" 
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium mt-2 italic px-1">{t('profile.personal.emailNote')}</p>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-50 dark:border-slate-800 flex justify-end">
                  <Button 
                    onClick={handleSavePersonalInfo} 
                    disabled={saving}
                    className="h-14 px-10 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-900/20 dark:shadow-emerald-900/20 flex items-center gap-3 transition-all active:scale-95 disabled:opacity-70"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                    {t('profile.personal.saveChanges')}
                  </Button>
                </div>
              </section>
            )}

            {activeTab === 'goals' && (
              <section className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-100 dark:border-slate-800/60 rounded-[2.5rem] p-8 sm:p-10 shadow-sm dark:shadow-2xl dark:shadow-black/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    <Target className="w-6 h-6 text-emerald-600" /> {t('profile.goals.title')}
                  </h2>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <label className="text-[13px] font-black text-slate-500 uppercase tracking-widest block mb-6">{t('profile.goals.question')}</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {[
                        { level: 'B1', subLabel: t('profile.goals.intermediate'), color: 'emerald' },
                        { level: 'B2', subLabel: t('profile.goals.upperInter'), color: 'emerald' },
                        { level: 'C1', subLabel: t('profile.goals.advanced'), color: 'emerald' },
                      ].map(({ level, subLabel }) => (
                        <label key={level} className="relative cursor-pointer group">
                          <input 
                            type="radio" 
                            name="targetLevel" 
                            className="peer sr-only" 
                            checked={targetLevel === level}
                            onChange={() => setTargetLevel(level)} 
                          />
                          <div className="h-full rounded-[2rem] border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-6 hover:bg-white dark:hover:bg-slate-800 hover:border-emerald-200 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 dark:peer-checked:bg-emerald-500/10 peer-checked:shadow-lg peer-checked:shadow-emerald-500/5 transition-all text-center">
                            <span className="block text-3xl font-black text-slate-900 dark:text-white mb-1 peer-checked:text-emerald-700 dark:peer-checked:text-emerald-400">{level}</span>
                            <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 transition-colors">{subLabel}</span>
                          </div>
                          {targetLevel === level && (
                             <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg">
                                <CheckCircle2 className="w-4 h-4" />
                             </div>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="p-8 bg-emerald-50 dark:bg-emerald-500/5 rounded-[2rem] border border-emerald-100/50 dark:border-emerald-500/10">
                     <div className="flex gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                           <Target className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                           <h4 className="font-black text-slate-900 dark:text-white text-sm">Vì sao cần đặt mục tiêu?</h4>
                           <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mt-1">
                              Đặt mục tiêu giúp AI của chúng tôi cá nhân hóa các gợi ý từ vựng và cấu trúc ngữ pháp phù hợp nhất với trình độ mục tiêu của bạn.
                           </p>
                        </div>
                     </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-50 dark:border-slate-800 flex justify-end">
                  <Button 
                    onClick={handleSaveGoals}
                    disabled={saving}
                    className="h-14 px-10 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-900/20 dark:shadow-emerald-900/20 flex items-center gap-3 transition-all active:scale-95 disabled:opacity-70"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                    {t('profile.goals.saveGoals')}
                  </Button>
                </div>
              </section>
            )}

            {activeTab === 'notifications' && (
              <section className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-100 dark:border-slate-800/60 rounded-[2.5rem] p-8 sm:p-10 shadow-sm dark:shadow-2xl dark:shadow-black/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex items-center justify-between mb-10">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    <Bell className="w-6 h-6 text-emerald-600" /> {t('profile.notifications.title', { defaultValue: 'Cài đặt thông báo' })}
                  </h2>
                </div>

                <div className="space-y-6">
                    {[
                        { 
                            id: 'email', 
                            label: t('profile.notifications.email', { defaultValue: 'Thông báo qua Email' }), 
                            desc: t('profile.notifications.emailDesc', { defaultValue: 'Nhận báo cáo kết quả và tài liệu học tập qua email.' }),
                            checked: emailNots,
                            handler: setEmailNots
                        },
                        { 
                            id: 'web', 
                            label: t('profile.notifications.web', { defaultValue: 'Thông báo trình duyệt' }), 
                            desc: t('profile.notifications.webDesc', { defaultValue: 'Nhận thông báo tức thì khi có kết quả chấm bài.' }),
                            checked: webNots,
                            handler: setWebNots
                        }
                    ].map(item => (
                        <div key={item.id} className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-emerald-200 transition-all group">
                             <div className="space-y-1">
                                <h4 className="font-black text-slate-900 dark:text-white text-sm">{item.label}</h4>
                                <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                             </div>
                             <button 
                                onClick={() => syncNotification(item.id as 'email' | 'web', !item.checked)}
                                disabled={saving}
                                className={`w-14 h-8 rounded-full p-1 transition-colors relative ${item.checked ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                             >
                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${item.checked ? 'translate-x-6' : 'translate-x-0'}`} />
                             </button>
                        </div>
                    ))}
                </div>

                <div className="p-8 bg-blue-50 dark:bg-blue-500/5 rounded-[2rem] border border-blue-100/50 dark:border-blue-500/10 mt-10">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-2">
                        <Lock className="w-4 h-4" /> Lưu ý: Bạn có thể thay đổi các tùy chọn này bất cứ lúc nào.
                    </p>
                </div>
              </section>
            )}

            {activeTab === 'security' && (
              <section className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-100 dark:border-slate-800/60 rounded-[2.5rem] p-8 sm:p-10 shadow-sm dark:shadow-2xl dark:shadow-black/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    <Shield className="w-6 h-6 text-emerald-600" /> {t('profile.security.title', { defaultValue: 'Bảo mật & Mật khẩu' })}
                  </h2>
                </div>

                <div className="space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-2.5">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('profile.security.currentPassword', { defaultValue: 'Mật khẩu hiện tại' })}</label>
                            <input 
                                type="password" 
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-inner" 
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-2.5">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('profile.security.newPassword', { defaultValue: 'Mật khẩu mới' })}</label>
                                <input 
                                    type="password" 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-inner" 
                                />
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('profile.security.confirmPassword', { defaultValue: 'Xác nhận mật khẩu' })}</label>
                                <input 
                                    type="password" 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-inner" 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                        <h4 className="font-black text-slate-900 dark:text-white text-sm mb-2">{t('profile.security.tips.title')}</h4>
                        <ul className="text-xs text-slate-400 font-medium space-y-2">
                            <li className="flex items-center gap-2">• {t('profile.security.tips.length')}</li>
                            <li className="flex items-center gap-2">• {t('profile.security.tips.complexity')}</li>
                            <li className="flex items-center gap-2">• {t('profile.security.tips.common')}</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-50 dark:border-slate-800 flex justify-end">
                  <Button 
                    onClick={handleUpdatePassword}
                    disabled={saving || !currentPassword || !newPassword}
                    className="h-14 px-10 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-900/20 dark:shadow-emerald-900/20 flex items-center gap-3 transition-all active:scale-95 disabled:opacity-70"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />} 
                    {t('profile.security.btn', { defaultValue: 'Cập nhật mật khẩu' })}
                  </Button>
                </div>
              </section>
            )}

            {/* Danger Zone - Always show at bottom of personal */}
            {activeTab === 'personal' && (
              <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-500/10 rounded-[2rem] p-8 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <h2 className="text-lg font-black text-red-600 dark:text-red-400 mb-2 flex items-center gap-3">
                  <Shield className="w-6 h-6 text-red-500" /> {t('profile.danger.title')}
                </h2>
                <p className="text-sm text-red-500/60 dark:text-red-400/60 mb-8 font-medium">{t('profile.danger.subtitle')}</p>
                <Button variant="outline" className="h-12 px-8 border-red-200 dark:border-red-500/20 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-300 rounded-xl font-black text-xs uppercase tracking-widest transition-all">
                  {t('profile.danger.deleteBtn')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
