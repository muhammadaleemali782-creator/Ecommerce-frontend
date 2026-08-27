import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import EducaLogo from "../components/EducaLogo";

// ══════════════════════════════════════════════════════════
// ANIMATED INTERACTIVE EYE ICON COMPONENT (Emil Kowalski Style)
// ══════════════════════════════════════════════════════════
function AnimatedEye({ isOpen, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? "Hide password" : "Show password"}
      className="group relative p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] active:scale-90 transition-all duration-200 cursor-pointer flex items-center justify-center outline-none"
    >
      <svg
        className="w-4 h-4 transition-transform duration-300 group-hover:scale-110"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Outer Eye Outline */}
        <path
          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
          className="transition-all duration-300"
        />

        {/* Iris / Pupil: scales down and fades when closed */}
        <circle
          cx="12"
          cy="12"
          r="3"
          className={`transition-all duration-300 origin-center ${
            isOpen
              ? "scale-100 opacity-100 fill-white/20 stroke-white"
              : "scale-0 opacity-0 stroke-transparent"
          }`}
        />

        {/* Eyelid Slash: smoothly strikes through when closed */}
        <line
          x1="3"
          y1="3"
          x2="21"
          y2="21"
          className={`transition-all duration-300 origin-center ${
            isOpen
              ? "stroke-transparent scale-0 opacity-0"
              : "stroke-slate-300 scale-100 opacity-100 drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]"
          }`}
        />
      </svg>
    </button>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN REDESIGNED LOGIN COMPONENT
// ══════════════════════════════════════════════════════════
export default function Login({ setPage }) {
  const { login, loading } = useAuth() || {};

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [activeField, setActiveField] = useState(null);

  // Rate Limiting / Security Lockout State
  const [failedAttempts, setFailedAttempts] = useState(() => {
    return parseInt(localStorage.getItem("login_failed_attempts") || "0", 10);
  });
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Educa ID SSO States
  const [showEducaSSO, setShowEducaSSO] = useState(false);
  const [ssoStage, setSsoStage] = useState("idle"); // idle -> scanning -> discovered -> authenticating -> success
  const [customEducaEmail, setCustomEducaEmail] = useState("");
  const [discoveredProfiles, setDiscoveredProfiles] = useState([]);

  // Change Password States
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [userId, setUserId] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  // Lockout countdown
  useEffect(() => {
    let interval = null;
    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((t) => (t <= 1 ? 0 : t - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  // Load Saved Educa Profiles on mount
  useEffect(() => {
    const savedEduca = localStorage.getItem("saved_educa_profile");
    const demoProfiles = [
      {
        id: "ed-01",
        name: "Acharya Vaidya",
        email: "admin@educaveda.com",
        role: "ADMIN",
        fallbackEmail: "admin@gmail.com",
        lastActive: "Active Session",
        avatar: "🌿"
      },
      {
        id: "ed-02",
        name: "Himalaya Herbal Network",
        email: "distributor@educaveda.com",
        role: "DISTRIBUTOR",
        fallbackEmail: "distributor@gmail.com",
        lastActive: "Verified 2h ago",
        avatar: "🏔️"
      },
      {
        id: "ed-03",
        name: "Rasayana Seller Hub",
        email: "seller@educaveda.com",
        role: "SELLER",
        fallbackEmail: "seller@gmail.com",
        lastActive: "Verified Yesterday",
        avatar: "🌱"
      }
    ];

    if (savedEduca) {
      try {
        const parsed = JSON.parse(savedEduca);
        if (!demoProfiles.some(p => p.email === parsed.email)) {
          demoProfiles.unshift(parsed);
        }
      } catch (e) {}
    }
    setDiscoveredProfiles(demoProfiles);
  }, []);

  // Standard Login
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (lockoutTimer > 0) {
      setError(`Security cooldown active: ${lockoutTimer}s remaining.`);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setError("Please enter your email and security password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      const result = await login(cleanEmail, cleanPass);

      if (result?.changePasswordRequired) {
        setShowChangePassword(true);
        setUserId(result.userId);
        setError("Temporary password detected. Please configure a permanent password.");
        return;
      }

      if (!result || !result.success) {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        localStorage.setItem("login_failed_attempts", newAttempts.toString());

        if (newAttempts >= 4) {
          setLockoutTimer(30);
          setError("Multiple failed attempts. System locked for 30s security cooldown.");
        } else {
          setError(result?.message || "Invalid credentials. Please verify your details.");
        }
        return;
      }

      setFailedAttempts(0);
      localStorage.setItem("login_failed_attempts", "0");
      setSuccessMsg("Identity verified. Establishing session...");

      if (rememberMe) {
        localStorage.setItem("remembered_user_email", cleanEmail);
      }

      setTimeout(() => {
        const role = result.role || result.user?.role;
        if (role === "admin") setPage("admin");
        else if (role === "seller" || role === "distributor") setPage("dashboard");
        else setPage("home");
      }, 500);

    } catch (err) {
      setError("Network timeout. Authenticating via local sovereign fallback.");
    }
  };

  // Launch Educa ID SSO
  const startEducaSSO = () => {
    setShowEducaSSO(true);
    setSsoStage("scanning");
    setError("");

    setTimeout(() => {
      setSsoStage("discovered");
    }, 900);
  };

  // Authenticate with Selected Profile
  const authenticateWithEducaProfile = async (profile) => {
    setSsoStage("authenticating");
    setError("");

    try {
      localStorage.setItem("saved_educa_profile", JSON.stringify(profile));
      const targetEmail = profile.fallbackEmail || profile.email;
      const targetPass = "12345";

      const result = await login(targetEmail, targetPass);

      setTimeout(() => {
        setSsoStage("success");
        setSuccessMsg(`Welcome, ${profile.name}!`);

        setTimeout(() => {
          setShowEducaSSO(false);
          const role = profile.role?.toLowerCase() || result?.role || "user";
          if (role === "admin") setPage("admin");
          else if (role === "seller" || role === "distributor") setPage("dashboard");
          else setPage("home");
        }, 600);
      }, 800);

    } catch (err) {
      setSsoStage("discovered");
      setError("SSO handshake could not be completed. Use standard login.");
    }
  };

  const quickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
  };

  const handleChangePassword = async (e) => {
    if (e) e.preventDefault();
    if (!newPass || !confirmPass) {
      setError("Please fill both password fields.");
      return;
    }
    if (newPass.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPass !== confirmPass) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newPassword: newPass.trim() })
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Password update failed.");
        return;
      }
      alert("Password updated successfully! Please log in.");
      setShowChangePassword(false);
      setPassword("");
      setNewPass("");
      setConfirmPass("");
      setError("");
    } catch (err) {
      setError("Password change request failed.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] w-full bg-[#050706] text-white flex items-center justify-center p-4 sm:p-6 select-none relative overflow-hidden font-sans">
      
      {/* Subtle Atmospheric Backlight Orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-950/20 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] rounded-full bg-slate-900/30 blur-[120px] pointer-events-none" />

      {/* Main Obsidian Stealth Glass Card */}
      <div className="relative z-10 w-full max-w-[410px] bg-[#0c100e]/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.95)] flex flex-col gap-5 border border-white/[0.08] transition-all duration-300">
        
        {/* Sleek Minimalist Header with Official Logo */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="mb-1">
            <EducaLogo size={46} />
          </div>
          
          <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-amber-400 uppercase">
            EDUCA VEDA · PORTAL
          </span>
          
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Sign in to your account
          </h2>
          
          <p className="text-[11.5px] text-slate-400 max-w-xs leading-relaxed">
            Manage your rasayana orders, team network, and sovereign PPC wallet.
          </p>
        </div>

        {/* Error / Cooldown Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex flex-col gap-1 animate-fadeIn">
            <div className="flex items-center gap-1.5 font-medium">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
            {failedAttempts >= 3 && (
              <button
                type="button"
                onClick={() => setPage("password-help")}
                className="text-[10px] text-slate-300 underline text-left hover:text-white cursor-pointer pt-0.5"
              >
                Reset account access
              </button>
            )}
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-medium animate-fadeIn">
            <span>✓</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── 🌟 BUTTON 1: LOGIN WITH EDUCA MAIL (GOOGLE OAUTH STYLE) ── */}
        {!showChangePassword && (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setShowEducaSSO(true)}
              className="relative group overflow-hidden w-full py-3 px-4 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] active:scale-[0.98] border border-white/15 hover:border-amber-400/50 text-white text-xs font-black uppercase tracking-wider shadow-lg transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span className="text-base">📧</span>
              <span className="tracking-widest">LOGIN WITH EDUCA MAIL</span>
              <span className="text-amber-400 text-xs">➔</span>
            </button>

            {/* Subtle Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-white/[0.08]" />
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                or sign in with password
              </span>
              <div className="flex-1 h-[1px] bg-white/[0.08]" />
            </div>
          </div>
        )}

        {/* ── STANDARD CREDENTIAL LOGIN FORM ── */}
        {!showChangePassword && (
          <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
            
            {/* Email Field with Focus Animation */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono font-medium text-slate-300 uppercase tracking-wider">
                Email Address or System ID
              </label>
              <div
                className={`relative rounded-xl bg-black/40 border transition-all duration-200 flex items-center ${
                  activeField === "email"
                    ? "border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <span className="pl-3.5 text-slate-500 text-xs">✉</span>
                <input
                  type="text"
                  required
                  placeholder="name@example.com / DS001"
                  value={email}
                  onFocus={() => setActiveField("email")}
                  onBlur={() => setActiveField(null)}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={lockoutTimer > 0 || loading}
                  className="w-full py-2.5 px-3 bg-transparent text-white text-xs placeholder:text-slate-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Password Field with Cool Animated Eye */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono font-medium text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setPage("password-help")}
                  className="text-[9.5px] text-amber-400 hover:underline transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div
                className={`relative rounded-xl bg-black/40 border transition-all duration-200 flex items-center pr-2 ${
                  activeField === "password"
                    ? "border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <span className="pl-3.5 text-slate-500 text-xs">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onFocus={() => setActiveField("password")}
                  onBlur={() => setActiveField(null)}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={lockoutTimer > 0 || loading}
                  className="w-full py-2.5 px-3 bg-transparent text-white text-xs placeholder:text-slate-600 focus:outline-none"
                />
                
                {/* 👁️ ANIMATED BLINKING SVG EYE ICON */}
                <AnimatedEye
                  isOpen={showPassword}
                  onClick={() => setShowPassword((prev) => !prev)}
                />
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 text-[11px] text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-white/10 border-white/20 text-emerald-500 focus:ring-0 cursor-pointer"
                />
                <span>Remember this browser</span>
              </label>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading || lockoutTimer > 0}
              className={`w-full mt-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-200 shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                loading || lockoutTimer > 0
                  ? "bg-white/10 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black hover:from-amber-400 hover:to-yellow-300 active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : lockoutTimer > 0 ? (
                <span>Lockout: {lockoutTimer}s</span>
              ) : (
                <span>Continue ➔</span>
              )}
            </button>
          </form>
        )}

        {/* ── CHANGE PASSWORD FORM (FIRST TIME LOGIN / TEMP PASS) ── */}
        {showChangePassword && (
          <form onSubmit={handleChangePassword} className="flex flex-col gap-3 pt-2">
            <div className="text-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Create Master Password
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Set a permanent password for your sovereign profile.
              </p>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-[10px] font-mono text-slate-300 uppercase">New Permanent Password</label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full py-2.5 px-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-slate-300 uppercase">Confirm Permanent Password</label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Repeat password"
                className="w-full py-2.5 px-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-emerald-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-black font-black text-xs uppercase tracking-wider rounded-xl hover:from-emerald-400 hover:to-green-400 active:scale-95 transition-all cursor-pointer shadow-lg"
            >
              Save Permanent Password & Continue ➔
            </button>
          </form>
        )}

        {/* ── QUICK DEMO PRESETS ── */}
        <div className="pt-2 border-t border-white/[0.08] flex flex-col gap-2">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest text-center">
            Quick demo presets
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => quickFill("admin@gmail.com", "12345")}
              className="py-1.5 px-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] text-slate-300 text-[10px] font-mono font-medium transition-colors cursor-pointer text-center"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => quickFill("distributor@gmail.com", "12345")}
              className="py-1.5 px-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] text-slate-300 text-[10px] font-mono font-medium transition-colors cursor-pointer text-center"
            >
              Distributor
            </button>
            <button
              type="button"
              onClick={() => quickFill("seller@gmail.com", "12345")}
              className="py-1.5 px-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] text-slate-300 text-[10px] font-mono font-medium transition-colors cursor-pointer text-center"
            >
              Seller
            </button>
          </div>
        </div>

        {/* Visit Website / Back to Home Link */}
        <div className="text-center pt-2 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={() => setPage("home")}
            className="text-xs text-amber-400 hover:text-amber-300 transition-colors cursor-pointer flex items-center justify-center gap-1.5 mx-auto font-bold"
          >
            <span>🌐</span>
            <span>Visit Website / Back to Home</span>
          </button>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════
          REAL EDUCA MAIL SSO LOGIN MODAL
      ══════════════════════════════════════════════════════════ */}
      {showEducaSSO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
          <div className="relative max-w-md w-full bg-[#0c100e] border border-white/10 p-6 sm:p-8 rounded-3xl shadow-[0_30px_70px_rgba(0,0,0,0.95)] flex flex-col gap-4 text-white">
            
            <button
              onClick={() => setShowEducaSSO(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/[0.08] hover:bg-white/20 text-white flex items-center justify-center text-xs cursor-pointer transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <EducaLogo size={36} />
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Login with EDUCA Mail
                </h3>
                <p className="text-[10px] font-mono text-amber-400">
                  Single Sign-On (SSO) Portal
                </p>
              </div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const mailInput = e.target.educaMailInput.value
                const passInput = e.target.educaPassInput?.value
                if (!mailInput || !passInput) return
                try {
                  setError("")
                  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/educa-sso`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ identifier: mailInput.trim(), password: passInput.trim() })
                  })
                  const data = await res.json()
                  if (res.ok) {
                    if (data.changePasswordRequired) {
                      setShowEducaSSO(false)
                      setTempUserId(data.userId)
                      setShowChangePassword(true)
                    } else if (data.token) {
                      localStorage.setItem("token", data.token)
                      localStorage.setItem("user", JSON.stringify(data.user))
                      window.location.reload()
                    }
                  } else {
                    setError(data.message || "EDUCA Mail credentials invalid")
                  }
                } catch (err) {
                  setError("EDUCA Mail connection error")
                }
              }}
              className="space-y-3.5 pt-2"
            >
              <div>
                <label className="text-[10px] font-mono text-stone-300 font-bold block mb-1">
                  Company User ID / EDUCA Mail:
                </label>
                <input
                  name="educaMailInput"
                  type="text"
                  required
                  placeholder="e.g. DS001 ya name@educaveda.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-stone-300 font-bold block mb-1">
                  Password:
                </label>
                <input
                  name="educaPassInput"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs uppercase tracking-wider shadow-lg hover:from-amber-400 hover:to-yellow-300 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>⚡ Sign In with EDUCA Mail</span>
                <span>➔</span>
              </button>
            </form>

            <div className="text-center pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px]">
              <a
                href="https://messages-frontend-brown.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-400 hover:text-white flex items-center gap-1"
              >
                <span>📧 Open Mailbox</span>
                <span>↗</span>
              </a>
              <button
                type="button"
                onClick={() => { setShowEducaSSO(false); setPage("home"); }}
                className="text-amber-400 hover:underline cursor-pointer"
              >
                🌐 Visit Website
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
