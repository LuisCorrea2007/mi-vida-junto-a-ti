import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DLsAaqJR.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useAuth } from "./use-auth-DGYwFkQT.mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as notifyPartner } from "./notify-BAmHhUK-.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { r as Xa } from "../_libs/streamdown+[...].mjs";
import { n as cn, t as Button } from "./button-BhpwCH7y.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { I as LoaderCircle, K as HeartHandshake, M as Lock, _t as ArrowLeft, et as CornerDownLeft, r as Users, t as X, u as Square, vt as ArrowDown } from "../_libs/lucide-react.mjs";
import { t as Textarea } from "./textarea-DrdjxuB0.mjs";
import { t as Skeleton } from "./skeleton-kZZCypAp.mjs";
import { t as Route } from "./consejero._id-BMIHJAly.mjs";
import { n as threadTitleFrom } from "./advisor-0nLqBoCo.mjs";
import { n as useStickToBottomContext, t as StickToBottom } from "../_libs/use-stick-to-bottom.mjs";
import { t as A } from "../_libs/@streamdown/cjk+[...].mjs";
import { t as G } from "../_libs/shiki+streamdown__code.mjs";
import { t as h } from "../_libs/@streamdown/math+[...].mjs";
import { t as f } from "../_libs/@streamdown/mermaid+[...].mjs";
import { t as nanoid } from "../_libs/nanoid.mjs";
import { t as motion } from "../_libs/motion.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/consejero._id-O-tc2WJQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Conversation = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StickToBottom, {
	className: cn("relative flex-1 overflow-y-hidden", className),
	initial: "smooth",
	resize: "smooth",
	role: "log",
	...props
});
var ConversationContent = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StickToBottom.Content, {
	className: cn("flex flex-col gap-8 p-4", className),
	...props
});
var ConversationEmptyState = ({ className, title = "No messages yet", description = "Start a conversation to see messages here", icon, children, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex size-full flex-col items-center justify-center gap-3 p-8 text-center", className),
	...props,
	children: children ?? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-muted-foreground",
		children: icon
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "font-medium text-sm",
			children: title
		}), description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted-foreground text-sm",
			children: description
		})]
	})] })
});
var ConversationScrollButton = ({ className, ...props }) => {
	const { isAtBottom, scrollToBottom } = useStickToBottomContext();
	const handleScrollToBottom = (0, import_react.useCallback)(() => {
		scrollToBottom();
	}, [scrollToBottom]);
	return !isAtBottom && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		className: cn("absolute bottom-4 left-[50%] translate-x-[-50%] rounded-full dark:bg-background dark:hover:bg-muted", className),
		onClick: handleScrollToBottom,
		size: "icon",
		type: "button",
		variant: "outline",
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "size-4" })
	});
};
var Message = ({ className, from, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("group flex w-full max-w-[95%] flex-col gap-2", from === "user" ? "is-user ml-auto justify-end" : "is-assistant", className),
	...props
});
var MessageContent = ({ children, className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("is-user:dark flex w-fit min-w-0 max-w-full flex-col gap-2 overflow-hidden text-sm", "group-[.is-user]:ml-auto group-[.is-user]:rounded-lg group-[.is-user]:bg-secondary group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-foreground", "group-[.is-assistant]:text-foreground", className),
	...props,
	children
});
(0, import_react.createContext)(null);
var streamdownPlugins = {
	cjk: A,
	code: G,
	math: h,
	mermaid: f
};
var MessageResponse = (0, import_react.memo)(({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Xa, {
	className: cn("size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0", className),
	plugins: streamdownPlugins,
	...props
}), (prevProps, nextProps) => prevProps.children === nextProps.children && nextProps.isAnimating === prevProps.isAnimating);
MessageResponse.displayName = "MessageResponse";
function InputGroup({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-slot": "input-group",
		role: "group",
		className: cn("group/input-group border-input dark:bg-input/30 shadow-xs relative flex w-full items-center rounded-md border outline-none transition-[color,box-shadow]", "h-9 has-[>textarea]:h-auto", "has-[>[data-align=inline-start]]:[&>input]:pl-2", "has-[>[data-align=inline-end]]:[&>input]:pr-2", "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3", "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3", "has-[[data-slot=input-group-control]:focus-visible]:ring-ring has-[[data-slot=input-group-control]:focus-visible]:ring-1", "has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[[data-slot][aria-invalid=true]]:border-destructive dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40", className),
		...props
	});
}
var inputGroupAddonVariants = cva("text-muted-foreground flex h-auto cursor-text select-none items-center justify-center gap-2 py-1.5 text-sm font-medium group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4", {
	variants: { align: {
		"inline-start": "order-first pl-3 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]",
		"inline-end": "order-last pr-3 has-[>button]:mr-[-0.4rem] has-[>kbd]:mr-[-0.35rem]",
		"block-start": "[.border-b]:pb-3 order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-2.5",
		"block-end": "[.border-t]:pt-3 order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-2.5"
	} },
	defaultVariants: { align: "inline-start" }
});
function InputGroupAddon({ className, align = "inline-start", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "group",
		"data-slot": "input-group-addon",
		"data-align": align,
		className: cn(inputGroupAddonVariants({ align }), className),
		onClick: (e) => {
			if (e.target.closest("button")) return;
			e.currentTarget.parentElement?.querySelector("input")?.focus();
		},
		...props
	});
}
var inputGroupButtonVariants = cva("flex items-center gap-2 text-sm shadow-none", {
	variants: { size: {
		xs: "h-6 gap-1 rounded-[calc(var(--radius)-5px)] px-2 has-[>svg]:px-2 [&>svg:not([class*='size-'])]:size-3.5",
		sm: "h-8 gap-1.5 rounded-md px-2.5 has-[>svg]:px-2.5",
		"icon-xs": "size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0",
		"icon-sm": "size-8 p-0 has-[>svg]:p-0"
	} },
	defaultVariants: { size: "xs" }
});
function InputGroupButton({ className, type = "button", variant = "ghost", size = "xs", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type,
		"data-size": size,
		variant,
		className: cn(inputGroupButtonVariants({ size }), className),
		...props
	});
}
function InputGroupTextarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
		"data-slot": "input-group-control",
		className: cn("flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent", className),
		...props
	});
}
function Spinner({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
		role: "status",
		"aria-label": "Loading",
		className: cn("size-4 animate-spin", className),
		...props
	});
}
var convertBlobUrlToDataUrl = async (url) => {
	try {
		const blob = await (await fetch(url)).blob();
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result);
			reader.onerror = () => resolve(null);
			reader.readAsDataURL(blob);
		});
	} catch {
		return null;
	}
};
var PromptInputController = (0, import_react.createContext)(null);
var ProviderAttachmentsContext = (0, import_react.createContext)(null);
var useOptionalPromptInputController = () => (0, import_react.useContext)(PromptInputController);
var useOptionalProviderAttachments = () => (0, import_react.useContext)(ProviderAttachmentsContext);
var LocalAttachmentsContext = (0, import_react.createContext)(null);
var usePromptInputAttachments = () => {
	const provider = useOptionalProviderAttachments();
	const context = (0, import_react.useContext)(LocalAttachmentsContext) ?? provider;
	if (!context) throw new Error("usePromptInputAttachments must be used within a PromptInput or PromptInputProvider");
	return context;
};
var LocalReferencedSourcesContext = (0, import_react.createContext)(null);
var PromptInput = ({ className, accept, multiple, globalDrop, syncHiddenInput, maxFiles, maxFileSize, onError, onSubmit, children, ...props }) => {
	const controller = useOptionalPromptInputController();
	const usingProvider = !!controller;
	const inputRef = (0, import_react.useRef)(null);
	const formRef = (0, import_react.useRef)(null);
	const [items, setItems] = (0, import_react.useState)([]);
	const files = usingProvider ? controller.attachments.files : items;
	const [referencedSources, setReferencedSources] = (0, import_react.useState)([]);
	const filesRef = (0, import_react.useRef)(files);
	(0, import_react.useEffect)(() => {
		filesRef.current = files;
	}, [files]);
	const openFileDialogLocal = (0, import_react.useCallback)(() => {
		inputRef.current?.click();
	}, []);
	const matchesAccept = (0, import_react.useCallback)((f) => {
		if (!accept || accept.trim() === "") return true;
		return accept.split(",").map((s) => s.trim()).filter(Boolean).some((pattern) => {
			if (pattern.endsWith("/*")) {
				const prefix = pattern.slice(0, -1);
				return f.type.startsWith(prefix);
			}
			return f.type === pattern;
		});
	}, [accept]);
	const addLocal = (0, import_react.useCallback)((fileList) => {
		const incoming = [...fileList];
		const accepted = incoming.filter((f) => matchesAccept(f));
		if (incoming.length && accepted.length === 0) {
			onError?.({
				code: "accept",
				message: "No files match the accepted types."
			});
			return;
		}
		const withinSize = (f) => maxFileSize ? f.size <= maxFileSize : true;
		const sized = accepted.filter(withinSize);
		if (accepted.length > 0 && sized.length === 0) {
			onError?.({
				code: "max_file_size",
				message: "All files exceed the maximum size."
			});
			return;
		}
		setItems((prev) => {
			const capacity = typeof maxFiles === "number" ? Math.max(0, maxFiles - prev.length) : void 0;
			const capped = typeof capacity === "number" ? sized.slice(0, capacity) : sized;
			if (typeof capacity === "number" && sized.length > capacity) onError?.({
				code: "max_files",
				message: "Too many files. Some were not added."
			});
			const next = [];
			for (const file of capped) next.push({
				filename: file.name,
				id: nanoid(),
				mediaType: file.type,
				type: "file",
				url: URL.createObjectURL(file)
			});
			return [...prev, ...next];
		});
	}, [
		matchesAccept,
		maxFiles,
		maxFileSize,
		onError
	]);
	const removeLocal = (0, import_react.useCallback)((id) => setItems((prev) => {
		const found = prev.find((file) => file.id === id);
		if (found?.url) URL.revokeObjectURL(found.url);
		return prev.filter((file) => file.id !== id);
	}), []);
	const addWithProviderValidation = (0, import_react.useCallback)((fileList) => {
		const incoming = [...fileList];
		const accepted = incoming.filter((f) => matchesAccept(f));
		if (incoming.length && accepted.length === 0) {
			onError?.({
				code: "accept",
				message: "No files match the accepted types."
			});
			return;
		}
		const withinSize = (f) => maxFileSize ? f.size <= maxFileSize : true;
		const sized = accepted.filter(withinSize);
		if (accepted.length > 0 && sized.length === 0) {
			onError?.({
				code: "max_file_size",
				message: "All files exceed the maximum size."
			});
			return;
		}
		const currentCount = files.length;
		const capacity = typeof maxFiles === "number" ? Math.max(0, maxFiles - currentCount) : void 0;
		const capped = typeof capacity === "number" ? sized.slice(0, capacity) : sized;
		if (typeof capacity === "number" && sized.length > capacity) onError?.({
			code: "max_files",
			message: "Too many files. Some were not added."
		});
		if (capped.length > 0) controller?.attachments.add(capped);
	}, [
		matchesAccept,
		maxFileSize,
		maxFiles,
		onError,
		files.length,
		controller
	]);
	const clearAttachments = (0, import_react.useCallback)(() => usingProvider ? controller?.attachments.clear() : setItems((prev) => {
		for (const file of prev) if (file.url) URL.revokeObjectURL(file.url);
		return [];
	}), [usingProvider, controller]);
	const clearReferencedSources = (0, import_react.useCallback)(() => setReferencedSources([]), []);
	const add = usingProvider ? addWithProviderValidation : addLocal;
	const remove = usingProvider ? controller.attachments.remove : removeLocal;
	const openFileDialog = usingProvider ? controller.attachments.openFileDialog : openFileDialogLocal;
	const clear = (0, import_react.useCallback)(() => {
		clearAttachments();
		clearReferencedSources();
	}, [clearAttachments, clearReferencedSources]);
	(0, import_react.useEffect)(() => {
		if (!usingProvider) return;
		controller.__registerFileInput(inputRef, () => inputRef.current?.click());
	}, [usingProvider, controller]);
	(0, import_react.useEffect)(() => {
		if (syncHiddenInput && inputRef.current && files.length === 0) inputRef.current.value = "";
	}, [files, syncHiddenInput]);
	(0, import_react.useEffect)(() => {
		const form = formRef.current;
		if (!form) return;
		if (globalDrop) return;
		const onDragOver = (e) => {
			if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
		};
		const onDrop = (e) => {
			if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
			if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) add(e.dataTransfer.files);
		};
		form.addEventListener("dragover", onDragOver);
		form.addEventListener("drop", onDrop);
		return () => {
			form.removeEventListener("dragover", onDragOver);
			form.removeEventListener("drop", onDrop);
		};
	}, [add, globalDrop]);
	(0, import_react.useEffect)(() => {
		if (!globalDrop) return;
		const onDragOver = (e) => {
			if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
		};
		const onDrop = (e) => {
			if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
			if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) add(e.dataTransfer.files);
		};
		document.addEventListener("dragover", onDragOver);
		document.addEventListener("drop", onDrop);
		return () => {
			document.removeEventListener("dragover", onDragOver);
			document.removeEventListener("drop", onDrop);
		};
	}, [add, globalDrop]);
	(0, import_react.useEffect)(() => () => {
		if (!usingProvider) {
			for (const f of filesRef.current) if (f.url) URL.revokeObjectURL(f.url);
		}
	}, [usingProvider]);
	const handleChange = (0, import_react.useCallback)((event) => {
		if (event.currentTarget.files) add(event.currentTarget.files);
		event.currentTarget.value = "";
	}, [add]);
	const attachmentsCtx = (0, import_react.useMemo)(() => ({
		add,
		clear: clearAttachments,
		fileInputRef: inputRef,
		files: files.map((item) => ({
			...item,
			id: item.id
		})),
		openFileDialog,
		remove
	}), [
		files,
		add,
		remove,
		clearAttachments,
		openFileDialog
	]);
	const refsCtx = (0, import_react.useMemo)(() => ({
		add: (incoming) => {
			const array = Array.isArray(incoming) ? incoming : [incoming];
			setReferencedSources((prev) => [...prev, ...array.map((s) => ({
				...s,
				id: nanoid()
			}))]);
		},
		clear: clearReferencedSources,
		remove: (id) => {
			setReferencedSources((prev) => prev.filter((s) => s.id !== id));
		},
		sources: referencedSources
	}), [referencedSources, clearReferencedSources]);
	const handleSubmit = (0, import_react.useCallback)(async (event) => {
		event.preventDefault();
		const form = event.currentTarget;
		const text = usingProvider ? controller.textInput.value : (() => {
			return new FormData(form).get("message") || "";
		})();
		if (!usingProvider) form.reset();
		try {
			const result = onSubmit({
				files: await Promise.all(files.map(async ({ id: _id, ...item }) => {
					if (item.url?.startsWith("blob:")) {
						const dataUrl = await convertBlobUrlToDataUrl(item.url);
						return {
							...item,
							url: dataUrl ?? item.url
						};
					}
					return item;
				})),
				text
			}, event);
			if (result instanceof Promise) try {
				await result;
				clear();
				if (usingProvider) controller.textInput.clear();
			} catch {}
			else {
				clear();
				if (usingProvider) controller.textInput.clear();
			}
		} catch {}
	}, [
		usingProvider,
		controller,
		files,
		onSubmit,
		clear
	]);
	const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		accept,
		"aria-label": "Upload files",
		className: "hidden",
		multiple,
		onChange: handleChange,
		ref: inputRef,
		title: "Upload files",
		type: "file"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
		className: cn("w-full", className),
		onSubmit: handleSubmit,
		ref: formRef,
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroup, {
			className: "overflow-hidden",
			children
		})
	})] });
	const withReferencedSources = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocalReferencedSourcesContext.Provider, {
		value: refsCtx,
		children: inner
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocalAttachmentsContext.Provider, {
		value: attachmentsCtx,
		children: withReferencedSources
	});
};
var PromptInputTextarea = ({ onChange, onKeyDown, className, placeholder = "What would you like to know?", ...props }) => {
	const controller = useOptionalPromptInputController();
	const attachments = usePromptInputAttachments();
	const [isComposing, setIsComposing] = (0, import_react.useState)(false);
	const handleKeyDown = (0, import_react.useCallback)((e) => {
		onKeyDown?.(e);
		if (e.defaultPrevented) return;
		if (e.key === "Enter") {
			if (isComposing || e.nativeEvent.isComposing) return;
			if (e.shiftKey) return;
			e.preventDefault();
			const { form } = e.currentTarget;
			if ((form?.querySelector("button[type=\"submit\"]"))?.disabled) return;
			form?.requestSubmit();
		}
		if (e.key === "Backspace" && e.currentTarget.value === "" && attachments.files.length > 0) {
			e.preventDefault();
			const lastAttachment = attachments.files.at(-1);
			if (lastAttachment) attachments.remove(lastAttachment.id);
		}
	}, [
		onKeyDown,
		isComposing,
		attachments
	]);
	const handlePaste = (0, import_react.useCallback)((event) => {
		const items = event.clipboardData?.items;
		if (!items) return;
		const files = [];
		for (const item of items) if (item.kind === "file") {
			const file = item.getAsFile();
			if (file) files.push(file);
		}
		if (files.length > 0) {
			event.preventDefault();
			attachments.add(files);
		}
	}, [attachments]);
	const handleCompositionEnd = (0, import_react.useCallback)(() => setIsComposing(false), []);
	const handleCompositionStart = (0, import_react.useCallback)(() => setIsComposing(true), []);
	const controlledProps = controller ? {
		onChange: (e) => {
			controller.textInput.setInput(e.currentTarget.value);
			onChange?.(e);
		},
		value: controller.textInput.value
	} : { onChange };
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupTextarea, {
		className: cn("field-sizing-content max-h-48 min-h-16", className),
		name: "message",
		onCompositionEnd: handleCompositionEnd,
		onCompositionStart: handleCompositionStart,
		onKeyDown: handleKeyDown,
		onPaste: handlePaste,
		placeholder,
		...props,
		...controlledProps
	});
};
var PromptInputFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupAddon, {
	align: "block-end",
	className: cn("justify-between gap-1", className),
	...props
});
var PromptInputSubmit = ({ className, variant = "default", size = "icon-sm", status, onStop, onClick, children, ...props }) => {
	const isGenerating = status === "submitted" || status === "streaming";
	let Icon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CornerDownLeft, { className: "size-4" });
	if (status === "submitted") Icon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spinner, {});
	else if (status === "streaming") Icon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-4" });
	else if (status === "error") Icon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" });
	const handleClick = (0, import_react.useCallback)((e) => {
		if (isGenerating && onStop) {
			e.preventDefault();
			onStop();
			return;
		}
		onClick?.(e);
	}, [
		isGenerating,
		onStop,
		onClick
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupButton, {
		"aria-label": isGenerating ? "Stop" : "Submit",
		className: cn(className),
		onClick: handleClick,
		size,
		type: isGenerating && onStop ? "button" : "submit",
		variant,
		...props,
		children: children ?? Icon
	});
};
var motionComponentCache = /* @__PURE__ */ new Map();
var getMotionComponent = (element) => {
	let component = motionComponentCache.get(element);
	if (!component) {
		component = motion.create(element);
		motionComponentCache.set(element, component);
	}
	return component;
};
var ShimmerComponent = ({ children, as: Component = "p", className, duration = 2, spread = 2 }) => {
	const MotionComponent = getMotionComponent(Component);
	const dynamicSpread = (0, import_react.useMemo)(() => (children?.length ?? 0) * spread, [children, spread]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MotionComponent, {
		animate: { backgroundPosition: "0% center" },
		className: cn("relative inline-block bg-[length:250%_100%,auto] bg-clip-text text-transparent", "[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--color-background),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]", className),
		initial: { backgroundPosition: "100% center" },
		style: {
			"--spread": `${dynamicSpread}px`,
			backgroundImage: "var(--bg), linear-gradient(var(--color-muted-foreground), var(--color-muted-foreground))"
		},
		transition: {
			duration,
			ease: "linear",
			repeat: Number.POSITIVE_INFINITY
		},
		children
	});
};
var Shimmer = (0, import_react.memo)(ShimmerComponent);
var ADVISOR_TOOLS = [
	{
		type: "function",
		function: {
			name: "crear_nota",
			description: "Guarda una nota en la sección Notas. Úsala SOLO después de que el usuario haya confirmado explícitamente que quiere guardarla.",
			parameters: {
				type: "object",
				properties: {
					title: {
						type: "string",
						description: "Título corto de la nota"
					},
					content: {
						type: "string",
						description: "Contenido completo de la nota"
					}
				},
				required: ["title", "content"]
			}
		}
	},
	{
		type: "function",
		function: {
			name: "crear_dedicatoria",
			description: "Guarda una dedicatoria de texto. Úsala SOLO después de confirmación explícita del usuario.",
			parameters: {
				type: "object",
				properties: {
					title: { type: "string" },
					content: { type: "string" }
				},
				required: ["title", "content"]
			}
		}
	},
	{
		type: "function",
		function: {
			name: "agendar_evento",
			description: "Agrega un plan al calendario. Úsala SOLO después de confirmación explícita del usuario.",
			parameters: {
				type: "object",
				properties: {
					title: { type: "string" },
					date: {
						type: "string",
						description: "Fecha YYYY-MM-DD"
					},
					time: {
						type: "string",
						description: "Hora HH:MM, opcional"
					},
					location: {
						type: "string",
						description: "Lugar, opcional"
					},
					description: {
						type: "string",
						description: "Descripción, opcional"
					}
				},
				required: ["title", "date"]
			}
		}
	},
	{
		type: "function",
		function: {
			name: "crear_capsula",
			description: "Crea una cápsula del tiempo. Úsala SOLO después de confirmación explícita del usuario.",
			parameters: {
				type: "object",
				properties: {
					title: { type: "string" },
					content: { type: "string" },
					open_at: {
						type: "string",
						description: "Fecha de apertura en ISO 8601 o YYYY-MM-DD"
					}
				},
				required: [
					"title",
					"content",
					"open_at"
				]
			}
		}
	},
	{
		type: "function",
		function: {
			name: "crear_reto",
			description: "Crea un reto para la pareja. Úsala SOLO después de confirmación explícita del usuario.",
			parameters: {
				type: "object",
				properties: {
					title: { type: "string" },
					description: { type: "string" }
				},
				required: ["title"]
			}
		}
	},
	{
		type: "function",
		function: {
			name: "agregar_cancion",
			description: "Agrega una canción a Canciones. Úsala SOLO después de confirmación explícita del usuario.",
			parameters: {
				type: "object",
				properties: {
					title: { type: "string" },
					artist: { type: "string" },
					url: { type: "string" },
					note: { type: "string" }
				},
				required: ["title"]
			}
		}
	},
	{
		type: "function",
		function: {
			name: "agregar_frase",
			description: "Guarda una frase especial. Úsala SOLO después de confirmación explícita del usuario.",
			parameters: {
				type: "object",
				properties: {
					content: { type: "string" },
					author: { type: "string" }
				},
				required: ["content"]
			}
		}
	},
	{
		type: "function",
		function: {
			name: "registrar_animo",
			description: "Registra el ánimo del usuario. Úsala SOLO después de confirmación explícita del usuario.",
			parameters: {
				type: "object",
				properties: {
					emoji: { type: "string" },
					label: { type: "string" },
					note: { type: "string" }
				},
				required: ["emoji", "label"]
			}
		}
	},
	{
		type: "function",
		function: {
			name: "avisar_pareja",
			description: "Envía un aviso a la pareja dentro de Nuestro Espacio. Úsala SOLO después de confirmación explícita del usuario.",
			parameters: {
				type: "object",
				properties: {
					title: { type: "string" },
					message: { type: "string" },
					link: {
						type: "string",
						description: "Ruta interna de la app, opcional"
					}
				},
				required: ["title", "message"]
			}
		}
	}
];
function rowsToMessages(rows) {
	return rows.map((r) => ({
		id: r.id,
		role: r.role,
		parts: Array.isArray(r.parts) ? r.parts : []
	}));
}
function messageText(message) {
	return message.parts.filter((part) => part.type === "text").map((part) => part.text).join("\n").trim();
}
function newTextMessage(role, text) {
	return {
		id: `advisor-${role}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
		role,
		parts: [{
			type: "text",
			text
		}]
	};
}
function asString(value) {
	return typeof value === "string" ? value.trim() : "";
}
function optionalString(value) {
	return asString(value) || null;
}
function hasExplicitActionConfirmation(history, currentText) {
	const normalized = currentText.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
	if (!(/^(si|dale|hazlo|hazla|guardalo|guardala|agendalo|agendala|crealo|creala|envialo|enviala|registralo|registrala|confirmo)(\b|[,.!])/i.test(normalized) || /^(si\s+por\s+favor|si\s+hazlo|si\s+guardalo|si\s+guardala)$/i.test(normalized))) return false;
	const previousAssistant = [...history].reverse().find((message) => message.role === "assistant");
	if (!previousAssistant) return false;
	const previousText = messageText(previousAssistant).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
	return /(quieres que|confirmas|confirmame|puedo (guard|agend|cre|envi|registr)|lo (guardo|agendo|creo|envio|registro)|la (guardo|agendo|creo|envio|registro))/i.test(previousText);
}
function extractPuterText(response) {
	if (typeof response === "string") return response.trim();
	const content = response.message?.content ?? response.content;
	if (typeof content === "string") return content.trim();
	if (Array.isArray(content)) return content.map((part) => {
		if (typeof part === "string") return part;
		if (part && typeof part === "object" && "text" in part && typeof part.text === "string") return part.text;
		return "";
	}).join("\n").trim();
	const rendered = response.toString?.();
	return rendered && rendered !== "[object Object]" ? rendered.trim() : "";
}
async function buildAdvisorSystem(userId) {
	const [{ data: profiles }, { data: moods }, { data: events }, { data: capsules }] = await Promise.all([
		supabase.from("profiles").select("id, name, location, anniversary_date").order("created_at"),
		supabase.from("moods").select("user_id, emoji, label, note, created_at").order("created_at", { ascending: false }).limit(8),
		supabase.from("events").select("title, date, time, location, category").gte("date", (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)).order("date").limit(6),
		supabase.from("time_capsules").select("title, open_at").is("opened_at", null).order("open_at").limit(4)
	]);
	const myProfile = profiles?.find((profile) => profile.id === userId);
	const partner = profiles?.find((profile) => profile.id !== userId);
	const nameOf = (id) => id === userId ? myProfile?.name ?? "yo" : partner?.name ?? "mi pareja";
	const anniversary = profiles?.find((profile) => profile.anniversary_date)?.anniversary_date;
	return [
		"Eres el Consejero de una pareja dentro de la app privada 'Nuestro Espacio'. Hablas siempre en español cercano, respetuoso y cálido, en segunda persona.",
		"Tu trabajo es escuchar, ayudar a entender emociones y dar consejos concretos y personalizados para ESTA pareja. Evita respuestas genéricas.",
		"Haz una pregunta a la vez cuando necesites entender mejor. No juzgues ni tomes partido.",
		"No inventes recuerdos, conversaciones, fechas ni hechos que no aparezcan en el contexto o en los mensajes.",
		"REGLA DE ACCIONES: nunca llames una herramienta en el mismo turno en el que propones guardar, crear, agendar o avisar algo. Primero explica lo que harías y pide confirmación. Solo usa una herramienta cuando el último mensaje del usuario confirme explícitamente que quiere que lo hagas.",
		"Después de ejecutar una herramienta, explica brevemente qué se hizo y en qué sección de la app puede verlo.",
		"Nunca afirmes que una acción se completó si la herramienta devolvió un error.",
		"Nunca des consejos médicos o legales. Si detectas violencia o peligro, recomienda buscar ayuda profesional o de emergencia adecuada.",
		`Hoy es ${(/* @__PURE__ */ new Date()).toLocaleDateString("es", {
			weekday: "long",
			day: "numeric",
			month: "long",
			year: "numeric"
		})}.`,
		`Quien te escribe: ${myProfile?.name ?? "sin nombre"}${myProfile?.location ? ` (${myProfile.location})` : ""}.`,
		partner ? `Su pareja: ${partner.name ?? "sin nombre"}${partner.location ? ` (${partner.location})` : ""}.` : "Todavía no hay pareja vinculada en la app.",
		anniversary ? `Aniversario: ${anniversary}.` : "",
		moods?.length ? `Ánimos recientes: ${moods.map((mood) => `${nameOf(mood.user_id)} ${mood.emoji} ${mood.label}${mood.note ? ` (${mood.note})` : ""}`).join("; ")}.` : "",
		events?.length ? `Próximos planes: ${events.map((event) => `${event.title} el ${event.date}${event.time ? ` a las ${event.time}` : ""}`).join("; ")}.` : "No tienen planes próximos en el calendario.",
		capsules?.length ? `Cápsulas del tiempo pendientes: ${capsules.map((capsule) => `${capsule.title} (abre ${capsule.open_at})`).join("; ")}.` : ""
	].filter(Boolean).join("\n");
}
async function executeAdvisorTool(name, rawArgs, userId) {
	let args = {};
	try {
		args = rawArgs ? JSON.parse(rawArgs) : {};
	} catch {
		throw new Error(`La IA envió datos inválidos para ${name}.`);
	}
	if (name === "crear_nota") {
		const title = asString(args.title);
		const content = asString(args.content);
		if (!title || !content) throw new Error("La nota necesita título y contenido.");
		const { error } = await supabase.from("notes").insert({
			user_id: userId,
			title,
			content
		});
		if (error) throw error;
		return "Nota guardada correctamente en Notas.";
	}
	if (name === "crear_dedicatoria") {
		const title = asString(args.title);
		const content = asString(args.content);
		if (!title || !content) throw new Error("La dedicatoria necesita título y contenido.");
		const { error } = await supabase.from("dedications").insert({
			user_id: userId,
			kind: "text",
			title,
			content
		});
		if (error) throw error;
		return "Dedicatoria guardada correctamente en Dedicatorias.";
	}
	if (name === "agendar_evento") {
		const title = asString(args.title);
		const date = asString(args.date);
		if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("El evento necesita un título y una fecha válida YYYY-MM-DD.");
		const { error } = await supabase.from("events").insert({
			user_id: userId,
			title,
			date,
			time: optionalString(args.time),
			location: optionalString(args.location),
			description: optionalString(args.description),
			category: "cita"
		});
		if (error) throw error;
		return "Plan agregado correctamente al Calendario.";
	}
	if (name === "crear_capsula") {
		const title = asString(args.title);
		const content = asString(args.content);
		const rawOpenAt = asString(args.open_at);
		const parsed = rawOpenAt ? new Date(rawOpenAt) : null;
		if (!title || !content || !parsed || Number.isNaN(parsed.getTime())) throw new Error("La cápsula necesita título, contenido y una fecha de apertura válida.");
		const { error } = await supabase.from("time_capsules").insert({
			user_id: userId,
			title,
			content,
			open_at: parsed.toISOString()
		});
		if (error) throw error;
		return "Cápsula creada correctamente en Cápsulas.";
	}
	if (name === "crear_reto") {
		const title = asString(args.title);
		if (!title) throw new Error("El reto necesita un título.");
		const { error } = await supabase.from("challenges").insert({
			user_id: userId,
			title,
			description: optionalString(args.description)
		});
		if (error) throw error;
		return "Reto creado correctamente en Retos.";
	}
	if (name === "agregar_cancion") {
		const title = asString(args.title);
		if (!title) throw new Error("La canción necesita un título.");
		const { error } = await supabase.from("songs").insert({
			user_id: userId,
			title,
			artist: optionalString(args.artist),
			url: optionalString(args.url),
			note: optionalString(args.note)
		});
		if (error) throw error;
		return "Canción agregada correctamente en Canciones.";
	}
	if (name === "agregar_frase") {
		const content = asString(args.content);
		if (!content) throw new Error("La frase no puede estar vacía.");
		const { error } = await supabase.from("quotes").insert({
			user_id: userId,
			content,
			author: optionalString(args.author)
		});
		if (error) throw error;
		return "Frase guardada correctamente.";
	}
	if (name === "registrar_animo") {
		const emoji = asString(args.emoji);
		const label = asString(args.label);
		if (!emoji || !label) throw new Error("El ánimo necesita emoji y descripción.");
		const { error } = await supabase.from("moods").insert({
			user_id: userId,
			emoji,
			label,
			note: optionalString(args.note)
		});
		if (error) throw error;
		return "Ánimo registrado correctamente.";
	}
	if (name === "avisar_pareja") {
		const title = asString(args.title);
		const message = asString(args.message);
		if (!title || !message) throw new Error("El aviso necesita título y mensaje.");
		await notifyPartner(userId, {
			type: "consejero",
			title,
			message,
			link: optionalString(args.link) ?? "/consejero"
		});
		return "Aviso enviado correctamente a tu pareja.";
	}
	throw new Error(`Acción desconocida: ${name}`);
}
function readablePuterError(error) {
	const candidate = error;
	if (candidate?.error === "popup_blocked") return "El navegador bloqueó la autorización de la IA. Permite ventanas emergentes y vuelve a enviar el mensaje.";
	if (candidate?.error === "auth_window_closed") return "Se cerró la autorización de la IA. Vuelve a enviar el mensaje y acepta para continuar.";
	return candidate?.msg || candidate?.message || "La IA gratuita no pudo responder. Intenta nuevamente.";
}
function ConsejeroThread() {
	const { id } = Route.useParams();
	const { inicio } = Route.useSearch();
	const { user } = useAuth();
	const qc = useQueryClient();
	const { data: thread } = useQuery({
		queryKey: ["advisor-thread", id],
		queryFn: async () => {
			const { data, error } = await supabase.from("advisor_threads").select("id, user_id, title, is_shared").eq("id", id).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	const { data: rows, isLoading } = useQuery({
		queryKey: ["advisor-messages", id],
		queryFn: async () => {
			const { data, error } = await supabase.from("advisor_messages").select("id, role, parts, user_id, created_at").eq("thread_id", id).order("created_at");
			if (error) throw error;
			return data ?? [];
		}
	});
	async function toggleShared() {
		if (!thread || !user) return;
		const next = !thread.is_shared;
		const { error } = await supabase.from("advisor_threads").update({ is_shared: next }).eq("id", thread.id);
		if (error) return toast.error("No se pudo cambiar");
		qc.invalidateQueries({ queryKey: ["advisor-thread", id] });
		qc.invalidateQueries({ queryKey: ["advisor-threads"] });
		if (next) {
			toast.success("Ahora tu amor puede ver y escribir aquí");
			notifyPartner(user.id, {
				type: "consejero",
				title: "Te compartió una charla del Consejero",
				message: thread.title,
				link: `/consejero/${thread.id}`
			}).catch(() => {});
		} else toast.success("La charla volvió a ser privada");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "ghost",
					size: "icon-sm",
					"aria-label": "Volver",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/consejero",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "truncate font-display text-lg font-semibold",
						children: thread?.title ?? "Charla"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[11px] text-muted-foreground",
						children: [thread?.is_shared ? "Los dos ven esta charla" : "Solo tú ves esta charla", " · IA externa sin clave"]
					})]
				}),
				thread?.user_id === user?.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					className: "w-full justify-center rounded-full sm:w-auto",
					onClick: toggleShared,
					children: thread?.is_shared ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "mr-1 size-3.5" }), " Hacer privada"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "mr-1 size-3.5" }), " Compartir con mi amor"] })
				})
			]
		}), isLoading || !user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "surface space-y-3 p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-1/2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-3/4" })]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatWindow, {
			threadId: id,
			userId: user.id,
			initialMessages: rowsToMessages(rows ?? []),
			isShared: !!thread?.is_shared,
			...inicio ? { autoSend: inicio } : {}
		}, id)]
	});
}
function ChatWindow({ threadId, userId, initialMessages, isShared, autoSend }) {
	const qc = useQueryClient();
	const [text, setText] = (0, import_react.useState)("");
	const [messages, setMessages] = (0, import_react.useState)(initialMessages);
	const [status, setStatus] = (0, import_react.useState)("ready");
	const [chatError, setChatError] = (0, import_react.useState)(null);
	const areaRef = (0, import_react.useRef)(null);
	const savedRef = (0, import_react.useRef)(new Set(initialMessages.map((m) => m.id)));
	const autoSentRef = (0, import_react.useRef)(false);
	const busy = status === "submitted" || status === "streaming";
	(0, import_react.useEffect)(() => {
		if (busy) return;
		const pending = messages.filter((m) => !savedRef.current.has(m.id));
		if (pending.length === 0) return;
		for (const m of pending) savedRef.current.add(m.id);
		(async () => {
			const { error: insertError } = await supabase.from("advisor_messages").insert(pending.map((m) => ({
				thread_id: threadId,
				user_id: userId,
				role: m.role,
				parts: m.parts
			})));
			if (insertError) {
				for (const m of pending) savedRef.current.delete(m.id);
				return;
			}
			await supabase.from("advisor_threads").update({ updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", threadId);
			qc.invalidateQueries({ queryKey: ["advisor-threads"] });
		})();
	}, [
		busy,
		messages,
		qc,
		threadId,
		userId
	]);
	(0, import_react.useEffect)(() => {
		if (!isShared) return;
		const channel = supabase.channel(`advisor:${threadId}`).on("postgres_changes", {
			event: "INSERT",
			schema: "public",
			table: "advisor_messages",
			filter: `thread_id=eq.${threadId}`
		}, async (payload) => {
			const row = payload.new;
			if (row.user_id === userId || savedRef.current.has(row.id)) return;
			const { data } = await supabase.from("advisor_messages").select("id, role, parts, user_id, created_at").eq("thread_id", threadId).order("created_at");
			if (!data) return;
			savedRef.current = new Set(data.map((r) => r.id));
			setMessages(rowsToMessages(data));
		}).subscribe();
		return () => {
			supabase.removeChannel(channel);
		};
	}, [
		isShared,
		threadId,
		userId
	]);
	async function send(value) {
		const clean = value.trim();
		if (!clean || busy) return;
		const puter = window.puter;
		if (!puter) {
			const message = "La IA gratuita todavía no cargó. Recarga la página e intenta de nuevo.";
			setChatError(message);
			setStatus("error");
			toast.error(message);
			return;
		}
		try {
			if (!puter.auth.isSignedIn()) await puter.auth.signIn({ attempt_temp_user_creation: true });
		} catch (error) {
			const message = readablePuterError(error);
			setChatError(message);
			setStatus("error");
			toast.error(message);
			return;
		}
		setText("");
		setChatError(null);
		setStatus("submitted");
		const userMessage = newTextMessage("user", clean);
		const nextMessages = [...messages, userMessage];
		setMessages(nextMessages);
		if (messages.length === 0) {
			await supabase.from("advisor_threads").update({ title: threadTitleFrom(clean) }).eq("id", threadId);
			qc.invalidateQueries({ queryKey: ["advisor-thread", threadId] });
			qc.invalidateQueries({ queryKey: ["advisor-threads"] });
		}
		try {
			const system = await buildAdvisorSystem(userId);
			const history = nextMessages.slice(-30).map((message) => ({
				role: message.role,
				content: messageText(message)
			})).filter((message) => asString(message.content));
			const conversation = [{
				role: "system",
				content: system
			}, ...history];
			const actionConfirmed = hasExplicitActionConfirmation(messages, clean);
			const first = await puter.ai.chat(conversation, false, {
				model: "gpt-5.6-luna",
				stream: false,
				normalize: true,
				reasoning_effort: "low",
				verbosity: "medium",
				temperature: .7,
				max_tokens: 1400,
				tools: ADVISOR_TOOLS
			});
			const toolCalls = typeof first === "string" ? [] : first.message?.tool_calls ?? [];
			let answer = "";
			if (toolCalls.length > 0 && typeof first !== "string" && first.message) {
				conversation.push(first.message);
				for (const call of toolCalls) {
					let result;
					if (!actionConfirmed) result = "ERROR: La aplicación bloqueó la acción porque aún falta una confirmación explícita del usuario. Pide confirmación y no afirmes que se realizó.";
					else try {
						result = await executeAdvisorTool(call.function.name, call.function.arguments, userId);
					} catch (error) {
						result = `ERROR: ${error instanceof Error ? error.message : "No se pudo completar la acción."}`;
					}
					conversation.push({
						role: "tool",
						tool_call_id: call.id,
						content: result
					});
				}
				await qc.invalidateQueries();
				answer = extractPuterText(await puter.ai.chat(conversation, false, {
					model: "gpt-5.6-luna",
					stream: false,
					normalize: true,
					reasoning_effort: "low",
					verbosity: "medium",
					temperature: .7,
					max_tokens: 1200
				}));
			} else answer = extractPuterText(first);
			if (!answer) throw new Error("La IA respondió sin texto.");
			setMessages((current) => [...current, newTextMessage("assistant", answer)]);
			setStatus("ready");
		} catch (error) {
			const message = readablePuterError(error);
			setChatError(message);
			setStatus("error");
			toast.error(message);
		} finally {
			areaRef.current?.focus();
		}
	}
	(0, import_react.useEffect)(() => {
		if (!autoSend || autoSentRef.current || messages.length > 0) return;
		autoSentRef.current = true;
		if (window.puter?.auth.isSignedIn()) send(autoSend);
		else setText(autoSend);
	}, [autoSend]);
	(0, import_react.useEffect)(() => {
		areaRef.current?.focus();
	}, [threadId, status]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface flex h-[calc(100dvh-12rem)] min-h-[24rem] max-h-[52rem] min-w-0 flex-col overflow-hidden lg:h-[min(72vh,52rem)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Conversation, {
			className: "flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ConversationContent, {
				className: "gap-4 p-3 sm:gap-6 sm:p-4",
				children: [
					messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConversationEmptyState, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartHandshake, { className: "size-8 text-primary" }),
						title: "Cuéntame cómo te sientes",
						description: "El Consejero usa IA externa sin una API key de Lovable. La primera vez puede pedir una autorización gratuita de Puter."
					}) : messages.map((message) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Message, {
						from: message.role,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageContent, { children: message.parts.map((part, index) => {
							if (part.type === "text") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageResponse, { children: part.text }, `${message.id}-${index}`);
							if (part.type === "reasoning") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs italic text-muted-foreground",
								children: part.text
							}, `${message.id}-${index}`);
							return null;
						}) })
					}, message.id)),
					status === "submitted" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shimmer, { children: "Pensando en ustedes…" }),
					chatError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-destructive",
						children: chatError
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConversationScrollButton, {})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-t border-border/60 p-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PromptInput, {
				onSubmit: (message, event) => {
					event.preventDefault();
					send(message.text || text);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PromptInputTextarea, {
					ref: areaRef,
					autoFocus: true,
					value: text,
					onChange: (event) => setText(event.target.value),
					placeholder: "Cuéntame qué pasó hoy…"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PromptInputFooter, {
					className: "justify-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PromptInputSubmit, {
						status,
						disabled: !text.trim() && !busy
					})
				})]
			})
		})]
	});
}
//#endregion
export { ConsejeroThread as component };
