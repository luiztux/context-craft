import React from 'react';
import { Home, Craft } from './Pages';

type PagesRouterProps = {
    element: React.ReactElement;
    path: string;
    title: string;
}

export const pagesRouter:PagesRouterProps[] = [
    {
        element: <Home />,
        path: '/',
        title: 'Home'
    },
    {
        element: <Craft />,
        path: '/craft-playground',
        title: 'Craft'
    },
];