import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Platform } from 'react-native';
import { useSupabase } from '@/components/providers/supabase-provider';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';

export default function AnalyticsScreen() {
  const { user } = useSupabase();
  const [isClient, setIsClient] = useState(false);
  
  // 确保只在客户端运行
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return;
    }
    setIsClient(true);
  }, []);

  // 静态分析数据
  const analytics = {
    totalExpense: 0,
    totalIncome: 0,
    savingRate: 0,
    expenseByCategory: [],
    transactionCount: 0,
  };

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
          <IconSymbol name="chart.bar.fill" size={36} color="#A5B4FC" />
          <ThemedText type="title" style={styles.headerTitle}>
            数据分析
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>财务数据洞察与趋势分析</ThemedText>
        </View>
      }>
      
      {/* 关键指标 */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">关键指标</ThemedText>
        <View style={styles.metricsGrid}>
          <ThemedView style={[styles.metricCard, { borderColor: '#EF444455' }]}>
            <View style={[styles.iconBadge, { backgroundColor: '#EF444422' }]}>
              <IconSymbol name="arrow.down" size={20} color="#EF4444" />
            </View>
            <ThemedText style={styles.metricLabel}>总支出</ThemedText>
            <ThemedText type="title" style={[styles.metricValue, { color: '#EF4444' }]}>
              ¥ {analytics.totalExpense.toFixed(0)}
            </ThemedText>
          </ThemedView>

          <ThemedView style={[styles.metricCard, { borderColor: '#22C55E55' }]}>
            <View style={[styles.iconBadge, { backgroundColor: '#22C55E22' }]}>
              <IconSymbol name="arrow.up" size={20} color="#22C55E" />
            </View>
            <ThemedText style={styles.metricLabel}>总收入</ThemedText>
            <ThemedText type="title" style={[styles.metricValue, { color: '#22C55E' }]}>
              ¥ {analytics.totalIncome.toFixed(0)}
            </ThemedText>
          </ThemedView>

          <ThemedView style={[styles.metricCard, { borderColor: '#3B82F655' }]}>
            <View style={[styles.iconBadge, { backgroundColor: '#3B82F622' }]}>
              <IconSymbol name="percent" size={20} color="#3B82F6" />
            </View>
            <ThemedText style={styles.metricLabel}>储蓄率</ThemedText>
            <ThemedText type="title" style={[styles.metricValue, { color: '#3B82F6' }]}>
              {analytics.savingRate.toFixed(1)}%
            </ThemedText>
          </ThemedView>

          <ThemedView style={[styles.metricCard, { borderColor: '#F59E0B55' }]}>
            <View style={[styles.iconBadge, { backgroundColor: '#F59E0B22' }]}>
              <IconSymbol name="list.bullet" size={20} color="#F59E0B" />
            </View>
            <ThemedText style={styles.metricLabel}>交易笔数</ThemedText>
            <ThemedText type="title" style={[styles.metricValue, { color: '#F59E0B' }]}>
              {analytics.transactionCount}
            </ThemedText>
          </ThemedView>
        </View>
      </ThemedView>

      {/* 支出分类 */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">支出分类</ThemedText>
        <ThemedView style={styles.emptyState}>
          <IconSymbol name="chart.pie" size={48} color="#6B7280" />
          <ThemedText style={styles.emptyText}>暂无支出数据</ThemedText>
          <ThemedText style={styles.emptySubtext}>开始记录支出来查看分析</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* 账户分布 */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">账户分布</ThemedText>
        <ThemedView style={styles.emptyState}>
          <IconSymbol name="creditcard" size={48} color="#6B7280" />
          <ThemedText style={styles.emptyText}>暂无账户数据</ThemedText>
          <ThemedText style={styles.emptySubtext}>添加账户来查看分布</ThemedText>
        </ThemedView>
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '47%',
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
  metricLabel: {
    color: '#6B7280',
    fontSize: 12,
  },
  metricValue: {
    fontSize: 20,
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
  categoryList: {
    gap: 12,
  },
  categoryItem: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryPercentage: {
    color: '#6B7280',
    fontSize: 12,
  },
  categoryAmount: {
    color: '#EF4444',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  accountList: {
    gap: 12,
  },
  accountItem: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountIcon: {
    fontSize: 24,
  },
  accountType: {
    color: '#6B7280',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  accountBalance: {
    alignItems: 'flex-end',
  },
  accountPercentage: {
    color: '#6B7280',
    fontSize: 12,
  },
});