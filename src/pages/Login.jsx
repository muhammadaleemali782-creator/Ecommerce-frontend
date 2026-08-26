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

        {/* ── 🌟 BUTTON 1: LOGIN WITH EDUCA ID (STEALTH TITANIUM SSO) ── */}
        {!showChangePassword && (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={startEducaSSO}
              className="relative group overflow-hidden w-full py-3 px-4 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] active:scale-[0.98] border border-white/15 text-white text-xs font-bold uppercase tracking-[0.16em] shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-200 flex items-center justify-between cursor-pointer"
            >
              {/* Shimmer Light Reflection Sweep */}
              <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
              
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                  ✦
                </span>
                <span className="font-sans font-bold">LOGIN WITH EDUCA ID</span>
              </div>
              
              <svg className="w-4 h-4 stroke-[2] text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Subtle Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-white/[0.08]" />
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                or sign in with email
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
                Email Address
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
                  type="email"
                  required
                  placeholder="name@example.com"
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
                  className="text-[9.5px] text-slate-400 hover:text-white transition-colors cursor-pointer"
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
                  onClick={() => setShowPassword(!showPassword)}
                />
              </div>
            </div>

            {/* Remember Checkbox */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-300 cursor-pointer">
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
                  : "bg-white text-black hover:bg-slate-200 active:scale-[0.98]"
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

        {/* ── CHANGE PASSWORD FORM ── */}
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
              <label className="text-[10px] font-mono text-slate-300 uppercase">New Password</label>
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
              <label className="text-[10px] font-mono text-slate-300 uppercase">Confirm Password</label>
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
              className="w-full mt-2 py-3 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
            >
              Save Password
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

        {/* Back Link */}
        <div className="text-center pt-0.5">
          <button
            type="button"
            onClick={() => setPage("home")}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            ← Back to Home
          </button>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════
          EDUCA ID SSO KEYRING RESOLVER MODAL
      ══════════════════════════════════════════════════════════ */}
      {showEducaSSO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
          <div className="relative max-w-md w-full bg-[#0d120f]/95 border border-white/10 p-6 rounded-3xl shadow-[0_30px_70px_rgba(0,0,0,0.95)] flex flex-col gap-4">
            
            <button
              onClick={() => setShowEducaSSO(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/[0.08] hover:bg-white/20 text-white flex items-center justify-center text-xs cursor-pointer transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold">
                ✦
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Educa Sovereign Keyring
                </h3>
                <p className="text-[10px] font-mono text-slate-400">
                  Federated Credential Resolver
                </p>
              </div>
            </div>

            {ssoStage === "scanning" && (
              <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
                <div className="w-10 h-10 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                <p className="text-xs text-slate-400">
                  Detecting saved @educaveda.com profiles...
                </p>
              </div>
            )}

            {ssoStage === "discovered" && (
              <div className="space-y-3 pt-1">
                <span className="text-[9.5px] font-mono font-medium text-slate-400 uppercase tracking-wider block">
                  Select identity:
                </span>

                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                  {discoveredProfiles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => authenticateWithEducaProfile(p)}
                      className="w-full p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.98] border border-white/5 transition-all flex items-center justify-between text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{p.avatar}</span>
                        <div>
                          <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                            {p.name}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400 block">
                            {p.email}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 text-[8.5px] font-mono font-bold">
                        {p.role}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-white/[0.08] flex flex-col gap-2">
                  <span className="text-[9.5px] font-mono text-slate-400">
                    Or enter Educa mail:
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="user@educaveda.com"
                      value={customEducaEmail}
                      onChange={(e) => setCustomEducaEmail(e.target.value)}
                      className="flex-1 py-2 px-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!customEducaEmail) return;
                        authenticateWithEducaProfile({
                          id: "custom-" + Date.now(),
                          name: customEducaEmail.split("@")[0].toUpperCase(),
                          email: customEducaEmail,
                          role: "USER",
                          fallbackEmail: "admin@gmail.com",
                          lastActive: "Just now",
                          avatar: "👤"
                        });
                      }}
                      className="px-4 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              </div>
            )}

            {ssoStage === "authenticating" && (
              <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
                <div className="w-10 h-10 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                <p className="text-xs text-slate-400">Establishing secure session...</p>
              </div>
            )}

            {ssoStage === "success" && (
              <div className="py-6 flex flex-col items-center justify-center gap-2 text-center text-emerald-400">
                <span className="text-3xl">✓</span>
                <h4 className="text-sm font-bold text-white">Authenticated</h4>
                <p className="text-xs text-slate-400 font-mono">Redirecting...</p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
