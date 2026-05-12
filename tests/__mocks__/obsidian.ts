export class Notice {
  static messages: string[] = [];

  constructor(message: string) {
    Notice.messages.push(message);
  }
}

export class Plugin {}
export class Setting {}
export class SettingTab {}
export class MarkdownRenderChild {}
