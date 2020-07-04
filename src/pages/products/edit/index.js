import ProductForm from "../../../components/product-form";
import Notification from "../../../components/notification";

export default class Page {
  element;
  subElements = {};
  components = {};

  responseNotice = ({type, detail}) => {
    const responseType = type.split('-').slice(-1).join(''); 

    if(responseType === 'canceled') {
      new Notification(`${detail} Product ${responseType}`, { duration: 2000, type: 'error'}).show();
      return;
    }

    new Notification(`Product ${responseType}`, { duration: 2000}).show();
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.initComponents();

    await this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  get template() {
    return `
    <div class="products-edit">
      <div class="content__top-panel">
        <h1 class="page-title">
          <a href="/products" class="link">List products</a>
          / Edit
        </h1>
      </div>

      <div class="content-box" data-element="productForm">
      </div>
    </div>`
  }

  getSubElements ($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }
  
  initComponents() {
    const {pathname} = window.location;
    
    const productName = pathname.split('/').slice(-1).join('');
    const productId = productName === 'add' ? '' : productName;
    
    this.components.productForm = new ProductForm(productId);
  }

  async renderComponents() {
    await this.components.productForm.render();

    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  initEventListeners () {
    const {productForm} = this.components;

    productForm.element.addEventListener('product-canceled', this.responseNotice);
    productForm.element.addEventListener('product-updated', this.responseNotice);
    productForm.element.addEventListener('product-saved', this.responseNotice);
  }

  destroy () {
    const {productForm} = this.components;

    productForm.element.addEventListener('product-canceled', this.responseNotice);
    productForm.element.removeEventListener('product-updated', this.responseNotice);
    productForm.element.removeEventListener('product-saved', this.responseNotice);

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
