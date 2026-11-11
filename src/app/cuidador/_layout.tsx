import { RoleTabs } from "@/components/domain/RoleTabs";

export default function CuidadorLayout() {
  return (
    <RoleTabs
      role="cuidador"
      tabs={[
        { name: "index", title: "Início", icon: "home" },
        { name: "alertas", title: "Alertas", icon: "bell" },
        { name: "rotina", title: "Rotina", icon: "file-text" },
        { name: "rede", title: "Rede", icon: "users" },
      ]}
    />
  );
}
