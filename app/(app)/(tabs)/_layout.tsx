import { Tabs } from 'expo-router/js-tabs';
import { Banknote, Building2, House, Plus, UserRound } from 'lucide-react-native';

import { TabBar, toast, type TabBarAction, type TabBarItem } from '@/components/ui';

const tabs: readonly TabBarItem[] = [
  { key: 'index', label: 'Home', icon: House },
  { key: 'entries', label: 'Entries', icon: Banknote },
  { key: 'properties', label: 'Properties', icon: Building2 },
  { key: 'profile', label: 'Profile', icon: UserRound },
];

const addAction: TabBarAction = {
  label: 'Add',
  icon: Plus,
  onPress: () => toast.show({ variant: 'neutral', message: 'Adding entries is coming soon' }),
};

export default function TabsLayout() {
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
