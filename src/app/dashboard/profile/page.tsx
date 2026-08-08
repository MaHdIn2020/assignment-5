"use client";
// /dashboard/profile — view + edit profile, change password.

import { api } from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useState } from "react";
import { UserCircle, KeyRound, Mail, Phone, Calendar } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  profilePhoto: z.string().url("Enter a valid URL").or(z.literal("")).optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one digit"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, setAuth } = useAuthStore();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      phone: user?.phone ?? "",
      profilePhoto: user?.profilePhoto ?? "",
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  if (!user) return null;

  async function onSaveProfile(values: ProfileForm) {
    if (!user) return;
    setSavingProfile(true);
    try {
      const { data } = await api.patch<{
        success: boolean;
        data: { id: string; name: string; email: string; role: string; phone?: string; profilePhoto?: string; isActive: boolean; createdAt: string };
      }>(`/api/users/${user.id}`, {
        name: values.name,
        phone: values.phone,
        profilePhoto: values.profilePhoto || undefined,
      });
      const updated = data.data;
      setAuth(
        { ...user, name: updated.name, phone: updated.phone, profilePhoto: updated.profilePhoto },
        useAuthStore.getState().accessToken!,
        useAuthStore.getState().refreshToken!
      );
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function onChangePassword(values: PasswordForm) {
    setSavingPassword(true);
    try {
      await api.post("/api/auth/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success("Password changed!");
      passwordForm.reset();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to change password.";
      toast.error(msg);
    } finally {
      setSavingPassword(false);
    }
  }

  const infoItems = [
    { icon: Mail, label: "Email", value: user.email },
    { icon: Phone, label: "Phone", value: user.phone || "—" },
    { icon: Calendar, label: "Joined", value: new Date(user.createdAt).toLocaleDateString() },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">
          My <span className="gradient-text">Profile</span>
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Manage your account details and password
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Account info card ─────────────────────────────────────────── */}
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-accent-primary/30 flex items-center justify-center text-accent-primary text-2xl font-bold">
              {user.profilePhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.profilePhoto}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <div>
              <h2 className="font-bold text-text-primary text-lg">{user.name}</h2>
              <span className="text-xs font-semibold bg-accent-primary/20 text-accent-primary px-2 py-0.5 rounded-full">
                {user.role}
              </span>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {infoItems.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 text-sm">
                <Icon size={15} className="text-accent-primary" />
                <span className="text-text-muted w-16">{label}</span>
                <span className="text-text-primary">{value}</span>
              </div>
            ))}
          </div>

          <h3 className="font-semibold text-text-secondary text-sm mb-3 flex items-center gap-2">
            <UserCircle size={15} /> Edit Profile
          </h3>
          <form
            onSubmit={profileForm.handleSubmit(onSaveProfile)}
            noValidate
            className="space-y-4"
          >
            <div>
              <label className="text-xs text-text-secondary mb-1.5 block uppercase tracking-wider">
                Full Name
              </label>
              <input className="form-input" {...profileForm.register("name")} id="profile-name" />
              {profileForm.formState.errors.name && (
                <p className="text-red-400 text-xs mt-1">
                  {profileForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs text-text-secondary mb-1.5 block uppercase tracking-wider">
                Phone
              </label>
              <input
                className="form-input"
                placeholder="+880…"
                {...profileForm.register("phone")}
                id="profile-phone"
              />
            </div>
            <div>
              <label className="text-xs text-text-secondary mb-1.5 block uppercase tracking-wider">
                Profile Photo URL
              </label>
              <input
                className="form-input"
                placeholder="https://…"
                {...profileForm.register("profilePhoto")}
                id="profile-photo"
              />
              {profileForm.formState.errors.profilePhoto && (
                <p className="text-red-400 text-xs mt-1">
                  {profileForm.formState.errors.profilePhoto.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={savingProfile}
              className="btn-primary w-full justify-center"
              id="save-profile-btn"
            >
              {savingProfile ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </div>

        {/* ── Change password card ──────────────────────────────────────── */}
        <div className="card p-6 self-start">
          <h3 className="font-semibold text-text-secondary mb-4 flex items-center gap-2">
            <KeyRound size={15} /> Change Password
          </h3>
          <form
            onSubmit={passwordForm.handleSubmit(onChangePassword)}
            noValidate
            className="space-y-4"
          >
            <div>
              <label className="text-xs text-text-secondary mb-1.5 block uppercase tracking-wider">
                Current Password
              </label>
              <input
                type="password"
                className="form-input"
                {...passwordForm.register("currentPassword")}
                id="current-password"
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-red-400 text-xs mt-1">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs text-text-secondary mb-1.5 block uppercase tracking-wider">
                New Password
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="Min 6 chars, 1 uppercase, 1 digit"
                {...passwordForm.register("newPassword")}
                id="new-password"
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-red-400 text-xs mt-1">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs text-text-secondary mb-1.5 block uppercase tracking-wider">
                Confirm New Password
              </label>
              <input
                type="password"
                className="form-input"
                {...passwordForm.register("confirmPassword")}
                id="confirm-password"
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={savingPassword}
              className="btn-primary w-full justify-center"
              id="change-password-btn"
            >
              {savingPassword ? "Updating…" : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
