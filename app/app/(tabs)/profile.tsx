import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSupabase } from '@/components/providers/supabase-provider';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, loading, signOut } = useSupabase();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText style={styles.loadingText}>加载中...</ThemedText>
      </View>
    );
  }

  const stats = {
    accountCount: 3,
    transactionCount: 25,
    totalBalance: 18500,
    daysUsed: 28,
  };

  const handleSignOut = async () => {
    Alert.alert(
      '退出登录',
      '确定要退出登录吗？',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '退出',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('User confirmed sign out');
              await signOut();
              // 不需要手动导航，认证状态变化会自动处理路由
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('退出失败', '请重试');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {!user ? (
        <View style={styles.signedOutContainer}>
          <View style={styles.signedOutContent}>
            <IconSymbol name="person.crop.circle" size={80} color="#64748b" />
            <ThemedText type="title" style={styles.signedOutTitle}>欢迎使用智能钱包</ThemedText>
            <ThemedText style={styles.signedOutSubtitle}>
              登录以访问您的个人资料并在设备间同步数据
            </ThemedText>
            <View style={styles.authButtons}>
              <TouchableOpacity
                style={styles.signInButton}
                onPress={() => router.push('/(auth)/login' as any)}
              >
                <ThemedText style={styles.signInButtonText}>登录</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.signUpButton}
                onPress={() => router.push('/(auth)/register' as any)}
              >
                <ThemedText style={styles.signUpButtonText}>创建账户</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <>
          {/* 用户信息 */}
          <ThemedView style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <ThemedText style={styles.avatarText}>
                  {user?.user_metadata?.name?.[0] || user?.email?.[0] || 'U'}
                </ThemedText>
              </View>
            </View>
            <ThemedText type="title" style={styles.userName}>
              {user?.user_metadata?.name || user?.email?.split('@')[0] || '用户'}
            </ThemedText>
            <ThemedText style={styles.userEmail}>
              {user?.email}
            </ThemedText>
          </ThemedView>

          {/* 使用统计 */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>使用统计</ThemedText>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <IconSymbol name="creditcard.fill" size={24} color="#3B82F6" />
                <ThemedText style={styles.statValue}>{stats.accountCount}</ThemedText>
                <ThemedText style={styles.statLabel}>账户</ThemedText>
              </View>
              <View style={styles.statItem}>
                <IconSymbol name="creditcard.fill" size={24} color="#10B981" />
                <ThemedText style={styles.statValue}>{stats.transactionCount}</ThemedText>
                <ThemedText style={styles.statLabel}>交易</ThemedText>
              </View>
              <View style={styles.statItem}>
                <IconSymbol name="creditcard.fill" size={24} color="#F59E0B" />
                <ThemedText style={styles.statValue}>¥{stats.totalBalance}</ThemedText>
                <ThemedText style={styles.statLabel}>总资产</ThemedText>
              </View>
              <View style={styles.statItem}>
                <IconSymbol name="creditcard.fill" size={24} color="#8B5CF6" />
                <ThemedText style={styles.statValue}>{stats.daysUsed}</ThemedText>
                <ThemedText style={styles.statLabel}>使用天数</ThemedText>
              </View>
            </View>
          </ThemedView>

          {/* 设置选项 */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>设置</ThemedText>
            <View style={styles.settingsList}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <IconSymbol name="person.crop.circle" size={20} color="#6B7280" />
                  <ThemedText style={styles.settingText}>个人信息</ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={16} color="#6B7280" />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <IconSymbol name="sparkles" size={20} color="#6B7280" />
                  <ThemedText style={styles.settingText}>通知设置</ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={16} color="#6B7280" />
              </View>

              <TouchableOpacity style={styles.settingItem} onPress={handleSignOut}>
                <View style={styles.settingLeft}>
                  <IconSymbol name="arrow.right.square" size={20} color="#EF4444" />
                  <ThemedText style={[styles.settingText, { color: '#EF4444' }]}>退出登录</ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </ThemedView>

          {/* 同步状态 */}
          <ThemedView style={[styles.section, styles.lastSection]}>
            <View style={styles.syncStatus}>
              <View style={styles.syncIndicator}>
                <View style={styles.syncDot} />
                <ThemedText style={styles.syncText}>实时同步 · 正常</ThemedText>
              </View>
              <ThemedText style={styles.syncSubtext}>Supabase Realtime</ThemedText>
            </View>
          </ThemedView>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  loadingText: {
    color: '#64748b',
    fontSize: 16,
  },
  signedOutContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 600,
  },
  signedOutContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  signedOutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  signedOutSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  authButtons: {
    width: '100%',
    gap: 12,
  },
  signInButton: {
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  avatarContainer: {
    marginBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  userEmail: {
    fontSize: 16,
    color: '#94A3B8',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  lastSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    padding: 16,
    paddingBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  statItem: {
    width: '47%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  settingsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: 'white',
  },
  syncStatus: {
    alignItems: 'center',
    padding: 24,
  },
  syncIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  syncText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  syncSubtext: {
    fontSize: 12,
    color: '#64748b',
  },
});