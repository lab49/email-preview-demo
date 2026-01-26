import './style.css';
import { getCurrentRoute } from './router';
import { initComposePage } from './composePage';
import { initPreviewPage } from './previewPage';

const app = document.querySelector<HTMLDivElement>('#app');

if (app) {
  const route = getCurrentRoute();
  
  if (route === 'preview') {
    initPreviewPage(app);
  } else {
    initComposePage(app);
  }
}
