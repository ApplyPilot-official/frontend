"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type OnboardingStep = "resume" | "personal" | "professional" | "review";

export default function OnboardingPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [step, setStep] = useState<OnboardingStep>("resume");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Form state
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [profile, setProfile] = useState({
        fullName: session?.user?.name || "",
        mobileNumber: "",
        city: "",
        state: "",
        linkedinUrl: "",
        githubUrl: "",
        yearsOfExperience: 0,
        currentJobTitle: "",
        targetJobTitle: "",
        skills: [] as string[],
        visaStatus: "",
        visaType: "",
        workAuthorization: "",
    });
    const [skillInput, setSkillInput] = useState("");

    const steps: { id: OnboardingStep; label: string; icon: string }[] = [
        { id: "resume", label: "Resume", icon: "📄" },
        { id: "personal", label: "Personal", icon: "👤" },
        { id: "professional", label: "Professional", icon: "💼" },
        { id: "review", label: "Review", icon: "✅" },
    ];

    const currentIndex = steps.findIndex((s) => s.id === step);

    const addSkill = () => {
        if (skillInput.trim() && !profile.skills.includes(skillInput.trim())) {
            setProfile({ ...profile, skills: [...profile.skills, skillInput.trim()] });
            setSkillInput("");
        }
    };

    const removeSkill = (skill: string) => {
        setProfile({
            ...profile,
            skills: profile.skills.filter((s) => s !== skill),
        });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError("");

        try {
            const res = await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile),
            });

            if (res.ok) {
                router.push("/dashboard");
            } else {
                const data = await res.json();
                setError(data.error || "Failed to save profile");
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass =
        "w-full px-4 py-3 bg-dark-600 border border-dark-50/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm";

    return (
        <div className="min-h-screen bg-dark-700 pt-24 pb-16">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Complete Your Profile
                    </h1>
                    <p className="text-sm text-slate-400">
                        This helps our AI create perfect applications for you
                    </p>
                </motion.div>

                {/* Progress Bar */}
                <div className="flex items-center justify-between mb-10 px-4">
                    {steps.map((s, i) => (
                        <div key={s.id} className="flex items-center">
                            <button
                                onClick={() => i <= currentIndex && setStep(s.id)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${step === s.id
                                        ? "bg-primary-500/10 text-primary-400 border border-primary-500/30"
                                        : i < currentIndex
                                            ? "bg-neon-emerald/10 text-neon-emerald"
                                            : "text-slate-500"
                                    }`}
                            >
                                <span>{i < currentIndex ? "✓" : s.icon}</span>
                                <span className="hidden sm:inline">{s.label}</span>
                            </button>
                            {i < steps.length - 1 && (
                                <div
                                    className={`w-8 sm:w-16 h-px mx-1 ${i < currentIndex ? "bg-neon-emerald" : "bg-dark-50/30"
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form */}
                <div className="bg-dark-400 rounded-2xl p-6 sm:p-8 border border-dark-50/20">
                    <AnimatePresence mode="wait">
                        {/* Step: Resume Upload */}
                        {step === "resume" && (
                            <motion.div
                                key="resume"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h2 className="text-lg font-bold text-white mb-1">
                                        Upload Your Resume
                                    </h2>
                                    <p className="text-sm text-slate-400">
                                        We&apos;ll use AI to auto-fill your profile from your resume
                                    </p>
                                </div>

                                <div
                                    className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all hover:border-primary-500/50 ${resumeFile
                                            ? "border-neon-emerald/50 bg-neon-emerald/5"
                                            : "border-dark-50/30"
                                        }`}
                                    onClick={() => document.getElementById("resume-input")?.click()}
                                >
                                    <input
                                        id="resume-input"
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        className="hidden"
                                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                                    />
                                    {resumeFile ? (
                                        <>
                                            <div className="text-4xl mb-3">✅</div>
                                            <p className="text-white font-medium">{resumeFile.name}</p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                            <p className="text-xs text-neon-emerald mt-2">
                                                Click to change file
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-4xl mb-3">📄</div>
                                            <p className="text-white font-medium">
                                                Drop your resume here or click to upload
                                            </p>
                                            <p className="text-xs text-slate-500 mt-2">
                                                Supports PDF, DOC, DOCX · Max 10MB
                                            </p>
                                        </>
                                    )}
                                </div>

                                <button
                                    onClick={() => setStep("personal")}
                                    className="w-full py-3 text-sm font-bold text-white bg-gradient-to-r from-neon-blue to-primary-500 rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                                >
                                    {resumeFile ? "Continue" : "Skip & Fill Manually"}
                                </button>
                            </motion.div>
                        )}

                        {/* Step: Personal Info */}
                        {step === "personal" && (
                            <motion.div
                                key="personal"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-5"
                            >
                                <h2 className="text-lg font-bold text-white">
                                    Personal Information
                                </h2>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1.5">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={profile.fullName}
                                            onChange={(e) =>
                                                setProfile({ ...profile, fullName: e.target.value })
                                            }
                                            className={inputClass}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1.5">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={profile.mobileNumber}
                                            onChange={(e) =>
                                                setProfile({ ...profile, mobileNumber: e.target.value })
                                            }
                                            className={inputClass}
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1.5">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            value={profile.city}
                                            onChange={(e) =>
                                                setProfile({ ...profile, city: e.target.value })
                                            }
                                            className={inputClass}
                                            placeholder="San Francisco"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1.5">
                                            State
                                        </label>
                                        <input
                                            type="text"
                                            value={profile.state}
                                            onChange={(e) =>
                                                setProfile({ ...profile, state: e.target.value })
                                            }
                                            className={inputClass}
                                            placeholder="California"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1.5">
                                            LinkedIn URL
                                        </label>
                                        <input
                                            type="url"
                                            value={profile.linkedinUrl}
                                            onChange={(e) =>
                                                setProfile({ ...profile, linkedinUrl: e.target.value })
                                            }
                                            className={inputClass}
                                            placeholder="https://linkedin.com/in/..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1.5">
                                            GitHub URL
                                        </label>
                                        <input
                                            type="url"
                                            value={profile.githubUrl}
                                            onChange={(e) =>
                                                setProfile({ ...profile, githubUrl: e.target.value })
                                            }
                                            className={inputClass}
                                            placeholder="https://github.com/..."
                                        />
                                    </div>
                                </div>

                                {/* Visa Info */}
                                <div className="border-t border-dark-50/20 pt-4">
                                    <h3 className="text-sm font-semibold text-white mb-3">
                                        Visa & Work Authorization
                                    </h3>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1.5">
                                                Visa Status
                                            </label>
                                            <select
                                                value={profile.visaStatus}
                                                onChange={(e) =>
                                                    setProfile({ ...profile, visaStatus: e.target.value })
                                                }
                                                className={inputClass}
                                            >
                                                <option value="">Select...</option>
                                                <option value="citizen">US Citizen</option>
                                                <option value="green-card">Green Card</option>
                                                <option value="h1b">H-1B</option>
                                                <option value="opt">OPT</option>
                                                <option value="stem-opt">STEM OPT</option>
                                                <option value="l1">L-1</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1.5">
                                                Work Authorization
                                            </label>
                                            <select
                                                value={profile.workAuthorization}
                                                onChange={(e) =>
                                                    setProfile({
                                                        ...profile,
                                                        workAuthorization: e.target.value,
                                                    })
                                                }
                                                className={inputClass}
                                            >
                                                <option value="">Select...</option>
                                                <option value="authorized">
                                                    Authorized to work in US
                                                </option>
                                                <option value="sponsorship">
                                                    Need visa sponsorship
                                                </option>
                                                <option value="future-sponsorship">
                                                    May need future sponsorship
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setStep("resume")}
                                        className="px-6 py-3 text-sm font-medium text-slate-400 bg-dark-600 rounded-xl hover:bg-dark-300 transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => setStep("professional")}
                                        className="flex-1 py-3 text-sm font-bold text-white bg-gradient-to-r from-neon-blue to-primary-500 rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step: Professional */}
                        {step === "professional" && (
                            <motion.div
                                key="professional"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-5"
                            >
                                <h2 className="text-lg font-bold text-white">
                                    Professional Details
                                </h2>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1.5">
                                            Current Job Title
                                        </label>
                                        <input
                                            type="text"
                                            value={profile.currentJobTitle}
                                            onChange={(e) =>
                                                setProfile({
                                                    ...profile,
                                                    currentJobTitle: e.target.value,
                                                })
                                            }
                                            className={inputClass}
                                            placeholder="Software Engineer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1.5">
                                            Target Job Title
                                        </label>
                                        <input
                                            type="text"
                                            value={profile.targetJobTitle}
                                            onChange={(e) =>
                                                setProfile({
                                                    ...profile,
                                                    targetJobTitle: e.target.value,
                                                })
                                            }
                                            className={inputClass}
                                            placeholder="Senior Software Engineer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1.5">
                                            Years of Experience
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="50"
                                            value={profile.yearsOfExperience}
                                            onChange={(e) =>
                                                setProfile({
                                                    ...profile,
                                                    yearsOfExperience: parseInt(e.target.value) || 0,
                                                })
                                            }
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                {/* Skills */}
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1.5">
                                        Skills
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={skillInput}
                                            onChange={(e) => setSkillInput(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                                            className={`${inputClass} flex-1`}
                                            placeholder="Type a skill and press Enter"
                                        />
                                        <button
                                            type="button"
                                            onClick={addSkill}
                                            className="px-4 py-2 bg-primary-500/20 text-primary-400 rounded-xl text-sm font-medium hover:bg-primary-500/30 transition-all"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="inline-flex items-center gap-1 px-3 py-1 bg-dark-600 text-slate-300 text-xs rounded-full"
                                            >
                                                {skill}
                                                <button
                                                    onClick={() => removeSkill(skill)}
                                                    className="text-slate-500 hover:text-red-400 ml-1"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setStep("personal")}
                                        className="px-6 py-3 text-sm font-medium text-slate-400 bg-dark-600 rounded-xl hover:bg-dark-300 transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => setStep("review")}
                                        className="flex-1 py-3 text-sm font-bold text-white bg-gradient-to-r from-neon-blue to-primary-500 rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                                    >
                                        Review Profile
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step: Review */}
                        {step === "review" && (
                            <motion.div
                                key="review"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-5"
                            >
                                <h2 className="text-lg font-bold text-white">
                                    Review Your Profile
                                </h2>

                                <div className="space-y-4">
                                    <div className="bg-dark-600 rounded-xl p-4">
                                        <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                                            Personal
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-slate-500">Name:</span>{" "}
                                                <span className="text-white">{profile.fullName || "—"}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">Phone:</span>{" "}
                                                <span className="text-white">{profile.mobileNumber || "—"}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">Location:</span>{" "}
                                                <span className="text-white">
                                                    {profile.city && profile.state
                                                        ? `${profile.city}, ${profile.state}`
                                                        : "—"}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">Visa:</span>{" "}
                                                <span className="text-white">{profile.visaStatus || "—"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-dark-600 rounded-xl p-4">
                                        <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                                            Professional
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-slate-500">Current:</span>{" "}
                                                <span className="text-white">{profile.currentJobTitle || "—"}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">Target:</span>{" "}
                                                <span className="text-white">{profile.targetJobTitle || "—"}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">Experience:</span>{" "}
                                                <span className="text-white">{profile.yearsOfExperience} years</span>
                                            </div>
                                        </div>
                                        {profile.skills.length > 0 && (
                                            <div className="mt-3">
                                                <span className="text-slate-500 text-sm">Skills:</span>{" "}
                                                <div className="flex flex-wrap gap-1.5 mt-1">
                                                    {profile.skills.map((s) => (
                                                        <span
                                                            key={s}
                                                            className="px-2 py-0.5 bg-primary-500/10 text-primary-400 text-xs rounded-full"
                                                        >
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {resumeFile && (
                                        <div className="bg-dark-600 rounded-xl p-4">
                                            <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                                                Resume
                                            </h3>
                                            <p className="text-sm text-white">📄 {resumeFile.name}</p>
                                        </div>
                                    )}
                                </div>

                                {error && (
                                    <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                                        {error}
                                    </p>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setStep("professional")}
                                        className="px-6 py-3 text-sm font-medium text-slate-400 bg-dark-600 rounded-xl hover:bg-dark-300 transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="flex-1 py-3 text-sm font-bold text-white bg-gradient-to-r from-neon-emerald to-primary-500 rounded-xl hover:shadow-lg hover:shadow-neon-emerald/30 transition-all disabled:opacity-60"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Saving...
                                            </span>
                                        ) : (
                                            "Save & Go to Dashboard 🚀"
                                        )}
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
