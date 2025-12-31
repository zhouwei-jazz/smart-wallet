import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Platform } from 'react-native';
import { useSupabase } from '@/components/providers/supabase-provider';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';

const quickActions: { label: string; icon: IconSymbolName; color: string }[] = [
  { label: '记一笔', icon: 'plus.app.fill', color: '#22C55E' },
  { label: '扫码入账', icon: 'qrcode.viewfinder', color: '#6366F1' },
  { label: 'OCR 票据', icon: 'doc.text.viewfinder', color: '#EC4899' },
  { label: '预算', icon: 'target', color: '#F97316' },
];

export default function OverviewScreen() {
  const { user } = useSupabase();
  const [isClient, setIsClient] = useState(false);
  
  // 确保只在客户端运行
  useEffect(() => {
    // 检查是否在客户端环境
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return;
    }
    setIsClient(true);
  }, []);

  // 服务端渲染时显示加载状态
  if (!isClient) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <ThemedText style={styles.loadingText}>初始化中...</ThemedText>
      </View>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#0F172A', dark: '#0B1220' }}
      headerImage={
        <View style={styles.headerGraphic}>
          <IconSymbol name="sparkles" size={42} color="#A5B4FC" />
          <ThemedText type="title" style={styles.headerTitle}>
            Smart Wallet
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {user?.user_metadata?.name || user?.email || '跨端智能记账 · 安全同步'}
          </ThemedText>
        </View>
      }>
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">账户总览</ThemedText>
        <ThemedView style={styles.emptyState}>
          <IconSymbol name="creditcard.fill" size={48} color="#6B7280" />
          <ThemedText style={styles.emptyText}>还没有账户</ThemedText>
          <ThemedText style={styles.emptySubtext}>添加您的第一个账户开始记账</ThemedText>
        </ThemedView>
      </ThemedView>
      
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">快捷操作</ThemedText>
        <View style={styles.actions}>
          {quickActions.map((action) => (
            <ThemedView key={action.label} style={styles.actionButton}>
              <View style={[styles.iconBadge, { backgroundColor: `${action.color}22` }]}>
                <IconSymbol name={action.icon} size={22} color={action.color} />
              </View>
              <ThemedText type="defaultSemiBold">{action.label}</ThemedText>
            </ThemedView>
          ))}
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">关键指标</ThemedText>
        <View style={styles.cardRow}>
          {[
            { title: '本月支出', value: '¥ 0', change: '-8.2%', trend: 'down' as const },
            { title: '收入', value: '¥ 0', change: '+5.1%', trend: 'up' as const },
            { title: '储蓄率', value: '0%', change: '+3.2%', trend: 'up' as const },
          ].map((item) => (
            <ThemedView key={item.title} style={styles.metricCard}>
              <ThemedText style={styles.metaText}>{item.title}</ThemedText>
              <ThemedText type="title" style={styles.metricValue}>
                {item.value}
              </ThemedText>
              <View style={styles.trendRow}>
                <IconSymbol
                  name={item.trend === 'up' ? 'arrow.up' : 'arrow.down'}
                  size={16}
                  color={item.trend === 'up' ? Colors.light.tint : '#EF4444'}
                />
                <ThemedText
                  style={[
                    styles.metaText,
                    { color: item.trend === 'up' ? Colors.light.tint : '#EF4444', fontWeight: '600' },
                  ]}>
                  {item.change}
                </ThemedText>
              </View>
            </ThemedView>
          ))}
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#6B7280',
  },
  headerGraphic: {
    flex: 1,
    padding: 28,
    justifyContent: 'flex-end',
    gap: 8,
  },
  headerTitle: {
    color: '#E0E7FF',
  },
  headerSubtitle: {
    color: '#CBD5E1',
  },
  section: {
    gap: 12,
  },
  cardRow: {
    gap: 12,
  },
  accountCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balance: {
    marginTop: 8,
    marginBottom: 4,
  },
  metaText: {
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  emptySubtext: {
    color: '#9CA3AF',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '47%',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
