# Acolhe App

Aplicativo mobile do **Acolhe**, plataforma de socorro para pessoas idosas ou com deficiência.

- **Pessoa cuidada:** botão grande "Preciso de ajuda", remédios do dia, rotina e rede de cuidado.
- **Cuidador(a)** (familiar, vizinho, amigo...): recebe o alerta, assume o atendimento e acompanha a rotina.
- **Widget de SOS** na tela inicial (Android e iPhone): pede ajuda sem precisar abrir o app.

> O portal web (família e médicos) fica no repositório `acolhe-web`.

## Tecnologias

- Expo SDK 58 + React Native + TypeScript
- Expo Router (navegação por arquivos em `src/app`)
- TanStack React Query (dados)
- Fonte Atkinson Hyperlegible (feita para baixa visão), `expo-speech` (ler em voz alta), `expo-haptics` (vibração na contagem)
- Widgets: `expo-widgets` (iPhone) e `react-native-android-widget` (Android)

## Como rodar

```bash
npm install
cp .env.example .env
npx expo start
```

- **Celular:** abra o app **Expo Go** e leia o QR code. Tudo funciona, **menos o widget** (veja abaixo).
- **Navegador:** aperte `w` no terminal (ou `npm run web`).

Na tela de login há o botão **"Entrar como Dona Maria"** / **"Entrar como Ana"** (modo demonstração, sem backend).

### Roteiro de demonstração

1. Entre como **Dona Maria** → toque em **PRECISO DE AJUDA** → contagem de 5 s → a rede "vê" e a Ana "assume" sozinha (simulação).
2. Entre como **Ana** → na tela inicial, toque em **Simular alerta** → **Assumir e ir ajudar** → **Cheguei, está tudo bem**.
3. Abra o link `acolhe://sos` (ou `/sos` na web): é o que o widget faz.

## Widget de SOS (tela inicial)

Tocar no widget abre `acolhe://sos`, que leva direto para a **contagem de 5 segundos**, onde dá para cancelar.
Assim um toque sem querer no widget não dispara o alerta.

| Plataforma | Arquivo | Biblioteca |
| --- | --- | --- |
| Android | `src/widgets/android/SosWidget.tsx` | `react-native-android-widget` (abre o link com `OPEN_URI`; pode ficar na tela de bloqueio) |
| iPhone | `src/widgets/ios/SosWidget.tsx` | `expo-widgets` (abre o link com `widgetURL`; tamanhos pequeno, médio e tela de bloqueio) |

Configuração dos dois em `app.json` (seção `plugins`).

**Widgets não funcionam no Expo Go.** Para testar, gere uma versão de desenvolvimento:

```bash
# Android (precisa do Android Studio instalado)
npx expo run:android

# ou na nuvem, sem instalar nada (Android ou iOS)
npx eas-cli@latest build --profile development --platform android
```

O iPhone exige um Mac com Xcode (`npx expo run:ios`) ou o EAS Build com conta de desenvolvedor Apple.
Depois de instalar, segure o dedo na tela inicial → Widgets → **Acolhe SOS**.

> ⚠️ Os widgets ainda não foram testados em aparelho real. O código segue a documentação das duas bibliotecas,
> mas pode precisar de pequenos ajustes no primeiro build.

## Estrutura de pastas

```
index.ts                 # Entrada: Expo Router + registro do widget Android
src/
├── app/                 # Telas (cada arquivo é uma rota)
│   ├── index.tsx        # Boas-vindas (escolha de perfil)
│   ├── login.tsx
│   ├── sos.tsx          # Destino do widget (acolhe://sos)
│   ├── pessoa/          # Abas da pessoa cuidada: Início, Remédios, Rotina, Rede
│   ├── cuidador/        # Abas do cuidador: Início, Alertas, Rotina, Rede
│   ├── emergencia/      # Contagem, Alerta enviado, Alerta recebido
│   └── nova-anotacao.tsx
├── screens/             # Telas compartilhadas pelos dois perfis (Rotina, Rede)
├── components/
│   ├── ui/              # Componentes genéricos (AppText, Button, Card, Screen...)
│   └── domain/          # Componentes do Acolhe (HelpButton, Timeline, RecipientList...)
├── contexts/            # AuthContext (sessão) e EmergencyContext (estado do alerta)
├── hooks/               # Hooks do React Query
├── services/            # Camada de dados (API ou dados simulados)
├── mocks/               # Dados simulados
├── theme/               # colors.ts (cores) e tokens.ts (espaços, fontes)
├── types/               # Modelos de dados (os mesmos do acolhe-web)
├── utils/
└── widgets/             # Widgets de SOS (android/ e ios/)
```

## Cores

Todas as cores ficam em **`src/theme/colors.ts`**, com os mesmos valores do portal web. As telas usam `colors.primary`,
`colors.danger` etc.; nunca um `#hex` solto. (Exceção: o widget do iPhone roda isolado e repete as cores dentro do arquivo.)

## Integração com o backend

1. No `.env`: `EXPO_PUBLIC_USE_MOCKS=false` e `EXPO_PUBLIC_API_URL=https://sua-api/api`.
2. Implemente as rotas usadas em `src/services/*` (cada função mostra o caminho da API).
3. **Alertas em tempo real:** em `alertService.subscribe`, troque o emissor em memória por WebSocket e
   **notificações push** (`expo-notifications`), para o cuidador ser avisado mesmo com o app fechado.
4. **Sessão salva:** guarde o token com `expo-secure-store` no `AuthContext`. Isso é necessário para o widget funcionar sem pedir login.
5. **Localização:** envie a posição do celular junto com o alerta (`expo-location`).

As telas não precisam mudar.
