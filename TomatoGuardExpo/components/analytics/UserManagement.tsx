import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchAllUsers,
  updateUserRole,
  updateUserStatus,
  User,
} from '../../services/api/userService';

const UserManagement: React.FC = () => {
  const { authState } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deactivateModalVisible, setDeactivateModalVisible] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState('');

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAllUsers(authState.accessToken || undefined);
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }, [authState.accessToken]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleStatus = async (user: User) => {
    const newStatus = !user.is_active;

    // If deactivating, open the reason modal instead of a simple confirm
    if (!newStatus) {
      setSelectedUser(user);
      setDeactivateReason('');
      setDeactivateModalVisible(true);
      return;
    }

    // Activating — simple confirmation
    const doActivate = async () => {
      try {
        setActionLoading(user.id);
        const updated = await updateUserStatus(user.id, true, authState.accessToken || undefined);
        setUsers(prev => prev.map(u => u.id === user.id ? updated : u));
      } catch (err: any) {
        console.error('Failed to update user status:', err);
        const message = err?.response?.data?.detail || 'Failed to update user status';
        if (Platform.OS === 'web') {
          window.alert(message);
        } else {
          Alert.alert('Error', message);
        }
      } finally {
        setActionLoading(null);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to activate ${user.full_name || user.email}?`);
      if (confirmed) doActivate();
    } else {
      Alert.alert(
        'Activate User',
        `Are you sure you want to activate ${user.full_name || user.email}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Activate', onPress: doActivate },
        ]
      );
    }
  };

  const handleDeactivateConfirm = async () => {
    if (!selectedUser) return;
    if (!deactivateReason.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Please enter a reason for deactivation.');
      } else {
        Alert.alert('Required', 'Please enter a reason for deactivation.');
      }
      return;
    }

    try {
      setActionLoading(selectedUser.id);
      const updated = await updateUserStatus(
        selectedUser.id,
        false,
        authState.accessToken || undefined,
        deactivateReason.trim()
      );
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
      setDeactivateModalVisible(false);
      setSelectedUser(null);
      setDeactivateReason('');
    } catch (err: any) {
      console.error('Failed to deactivate user:', err);
      const message = err?.response?.data?.detail || 'Failed to deactivate user';
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangeRole = async (newRole: 'user' | 'admin') => {
    if (!selectedUser) return;
    
    try {
      setActionLoading(selectedUser.id);
      const updated = await updateUserRole(selectedUser.id, newRole, authState.accessToken || undefined);
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
      setRoleModalVisible(false);
      setSelectedUser(null);
    } catch (err: any) {
      console.error('Failed to update user role:', err);
      const message = err?.response?.data?.detail || 'Failed to update user role';
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setRoleModalVisible(true);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Unknown';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={s.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={s.loadingText}>Loading users...</Text>
      </View>
    );
  }

  if (users.length === 0) {
    return (
      <View style={s.container}>
        <Text style={s.sectionTitle}>User Management</Text>
        <View style={s.emptyCard}>
          <Text style={s.emptyIcon}>👥</Text>
          <Text style={s.emptyText}>No users found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.headerRow}>
        <Text style={s.sectionTitle}>User Management</Text>
        <View style={s.badge}>
          <Text style={s.badgeText}>{users.length} users</Text>
        </View>
      </View>
      <Text style={s.subTitle}>
        Manage user accounts, roles, and access
      </Text>

      {users.map((user) => {
        const isCurrentUser = user.id === authState.user?.id;
        const isDisabled = actionLoading === user.id;

        return (
          <View key={user.id} style={[s.userCard, !user.is_active && s.inactiveCard]}>
            <View style={s.userHeader}>
              {/* Profile Picture */}
              <View style={s.avatarContainer}>
                {user.profile_picture ? (
                  <Image source={{ uri: user.profile_picture }} style={s.avatar} />
                ) : (
                  <View style={[s.avatar, s.avatarPlaceholder]}>
                    <Text style={s.avatarText}>
                      {(user.full_name || user.email).charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              {!user.is_active && user.deactivation_reason && (
                  <View style={s.reasonContainer}>
                    <Text style={s.reasonLabel}>Deactivation Reason:</Text>
                    <Text style={s.reasonText}>{user.deactivation_reason}</Text>
                  </View>
                )}
                {!user.is_active && (
                  <View style={s.inactiveBadge}>
                    <Text style={s.inactiveBadgeText}>Inactive</Text>
                  </View>
                )}
              </View>

              {/* User Info */}
              <View style={s.userInfo}>
                <Text style={s.userName}>{user.full_name || 'No Name'}</Text>
                <Text style={s.userEmail}>{user.email}</Text>
                <View style={s.metaRow}>
                  <View style={[s.roleBadge, user.role === 'admin' ? s.adminBadge : s.userBadge]}>
                    <Text style={s.roleText}>{user.role.toUpperCase()}</Text>
                  </View>
                  <Text style={s.memberSince}>Member since {formatDate(user.created_at)}</Text>
                </View>
              </View>
            </View>

            {/* Actions */}
            {!isCurrentUser && (
              <View style={s.actionRow}>
                <TouchableOpacity
                  style={[s.actionBtn, user.is_active ? s.deactivateBtn : s.activateBtn]}
                  onPress={() => handleToggleStatus(user)}
                  disabled={isDisabled}
                >
                  {isDisabled ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={s.actionBtnText}>
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.actionBtn, s.roleBtn]}
                  onPress={() => openRoleModal(user)}
                  disabled={isDisabled}
                >
                  <Text style={s.actionBtnText}>Change Role</Text>
                </TouchableOpacity>
              </View>
            )}
            {isCurrentUser && (
              <View style={s.currentUserBadge}>
                <Text style={s.currentUserText}>This is you</Text>
              </View>
            )}
          </View>
        );
      })}

      {/* Role Change Modal */}
      <Modal
        visible={roleModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Change Role</Text>
            <Text style={s.modalSubtitle}>
              Select a new role for {selectedUser?.full_name || selectedUser?.email}
            </Text>
            
            <TouchableOpacity
              style={[
                s.roleOption,
                selectedUser?.role === 'user' && s.roleOptionSelected,
              ]}
              onPress={() => handleChangeRole('user')}
              disabled={actionLoading !== null}
            >
              <View style={s.roleOptionContent}>
                <Text style={s.roleOptionTitle}>User</Text>
                <Text style={s.roleOptionDesc}>Standard access to app features</Text>
              </View>
              {selectedUser?.role === 'user' && (
                <Text style={s.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                s.roleOption,
                selectedUser?.role === 'admin' && s.roleOptionSelected,
              ]}
              onPress={() => handleChangeRole('admin')}
              disabled={actionLoading !== null}
            >
              <View style={s.roleOptionContent}>
                <Text style={s.roleOptionTitle}>Admin</Text>
                <Text style={s.roleOptionDesc}>Full access including user management</Text>
              </View>
              {selectedUser?.role === 'admin' && (
                <Text style={s.checkmark}>✓</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={s.cancelBtn}
              onPress={() => {
                setRoleModalVisible(false);
                setSelectedUser(null);
              }}
            >
              <Text style={s.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Deactivation Reason Modal */}
      <Modal
        visible={deactivateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setDeactivateModalVisible(false);
          setSelectedUser(null);
          setDeactivateReason('');
        }}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Deactivate User</Text>
            <Text style={s.modalSubtitle}>
              Please provide a reason for deactivating{' '}
              {selectedUser?.full_name || selectedUser?.email}
            </Text>

            <TextInput
              style={s.reasonInput}
              placeholder="Enter reason for deactivation..."
              placeholderTextColor="#64748b"
              value={deactivateReason}
              onChangeText={setDeactivateReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[s.actionBtn, s.deactivateBtn, { marginBottom: 10 }]}
              onPress={handleDeactivateConfirm}
              disabled={actionLoading !== null || !deactivateReason.trim()}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={[s.actionBtnText, !deactivateReason.trim() && { opacity: 0.5 }]}>
                  Confirm Deactivation
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={s.cancelBtn}
              onPress={() => {
                setDeactivateModalVisible(false);
                setSelectedUser(null);
                setDeactivateReason('');
              }}
            >
              <Text style={s.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
  },
  badge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  subTitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
  },
  emptyCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
  userCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inactiveCard: {
    opacity: 0.7,
    borderColor: '#ef4444',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  inactiveBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  inactiveBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  adminBadge: {
    backgroundColor: '#7c3aed',
  },
  userBadge: {
    backgroundColor: '#3b82f6',
  },
  roleText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  memberSince: {
    fontSize: 11,
    color: '#64748b',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  activateBtn: {
    backgroundColor: '#22c55e',
  },
  deactivateBtn: {
    backgroundColor: '#ef4444',
  },
  roleBtn: {
    backgroundColor: '#6366f1',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  currentUserBadge: {
    marginTop: 12,
    backgroundColor: '#334155',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  currentUserText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 20,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleOptionSelected: {
    borderColor: '#6366f1',
  },
  roleOptionContent: {
    flex: 1,
  },
  roleOptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 2,
  },
  roleOptionDesc: {
    fontSize: 12,
    color: '#94a3b8',
  },
  checkmark: {
    color: '#6366f1',
    fontSize: 20,
    fontWeight: '700',
  },
  cancelBtn: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#334155',
  },
  cancelBtnText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
  reasonContainer: {
    backgroundColor: '#2d1215',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  reasonLabel: {
    color: '#f87171',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 3,
  },
  reasonText: {
    color: '#fca5a5',
    fontSize: 12,
  },
  reasonInput: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 14,
    color: '#f8fafc',
    fontSize: 14,
    minHeight: 100,
    marginBottom: 16,
  },
});

export default UserManagement;
