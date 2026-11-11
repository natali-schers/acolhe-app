import { RoleTabs } from "@/components/domain/RoleTabs";

export default function PessoaLayout() {
  return (
    <RoleTabs
      role="pessoa"
      tabs={[
        { name: "index", title: "Início", icon: "home" },
        { name: "remedios", title: "Remédios", icon: "package" },
        { name: "rotina", title: "Rotina", icon: "file-text" },
        { name: "rede", title: "Rede", icon: "users" },
      ]}
    />
  );
}
