import { ActivityIndicator, RefreshControl, ScrollView, SectionList, View } from 'react-native';
import { Banknote, Plus } from 'lucide-react-native';

import { Amount, Banner, Button, Card, EmptyState, Text } from '@/components/ui';
import { EntryRow } from '@/features/entries/components/EntryRow';
import { groupEntriesByMonth, type EntryMonth } from '@/features/entries/lib/entryList';
import { useNewEntry } from '@/features/entries/NewEntryProvider';
import { useEntries } from '@/features/entries/queries';
import { useUserTimeZone } from '@/features/profile/queries';
import { currentMonthStart } from '@/shared/dates';
import { toneColor } from '@/theme/tokens';

function MonthSummary({ month, current }: { month: EntryMonth; current: boolean }) {
  const net = month.incomeCents - month.expenseCents;
  return (
    <Card className="mb-6 gap-4">
      <View className="gap-1">
        <Text size="sm" tone="grey">
          {current ? 'This month' : month.title}
        </Text>
        <Amount
          cents={net}
          kind={net >= 0 ? 'income' : 'expense'}
          showSign
          className="font-mono text-4xl"
        />
        <Text size="sm" tone="grey">
          Net cash flow
        </Text>
      </View>
      <View className="flex-row gap-3">
        <View className="flex-1 gap-0.5 rounded-tile bg-success-tint px-3 py-2.5">
          <Text size="sm" tone="success">
            Money in
          </Text>
          <Amount cents={month.incomeCents} kind="income" size="lg" className="font-mono" />
        </View>
        <View className="flex-1 gap-0.5 rounded-tile bg-danger-tint px-3 py-2.5">
          <Text size="sm" tone="danger">
            Money out
          </Text>
          <Amount cents={month.expenseCents} kind="expense" size="lg" className="font-mono" />
        </View>
      </View>
    </Card>
  );
}

function MonthHeader({ month }: { month: EntryMonth }) {
  return (
    <View className="flex-row items-baseline justify-between bg-surface pb-2 pt-4">
      <Text accessibilityRole="header" weight="semibold" size="lg">
        {month.title}
      </Text>
      <View className="flex-row items-baseline gap-2">
        <Amount cents={month.incomeCents} kind="income" showSign size="sm" hideCents />
        <Amount cents={month.expenseCents} kind="expense" showSign size="sm" hideCents />
      </View>
    </View>
  );
}

function NoEntries({ onAdd }: { onAdd: () => void }) {
  return (
    <View className="flex-1 justify-center bg-surface px-screen">
      <EmptyState>
        <EmptyState.Header>
          <EmptyState.Media variant="icon" icon={Banknote} />
          <EmptyState.Title>No entries yet</EmptyState.Title>
          <EmptyState.Description>
            Rent, bills and repairs you log will show up here, grouped by month.
          </EmptyState.Description>
        </EmptyState.Header>
        <EmptyState.Content>
          <Button leftIcon={Plus} label="New entry" onPress={onAdd} />
        </EmptyState.Content>
      </EmptyState>
    </View>
  );
}

export default function EntriesScreen() {
  const entries = useEntries();
  const newEntry = useNewEntry();
  const timeZone = useUserTimeZone();

  if (entries.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color={toneColor('accent')} />
      </View>
    );
  }

  const refreshControl = (
    <RefreshControl
      refreshing={entries.isRefetching}
      onRefresh={() => void entries.refetch()}
      colors={[toneColor('accent')]}
    />
  );

  if (entries.isError) {
    return (
      <ScrollView
        className="flex-1 bg-surface"
        contentContainerClassName="gap-3 p-5"
        refreshControl={refreshControl}
      >
        <Banner message="Couldn't load your entries. Pull down or tap Retry." />
        <Button
          variant="secondary"
          label="Retry"
          loading={entries.isRefetching}
          onPress={() => void entries.refetch()}
        />
      </ScrollView>
    );
  }

  if (entries.data.length === 0) return <NoEntries onAdd={() => newEntry.open()} />;

  const months = groupEntriesByMonth(entries.data);
  // One item per month: its entries render together in a single card.
  const sections = months.map((month) => ({ month, data: [month.data] }));
  const [latest] = months;
  const thisMonth = currentMonthStart(timeZone);

  return (
    <SectionList
      className="flex-1 bg-surface"
      contentContainerClassName="px-screen pb-10 pt-5"
      sections={sections}
      keyExtractor={(monthEntries) => monthEntries[0]?.id ?? 'empty'}
      stickySectionHeadersEnabled
      refreshControl={refreshControl}
      ListHeaderComponent={
        latest === undefined ? null : (
          <MonthSummary month={latest} current={latest.month === thisMonth} />
        )
      }
      renderSectionHeader={({ section }) => <MonthHeader month={section.month} />}
      renderItem={({ item }) => (
        <Card padding="none">
          {item.map((entry, index) => (
            <EntryRow key={entry.id} entry={entry} divider={index < item.length - 1} />
          ))}
        </Card>
      )}
    />
  );
}
