declare function createPanel(): HTMLDivElement;
declare function isEditable(el: Element | null): boolean;
declare function getSelectedEditable(): Element | null;
declare function getSelectionRect(): DOMRect | null;
declare function removeButton(): void;
declare function showButton(selectedText: string, rect: DOMRect): void;
declare let currentPanel: HTMLElement | null;
declare function showPanel(selectedText: string): void;
declare function handleSelection(): void;
