import { Tabs } from 'expo-router/js-tabs';
import { Banknote, Building2, House, Plus, UserRound } from 'lucide-react-native';

import { TabBar, type TabBarAction, type TabBarItem } from '@/components/ui';
import { useNewEntry } from '@/features/entries/NewEntryProvider';

const tabs: readonly TabBarItem[] = [
  { key: 'index', label: 'Home', icon: House },
  { key: 'entries', label: 'Entries', icon: Banknote },
  { key: 'properties', label: 'Properties', icon: Building2 },
  { key: 'profile', label: 'Profile', icon: UserRound },
];

export default function TabsLayout() {
  const newEntry = useNewEntry();
  const addAction: TabBarAction = {
    label: 'New entry',
    icon: Plus,
    onPress: () => newEntry.open(),
  };

  return (
    <Tabs
      tabBar={({ state, navigation }) => (
        <TabBar
          items={tabs}
          activeKey={state.routes[state.index]?.name}
          onSelect={(name) => navigation.navigate(name)}
          action={addAction}
        />
      )}
    >
      {tabs.map((tab) => (
        <Tabs.Screen key={tab.key} name={tab.key} options={{ title: tab.label }} />
      ))}
    </Tabs>
  );
}
