import { Tabs } from 'expo-router';

import Ionicons from '@expo/vector-icons/Ionicons';


export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007BFF',
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerShadowVisible: false,
        headerTintColor: '#007BFF',
        tabBarStyle: {
          backgroundColor: '#fff',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'library-sharp' : 'library-outline'} color={color} size={24}/>
          ),
        }}
      />
      <Tabs.Screen
        name="rankings"
        options={{
          title: 'Rankings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'logo-tableau' : 'logo-tableau'} color={color} size={24}/>
          ),
        }}
      />
    </Tabs>
  );
}
