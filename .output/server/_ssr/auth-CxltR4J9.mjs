import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DLsAaqJR.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as string } from "../_libs/zod.mjs";
import { t as Button } from "./button-BhpwCH7y.mjs";
import { t as Input } from "./input-uKI_ipPV.mjs";
import { t as Label } from "./label-_AN6BsJs.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { I as LoaderCircle, W as Heart, t as X } from "../_libs/lucide-react.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-0Uv_3mYh.mjs";
import { t as createLovableAuth } from "../_libs/lovable.dev__cloud-auth-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-CxltR4J9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var auth = createLovableAuth();
var lovable = { auth: { async signInWithOAuth(provider, opts) {
	const result = await auth.signInWithOAuth(provider, opts);
	if (result.error) return result;
	if (result.redirected) return result;
	const { error } = await supabase.auth.setSession({
		access_token: result.tokens.access_token,
		refresh_token: result.tokens.refresh_token
	});
	if (error) return {
		error,
		redirected: false
	};
	return result;
} } };
var emailSchema = string().trim().email("Correo inválido").max(255);
var passSchema = string().min(8, "Mínimo 8 caracteres").max(72);
var nameSchema = string().trim().min(1, "Escribe un nombre").max(60);
var SAVED_KEY = "ne-saved-accounts";
function readSaved() {
	try {
		const raw = window.localStorage.getItem(SAVED_KEY);
		const list = raw ? JSON.parse(raw) : [];
		return Array.isArray(list) ? list.slice(0, 4) : [];
	} catch {
		return [];
	}
}
function rememberAccount(acc) {
	const list = readSaved().filter((a) => a.email !== acc.email);
	window.localStorage.setItem(SAVED_KEY, JSON.stringify([acc, ...list].slice(0, 4)));
}
function forgetAccount(email) {
	window.localStorage.setItem(SAVED_KEY, JSON.stringify(readSaved().filter((a) => a.email !== email)));
}
function AuthPage() {
	const navigate = useNavigate();
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [saved, setSaved] = (0, import_react.useState)([]);
	const [picked, setPicked] = (0, import_react.useState)(null);
	const [showAll, setShowAll] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setSaved(readSaved());
		supabase.auth.getSession().then(({ data }) => {
			if (data.session) navigate({
				to: "/panel",
				replace: true
			});
		});
	}, [navigate]);
	(0, import_react.useEffect)(() => {
		const { data } = supabase.auth.onAuthStateChange((event, session) => {
			if (event === "SIGNED_IN" && session?.user.email) {
				const meta = session.user.user_metadata;
				const isGoogle = session.user.app_metadata["provider"] === "google";
				rememberAccount({
					email: session.user.email,
					name: meta.name ?? meta.full_name ?? session.user.email.split("@")[0],
					provider: isGoogle ? "google" : "password"
				});
			}
		});
		return () => data.subscription.unsubscribe();
	}, []);
	async function signInWith(email, password) {
		if (!passSchema.safeParse(password).success) {
			toast.error("Mínimo 8 caracteres");
			return;
		}
		setLoading(true);
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password
		});
		setLoading(false);
		if (error) {
			toast.error("Contraseña incorrecta");
			return;
		}
		navigate({
			to: "/panel",
			replace: true
		});
	}
	async function signIn(e) {
		e.preventDefault();
		const form = new FormData(e.currentTarget);
		const email = emailSchema.safeParse(form.get("email"));
		const password = passSchema.safeParse(form.get("password"));
		if (!email.success) {
			toast.error(email.error.issues[0].message);
			return;
		}
		if (!password.success) {
			toast.error(password.error.issues[0].message);
			return;
		}
		setLoading(true);
		const { data, error } = await supabase.auth.signInWithPassword({
			email: email.data,
			password: password.data
		});
		setLoading(false);
		if (error) {
			toast.error("No pudimos entrar: revisa el correo y la contraseña");
			return;
		}
		const meta = data.user.user_metadata;
		rememberAccount({
			email: email.data,
			name: meta.name ?? email.data.split("@")[0],
			provider: "password"
		});
		navigate({
			to: "/panel",
			replace: true
		});
	}
	async function signUp(e) {
		e.preventDefault();
		const form = new FormData(e.currentTarget);
		const name = nameSchema.safeParse(form.get("name"));
		const email = emailSchema.safeParse(form.get("email"));
		const password = passSchema.safeParse(form.get("password"));
		if (!name.success) {
			toast.error(name.error.issues[0].message);
			return;
		}
		if (!email.success) {
			toast.error(email.error.issues[0].message);
			return;
		}
		if (!password.success) {
			toast.error(password.error.issues[0].message);
			return;
		}
		setLoading(true);
		const { error } = await supabase.auth.signUp({
			email: email.data,
			password: password.data,
			options: {
				data: { name: name.data },
				emailRedirectTo: `${window.location.origin}/panel`
			}
		});
		setLoading(false);
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Cuenta creada. Si te pedimos confirmar el correo, revisa tu bandeja.");
		navigate({
			to: "/panel",
			replace: true
		});
	}
	async function google() {
		setLoading(true);
		const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
		if (result.error) {
			setLoading(false);
			toast.error("No pudimos conectar con Google");
			return;
		}
		if (result.redirected) return;
		navigate({
			to: "/panel",
			replace: true
		});
	}
	async function reset() {
		const email = window.prompt("¿A qué correo enviamos el enlace de recuperación?");
		if (!email) return;
		const parsed = emailSchema.safeParse(email);
		if (!parsed.success) {
			toast.error("Correo inválido");
			return;
		}
		const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, { redirectTo: `${window.location.origin}/auth` });
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Te enviamos un enlace para restablecer la contraseña");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "warm-gradient flex min-h-screen items-center justify-center px-4 py-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				className: "mb-8 flex items-center justify-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-6 fill-primary text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display text-2xl font-semibold",
					children: "Nuestro Espacio"
				})]
			}), saved.length > 0 && !showAll ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "surface animate-fade-up p-6 sm:p-8",
				children: picked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "space-y-4",
					onSubmit: (e) => {
						e.preventDefault();
						const fd = new FormData(e.currentTarget);
						fd.set("email", picked.email);
						signInWith(picked.email, String(fd.get("password") ?? ""));
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex size-11 items-center justify-center rounded-full bg-primary/15 font-display text-lg text-primary",
								children: picked.name.charAt(0).toUpperCase()
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate font-medium",
									children: picked.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-xs text-muted-foreground",
									children: picked.email
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "pk-pass",
								children: "Contraseña"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "pk-pass",
								name: "password",
								type: "password",
								autoComplete: "current-password",
								autoFocus: true,
								required: true
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "submit",
							className: "w-full rounded-full",
							disabled: loading,
							children: [loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Entrar"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setPicked(null),
							className: "w-full text-center text-xs text-muted-foreground hover:underline",
							children: "Elegir otra cuenta"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-center text-sm text-muted-foreground",
							children: "¿Quién entra?"
						}),
						saved.map((acc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "flex flex-1 items-center gap-3 rounded-2xl border border-border p-3 text-left transition-colors hover:bg-muted/60",
								onClick: () => acc.provider === "google" ? google() : setPicked(acc),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex size-10 items-center justify-center rounded-full bg-primary/15 font-display text-primary",
									children: acc.name.charAt(0).toUpperCase()
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-sm font-medium",
										children: acc.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "truncate text-xs text-muted-foreground",
										children: [acc.email, acc.provider === "google" ? " · Google" : ""]
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": "Olvidar cuenta",
								onClick: () => {
									forgetAccount(acc.email);
									setSaved(readSaved());
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
							})]
						}, acc.email)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setShowAll(true),
							className: "w-full pt-2 text-center text-xs text-muted-foreground hover:underline",
							children: "Usar otra cuenta o crear una nueva"
						})
					]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface animate-fade-up p-6 sm:p-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
						defaultValue: "login",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
								className: "grid w-full grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "login",
									children: "Entrar"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "signup",
									children: "Crear cuenta"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "login",
								className: "mt-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									onSubmit: signIn,
									className: "space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "li-email",
												children: "Correo"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "li-email",
												name: "email",
												type: "email",
												autoComplete: "email",
												required: true
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "li-pass",
												children: "Contraseña"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "li-pass",
												name: "password",
												type: "password",
												autoComplete: "current-password",
												required: true
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											type: "submit",
											className: "w-full rounded-full",
											disabled: loading,
											children: [loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Entrar"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: reset,
											className: "w-full text-center text-xs text-muted-foreground underline-offset-2 hover:underline",
											children: "Olvidé mi contraseña"
										})
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "signup",
								className: "mt-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									onSubmit: signUp,
									className: "space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "su-name",
												children: "¿Cómo te llamamos?"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "su-name",
												name: "name",
												maxLength: 60,
												required: true
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "su-email",
												children: "Correo"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "su-email",
												name: "email",
												type: "email",
												autoComplete: "email",
												required: true
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "su-pass",
												children: "Contraseña"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "su-pass",
												name: "password",
												type: "password",
												autoComplete: "new-password",
												minLength: 8,
												required: true
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											type: "submit",
											className: "w-full rounded-full",
											disabled: loading,
											children: [loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Crear cuenta"]
										})
									]
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "my-6 flex items-center gap-3 text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" }),
							" o ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						className: "w-full rounded-full",
						onClick: google,
						disabled: loading,
						children: "Continuar con Google"
					})
				]
			})]
		})
	});
}
//#endregion
export { AuthPage as component };
