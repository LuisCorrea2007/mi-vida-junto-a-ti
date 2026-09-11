import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DLsAaqJR.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useAuth } from "./use-auth-DGYwFkQT.mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { i as useProfiles, r as useMyProfile } from "./use-profiles-BF23D9k9.mjs";
import { t as useCouple } from "./use-couple-DkHteiG_.mjs";
import { a as validateImage, i as useSignedUrl, r as uploadMedia, t as compressImage } from "./media-DkFqNmQI.mjs";
import { a as pushSupported, i as pushEnabled, n as enablePush, t as disablePush } from "./notify-BAmHhUK-.mjs";
import { t as Button } from "./button-BhpwCH7y.mjs";
import { t as Input } from "./input-uKI_ipPV.mjs";
import { t as Label } from "./label-_AN6BsJs.mjs";
import { n as AvatarFallback, r as AvatarImage, t as Avatar } from "./avatar-CvzBEeT_.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { I as LoaderCircle, K as HeartHandshake, f as Smartphone, gt as BellRing, i as Upload, lt as Check, tt as Copy } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ajustes-DhzN8mPd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SettingsPage() {
	const { user } = useAuth();
	const qc = useQueryClient();
	const fileRef = (0, import_react.useRef)(null);
	const { data: profile } = useMyProfile(user?.id);
	const { data: avatar } = useSignedUrl(profile?.avatar_url);
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		anniversary: "",
		location: ""
	});
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [joinCode, setJoinCode] = (0, import_react.useState)("");
	const [copied, setCopied] = (0, import_react.useState)(false);
	const { data: couple } = useCouple(user?.id);
	const { data: profiles } = useProfiles();
	const partner = profiles?.find((p) => p.id === couple?.partnerId);
	const createSpace = useMutation({
		mutationFn: async () => {
			if (!user) throw new Error("Sin sesión");
			const { data, error } = await supabase.from("couples").insert({
				created_by: user.id,
				code: crypto.randomUUID()
			}).select("id").single();
			if (error) throw error;
			const { error: memberError } = await supabase.from("couple_members").insert({
				couple_id: data.id,
				user_id: user.id
			});
			if (memberError) throw memberError;
		},
		onSuccess: () => {
			toast.success("Espacio creado. Comparte el código con tu pareja.");
			qc.invalidateQueries({ queryKey: ["couple"] });
		},
		onError: () => toast.error("No pudimos crear el espacio")
	});
	const joinSpace = useMutation({
		mutationFn: async () => {
			if (!user) throw new Error("Sin sesión");
			const code = joinCode.trim();
			if (!/^[0-9a-f-]{36}$/i.test(code)) throw new Error("Ese código no es válido");
			const { error } = await supabase.from("couple_members").insert({
				couple_id: code,
				user_id: user.id
			});
			if (error) throw new Error("No pudimos unirte: revisa el código o ya tiene dos personas");
		},
		onSuccess: () => {
			setJoinCode("");
			toast.success("¡Listo! Ya comparten el mismo espacio.");
			qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	async function copyCode() {
		if (!couple?.coupleId) return;
		await navigator.clipboard.writeText(couple.coupleId);
		setCopied(true);
		setTimeout(() => setCopied(false), 2e3);
	}
	(0, import_react.useEffect)(() => {
		if (profile) setForm({
			name: profile.name ?? "",
			anniversary: profile.anniversary_date ?? "",
			location: profile.location ?? ""
		});
	}, [profile]);
	const { data: storage } = useQuery({
		queryKey: ["storage-usage"],
		queryFn: async () => {
			const { data, error } = await supabase.from("photos").select("file_size");
			if (error) throw error;
			const bytes = (data ?? []).reduce((sum, p) => sum + (p.file_size ?? 0), 0);
			return {
				count: data?.length ?? 0,
				mb: (bytes / 1048576).toFixed(1)
			};
		}
	});
	const save = useMutation({
		mutationFn: async () => {
			if (!user) throw new Error("Sin sesión");
			if (!form.name.trim()) throw new Error("Escribe un nombre");
			const { error } = await supabase.from("profiles").upsert({
				id: user.id,
				email: user.email ?? null,
				name: form.name.trim().slice(0, 60),
				anniversary_date: form.anniversary || null,
				location: form.location.trim().slice(0, 120) || null
			}, { onConflict: "id" });
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Guardado");
			qc.invalidateQueries({ queryKey: ["profiles"] });
		},
		onError: (e) => toast.error(e.message)
	});
	async function uploadAvatar(file) {
		if (!file || !user) return;
		const invalid = validateImage(file);
		if (invalid) {
			toast.error(invalid);
			return;
		}
		setBusy(true);
		try {
			const blob = await compressImage(file, 512, .9);
			const ext = blob.type === "image/webp" ? "webp" : file.name.split(".").pop() || "jpg";
			const path = await uploadMedia("avatars", user.id, blob, ext);
			const { error } = await supabase.from("profiles").upsert({
				id: user.id,
				email: user.email ?? null,
				avatar_url: path
			}, { onConflict: "id" });
			if (error) throw error;
			toast.success("Foto actualizada");
			qc.invalidateQueries({ queryKey: ["profiles"] });
		} catch {
			toast.error("No pudimos subir la foto");
		}
		setBusy(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-semibold",
				children: "Ajustes"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Su perfil y los detalles del espacio."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface space-y-5 p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
								className: "size-16 border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
									src: avatar ?? void 0,
									alt: profile?.name ?? "Perfil"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, { children: (profile?.name ?? "?").slice(0, 2).toUpperCase() })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								className: "rounded-full",
								disabled: busy,
								onClick: () => fileRef.current?.click(),
								children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "mr-1 size-4" }), "Cambiar foto"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: fileRef,
								type: "file",
								accept: "image/*",
								className: "hidden",
								onChange: (e) => uploadAvatar(e.target.files?.[0])
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "pn",
							children: "Tu nombre"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "pn",
							maxLength: 60,
							value: form.name,
							onChange: (e) => setForm({
								...form,
								name: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "pa",
								children: "Fecha de aniversario"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "pa",
								type: "date",
								value: form.anniversary,
								onChange: (e) => setForm({
									...form,
									anniversary: e.target.value
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Con esta fecha calculamos el contador de días juntos."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "pl",
							children: "Ciudad"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "pl",
							maxLength: 120,
							value: form.location,
							onChange: (e) => setForm({
								...form,
								location: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "rounded-full",
						onClick: () => save.mutate(),
						disabled: save.isPending,
						children: "Guardar cambios"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface space-y-4 p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartHandshake, { className: "size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl font-semibold",
							children: "Su espacio de pareja"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Todo lo que guardan aquí es privado. Solo lo verán las dos personas vinculadas a este espacio."
					}),
					!couple?.coupleId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "rounded-full",
							onClick: () => createSpace.mutate(),
							disabled: createSpace.isPending,
							children: "Crear nuestro espacio"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted-foreground",
							children: "Crea el espacio y comparte el código con tu pareja."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2 border-t pt-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "jc",
								children: "Ya tengo un código"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-2 min-[420px]:flex-row",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "jc",
									placeholder: "Pega aquí el código",
									value: joinCode,
									onChange: (e) => setJoinCode(e.target.value)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									className: "rounded-full",
									onClick: () => joinSpace.mutate(),
									disabled: joinSpace.isPending,
									children: "Unirme"
								})]
							})]
						})]
					}) : partner ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm",
						children: [
							"Vinculado con ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold",
								children: partner.name ?? "tu pareja"
							}),
							". Ya se ven todo entre ustedes."
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Código de invitación" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-2 min-[420px]:flex-row",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									readOnly: true,
									value: couple.coupleId,
									className: "min-w-0 font-mono text-xs"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									className: "rounded-full",
									onClick: copyCode,
									children: copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Envíale este código a tu pareja para que se una."
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PushSection, { userId: user?.id }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InstallSection, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl font-semibold",
						children: "Almacenamiento"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: storage ? `${storage.count} fotos · ${storage.mb} MB usados` : "Calculando…"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "Sus fotos son privadas: solo ustedes dos pueden verlas."
					})
				]
			})
		]
	});
}
function PushSection({ userId }) {
	const [supported, setSupported] = (0, import_react.useState)(false);
	const [enabled, setEnabled] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setSupported(pushSupported());
		pushEnabled().then(setEnabled);
	}, []);
	async function toggle() {
		if (!userId) return;
		setBusy(true);
		try {
			if (enabled) {
				await disablePush(userId);
				setEnabled(false);
				toast.success("Avisos desactivados en este dispositivo");
			} else {
				const ok = await enablePush(userId);
				setEnabled(ok);
				if (ok) toast.success("Listo: te avisaremos en este dispositivo");
				else toast.error("No se dio permiso para los avisos");
			}
		} catch {
			toast.error("No pudimos cambiar los avisos");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "surface space-y-3 p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl font-semibold",
				children: "Avisos en el celular"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Recibe una notificación cuando tu pareja suba, comente o cambie algo, incluso con la app cerrada."
			}),
			supported ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: enabled ? "outline" : "default",
				className: "rounded-full",
				onClick: toggle,
				disabled: busy,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellRing, { className: "mr-1 size-4" }), enabled ? "Desactivar en este dispositivo" : "Activar avisos"]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Este navegador no admite avisos. En iPhone, primero agrega la app a la pantalla de inicio y ábrela desde ahí."
			})
		]
	});
}
function InstallSection() {
	const [prompt, setPrompt] = (0, import_react.useState)(null);
	const [installed, setInstalled] = (0, import_react.useState)(false);
	const [ios, setIos] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setInstalled(window.matchMedia("(display-mode: standalone)").matches);
		setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
		const onPrompt = (e) => {
			e.preventDefault();
			setPrompt(e);
		};
		const onInstalled = () => setInstalled(true);
		window.addEventListener("beforeinstallprompt", onPrompt);
		window.addEventListener("appinstalled", onInstalled);
		return () => {
			window.removeEventListener("beforeinstallprompt", onPrompt);
			window.removeEventListener("appinstalled", onInstalled);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "surface space-y-3 p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-xl font-semibold",
			children: "Instalar la app"
		}), installed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Ya tienes Nuestro Espacio en tu pantalla de inicio. 💗"
		}) : prompt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			className: "rounded-full",
			onClick: async () => {
				await prompt.prompt();
				setPrompt(null);
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "mr-1 size-4" }), " Agregar a la pantalla de inicio"]
		}) : ios ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-sm text-muted-foreground",
			children: [
				"En Safari toca el botón ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Compartir" }),
				" y luego ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Agregar a pantalla de inicio" }),
				". Verás el corazón rosa como ícono."
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-sm text-muted-foreground",
			children: [
				"Abre el menú del navegador y elige ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Instalar app" }),
				" o ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Agregar a pantalla de inicio" }),
				"."
			]
		})]
	});
}
//#endregion
export { SettingsPage as component };
