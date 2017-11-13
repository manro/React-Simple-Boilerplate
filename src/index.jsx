import React from 'react';
import ReactDOM from 'react-dom';

import App from '@/containers/App';

const rootEl  = document.getElementById('application_host');
const render = (Root) => {
    ReactDOM.render(<Root />, rootEl);
};

render(App);

if (module.hot) {
    module.hot.accept('@/containers/App.jsx', () => {
        const NewRoot = require('@/containers/App.jsx');
        render(NewRoot);
    });
}