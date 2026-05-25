import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, Trash2, Camera, Check, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import api from "../lib/axios";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef(null);
  const formRef = useRef(null);

  const avatarSrc = user?.avatar
    ? user.avatar.startsWith("/uploads") ? `http://localhost:5000${user.avatar}` : user.avatar
    : null;

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const formData = new FormData(formRef.current);
      formData.set("name", name);
      const { data } = await api.put("/users/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateUser(data.user);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return toast.error("Passwords do not match");
    if (passwords.new.length < 8) return toast.error("New password must be at least 8 characters");
    setSavingPassword(true);
    try {
      await api.put("/users/me/password", { currentPassword: passwords.current, newPassword: passwords.new });
      setPasswords({ current: "", new: "", confirm: "" });
      toast.success("Password changed successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return toast.error('Type "DELETE" to confirm');
    setDeleting(true);
    try {
      await api.delete("/users/me");
      await logout();
      navigate("/");
      toast.success("Account deleted. Goodbye! 👋");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete account");
    } finally {
      setDeleting(false);
      setDeleteModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface pt-20 pb-24 md:pb-8">
      <div className="container-custom px-4 py-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-primary mb-8">Profile Settings</h1>

        {/* ─── Avatar + Name ─────────────────────────────────────────── */}
        <form ref={formRef} onSubmit={handleProfileSave}>
          <div className="card p-6 mb-6 space-y-5">
            <h2 className="font-bold text-primary flex items-center gap-2">
              <User size={16} className="text-accent" /> Personal Information
            </h2>

            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0)?.toUpperCase()
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-white hover:bg-accent transition-colors"
                >
                  <Camera size={12} />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  name="avatar"
                  accept="image/*"
                  className="hidden"
                  onChange={() => formRef.current?.dispatchEvent(new Event("submit", { bubbles: true }))}
                />
              </div>
              <div>
                <p className="font-semibold text-primary">{user?.name}</p>
                <p className="text-sm text-muted">{user?.email}</p>
                <button type="button" onClick={() => fileRef.current?.click()} className="text-xs text-accent hover:underline mt-1">
                  Change avatar
                </button>
              </div>
            </div>

            {/* Name */}
            <div className="input-group">
              <label className="label">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input pl-9" />
              </div>
            </div>

            {/* Email (read only) */}
            <div className="input-group">
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input type="email" value={user?.email || ""} className="input pl-9 bg-slate-50 text-muted" readOnly />
              </div>
              <p className="text-xs text-muted">Email cannot be changed</p>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" variant="primary" loading={savingProfile}>
                <Check size={14} /> Save Changes
              </Button>
              {user?.isVerified ? (
                <span className="badge badge-success text-xs">✓ Email Verified</span>
              ) : (
                <span className="badge badge-danger text-xs">⚠ Email Not Verified</span>
              )}
            </div>
          </div>
        </form>

        {/* ─── Change Password ────────────────────────────────────────── */}
        <form onSubmit={handlePasswordChange}>
          <div className="card p-6 mb-6 space-y-5">
            <h2 className="font-bold text-primary flex items-center gap-2">
              <Lock size={16} className="text-accent" /> Change Password
            </h2>

            {[
              { label: "Current Password", key: "current" },
              { label: "New Password", key: "new" },
              { label: "Confirm New Password", key: "confirm" },
            ].map((field) => (
              <div key={field.key} className="input-group">
                <label className="label">{field.label}</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={passwords[field.key]}
                    onChange={(e) => setPasswords((p) => ({ ...p, [field.key]: e.target.value }))}
                    className="input pl-9 pr-10"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPass((v) => !v)}
              leftIcon={showPass ? <EyeOff size={13} /> : <Eye size={13} />}
            >
              {showPass ? "Hide" : "Show"} passwords
            </Button>

            <Button type="submit" variant="outline" loading={savingPassword}>
              <Lock size={14} /> Change Password
            </Button>
          </div>
        </form>

        {/* ─── Danger Zone ────────────────────────────────────────────── */}
        <div className="card p-6 border-danger/30 border-2">
          <h2 className="font-bold text-danger flex items-center gap-2 mb-3">
            <AlertTriangle size={16} /> Danger Zone
          </h2>
          <p className="text-sm text-muted mb-4">
            Permanently delete your account and all your trips. This action is irreversible.
          </p>
          <Button variant="danger" onClick={() => setDeleteModal(true)}>
            <Trash2 size={14} /> Delete My Account
          </Button>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="⚠️ Delete Account"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" loading={deleting} onClick={handleDeleteAccount}>
              <Trash2 size={14} /> Permanently Delete
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-muted text-sm">
            This will permanently delete your account and <strong>all your trips</strong>. This cannot be undone.
          </p>
          <div className="input-group">
            <label className="label">Type <code className="bg-slate-100 px-1 rounded text-danger">DELETE</code> to confirm</label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              className="input border-danger/50 focus:ring-danger"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
