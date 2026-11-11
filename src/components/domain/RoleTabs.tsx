import { Redirect, Tabs } from "expo-router";
import { Icon, type IconName } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { colors, fontFamily } from "@/theme";
import type { AppRole } from "@/types";

interface TabDef {
  name: string;
  title: string;
  icon: IconName;
}

/** Barra de abas usada pelos dois perfis. Só abre para quem tem o perfil certo. */
export function RoleTabs({ role, tabs }: { role: AppRole; tabs: TabDef[] }) {
  const { user } = useAuth();
  if (!user) return <Redirect href="/" />;
  if (user.role !== role) return <Redirect href={user.role === "pessoa" ? "/pessoa" : "/cuidador"} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { height: 76, paddingTop: 6, paddingBottom: 10, borderTopColor: colors.border },
        tabBarLabelStyle: { fontFamily: fontFamily.bold, fontSize: 13 },
      }}
    >
      {tabs.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ focused }) => <Icon name={t.icon} size={24} color={focused ? "primary" : "textMuted"} />,
          }}
        />
      ))}
    </Tabs>
  );
}
