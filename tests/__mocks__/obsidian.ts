export class Notice {
  static messages: string[] = [];

  constructor(message: string) {
    Notice.messages.push(message);
  }
}

export class Plugin {}
export class Setting {}
export class SettingTab {}
export class MarkdownRenderChild {
  containerEl: HTMLElement;

  constructor(containerEl: HTMLElement) {
    this.containerEl = containerEl;
  }

  onload(): void {}

  onunload(): void {}

  registerDomEvent<K extends keyof HTMLElementEventMap>(
    el: HTMLElement,
    type: K,
    callback: (event: HTMLElementEventMap[K]) => void,
  ): void {
    el.addEventListener(type, callback as EventListener);
  }
}
