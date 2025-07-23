import { Splitter } from 'antd';
import { MainContent, TreeView } from '../../components/Components';
import { ActionLogModalContextProvider } from '../../contexts/ModalContext';

export const Craft = () => {

  return (
    <ActionLogModalContextProvider>
      <div className='h-screen'>
        <Splitter>
          <Splitter.Panel defaultSize='50%' min='40%' max='70%'>
            <div className='text-center w-full pt-3'>
              <span className='text-zinc-600 text-lg font-semibold'>
                Tree View
              </span>
            </div>
            {/* Passe handleLogAction para TreeView para registrar ações */}
            <TreeView />
          </Splitter.Panel>
          <Splitter.Panel>
            <div className='text-center w-full pt-3'>
              <span className='text-zinc-600 text-lg font-semibold'>
                Main Content
              </span>
            </div>
            {/* Passe o histórico de ações para MainContent */}
            <MainContent />
          </Splitter.Panel>
        </Splitter>
      </div>
    </ActionLogModalContextProvider>
  );
};
