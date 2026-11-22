import { useLayoutEffect, useRef } from "react";

export function useContentFit() {
	const viewportRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		const viewport = viewportRef.current;
		const content = contentRef.current;
		if (!viewport || !content) return;
		const fit = () => {
			// Keep the unscaled line wrapping stable; zoom also scales the layout box.
			content.style.width = `${viewport.clientWidth}px`;
			content.style.minHeight = `${viewport.clientHeight}px`;
			const scale = Math.min(
				1,
				viewport.clientWidth / Math.max(1, content.scrollWidth),
				viewport.clientHeight /
					Math.max(1, content.offsetHeight, content.scrollHeight),
			);
			content.style.zoom = `${scale}`;
		};
		const observer = new ResizeObserver(fit);
		observer.observe(viewport);
		observer.observe(content);
		fit();
		return () => observer.disconnect();
	}, []);

	return { viewportRef, contentRef };
}
