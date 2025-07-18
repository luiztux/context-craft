# 🧠 ContextCraft – Visualize, entenda e domine o React Context

**ContextCraft** é uma ferramenta interativa e educativa feita com React que te ajuda a **visualizar, testar e entender** a Context API de forma clara e divertida.

Ideal para quem:
- Está aprendendo React
- Tem dúvidas sobre como o Context se propaga
- Já sofreu com erros como "useContext must be inside a Provider"
- Quer entender **boas práticas e armadilhas comuns** da Context API

---

## ✨ Funcionalidades (MVP)

- 🔁 Atualização de valores em tempo real via UI
- 🎯 Destaque visual de componentes que re-renderizam
- ⚠️ Simulação de erros comuns com explicações guiadas
- 🧩 Visualização da árvore de Providers e Consumers
- 💬 Painel lateral com insights, boas práticas e mensagens didáticas
- 💾 Salvamento automático da simulação no `localStorage`

---

## 📚 Exemplo de erros cobertos

- `useContext` fora de um `Provider`
- `Maximum update depth exceeded`
- Re-renderizações desnecessárias
- `React.memo` sendo ignorado por contextos mutáveis
- Contexto usado como “state global” sem separação de responsabilidades

---

## 🛠️ Tecnologias utilizadas

- ⚛️ React + Vite
- 🎨 TailwindCSS
- 🎞️ Framer Motion (para animações visuais)
- 🧪 Context API
- 💾 LocalStorage (para persistência simples)

---

## 📦 Instalação

```bash
git clone https://github.com/seu-usuario/contextcraft.git
cd contextcraft
npm install
npm run dev
