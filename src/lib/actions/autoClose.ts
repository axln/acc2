export function autoClose(node: HTMLElement, attrName: string) {
	function documentClickHandler(e: MouseEvent) {
		if (e.target instanceof Node && node.hasAttribute(attrName)) {
			if (!node.contains(e.target)) {
				node.removeAttribute(attrName);
			}
		}
	}

	function documentKeyHandler(e: KeyboardEvent) {
		if (e.code === 'Escape' && node.hasAttribute(attrName)) {
			node.removeAttribute(attrName);
		}
	}

	document.addEventListener('click', documentClickHandler);
	document.addEventListener('keydown', documentKeyHandler);

	return {
		destroy() {
			document.removeEventListener('keydown', documentKeyHandler);
			document.removeEventListener('click', documentClickHandler);
		}
	};
}
