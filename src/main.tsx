import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';
import { ConfigProvider } from 'antd';
import '@ant-design/v5-patch-for-react-19';

import locale from 'antd/locale/pt_BR';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      locale={locale}
      theme={{
        token: {
          colorPrimary: '#6832f5',
        },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>
);
