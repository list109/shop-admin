import Router from './router/index.js';
import tooltip from './components/tooltip/index.js';

tooltip.initialize();

const router = Router.instance();

router
  .addRoute(/^$/, 'dashboard')
  .addRoute(/^products$/, 'products/list')
  .addRoute(/^products\/add$/, 'products/edit')
  .addRoute(/^products\/([\w()-]+)$/, 'products/edit')
  .addRoute(/^sales$/, 'sales')
  .addRoute(/^categories$/, 'categories')
  .addRoute(/^404\/?$/, 'error404')
  .setNotFoundPagePath('error404')
  .listen();

function onClick({ target, currentTarget }) {
  const toggleBtn = target.closest('.sidebar__toggler');
  if (toggleBtn) {
    currentTarget.classList.toggle('is-collapsed-sidebar');
    return;
  }

  const categoryHead = target.closest('.category__header');
  const categoryItem = categoryHead?.closest('.category');
  if (categoryHead && categoryItem) {
    categoryItem.classList.toggle('category_open');
    return;
  }

  const sidebar = document.querySelector('.sidebar__nav');
  const link = target.closest('a');
  const href = link?.getAttribute('href');
  if (href && href.startsWith('/')) {
    initLink(href);
  }
}

function initLink(pathname) {
  
  const index = pathname.indexOf('/', 1);
  const page = (~index) ? pathname.slice(0, index) : pathname.slice(0);
  
  const [...links] = document.querySelectorAll('[data-page]');
  links.forEach(link => link.parentNode.className = '');
  const link = links.find(link => link.matches(`[href="${page}"]`));
  if (link) link.parentNode.className = 'active';
}

const { pathname } = window.location;

initLink(pathname);

document.body.addEventListener('click', onClick);


