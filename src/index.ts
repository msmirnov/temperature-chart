import './styles.css';

import App from './components/App';

const container = document.getElementById('app-container') as HTMLElement;
const app = new App();

container.innerHTML = '';
container.appendChild(app.render());
