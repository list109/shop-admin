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
    const { children: [...items] } = sidebar;

    items.forEach(item => {
      item.classList.remove('active');
      if (item.firstElementChild.matches(`[href="${href}"]`)) item.classList.add('active');
    });

    return;
  }
}

document.body.addEventListener('click', onClick);


function initLink() {
  const { pathname } = window.location;
  const [...links] = document.querySelectorAll('[data-page]');
  const link = links.find(link => link.matches(`[href="${pathname}"]`));
  if (link) link.parentNode.className = 'active';
}

initLink();