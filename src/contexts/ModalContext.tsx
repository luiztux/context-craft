import React from 'react';

type ActionLogModalContextType = {
  actionLog: string[];
  addAction: (action: string) => void;
  clearLog: () => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

const ActionLogModalContext = React.createContext<ActionLogModalContextType | undefined>(
  undefined
);

export const useActionLogModalContext = () => {
  const context = React.useContext(ActionLogModalContext);
  if (!context) {
    throw new Error(
      'useActionLogContext deve ser usado dentro de um ActionLogProvider'
    );
  }
  return context;
};

export const ActionLogModalContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [actionLog, setActionLog] = React.useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const addAction = (action: string) =>
    setActionLog((prev) => [...prev, action]);
  const clearLog = () => setActionLog([]);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const MemoizedActionLogModalContextValues = React.useMemo(
    () => ({
      actionLog,
      addAction,
      clearLog,
      isModalOpen,
      openModal,
      closeModal,
    }),
    [actionLog, isModalOpen]
  );

  return (
    <ActionLogModalContext.Provider value={MemoizedActionLogModalContextValues}>
      {children}
    </ActionLogModalContext.Provider>
  );
};
