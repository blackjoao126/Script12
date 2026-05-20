# 🚀 Guia Completo de Deploy - Vercel

## ✅ Status: Pronto para Deploy

Seu repositório está **100% configurado** e **reorganizado** para fazer deploy no Vercel!

---

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes UI reutilizáveis (Shadcn/ui)
├── lib/                 # Utilitários, helpers e funções
│   ├── error-capture.ts
│   └── error-page.ts
├── middleware/          # Middlewares de autenticação
├── routes/              # Definições de rotas
├── pages/               # Páginas da aplicação
├── types/               # Tipos TypeScript
├── router.tsx           # Configuração do router
├── entry-server.ts      # Entry point do servidor SSR
└── server.ts            # Handler do servidor
```

---

## 📋 O que foi preparado:

- ✅ `src/entry-server.ts` - Entry point para Cloudflare Workers
- ✅ `src/lib/error-capture.ts` - Captura de erros
- ✅ `src/lib/error-page.ts` - Página de erro customizada
- ✅ `src/server.ts` - Handler do servidor
- ✅ `src/router.tsx` - Configuração de rotas
- ✅ `vercel.json` - Configuração automática do Vercel
- ✅ `.vercelignore` - Arquivos ignorados no deploy
- ✅ `.env.example` - Variáveis de ambiente
- ✅ `package.json` - Todas as dependências corretas
- ✅ `vite.config.ts` - Build otimizado
- ✅ `tsconfig.json` - TypeScript configurado

---

## 🚀 Instruções de Deploy

### **Passo 1: Conectar ao Vercel**

1. Acesse **[vercel.com](https://vercel.com)**
2. Clique em **"Sign Up"** ou **"Log In"** (com GitHub)
3. Authorize o Vercel a acessar seus repositórios

### **Passo 2: Importar Projeto**

1. No dashboard do Vercel, clique em **"Add New..."**
2. Selecione **"Project"**
3. Clique em **"Import Git Repository"**
4. Procure por **`Script12`** (seu repositório)
5. Clique em **"Import"**

### **Passo 3: Configurar Variáveis de Ambiente**

Na página de configuração do projeto:

1. Vá para **"Environment Variables"**
2. Adicione estas variáveis (copie do seu `.env.local`):
   - **Name**: `VITE_SUPABASE_URL` → **Value**: sua URL do Supabase
   - **Name**: `VITE_SUPABASE_ANON_KEY` → **Value**: sua chave do Supabase
   - (Adicione outras conforme necessário)

3. Clique em **"Add"** para cada variável

### **Passo 4: Fazer Deploy**

1. Clique em **"Deploy"**
2. Aguarde o build completar (≈2-3 minutos)
3. Verifique a URL do seu site: `https://seu-projeto.vercel.app`

---

## 🔄 Deploy Automático (após primeiro deploy)

A partir de agora, **qualquer push para `main` faz deploy automaticamente**:

```bash
# No seu computador:
git add .
git commit -m "Sua mensagem"
git push origin main

# Vercel detecta automaticamente e faz o deploy! 🚀
```

---

## 🛠️ Deploy Manual (Alternativo)

Se preferir usar a CLI do Vercel:

```bash
# 1. Instale a CLI
npm install -g vercel

# 2. Faça login com sua conta GitHub
vercel login

# 3. Deploy para produção
vercel --prod
```

---

## ✨ Funcionalidades Incluídas

| Feature | Status |
|---------|--------|
| Build Vite otimizado | ✅ |
| React 19 + TypeScript | ✅ |
| TanStack React Router | ✅ |
| TanStack React Start | ✅ |
| Tailwind CSS | ✅ |
| Shadcn/ui Components | ✅ |
| Supabase Integration | ✅ |
| Cloudflare Workers | ✅ |
| Environment Variables | ✅ |
| Projeto Reorganizado | ✅ |

---

## 🔍 Verificação pós-Deploy

Após o deploy, verifique:

- [ ] Página carrega sem erros 404
- [ ] Componentes React renderizam
- [ ] Conexão com Supabase funciona
- [ ] Variáveis de ambiente estão carregadas
- [ ] Estilos Tailwind aplicados corretamente
- [ ] Estrutura de pastas funciona corretamente

---

## 🆘 Troubleshooting

### Build falha com erro?

1. Verifique os **logs** no Vercel Dashboard
2. Confirme que `src/entry-server.ts` existe
3. Verifique se todas as dependências estão em `package.json`
4. Limpe o cache: Settings → Advanced → Clear Build Cache

### Página em branco?

1. Abra o DevTools (F12)
2. Verifique a aba "Console" para erros
3. Verifique se as variáveis de ambiente estão corretas

### Erro de Supabase?

1. Confirme URL e chave em "Environment Variables"
2. Verifique CORS no Supabase: Settings → API → CORS

---

## 📱 Adicionar Domínio Customizado

Para usar seu próprio domínio:

1. Dashboard → Project → Settings → Domains
2. Clique em "Add"
3. Digite seu domínio
4. Siga as instruções para atualizar os nameservers

---

## 💾 Commits importantes

```bash
# Commits recentes com reorganização:
- src/entry-server.ts ✅
- src/lib/error-capture.ts ✅
- src/lib/error-page.ts ✅
- src/router.tsx ✅
- src/server.ts ✅
- vercel.json ✅
- .vercelignore ✅
- .env.example ✅
```

---

## 📞 Suporte

- 📖 [Docs Vercel](https://vercel.com/docs)
- 🤖 [Docs Vite](https://vite.dev)
- ⚛️ [Docs React](https://react.dev)
- 🎨 [Docs Tailwind](https://tailwindcss.com)

---

**Tudo pronto! Comece seu deploy agora! 🚀**

Última atualização: 2026-05-20
