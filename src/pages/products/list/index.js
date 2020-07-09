import SortableTable from "../../../components/sortable-table/index.js";
import DoubleSlider from "../../../components/double-slider/index.js";
import header from "./products-header.js";

export default class Page {
  element;
  subElements = {};
  components = {};

  updateData = ({detail, type, target}) => {
    switch(type) {
      case 'range-select': 
        this.updateTableByRange(detail);
        break
      case 'input':
        this.updateTableByInput(target);
    }
  }

  updateTableByRange({from, to}) {
    const {productsContainer: sortableTable} = this.components;
    const {url} = sortableTable;

    url.searchParams.set('price_gte', from);
    url.searchParams.set('price_lte', to);
    
    sortableTable.sortOnServer()
  };

  updateTableByInput(elem) {
    const {filterName, filterStatus} = this.subElements;
    
    if(elem === filterName) this.sortByNameInput(filterName);
    if(elem === filterStatus) this.sortByStatusInput(filterStatus);
  }

  sortByNameInput({value}) {
    const {productsContainer: sortableTable} = this.components;
    const {url, step} = sortableTable;

    sortableTable.start = 0;
    sortableTable.end = step;

    url.searchParams.set('title_like', value);

    sortableTable.sortOnServer();
  }

  sortByStatusInput({value}) {
    const {productsContainer: sortableTable} = this.components;
    const {url, step} = sortableTable;

    sortableTable.start = 0;
    sortableTable.end = step;

    switch(Boolean(value)) {
      case true: 
        url.searchParams.set('status', value);
        break
      case false: 
        url.searchParams.delete('status');
    }

    sortableTable.sortOnServer();
  }

  clearFilters = () => {
    const {filterName} = this.subElements;

    filterName.value = '';
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

  getSubElements($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  async initComponents() {
    const sortableTable = await new SortableTable(header, {
      url: `api/rest/products?_embed=subcategory.category`,
      step: 30,
      isRowLink: true,
      isInfinityScroll: true,
      sorted: {
        id: 'title',
        order: 'asc',
      }
    });

    const doubleSlider = new DoubleSlider({
      min: 0,
      max: 4000,
    });

    this.components.productsContainer = sortableTable;
    this.components.sliderContainer = doubleSlider;
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {

      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  get template() {
    return `
    <div class="products-list">
      <div class="content__top-panel">
        <h1 class="page-title">Products list</h1>
        <a href="/products/add" class="button-primary">Add product</a>
      </div>

      <div class="content-box content-box_small">
        ${this.formTemplate}
      </div>

      <div data-element="productsContainer" class="products-list__container"></div>
    </div>`
  }

  get formTemplate() {
    return `
    <form class="form-inline">
      <div class="form-group">
        <label class="form-label">Sort by:</label>
        <input type="text" data-element="filterName" class="form-control" placeholder="Product name">
      </div>
      <div class="form-group" data-element="sliderContainer">
        <label class="form-label">Price:</label>
      </div>
      <div class="form-group">
        <label class="form-label">Status:</label>
        <select class="form-control" data-element="filterStatus">
          <option value="" selected="">Anything</option>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>
      </div>
    </form>`
  }

  initEventListeners () {
    const {sliderContainer, productsContainer} = this.components;
    
    productsContainer.element.addEventListener('clear-filters', this.clearFilters)
    sliderContainer.element.addEventListener('range-select', this.updateData);
    this.element.addEventListener('input', this.updateData);
  }

  destroy () {
    const {sliderContainer, productsContainer} = this.components;

    productsContainer.element.removeEventListener('clear-filters', this.clearFilters)
    sliderContainer.element.removeEventListener('range-select', this.updateData);
    this.element.removeEventListener('input', this.updateData);

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
