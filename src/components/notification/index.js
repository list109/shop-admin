export default class NotificationMessage {
    constructor(message = 'Hello World', { duration = 5000, type = 'success' } = {}) {
        NotificationMessage.prevElem;

        this.message = message;
        this.duration = duration;
        this.type = type;
        this.element;
        
        this.render();
    }

    render() {
        const element = document.createElement('div');
        element.innerHTML = this.template;
        this.element = element.firstElementChild;
    }

    get template() {
        return `
            <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
                <div class="timer"></div>
                <div class="notification__content">
                    <div class="notification-header">${this.type}</div>
                    <div class="notification-body">
                        ${this.message}
                    </div>
                </div>
            </div>`;
    }

    show(parent = document.body) {
        NotificationMessage.prevElem?.remove();

        NotificationMessage.prevElem = this.element;
        parent.append(this.element);
        setTimeout(() => { this.destroy() }, this.duration);
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        this.remove();
    }
}