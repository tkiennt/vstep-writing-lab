'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  ShieldCheck,
  Ban,
  Mail,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adminUserService, type AdminUser } from '@/services/adminUserService';

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminUserService.getAllUsers();
      setUsers(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách người dùng';
      setError(msg);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleActive = async (user: AdminUser) => {
    if (togglingId) return;

    const confirmMsg = user.isActive
      ? `Bạn có chắn chắn muốn vô hiệu hóa tài khoản "${user.displayName || user.email}"? Người dùng sẽ không thể đăng nhập.`
      : `Bạn có chắc chắn muốn kích hoạt lại tài khoản "${user.displayName || user.email}"?`;

    if (!confirm(confirmMsg)) return;

    setTogglingId(user.userId);
    setError(null);
    try {
      const updated = await adminUserService.updateUser(user.userId, {
        isActive: !user.isActive,
      });
      setUsers((prev) =>
        prev.map((u) => (u.userId === user.userId ? updated : u))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể cập nhật trạng thái';
      setError(msg);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (user: AdminUser) => {
    if (deletingId) return;

    const confirmMsg = `Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản "${user.displayName || user.email}"?\n\nHành động này không thể hoàn tác. Tài khoản và dữ liệu liên quan sẽ bị xóa.`;

    if (!confirm(confirmMsg)) return;

    setDeletingId(user.userId);
    setError(null);
    try {
      await adminUserService.deleteUser(user.userId);
      setUsers((prev) => prev.filter((u) => u.userId !== user.userId));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể xóa tài khoản';
      setError(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-vstep-dark" />
          Quản lý người dùng
        </h1>
        <Button
          onClick={fetchUsers}
          variant="outline"
          disabled={loading}
          className="flex items-center gap-2 rounded-xl"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Tải lại
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto w-full max-w-7xl mx-auto space-y-8 pb-20">
        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading && users.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
            <p className="text-gray-500 font-medium">Đang tải danh sách...</p>
          </div>
        ) : (
          /* Data Table */
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden min-h-[300px]">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-gray-500 font-black text-[10px] uppercase tracking-widest border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5">Tài khoản</th>
                  <th className="px-8 py-5">Vai trò</th>
                  <th className="px-8 py-5 text-center">Trạng thái</th>
                  <th className="px-8 py-5">Ngày tạo</th>
                  <th className="px-8 py-5 text-right">Thao tác</th>
                  <th className="px-8 py-5 w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-16 text-center text-gray-500">
                      Chưa có người dùng nào
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                      {/* User Info */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center shrink-0 border border-emerald-100 text-lg">
                            {(user.displayName || user.email || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-base mb-0.5">
                              {user.displayName || 'Chưa đặt tên'}
                            </p>
                            <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-gray-400" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-8 py-6">
                        <span
                          className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider
                            ${user.role === 'admin' ? 'bg-purple-50 border border-purple-200 text-purple-700' : 'bg-gray-100 text-gray-600'}`}
                        >
                          {user.role === 'admin' ? 'Quản trị viên' : 'Học viên'}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="px-8 py-6 text-center">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <ShieldCheck className="w-4 h-4" /> Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-100">
                            <Ban className="w-4 h-4 text-red-500" /> Vô hiệu hóa
                          </span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="px-8 py-6 text-gray-500 text-sm">
                        {formatDate(user.createdAt)}
                      </td>

                      {/* Toggle Active */}
                      <td className="px-8 py-6 text-right">
                        <Button
                          onClick={() => handleToggleActive(user)}
                          disabled={togglingId === user.userId || deletingId === user.userId}
                          variant={user.isActive ? 'outline' : 'default'}
                          className={`rounded-xl font-bold h-10 px-6 transition-all shadow-sm
                            ${user.isActive
                              ? 'border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                        >
                          {togglingId === user.userId ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : user.isActive ? (
                            <>
                              <Ban className="w-4 h-4 mr-2" />
                              Vô hiệu hóa
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4 mr-2" />
                              Kích hoạt
                            </>
                          )}
                        </Button>
                      </td>

                      {/* Delete */}
                      <td className="px-8 py-6">
                        <Button
                          onClick={() => handleDelete(user)}
                          disabled={deletingId === user.userId || user.role === 'admin'}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl disabled:opacity-50"
                          title={user.role === 'admin' ? 'Không thể xóa tài khoản admin' : 'Xóa tài khoản'}
                        >
                          {deletingId === user.userId ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
