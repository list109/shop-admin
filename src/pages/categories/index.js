import SortableList from '../../components/sortable-list/index.js';
import Notification from '../../components/notification/index.js';

import fetchJson from '../../utils/fetch-json.js';
console.log(123);

export default class Page {
    element;
    subElements = {};
    components = {};

    updateData = async (event) => {
        await this.updateSortableListComponent(event.detail);
    }

    async updateSortableListComponent({ parent }) {
        const { children: [...items] } = parent;

        const url = new URL(`${process.env.BACKEND_URL}api/rest/subcategories`)

        const body = items.map(({ dataset }, index) => {
            const obj = {};
            obj.id = dataset.id;
            obj.weight = ++index;

            return obj;
        });

        try {
            const response = await fetchJson(`${process.env.BACKEND_URL}api/rest/subcategories`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(body),
            });
        } catch(err) {
            new Notification(err.message, {type: 'error', duration: 2000}).show();
            throw err;
        }

        new Notification('Category order saved', { duration: 2000}).show();
    }

    async render() {
        const data = await fetchJson(`${process.env.BACKEND_URL}api/rest/categories?_sort=weight&_refs=subcategory`);
        this.data = data;

        const element = document.createElement('div');

        element.innerHTML = this.template;

        this.element = element.firstElementChild;
        this.subElements = this.getSubElements(this.element);

        this.initComponents(data);

        this.renderComponents();
        this.initEventListeners();

        return this.element;
    }

    get template() {
        return `
        <div class="categories">
            <div class="content__top-panel">
                <h1 class="page-title">Категории товаров</h1>
            </div>
            <div data-elem="categoriesContainer">${this.getCategoriesTemplate()}</div> 
        </div>`;
    }

    getCategoriesTemplate(data = this.data) {
        return data
            .map(({ id, title, subcategories }) => `
            <div class="category category_open" data-id="${id}">
                <header class="category__header">${title}</header>
                <div class="category__body">
                    <div class="subcategory-list" data-element="${id}">
                        ${subcategories
                    .map(subcategory => this.getSubcategoryTemplate(subcategory))
                    .join('')
                }
                    </div>
                </div>
            </div>`)
            .join('');
    }

    getSubcategoryTemplate({ id, title, count }) {
        return `<li class="categories__sortable-list-item sortable-list__item" data-grab-handle="" data-id="${id}">
                    <strong>${title}</strong>
                    <span><b>${count}</b> products</span>
                </li>`
    }


    getSubElements($element) {
        const elements = $element.querySelectorAll('[data-element]');

        return [...elements].reduce((accum, subElement) => {
            accum[subElement.dataset.element] = subElement;

            return accum;
        }, {});
    }

    initComponents(data) {
        data.forEach(({ id }) => {
            const { children: items } = this.subElements[id];

            this.components[id] = new SortableList({ items: [...items] });
        });
    }

    renderComponents() {
        Object.keys(this.components).forEach(component => {
            const root = this.subElements[component];
            const { element } = this.components[component];

            root.append(element);
        });
    }

    initEventListeners() {
        this.element.addEventListener('sortable-list-reorder', this.updateData);
    }

    destroy() {
        Notification?.prevElem.remove();
        this.element.removeEventListener('sortable-list-reorder', this.updateData);

        for (const component of Object.values(this.components)) {
            component.destroy();
        }
    }
}