# Sistema de Notificações Flutuantes

Este sistema implementa notificações flutuantes em tempo real usando SSE (Server-Sent Events) e a biblioteca `notistack`.

## Componentes

### 1. `NotificationListener`
- **Localização**: `src/components/notifications/NotificationListener.tsx`
- **Função**: Escuta notificações via SSE e exibe notificações flutuantes
- **Características**:
  - Conecta automaticamente ao endpoint SSE `/api/notifications/stream`
  - Respeita as configurações do usuário (som e notificações flutuantes)
  - Toca sons de notificação quando habilitado
  - Não renderiza interface (componente invisível)

### 2. `FloatingNotification`
- **Localização**: `src/components/notistack/FloatingNotification.tsx`
- **Função**: Componente visual das notificações flutuantes
- **Características**:
  - Visual moderno com chip de categoria
  - Ícone de notificação
  - Botão de fechar
  - Suporte a título, descrição e data
  - Cores diferentes por tipo de notificação

### 3. `NotificationsConfig`
- **Localização**: `src/components/navigation/TopBar/NotificationsConfig.tsx`
- **Função**: Configurações de notificação
- **Características**:
  - Seleção de som (incluindo "Sem som")
  - Toggle para notificações flutuantes
  - Preview de sons
  - Persistência no localStorage

## Como Funciona

1. **SSE Connection**: O `NotificationListener` conecta ao endpoint SSE quando a aplicação carrega
2. **Recebimento**: Quando uma nova notificação é recebida via SSE, o listener:
   - Verifica se notificações flutuantes estão habilitadas
   - Exibe a notificação usando `enqueueSnackbar`
   - Toca o som configurado (se habilitado)
3. **Exibição**: O `FloatingNotification` renderiza a notificação com visual customizado
4. **Auto-dismiss**: A notificação desaparece automaticamente após 6 segundos

## Configuração

As configurações são armazenadas no localStorage:
- `sound`: ID do som selecionado ("none", "ding-1", "ding-2", "ding-3")
- `floating`: Boolean indicando se notificações flutuantes estão habilitadas

## Tipos de Notificação

- **payment_confirmed**: Pagamento confirmado (cor verde)
- **family_filled**: Família completa (cor azul)
- **registration_completed**: Inscrição realizada (cor primária)

## Integração

O sistema está integrado no layout protegido (`app/(protected)/layout.tsx`):

```tsx
<SnackbarClientProvider>
  <NotificationListener />
  <ProtectedLayoutContent>{children}</ProtectedLayoutContent>
</SnackbarClientProvider>
```

## Arquivos de Som

Os sons estão localizados em `/public/sounds/`:
- `ding-1.mp3`
- `ding-2.mp3`
- `ding-3.mp3`

## Limitações do Mock

O mock está configurado para enviar no máximo 10 notificações para evitar spam durante desenvolvimento.
