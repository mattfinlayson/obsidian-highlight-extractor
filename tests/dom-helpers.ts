type DomCreateOptions = {
  text?: string;
  cls?: string;
};

export function installObsidianDomHelpers(): void {
  HTMLElement.prototype.addClass = function addClass(className: string): void {
    this.classList.add(className);
  };

  HTMLElement.prototype.removeClass = function removeClass(className: string): void {
    this.classList.remove(className);
  };

  HTMLElement.prototype.createDiv = function createDiv(options?: DomCreateOptions): HTMLElement {
    return this.createEl('div', options);
  };

  HTMLElement.prototype.createEl = function createEl(
    tag: string,
    options?: DomCreateOptions,
  ): HTMLElement {
    const element = this.ownerDocument.createElement(tag);
    if (options?.text) {
      element.textContent = options.text;
    }
    if (options?.cls) {
      element.className = options.cls;
    }
    this.appendChild(element);
    return element;
  };

  HTMLElement.prototype.createSpan = function createSpan(options?: DomCreateOptions): HTMLElement {
    return this.createEl('span', options);
  };

  HTMLElement.prototype.empty = function empty(): void {
    this.replaceChildren();
  };

  HTMLElement.prototype.findAll = function findAll(selector: string): HTMLElement[] {
    return Array.from(this.querySelectorAll(selector));
  };

  HTMLElement.prototype.setText = function setText(text: string): void {
    this.textContent = text;
  };
}
