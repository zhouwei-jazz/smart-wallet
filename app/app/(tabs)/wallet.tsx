import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Platform } from 'react-native';
import { useSupabase } from '@/components/providers/supabase-provider';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';

export default function WalletScreen() {
  const { user } = useSupabase();
  const [isClient, setIsClient] = useState(false);
  
  // 确保只在客户端运行
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return;
    }
    setIsClient(true);
  }, []);

  // 静态资产概览数据
  const cards = [
    { label: '总资产', value: '¥ 0', color: '#22C55E', icon: 'creditcard.fill' as const },
    { label: '可用余额', value: '¥ 0', color: '#2563EB', icon: 'sparkles' as const },
    { label: '预算剩余', value: '¥ 0', color: '#F97316', icon: 'target' as const },
  ];

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
      headerBackgroundColor={{ light: '#0B1727', dark: '#0B1727' }}
      headerImage={
        <View style={styles.headerGraphic}>
          <IconSymbol name="creditcard.fill" size={36} color="#E2E8F0" />
          <ThemedText type="title" style={styles.headerTitle}>
            钱包中心
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>账户、卡片与流水集中管理</ThemedText>
        </View>
      }>
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">资产概览</ThemedText>
        <View style={styles.cardGrid}>
          {cards.map((card) => (
            <ThemedView key={card.label} style={[styles.card, { borderColor: `${card.color}55` }]}>
              <View style={[styles.iconBadge, { backgroundColor: `${card.color}22` }]}>
                <IconSymbol name={card.icon} size={20} color={card.color} />
              </View>
              <ThemedText style={styles.meta}>{card.label}</ThemedText>
              <ThemedText type="title" style={styles.value}>
                {card.value}
              </ThemedText>
            </ThemedView>
          ))}
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">最近流水</ThemedText>
        <ThemedView style={styles.emptyState}>
          <IconSymbol name="list.bullet" size={48} color="#6B7280" />
          <ThemedText style={styles.emptyText}>暂无交易记录</ThemedText>
          <ThemedText style={styles.emptySubtext}>开始记录您的第一笔交易</ThemedText>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

// 格式化交易时间
function formatTransactionTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return '今天';
  } else if (diffInDays === 1) {
    return '昨天';
  } else if (diffInDays < 7) {
    return `${diffInDays}天前`;
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  }
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
    color: '#E2E8F0',
  },
  headerSubtitle: {
    color: '#CBD5E1',
  },
  section: {
    gap: 12,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  meta: {
    color: '#6B7280',
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
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
  list: {
    gap: 10,
  },
  listItem: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
