export class Page {
    title: string;
    url: string;
    icon: string;

    constructor(title: string, url: string, icon: string) {
        this.title = title;
        this.url = url;
        this.icon = icon;
    }

    set Title(title: string) {
        this.title = title;
    }
    get Title(): string {
        return this.title;
    }
    set Url(url: string) {
        this.url = url;
    }
    get Url(): string {
        return this.url;
    }
    set Icon(icon: string) {
        this.icon = icon;
    }
    get Icon(): string {
        return this.icon;
    }
}
