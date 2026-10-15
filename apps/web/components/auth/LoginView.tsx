"use client";

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/app-store';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Key, User, ArrowRight, Mail as MailIcon } from 'lucide-react';
import type { User as AppUser, UserRole } from '../../types';

type ApiUser = {
  id?: string;
  email?: string;
  fullName?: string;
  name?: string;
  role?: string;
  departmentId?: string | null;
  isActive?: boolean;
};

function mapApiUserToAppUser(apiUser: ApiUser, fallbackEmail: string, fallbackName: string): AppUser {
  const roleMap: Record<string, UserRole> = {
    SYSTEM_ADMIN: 'Administrator',
    COMMANDER: 'Administrator',
    SUPERVISOR: 'Supervisor',
    FIELD_OFFICER: 'Field Officer',
    ANALYST: 'Environmental Analyst',
    CITIZEN: 'Citizen',
    COMMAND_CENTER: 'Administrator',
  };

  return {
    id: apiUser.id || `usr-${Date.now()}`,
    name: apiUser.fullName || apiUser.name || fallbackName || 'Operator',
    email: apiUser.email || fallbackEmail,
    role: roleMap[apiUser.role || ''] || 'Field Officer',
    organization: 'Municipal Corporation',
    department: apiUser.departmentId || 'Public Works & Urban Services',
    region: 'Vijayawada',
    emailVerified: true,
  };
}

export default function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Public Works & Urban Services');
  const [role, setRole] = useState('FIELD_OFFICER');
  const [ward, setWard] = useState('Ward 12 (Benz Circle)');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const [screen, setScreen] = useState<'welcome' | 'login' | 'register' | 'otp' | 'profile'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const { login } = useAppStore();

  useEffect(() => {
    let interval: any = null;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[a-z]/.test(pass)) score += 25;
    if (/[0-9!@#$%^&*]/.test(pass)) score += 25;
    return score;
  };

  const strength = getPasswordStrength(password);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);
    
    try {
      const isRegistering = screen === 'register';
      const endpoint = isRegistering ? '/api/v1/auth/register' : '/api/v1/auth/login';
      const bodyPayload: any = { email, password };
      if (isRegistering) bodyPayload.fullName = name;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        throw new Error(data.error?.message || data.error || data.message || `Failed to ${isRegistering ? 'register' : 'login'}`);
      }
      
      if (isRegistering) {
        setScreen('otp');
        setTimer(60);
        setIsTimerActive(true);
        setSuccessMsg('Prototype verification code: 123456');
      } else if (data.data?.user) {
        login(mapApiUserToAppUser(data.data.user, email, name));
      } else if (data.user) {
        login(mapApiUserToAppUser(data.user, email, name));
      } else {
        login(data);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const otpString = otp.join('');
      if (otpString.length < 6) {
        throw new Error('Please enter a valid 6-digit verification code.');
      }
      const res = await fetch('/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpString })
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        throw new Error(data.error?.message || data.error || data.message || 'Invalid verification code.');
      }
      
      if (data.data?.user) {
        login(mapApiUserToAppUser(data.data.user, email, name));
      } else if (screen === 'register' || name) {
        setScreen('profile');
      } else {
        login(data);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid verification code. Access Denied.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishSetup = () => {
    login({
      id: 'usr_new',
      name: name || 'Operator',
      email: email,
      role: role as any,
      department,
      organization: 'Municipal Corporation',
      ward,
    } as any);
  };

  return (
    <div className="min-h-screen bg-[#050B14] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />
      
      <div className="w-full max-w-md bg-[#0A1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative z-10 flex flex-col overflow-hidden">
        
        <div className="p-8 pb-6 border-b border-white/10 text-center">
          <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl border border-cyan-500/30 flex items-center justify-center mb-4 mx-auto shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <ShieldCheck className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">EarthMind PIOS</h2>
          <p className="text-xs text-gray-400 mt-2">Planetary Intelligence Operating System</p>
        </div>

        {error && (
          <div className="mx-8 mt-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center text-red-400 text-xs font-bold">
            {error}
          </div>
        )}

        <div className="p-8">
          <AnimatePresence mode="wait">
            
            {/* ── WELCOME SCREEN ── */}
            {screen === 'welcome' && (
              <motion.div key="welcome" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-4">
                <button onClick={() => setScreen('login')} className="w-full bg-cyan-500 hover:bg-cyan-600 text-[#050B14] font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
                  <User className="w-4 h-4" /> Sign In
                </button>
                <button onClick={() => setScreen('register')} className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold py-3.5 rounded-xl transition-all">
                  Create Official Account
                </button>
              </motion.div>
            )}

            {/* ── LOGIN SCREEN ── */}
            {screen === 'login' && (
              <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-5">
                <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@earthmind.gov.in"
                        className="w-full bg-black/40 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-cyan-500 border border-white/10 transition-all focus:ring-2 focus:ring-cyan-500/20"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Password</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input required type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                        className="w-full bg-black/40 text-white rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-cyan-500 border border-white/10 transition-all focus:ring-2 focus:ring-cyan-500/20"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                        {showPassword ? '👁️' : '🙈'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="remember" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="w-4 h-4 rounded bg-black/40 border-white/10 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 focus:ring-offset-transparent" />
                      <label htmlFor="remember" className="text-[11px] text-gray-400 cursor-pointer font-medium">Remember me</label>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!email) {
                          setError('Please enter your email address to request password reset');
                          return;
                        }
                        setError('');
                        setIsLoading(true);
                        try {
                          await fetch('/api/v1/auth/forgot-password', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email }),
                          });
                          setSuccessMsg('If a matching account exists, password reset instructions have been dispatched.');
                        } catch {
                          setSuccessMsg('If a matching account exists, password reset instructions have been dispatched.');
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className="text-[11px] text-cyan-400 font-bold hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button disabled={isLoading} type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#050B14] font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)] mt-2 disabled:opacity-50">
                    {isLoading ? 'Authenticating...' : 'Sign In'}
                  </button>
                </form>

                <button onClick={() => setScreen('register')} className="text-center text-xs text-gray-400 mt-2 hover:text-white transition-colors">
                  Don't have an account? <span className="text-cyan-400 font-bold">Create Account</span>
                </button>
              </motion.div>
            )}

            {/* ── REGISTER SCREEN ── */}
            {screen === 'register' && (
              <motion.div key="register" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-5">
                <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                    <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Commander Sarah"
                      className="w-full bg-black/40 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 border border-white/10 transition-all focus:ring-2 focus:ring-cyan-500/20"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                    <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@earthmind.gov.in"
                      className="w-full bg-black/40 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 border border-white/10 transition-all focus:ring-2 focus:ring-cyan-500/20"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Password</label>
                    <div className="relative">
                      <input required type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                        className="w-full bg-black/40 text-white rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-cyan-500 border border-white/10 transition-all focus:ring-2 focus:ring-cyan-500/20"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                        {showPassword ? '👁️' : '🙈'}
                      </button>
                    </div>
                    {password.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {[25, 50, 75, 100].map(tier => (
                          <div key={tier} className={`h-1 flex-1 rounded-full ${strength >= tier ? (strength > 50 ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-white/10'}`} />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-3 mt-1">
                    <input type="checkbox" id="terms" required checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="mt-0.5 w-4 h-4 rounded bg-black/40 border-white/10 text-cyan-500 focus:ring-cyan-500" />
                    <label htmlFor="terms" className="text-[11px] text-gray-400 leading-relaxed cursor-pointer">
                      I agree to the <span className="text-cyan-400 font-semibold hover:underline">Terms of Service</span> and Operational Privacy Policy.
                    </label>
                  </div>

                  <button disabled={isLoading} type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#050B14] font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)] mt-2 disabled:opacity-50">
                    {isLoading ? 'Processing...' : 'Continue to Verification'}
                  </button>
                </form>

                <button onClick={() => setScreen('login')} className="text-center text-xs text-gray-400 mt-2 hover:text-white transition-colors">
                  Already have an account? <span className="text-cyan-400 font-bold">Sign In</span>
                </button>
              </motion.div>
            )}

            {/* ── OTP SCREEN ── */}
            {screen === 'otp' && (
              <motion.div key="otp" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-5 items-center text-center">
                <div className="w-16 h-16 rounded-[16px] bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-3xl mb-2 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  🛡️
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Verify Identity</h3>
                  <p className="text-[11px] text-gray-400">
                    Local prototype verification for <br/><strong className="text-white mt-1 block">{email}</strong>
                  </p>
                </div>

                <div className="w-full rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-left">
                  <p className="text-[10px] uppercase tracking-wider text-cyan-300 font-bold">Prototype OTP</p>
                  <div className="flex items-center justify-between gap-3 mt-1">
                    <span className="font-mono text-lg font-bold text-white">123456</span>
                    <button
                      type="button"
                      onClick={() => setOtp(['1', '2', '3', '4', '5', '6'])}
                      className="px-3 py-1 rounded-lg bg-cyan-500 text-[#050B14] text-[11px] font-bold hover:bg-cyan-400 transition"
                    >
                      Fill Code
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 justify-center my-4 w-full">
                  {otp.map((digit, i) => (
                    <input
                      key={i} id={`otp-${i}`} type="text" maxLength={1} value={digit}
                      onChange={(e) => {
                        const newOtp = [...otp];
                        newOtp[i] = e.target.value;
                        setOtp(newOtp);
                        if (e.target.value && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
                      }}
                      className="w-10 h-12 text-center text-lg font-bold bg-black/40 text-white border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    />
                  ))}
                </div>

                <div className="text-[11px] font-mono text-gray-400 font-bold">
                  {timer > 0 ? `00:${timer.toString().padStart(2, '0')}` : <button onClick={() => { setTimer(60); setIsTimerActive(true); }} className="text-cyan-400 hover:underline">Resend Code</button>}
                </div>

                <button onClick={handleVerifyOtp} disabled={isLoading} className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#050B14] font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)] mt-2 disabled:opacity-50">
                  {isLoading ? 'Verifying...' : 'Verify & Proceed'}
                </button>
                
                <button onClick={() => setScreen('register')} className="text-gray-400 hover:text-white font-bold text-xs mt-2">
                  Go Back
                </button>
              </motion.div>
            )}

            {/* ── PROFILE SETUP SCREEN ── */}
            {screen === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-5">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Operational Profile</h3>
                  <p className="text-[11px] text-gray-400">Configure your deployment settings.</p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Role</label>
                    <select value={role} onChange={e => setRole(e.target.value)} className="w-full bg-black/40 text-white rounded-xl px-4 py-3 text-sm focus:outline-none border border-white/10 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 appearance-none font-bold">
                      <option value="COMMAND_CENTER">Command Center (Admin)</option>
                      <option value="FIELD_OFFICER">Field Officer</option>
                      <option value="SUPERVISOR">Supervisor</option>
                      <option value="CITIZEN">Citizen / Volunteer</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Organization / Dept</label>
                    <input
                      type="text" value={department} onChange={e => setDepartment(e.target.value)}
                      className="w-full bg-black/40 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 border border-white/10 transition-all focus:ring-2 focus:ring-cyan-500/20"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Operating Zone</label>
                    <select value={ward} onChange={e => setWard(e.target.value)} className="w-full bg-black/40 text-white rounded-xl px-4 py-3 text-sm focus:outline-none border border-white/10 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 appearance-none font-bold">
                      {['Ward 12 (Benz Circle)', 'Ward 4 (Bhavanipuram)', 'Ward 7 (One Town)', 'Regional (All Wards)'].map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>

                  <button onClick={handleFinishSetup} className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#050B14] font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)] mt-4 flex items-center justify-center gap-2">
                    Enter Command Center <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
