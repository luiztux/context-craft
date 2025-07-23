import React, { useState, useCallback, useEffect } from 'react';
import type { Component, ComponentType } from '../types';
import { Button, Input, Tooltip, Empty } from 'antd';
import { X, Puzzle, Box, Layers } from 'lucide-react';
import { useActionLogModalContext } from '../contexts/ModalContext';

// Explicações detalhadas dos erros
const errorExplanations: Record<string, string> = {
  'Consumer não recebeu valor de contexto':
    'O Consumer está recebendo undefined ou valor vazio, geralmente porque não há Provider acima ou o valor não foi definido.',
  'Consumer fora de um Provider':
    'Um Consumer precisa estar dentro de um Provider para acessar o valor do contexto. Fora dele, o valor será undefined.',
  'Provider aninhado dentro de outro Provider do mesmo tipo':
    'Providers do mesmo tipo aninhados podem causar shadowing, ou seja, o Provider mais interno sobrescreve o valor do externo.',
  'Possível ciclo de atualização':
    'Providers aninhados com o mesmo valor podem causar loops de atualização, resultando em erros como "Maximum update depth exceeded".',
  'Provider não possui nenhum Consumer descendente':
    'Esse Provider não está sendo utilizado por nenhum Consumer abaixo dele.',
  'Muitos Providers ou Consumers detectados':
    'Pode indicar uso excessivo de Context como “state global”. Considere modularizar.',
  'Consumer sob múltiplos Providers do mesmo tipo':
    'Pode causar confusão sobre qual valor está sendo consumido.',
};

// Inicialização da árvore de componentes
const initialComponents: Component[] = [
  {
    id: 'root',
    type: 'App',
    children: [],
  },
];

// Função para propagar valor de contexto do Provider para Consumers descendentes
function propagateContext(
  component: Component,
  contextValue?: string
): Component {
  let propagatedValue = contextValue;
  if (component.type === 'Provider') {
    propagatedValue = component.contextValue;
  }
  return {
    ...component,
    children: component.children.map((child) =>
      propagateContext(child, propagatedValue)
    ),
    contextValue:
      component.type === 'Consumer' ? propagatedValue : component.contextValue,
  };
}

// Nó visual da árvore
const ComponentNode: React.FC<{
  component: Component;
  onRemove: (id: string) => void;
  onUpdateContext: (id: string, value: string) => void;
  onDropComponent: (draggedId: string, targetId: string) => void;
  onAddComponent: (parentId: string, type: ComponentType) => void;
  isRoot?: boolean;
}> = ({
  component,
  onRemove,
  onUpdateContext,
  onDropComponent,
  onAddComponent,
  isRoot = false,
}) => {
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    setHighlight(true);
    const timer = setTimeout(() => setHighlight(false), 300);
    return () => clearTimeout(timer);
  }, [component]);

  const getBackgroundColor = () => {
    switch (component.type) {
      case 'App':
        return 'bg-purple-100';
      case 'Provider':
        return 'bg-blue-200';
      case 'Consumer':
        return 'bg-teal-100';
      case 'Component':
        return 'bg-neutral-200';
      default:
        return 'bg-zinc-50';
    }
  };

  return (
    <div
      className={`p-2 m-2 rounded w-full ${getBackgroundColor()} ${
        highlight ? 're-render-highlight' : ''
      }`}
      draggable={!isRoot}
      onDragStart={(e) => {
        if (!isRoot) {
          e.stopPropagation();
          e.dataTransfer.setData('componentId', component.id);
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const draggedId = e.dataTransfer.getData('componentId');
        if (draggedId && draggedId !== component.id) {
          onDropComponent(draggedId, component.id);
        }
      }}
    >
      <div className='font-bold flex items-center gap-2'>
        {component.type}
        {/* Só permite remover se não for o App */}
        {!isRoot && (
          <Tooltip title='Remover componente'>
            <Button
              ghost
              className='border-none'
              icon={<X size={16} className='text-red-600' />}
              onClick={() => onRemove(component.id)}
              size='small'
            />
          </Tooltip>
        )}
      </div>
      {component.type === 'Provider' && (
        <Input
          placeholder='Defina o valor do contexto'
          allowClear
          value={component.contextValue || ''}
          onChange={(e) => onUpdateContext(component.id, e.target.value)}
          className='my-2'
        />
      )}
      {component.type === 'Consumer' && (
        <div className='text-xs text-gray-700'>
          Contexto:{' '}
          <span className='font-mono'>
            {component.contextValue ?? 'undefined'}
          </span>
        </div>
      )}
      <div className='ml-4 p-3'>
        <div className='flex my-4 gap-2 items-center'>
          <Tooltip title='Adicionar Provider'>
            <Button
              ghost
              className='border-none'
              icon={<Puzzle size={20} className='text-zinc-600' />}
              onClick={() => onAddComponent(component.id, 'Provider')}
            />
          </Tooltip>
          <Tooltip title='Adicionar Consumer'>
            <Button
              ghost
              className='border-none'
              icon={<Box size={20} className='text-zinc-600' />}
              onClick={() => onAddComponent(component.id, 'Consumer')}
            />
          </Tooltip>
          <Tooltip title='Adicionar Componente'>
            <Button
              ghost
              className='border-none'
              icon={<Layers size={20} className='text-zinc-600' />}
              onClick={() => onAddComponent(component.id, 'Component')}
            />
          </Tooltip>
        </div>
        {component.children.map((child) => (
          <ComponentNode
            key={child.id}
            component={child}
            onRemove={onRemove}
            onUpdateContext={onUpdateContext}
            onDropComponent={onDropComponent}
            onAddComponent={onAddComponent}
          />
        ))}
      </div>
    </div>
  );
};

// Detecta Providers aninhados do mesmo tipo/contexto (shadowing)
function findNestedProviderErrors(
  component: Component,
  providerTypes: string[] = []
): string[] {
  let errors: string[] = [];
  if (component.type === 'Provider') {
    if (providerTypes.includes(component.type)) {
      errors.push(
        `Provider aninhado dentro de outro Provider do mesmo tipo: "${component.id}"`
      );
    }
    providerTypes = [...providerTypes, component.type];
  }
  component.children.forEach((child) => {
    errors = errors.concat(findNestedProviderErrors(child, providerTypes));
  });
  return errors;
}

// Detecta Providers aninhados com o mesmo valor (simulação de ciclo)
function findMaximumUpdateDepthErrors(
  component: Component,
  providerStack: string[] = []
): string[] {
  let errors: string[] = [];
  if (component.type === 'Provider') {
    if (providerStack.includes(component.contextValue || '')) {
      errors.push(
        `Possível ciclo de atualização: Provider "${component.id}" está aninhado com valor de contexto já presente na hierarquia ("${component.contextValue}"). Isso pode causar "Maximum update depth exceeded".`
      );
    }
    providerStack = [...providerStack, component.contextValue || ''];
  }
  component.children.forEach((child) => {
    errors = errors.concat(findMaximumUpdateDepthErrors(child, providerStack));
  });
  return errors;
}

// Detecta Consumers fora de Provider
function findContextErrors(
  component: Component,
  hasProvider = false
): string[] {
  let errors: string[] = [];
  if (component.type === 'Consumer' && !hasProvider) {
    errors.push(`Consumer fora de um Provider: "${component.id}"`);
  }
  const nextHasProvider = hasProvider || component.type === 'Provider';
  component.children.forEach((child) => {
    errors = errors.concat(findContextErrors(child, nextHasProvider));
  });
  return errors;
}

// Detecta Consumers sem valor de contexto
function findUndefinedContextErrors(component: Component): string[] {
  let errors: string[] = [];
  if (
    component.type === 'Consumer' &&
    (component.contextValue === undefined || component.contextValue === '')
  ) {
    errors.push(`Consumer não recebeu valor de contexto: "${component.id}"`);
  }
  component.children.forEach((child) => {
    errors = errors.concat(findUndefinedContextErrors(child));
  });
  return errors;
}

// Detecta Providers sem Consumers descendentes
function hasDescendantConsumer(component: Component): boolean {
  if (component.type === 'Consumer') return true;
  return component.children.some(hasDescendantConsumer);
}

function findProviderWithoutConsumers(component: Component): string[] {
  let errors: string[] = [];
  if (component.type === 'Provider' && !hasDescendantConsumer(component)) {
    errors.push(
      `Provider "${component.id}" não possui nenhum Consumer descendente.`
    );
  }
  component.children.forEach((child) => {
    errors = errors.concat(findProviderWithoutConsumers(child));
  });
  return errors;
}

// Detecta uso excessivo de Providers/Consumers (simulação de "state global")
function findGlobalStateWarning(component: Component): string[] {
  const warnings: string[] = [];
  let providerCount = 0;
  let consumerCount = 0;

  function countNodes(node: Component) {
    if (node.type === 'Provider') providerCount++;
    if (node.type === 'Consumer') consumerCount++;
    node.children.forEach(countNodes);
  }
  countNodes(component);

  if (providerCount > 3 || consumerCount > 5) {
    warnings.push(
      'Muitos Providers ou Consumers detectados. Considere modularizar ou evitar usar Context como “state global”.'
    );
  }
  return warnings;
}

// Detecta Consumers sob múltiplos Providers do mesmo tipo
function findConsumerUnderMultipleProviders(
  component: Component,
  providerTypes: string[] = []
): string[] {
  let errors: string[] = [];
  if (component.type === 'Consumer') {
    const duplicates = providerTypes.filter(
      (t, i, arr) => arr.indexOf(t) !== i
    );
    if (duplicates.length > 0) {
      errors.push(
        `Consumer sob múltiplos Providers do mesmo tipo: "${
          component.id
        }" (${duplicates.join(', ')})`
      );
    }
  }
  if (component.type === 'Provider') {
    providerTypes = [...providerTypes, component.type];
  }
  component.children.forEach((child) => {
    errors = errors.concat(
      findConsumerUnderMultipleProviders(child, providerTypes)
    );
  });
  return errors;
}

export const TreeView: React.FC= () => {
  const [components, setComponents] = useState<Component[]>(initialComponents);
  const [selectedError, setSelectedError] = useState<string | null>(null);
  const { addAction } = useActionLogModalContext();

  // Propaga contexto para toda a árvore antes de renderizar
  const propagatedComponents = components.map((c) => propagateContext(c));
  // Detecta erros de contexto
  const contextErrors = [
    ...propagatedComponents.flatMap((c) => findContextErrors(c)),
    ...propagatedComponents.flatMap((c) => findMaximumUpdateDepthErrors(c)),
    ...propagatedComponents.flatMap((c) => findUndefinedContextErrors(c)),
    ...propagatedComponents.flatMap((c) => findNestedProviderErrors(c)),
    ...propagatedComponents.flatMap((c) => findProviderWithoutConsumers(c)),
    ...propagatedComponents.flatMap((c) => findGlobalStateWarning(c)),
    ...propagatedComponents.flatMap((c) =>
      findConsumerUnderMultipleProviders(c)
    ),
  ];

  // Adiciona novo componente filho
  const addComponent = useCallback(
    (parentId: string, type: ComponentType) => {
      if (type === 'App' && components.length > 0) return;
      const newComponent: Component = {
        id: Date.now().toString(),
        type,
        children: [],
      };

      if (type === 'App') {
        setComponents([newComponent]);
        addAction(`Adicionado App`);
        return;
      }

      const addRecursively = (comps: Component[]): Component[] =>
        comps.map((c) =>
          c.id === parentId
            ? { ...c, children: [...c.children, newComponent] }
            : { ...c, children: addRecursively(c.children) }
        );

      setComponents((prev) => addRecursively(prev));
      addAction(`Adicionado ${type} em ${parentId}`);
    },
    [components, addAction]
  );

  // Remove componente da árvore
  const removeComponent = useCallback(
    (componentId: string) => {
      if (
        components.length === 1 &&
        components[0].id === componentId &&
        components[0].type === 'App'
      )
        return;

      const removeRecursively = (comps: Component[]): Component[] =>
        comps
          .filter((c) => c.id !== componentId)
          .map((c) => ({ ...c, children: removeRecursively(c.children) }));

      setComponents((prev) => removeRecursively(prev));
      addAction(`Removido componente ${componentId}`);
    },
    [components, addAction]
  );

  // Atualiza valor do contexto do Provider e propaga para Consumers descendentes
  const updateContextValue = useCallback(
    (providerId: string, value: string) => {
      const updateRecursively = (comps: Component[]): Component[] =>
        comps.map((c) => {
          if (c.id === providerId && c.type === 'Provider') {
            addAction(
              `Atualizado valor do Provider ${providerId} para "${value}"`
            );
            return propagateContext({ ...c, contextValue: value });
          }
          return { ...c, children: updateRecursively(c.children) };
        });

      setComponents((prev) => updateRecursively(prev));
    },
    [addAction]
  );

  // Move componente via drag-and-drop
  const handleDropComponent = useCallback(
    (draggedId: string, targetId: string) => {
      let draggedComponent: Component | null = null;

      const removeComponent = (comps: Component[]): Component[] =>
        comps.filter((c) => {
          if (c.id === draggedId) {
            draggedComponent = c;
            return false;
          }
          c.children = removeComponent(c.children);
          return true;
        });

      const addComponentToTarget = (comps: Component[]): Component[] =>
        comps.map((c) => {
          if (c.id === targetId && draggedComponent) {
            return { ...c, children: [...c.children, draggedComponent] };
          }
          c.children = addComponentToTarget(c.children);
          return c;
        });

      setComponents((prev) => {
        let newComponents = removeComponent([...prev]);
        if (!draggedComponent) return prev;
        newComponents = addComponentToTarget(newComponents);
        return newComponents;
      });
      addAction(`Movido componente ${draggedId} para ${targetId}`);
    },
    [addAction]
  );

  // Exibe explicação detalhada ao clicar no erro
  const getErrorExplanation = (err: string) => {
    const entry = Object.entries(errorExplanations).find(
      ([key]) => err.startsWith(key) || err.includes(key)
    );
    return entry ? entry[1] : 'Sem explicação detalhada para este erro.';
  };

  return (
    <div className='p-2'>
      {/* Exibe erros de contexto */}
      {contextErrors.length > 0 && (
        <div className='bg-red-100 border border-red-400 text-red-700 p-2 rounded my-2'>
          <strong>Erros de Contexto:</strong>
          <ul>
            {contextErrors.map((err, idx) => (
              <li key={idx}>
                <Button
                  className='text-blue-700 underline hover:text-blue-900 border-none'
                  ghost
                  onClick={() => setSelectedError(err)}
                >
                  {err}
                </Button>
                {selectedError === err && (
                  <div className='bg-blue-50 border border-blue-300 p-4 rounded mt-2'>
                    <Button
                      className='float-right border-none'
                      onClick={() => setSelectedError(null)}
                      ghost
                      icon={<X size={16} className='text-red-600' />}
                    />
                    <div className='text-sm mt-2'>
                      {getErrorExplanation(err)}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Se não houver App, mostra botão para adicionar */}
      {propagatedComponents.length === 0 ? (
        <div className='flex flex-col items-center justify-center h-64'>
          <Empty description='Nenhum App na árvore' />
          <Button
            type='primary'
            onClick={() => addComponent('', 'App')}
            className='mt-4'
          >
            Adicionar App
          </Button>
        </div>
      ) : (
        propagatedComponents.map((component) => (
          <ComponentNode
            key={component.id}
            component={component}
            onRemove={removeComponent}
            onUpdateContext={updateContextValue}
            onDropComponent={handleDropComponent}
            onAddComponent={addComponent}
            isRoot={component.type === 'App'}
          />
        ))
      )}
    </div>
  );
};
