// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useContentFit } from "./use-content-fit";

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

it("fits overflow without compounding zoom and restores full size on resize", () => {
	let resize = () => {};
	const disconnect = vi.fn();
	vi.stubGlobal(
		"ResizeObserver",
		class {
			constructor(callback: () => void) {
				resize = callback;
			}
			observe() {}
			disconnect = disconnect;
		},
	);
	function Fixture() {
		const { viewportRef, contentRef } = useContentFit();
		return (
			<div ref={viewportRef}>
				<div ref={contentRef}>All content</div>
			</div>
		);
	}
	const view = render(<Fixture />);
	const viewport = view.container.firstElementChild as HTMLElement;
	const content = viewport.firstElementChild as HTMLElement;
	let height = 400;
	Object.defineProperties(viewport, {
		clientWidth: { get: () => 800 },
		clientHeight: { get: () => height },
	});
	Object.defineProperties(content, {
		scrollWidth: { get: () => 800 },
		offsetHeight: { get: () => 800 },
		scrollHeight: { get: () => 800 },
	});
	resize();
	expect(content.style.zoom).toBe("0.5");
	expect(content.style.width).toBe("800px");
	resize();
	expect(content.style.zoom).toBe("0.5");
	height = 1200;
	resize();
	expect(content.style.zoom).toBe("1");
	view.unmount();
	expect(disconnect).toHaveBeenCalledOnce();
});
