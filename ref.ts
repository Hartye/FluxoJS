const kit = {
    clean: (el: Element) => {
        el.innerHTML = "";
        return el;
    },
    get: (id: string): HTMLElement => document.querySelector(`${(id || "").charAt(0) === "#" ? id : `#${id}`}`) as HTMLElement,
    getClass: (className: string): HTMLElement => document.querySelector(`${(className || "").charAt(0) === "." ? className : `.${className}`}`) as HTMLElement,
    getAll: (id: string) => document.querySelectorAll(`${(id || "").charAt(0) === "#" ? id : `#${id}`}`) as NodeListOf<HTMLElement>,
    getAllClass: (className: string) => document.querySelectorAll(`${(className || "").charAt(0) === "." ? className : `.${className}`}`) as NodeListOf<HTMLElement>,
    append: (el: Element, targetEl: Element) => {
        el.appendChild(targetEl);
        return el;
    },
    create: <K extends keyof HTMLElementTagNameMap>(element: K): HTMLElement => document.createElement(element),
};

class RefClass<K extends keyof HTMLElementTagNameMap> {
    element: HTMLElement;

    constructor(elementTag?: K, element?: HTMLElement, elementId?: string) {
        if (!elementId && !element && !elementTag) throw new Error("Null Element");

        if (elementId) {
            const el = kit.get(elementId);

            if (el === null) throw new Error(`Null Element with id ${elementId}`);
            else this.element = el;
        } else if (element) {
            this.element = element;
        } else if (elementTag) {
            this.element = kit.create(elementTag);
        } else throw new Error("No Elements Passed to the Ref constructor");
    }

    private getInputElement = () => this.element as HTMLInputElement;

    appendNative(el: Element) {
        kit.append(this.element, el);
        return this;
    }

    append(el: RefClass<K>) {
        return this.appendNative(el.element);
    }

    appendArrayNative(elList: Array<Element>) {
        for (let i = 0; i < elList.length; i++) {
            this.appendNative(elList[i]);
        }
        return this;
    }

    appendArray(elList: Array<RefClass<K>>) {
        for (let i = 0; i < elList.length; i++) {
            this.appendNative(elList[i].element);
        }
        return this;
    }

    appendToNative(el: Element) {
        kit.append(el, this.element);
        return this;
    }

    appendTo(el: RefClass<K>) {
        return this.appendToNative(el.element);
    }

    textContent(value: string) {
        this.element.textContent = value;
        return this;
    }

    on<K extends keyof GlobalEventHandlersEventMap>(type: K, callback: (ev: HTMLElementEventMap[K]) => void, options?: boolean | AddEventListenerOptions) {
        this.element.addEventListener(type, (ev) => callback(ev), options);
        return this;
    }

    className(className: string) {
        this.element.className = className;
        return this;
    }

    classList = {
        values: () => this.element.classList.values,
        add: (className: string) => {
            this.className(this.element.className + ` ${className}`);
            return this;
        },
        remove: (className: string) => {
            this.element.classList.remove(className);
            return this;
        },
        toggle: (className: string) => {
            this.element.classList.toggle(className);
            return this;
        },
    };

    id(id: string) {
        this.element.id = id || String(Math.random());
        return this;
    }

    type(type: HTMLInputTypeAttribute) {
        this.getInputElement().type = type;
        return this;
    }

    title(title: string) {
        this.element.title = title;
        return this;
    }

    styles(styles: Array<[keyof CSSStyleDeclaration, string]>) {
        for (let i = 0; i < styles.length; i++) {
            //@ts-expect-error bullshit
            this.element.style[styles[i][0]] = styles[i][1];
        }
        return this;
    }

    value = {
        get: () => {
            if (this.getInputElement().type === "checkbox") {
                return this.getInputElement().checked;
            } else return this.getInputElement().value;
        },
        set: (value: string | boolean) => {
            if (this.getInputElement().type === "checkbox") {
                this.getInputElement().checked = value == true;
                return this;
            } else {
                this.getInputElement().value = String(value);
                return this;
            }
        },
    };

    get = {
        value: () => this.getInputElement().value,
        textContent: () => this.element.textContent,
    };

    clean() {
        kit.clean(this.element);
        return this;
    }
}

class MultiRefClass<K extends keyof HTMLElementTagNameMap> {
    elementArray: Array<RefClass<K>>;

    constructor(nodeList?: NodeListOf<HTMLElement>, nodeListId?: string, nodeListClass?: string) {
        if (!nodeList && !nodeListId && !nodeListClass) {
            throw new Error("No node list given");
        } else {
            if (nodeList) {
                this.elementArray = this.mapNodeList(nodeList);
            } else if (nodeListId) {
                this.elementArray = this.mapNodeList(kit.getAll(nodeListId));
            } else if (nodeListClass) {
                this.elementArray = this.mapNodeList(kit.getAllClass(nodeListClass));
            } else throw new Error("No elements loaded to the node list");
        }
    }

    private mapNodeList(nodeList: NodeListOf<HTMLElement>) {
        const tempElementArray: Array<RefClass<K>> = [];
        nodeList.forEach((node) => tempElementArray.push(Ref(void 0, node)));
        return tempElementArray;
    }

    at(index: number) {
        return this.elementArray[index];
    }

    values() {
        return this.elementArray;
    }
}

export type HTMLInputTypeAttribute =
    | "button"
    | "checkbox"
    | "color"
    | "date"
    | "datetime-local"
    | "email"
    | "file"
    | "hidden"
    | "image"
    | "month"
    | "number"
    | "password"
    | "radio"
    | "range"
    | "reset"
    | "search"
    | "submit"
    | "tel"
    | "text"
    | "time"
    | "url"
    | "week"
    | (string & {});

export const Ref = <K extends keyof HTMLElementTagNameMap>(elementTag?: K, element?: HTMLElement, elementId?: string) => new RefClass(elementTag, element, elementId);
export const MultiRef = (nodeList?: NodeListOf<HTMLElement>, nodeListId?: string, nodeListClass?: string) => new MultiRefClass(nodeList, nodeListId, nodeListClass);
