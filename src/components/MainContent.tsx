import { useState } from 'react';
import { History, Bolt } from 'lucide-react';
import { FloatButton, Modal } from 'antd';
import { useActionLogModalContext } from '../contexts/ModalContext';

const errorDetails: {
  [key: string]: { title: string; explanation: string; code?: string };
} = {
  'Consumer fora de um Provider': {
    title: 'Consumer fora de um Provider',
    explanation:
      'Um Consumer precisa estar dentro de um Provider para acessar o valor do contexto. Fora dele, o valor será undefined e pode causar bugs ou comportamentos inesperados.',
    code: `// Errado
function MyComponent() {
  const value = useContext(MyContext); // Erro: fora de Provider
}

// Certo
<MyContext.Provider value="algum valor">
  <MyComponent />
</MyContext.Provider>`,
  },
  'Provider aninhado dentro de outro Provider do mesmo tipo': {
    title: 'Provider aninhado do mesmo tipo',
    explanation:
      'Providers do mesmo tipo aninhados podem causar shadowing, ou seja, o Provider mais interno sobrescreve o valor do externo. Isso pode dificultar o entendimento de qual valor está sendo consumido.',
    code: `<ThemeContext.Provider value="dark">
  <ThemeContext.Provider value="light">
    <MyComponent />
  </ThemeContext.Provider>
</ThemeContext.Provider>
// MyComponent recebe "light"`,
  },
  'Possível ciclo de atualização': {
    title: 'Maximum update depth exceeded',
    explanation:
      'Providers aninhados com o mesmo valor podem causar loops de atualização, resultando em erros como "Maximum update depth exceeded". Evite atualizar Providers em cascata sem controle.',
    code: `// Exemplo de ciclo
function Parent() {
  const [value, setValue] = useState(0);
  return (
    <MyContext.Provider value={value}>
      <Child setValue={setValue} />
    </MyContext.Provider>
  );
}
function Child({ setValue }) {
  useEffect(() => setValue(v => v + 1), []);
  return null;
}
// Isso pode causar um loop infinito.`,
  },
  'Consumer não recebeu valor de contexto': {
    title: 'Consumer sem valor',
    explanation:
      'O Consumer está recebendo undefined ou valor vazio, geralmente porque não há Provider acima ou o valor não foi definido.',
    code: `<MyContext.Provider>
  <MyComponent />
</MyContext.Provider>
// Se não passar value, o contexto será undefined.`,
  },
  'Provider não possui nenhum Consumer descendente': {
    title: 'Provider sem Consumers',
    explanation:
      'Esse Provider não está sendo utilizado por nenhum Consumer abaixo dele. Pode indicar contexto desnecessário ou estrutura incorreta.',
  },
  'Muitos Providers ou Consumers detectados': {
    title: 'Contexto usado como “state global”',
    explanation:
      'Pode indicar uso excessivo de Context como “state global”. Considere modularizar e separar responsabilidades para evitar re-renderizações desnecessárias.',
  },
  'Consumer sob múltiplos Providers do mesmo tipo': {
    title: 'Consumer sob múltiplos Providers do mesmo tipo',
    explanation:
      'Pode causar confusão sobre qual valor está sendo consumido. Prefira Providers de tipos diferentes ou evite aninhar Providers do mesmo tipo.',
  },
};

export const MainContent = () => {
  const [selectedError, setSelectedError] = useState<string | null>(null);
  const { actionLog, isModalOpen, openModal, closeModal } =
    useActionLogModalContext();

  return (
    <>
      <FloatButton.Group
        trigger='click'
        tooltip={{
          title: 'Ações rápidas',
          placement: 'left',
        }}
        icon={<Bolt size={24} />}
      >
        <FloatButton
          icon={<History size={24} />}
          tooltip='Histórico de ações'
          onClick={openModal}
        />
      </FloatButton.Group>
      <Modal
        title='Histórico de ações'
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
      >
        {/* <h3 className='text-lg font-semibold mt-6 mb-2'>Histórico de ações</h3> */}
        <ul className='list-disc pl-6 text-zinc-700'>
          {actionLog.length === 0 ? (
            <span>Nenhuma ação registrada ainda.</span>
          ) : (
            actionLog.map((log, idx) => <li key={idx}>{log}</li>)
          )}
        </ul>
      </Modal>
      <div className='p-6'>
        <h2 className='text-xl font-bold mb-4'>Como usar o ContextCraft</h2>
        <ul className='mb-6 list-disc pl-6 text-zinc-700'>
          <li>Adicione Providers e Consumers à árvore usando os ícones.</li>
          <li>Arraste componentes para reorganizar a hierarquia.</li>
          <li>Altere valores de contexto nos Providers e veja a propagação.</li>
          <li>
            Observe os erros destacados e clique para ver explicações
            detalhadas.
          </li>
        </ul>
        <h3 className='text-lg font-semibold mb-2'>Tipos de Erros Simulados</h3>
        <ul className='mb-6 list-disc pl-6 text-zinc-700'>
          {Object.values(errorDetails).map((err, idx) => (
            <li key={idx}>
              <button
                className='text-blue-700 underline hover:text-blue-900'
                onClick={() => setSelectedError(err.title)}
                type='button'
              >
                {err.title}
              </button>
            </li>
          ))}
        </ul>
        {selectedError && (
          <div className='bg-blue-50 border border-blue-300 p-4 rounded mb-6'>
            <button
              className='float-right text-blue-700'
              onClick={() => setSelectedError(null)}
              type='button'
            >
              Fechar
            </button>
            <h4 className='text-lg font-bold mb-2'>{selectedError}</h4>
            <p className='mb-2'>{errorDetails[selectedError]?.explanation}</p>
            {errorDetails[selectedError]?.code && (
              <pre className='bg-zinc-100 p-2 rounded text-xs my-2 whitespace-pre-wrap'>
                {errorDetails[selectedError].code}
              </pre>
            )}
          </div>
        )}
        <h3 className='text-lg font-semibold mb-2'>Boas Práticas</h3>
        <ul className='list-disc pl-6 text-zinc-700'>
          <li>Use Context para dados realmente globais.</li>
          <li>Evite Providers do mesmo tipo aninhados sem necessidade.</li>
          <li>Prefira separar contextos por responsabilidade.</li>
          <li>Evite atualizar Providers em cascata sem controle.</li>
        </ul>

        <h3 className='text-lg font-semibold mt-6 mb-2'>Links úteis</h3>
        <ul className='list-disc pl-6 text-zinc-700'>
          <li>
            <a
              href='https://react.dev/reference/react/useContext'
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-600 underline'
            >
              Documentação oficial do React Context
            </a>
          </li>
          <li>
            <a
              href='https://kentcdodds.com/blog/how-to-use-react-context-effectively'
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-600 underline'
            >
              Como usar React Context efetivamente (Kent C. Dodds)
            </a>
          </li>
        </ul>
      </div>
    </>
  );
};
