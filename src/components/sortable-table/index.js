import fetchJson from "../../utils/fetch-json.js";

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};
  data = [];
  loading = false;
  step = 20;
  start = 1;
  end = this.start + this.step;
  isRestData = true;

  onWindowScroll = async () => {
    const { bottom } = this.element.getBoundingClientRect();
    const { id, order } = this.sorted;
    
    if (bottom < document.documentElement.clientHeight && !this.loading && this.isInfinityScroll) {

      this.start = this.end;
      this.end = this.start + this.step;

      this.loading = true;
      
      if(this.isRestData) {
        const data = await this.loadData(id, order, this.start, this.end);
        this.update(data);
      }

      const {headers} = await fetch(this.url);
      const result = headers.get('x-total-count');
      this.isRestData = Boolean(parseInt(result, 10));

      this.loading = false;
    }
  };

  onClick = ({target}) => {
    const column = target.closest('[data-sortable="true"]');
    if(column) this.sortByClick(column);

    const clearBtn = target.closest('[data-element="clearingButton"]');
    if(clearBtn) this.resetByClick();
  }

  sortByClick(column) {
    const toggleOrder = order => {
      const orders = {
        asc: 'desc',
        desc: 'asc'
      };

      return orders[order];
    };

    if (column) {
      const { id, order } = column.dataset;
      const newOrder = toggleOrder(order);

      this.sorted = {
        id,
        order: newOrder
      };

      column.dataset.order = newOrder;
      column.append(this.subElements.arrow);

      if (this.isSortLocally) {
        this.sortLocally(id, newOrder);
      } else {
        this.sortOnServer(id, newOrder);
      }
    }
  };

  resetByClick() {
    this.element.dispatchEvent(new CustomEvent('clear-filters', {
      bubbles: true,
    }));
  } 

  constructor(headersConfig = [], {
    url = '',
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    isSortLocally = false,
    step = 20,
    start = 0,
    end = start + step,
    isRowLink = false,
    isInfinityScroll = false,
  } = {}) {

    this.headersConfig = headersConfig;
    this.url = new URL(url, BACKEND_URL);
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.step = step;
    this.start = start;
    this.end = end;
    this.isRowLink = isRowLink;
    this.isInfinityScroll = isInfinityScroll;

    this.render();
  }

  async render() {
    const { id, order } = this.sorted;
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTable();

    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);

    const data = await this.loadData(id, order, this.start, this.end);

    this.renderRows(data);
    this.initEventListeners();
    return this.element;
  }

  async loadData(id, order, start, end) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);

    this.element.classList.add('sortable-table_loading');

    const data = await fetchJson(this.url);
    this.element.classList.remove('sortable-table_loading');
    return data;
  }

  addRows(data) {
    this.data = data;

    this.subElements.body.innerHTML = this.getTableRows(data);
  }

  update(data) {
    const rows = document.createElement('div');

    this.data = [...this.data, ...data];
    rows.innerHTML = this.getTableRows(data);

    // TODO: This is comparison of performance append vs insertAdjacentHTML
    // console.time('timer');
    // this.subElements.body.insertAdjacentHTML('beforeend', rows.innerHTML);
    this.subElements.body.append(...rows.childNodes);
    // console.timeEnd('timer');
  }

  getTableHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headersConfig.map(item => this.getHeaderRow(item)).join('')}
    </div>`;
  }

  getHeaderRow({ id, title, sortable }) {
    const order = this.sorted.id === id ? this.sorted.order : 'asc';

    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
        <span>${title}</span>
        ${this.getHeaderSortingArrow(id)}
      </div>
    `;
  }

  getHeaderSortingArrow(id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : '';

    return isOrderExist
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : '';
  }

  getTableBody(data) {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows(data)}
      </div>`;
  }

  getTableRows(data) {
    return this.isRowLink ?
      data
        .map(item => `
          <a href="/products/${item.id}" class="sortable-table__row">
            ${this.getTableRow(item, data)}
          </a>`)
        .join('') :
      data  
        .map(item => `
          <div  class="sortable-table__row">
            ${this.getTableRow(item, data)}
          </div>`)
        .join('');
  }

  getTableRow(item) {
    const cells = this.headersConfig.map(({ id, template }) => {
      return {
        id,
        template
      }
    });

    return cells.map(({ id, template }) => {
      return template
        ? template(item[id])
        : `<div class="sortable-table__cell">${item[id]}</div>`
    }).join('');
  }

  getTable() {
    return `
      <div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody(this.data)}

        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <p>There are no products matching the chosen enter</p>
          <button type="button" class="button-primary-outline" data-element="clearingButton">
            Clear the filters
          </button>
        </div>
      </div>`;
  }

  initEventListeners() {
    const {clearingButton, header} = this.subElements;

    this.element.addEventListener('pointerdown', this.onClick);
    document.addEventListener('scroll', this.onWindowScroll);
  }

  sortLocally(id, order) {
    const sortedData = this.sortData(id, order);

    this.subElements.body.innerHTML = this.getTableBody(sortedData);
  }

  async sortOnServer(id = this.sorted.id, 
                     order = this.sorted.order, 
                     start = 0, 
                     end = this.step) {
    
    const { body } = this.subElements;
    body.innerHTML = '';
    this.isRestData = true;

    const data = await this.loadData(id, order, start, end);

    this.renderRows(data);
  }

  renderRows(data) {
    if (data.length) {
      this.element.classList.remove('sortable-table_empty');
      this.addRows(data);
    } else {
      this.element.classList.add('sortable-table_empty');
    }
  }

  sortData(id, order) {
    const arr = [...this.data];
    const column = this.headersConfig.find(item => item.id === id);
    const { sortType, customSorting } = column;
    const direction = order === 'asc' ? 1 : -1;

    return arr.sort((a, b) => {
      switch (sortType) {
        case 'number':
          return direction * (a[id] - b[id]);
        case 'string':
          return direction * a[id].localeCompare(b[id], 'ru');
        case 'custom':
          return direction * customSorting(a, b);
        default:
          return direction * (a[id] - b[id]);
      }
    });
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove() {
    this.element.remove();

    this.element.removeEventListener('pointerdown', this.onClick);
    document.removeEventListener('scroll', this.onWindowScroll);
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
