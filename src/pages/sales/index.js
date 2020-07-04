import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './sales.js';

import fetchJson from '../../utils/fetch-json.js';

export default class Page {
    element;
    subElements = {};
    components = {};

    async updateTableComponent(from, to) {
        const { sortableTable } = this.components;
        const { body } = sortableTable.subElements;

        body.innerHTML = '';

        sortableTable.element.classList.add('sortable-table_loading');

        const url = `api/rest/orders?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}&_sort=createdAt&_order=desc&_start=0&_end=20`;
        const data = await fetchJson(`${process.env.BACKEND_URL}${url}`);

        sortableTable.element.classList.remove('sortable-table_loading');

        this.components.sortableTable.renderRows(data);
    }

    async initComponents() {
        const to = new Date();
        const from = new Date(to.getTime() - (45 * 24 * 60 * 60 * 1000));
        //const [ordersData, salesData, customersData] = await this.getDataForColumnCharts(from, to);

        const rangePicker = new RangePicker({
            from,
            to
        });

        const sortableTable = new SortableTable(header, {
            url: `api/rest/orders?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}&_order=desc`,
            step: 30,
            sorted: {
                id: 'createdAt',
                order: 'desc',
            }
        });

        this.components.sortableTable = sortableTable;
        this.components.rangePicker = rangePicker;
    }

    get template() {
        return `
        <div class="sales">
          <div class="content__top-panel">
            <h2 class="page-title">Sales</h2>
            <!-- RangePicker component -->
            <div data-element="rangePicker"></div>
          </div>
    
          <div data-element="sortableTable" class="full-height flex-column">
            <!-- sortable-table component -->
          </div>
        </div>`;
    }

    async render() {
        const element = document.createElement('div');

        element.innerHTML = this.template;


        this.element = element.firstElementChild;
        this.subElements = this.getSubElements(this.element);

        await this.initComponents();

        this.renderComponents();
        this.initEventListeners();

        return this.element;
    }

    renderComponents() {
        Object.keys(this.components).forEach(component => {
            const root = this.subElements[component];
            const { element } = this.components[component];

            root.append(element);
        });
    }

    getSubElements($element) {
        const elements = $element.querySelectorAll('[data-element]');

        return [...elements].reduce((accum, subElement) => {
            accum[subElement.dataset.element] = subElement;

            return accum;
        }, {});
    }

    initEventListeners() {
        this.components.rangePicker.element.addEventListener('date-select', event => {
            const { from, to } = event.detail;
            this.updateTableComponent(from, to);
        });
    }

    destroy () {
      for (const component of Object.values(this.components)) {
        component.destroy();
      }
    }
}