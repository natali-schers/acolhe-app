import { Redirect, Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, type IconName } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { colors, fontFamily } from "@/theme";
import type { AppRole } from "@/types";

interface TabDef {
  name: string;
  title: string;
  icon: IconName;
}

export function RoleTabs({ role, tabs }: { role: AppRole; tabs: TabDef[] }) {
  const { user } = useAuth();
  const { bottom } = useSafeAreaInsets();

  if (!user) return <Redirect href="/" />;
  
  if (user.role !== role)
    return <Redirect href={user.role === "pessoa" ? "/pessoa" : "/cuidador"} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: 76 + bottom,
          paddingTop: 6,
          paddingBottom: 10 + bottom,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontFamily: fontFamily.bold, fontSize: 13 },
      }}
    >
      {tabs.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ focused }) => (
              <Icon
                name={t.icon}
                size={24}
                color={focused ? "primary" : "textMuted"}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
