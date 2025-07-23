import { BrowserRouter } from 'react-router-dom';
import { Router } from './routes/Router';

export const App = () => {
  return (
    <BrowserRouter basename='/context-craft'>
      <Router />
    </BrowserRouter>
  );
};
