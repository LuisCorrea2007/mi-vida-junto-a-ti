import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DLsAaqJR.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useAuth } from "./use-auth-DGYwFkQT.mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { i as useProfiles } from "./use-profiles-BF23D9k9.mjs";
import { t as useCouple } from "./use-couple-DkHteiG_.mjs";
import { r as notifyPartner } from "./notify-BAmHhUK-.mjs";
import { n as cn, t as Button } from "./button-BhpwCH7y.mjs";
import { t as Input } from "./input-uKI_ipPV.mjs";
import { t as Label } from "./label-_AN6BsJs.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Q as ExternalLink, g as Quote, l as Star, o as Trash2, v as Plus, w as Music } from "../_libs/lucide-react.mjs";
import { t as useRealtime } from "./use-realtime-CbcWwiQW.mjs";
import { i as REACTIONS } from "./content-IdYYa_dU.mjs";
import { t as Textarea } from "./textarea-DrdjxuB0.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as DialogTrigger, t as Dialog } from "./dialog-BqlxLUVZ.mjs";
import { t as useHearts } from "./hearts-BQnLKLIB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/canciones-C3KM7NhG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CancionesPage() {
	const { user } = useAuth();
	const qc = useQueryClient();
	const { data: couple } = useCouple(user?.id);
	const { data: profiles } = useProfiles();
	const { burst, hearts } = useHearts();
	useRealtime("songs", "song_reactions", "quotes");
	const [songOpen, setSongOpen] = (0, import_react.useState)(false);
	const [title, setTitle] = (0, import_react.useState)("");
	const [artist, setArtist] = (0, import_react.useState)("");
	const [url, setUrl] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("");
	const [quote, setQuote] = (0, import_react.useState)("");
	const [author, setAuthor] = (0, import_react.useState)("");
	const { data: songs = [] } = useQuery({
		queryKey: ["songs"],
		queryFn: async () => {
			const { data, error } = await supabase.from("songs").select("id, user_id, title, artist, url, note, is_favorite, created_at").order("created_at", { ascending: false });
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: reactions = [] } = useQuery({
		queryKey: ["song_reactions"],
		queryFn: async () => {
			const { data, error } = await supabase.from("song_reactions").select("id, song_id, user_id, reaction_type");
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: quotes = [] } = useQuery({
		queryKey: ["quotes"],
		queryFn: async () => {
			const { data, error } = await supabase.from("quotes").select("id, user_id, content, author, created_at").order("created_at", { ascending: false });
			if (error) throw error;
			return data ?? [];
		}
	});
	const addSong = useMutation({
		mutationFn: async () => {
			if (!user) throw new Error("Inicia sesión");
			if (!title.trim()) throw new Error("Falta el nombre de la canción");
			const { error } = await supabase.from("songs").insert({
				user_id: user.id,
				title: title.trim(),
				artist: artist.trim() || null,
				url: url.trim() || null,
				note: note.trim() || null
			});
			if (error) throw error;
			if (couple?.partnerId) await notifyPartner({
				toUserId: couple.partnerId,
				type: "cancion",
				title: "Te dediqué una canción 🎵",
				message: `${title.trim()}${artist.trim() ? ` — ${artist.trim()}` : ""}`,
				link: "/canciones"
			});
		},
		onSuccess: () => {
			setSongOpen(false);
			setTitle("");
			setArtist("");
			setUrl("");
			setNote("");
			burst(10);
			toast.success("Canción añadida");
			qc.invalidateQueries({ queryKey: ["songs"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const favorite = useMutation({
		mutationFn: async (song) => {
			const { error } = await supabase.from("songs").update({ is_favorite: !song.is_favorite }).eq("id", song.id);
			if (error) throw error;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["songs"] }),
		onError: () => toast.error("Solo puedes destacar las canciones que subiste tú")
	});
	const removeSong = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("songs").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["songs"] }),
		onError: (e) => toast.error(e.message)
	});
	const react = useMutation({
		mutationFn: async ({ song, type }) => {
			if (!user) throw new Error("Inicia sesión");
			const mine = reactions.find((r) => r.song_id === song.id && r.user_id === user.id && r.reaction_type === type);
			if (mine) {
				const { error } = await supabase.from("song_reactions").delete().eq("id", mine.id);
				if (error) throw error;
				return;
			}
			const { error } = await supabase.from("song_reactions").insert({
				song_id: song.id,
				user_id: user.id,
				reaction_type: type
			});
			if (error) throw error;
			if (couple?.partnerId && song.user_id !== user.id) await notifyPartner({
				toUserId: couple.partnerId,
				type: "cancion",
				title: "Reaccionó a tu canción",
				message: song.title,
				link: "/canciones"
			});
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["song_reactions"] }),
		onError: (e) => toast.error(e.message)
	});
	const addQuote = useMutation({
		mutationFn: async () => {
			if (!user) throw new Error("Inicia sesión");
			if (!quote.trim()) throw new Error("Escribe la frase");
			const { error } = await supabase.from("quotes").insert({
				user_id: user.id,
				content: quote.trim(),
				author: author.trim() || null
			});
			if (error) throw error;
		},
		onSuccess: () => {
			setQuote("");
			setAuthor("");
			toast.success("Frase guardada");
			qc.invalidateQueries({ queryKey: ["quotes"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const removeQuote = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("quotes").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["quotes"] }),
		onError: (e) => toast.error(e.message)
	});
	const nameOf = (id) => id === user?.id ? "Tú" : profiles?.find((p) => p.id === id)?.name ?? "Tu pareja";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			hearts,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface warm-gradient p-5 text-center sm:p-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.25em] text-primary",
						children: "Nuestra banda sonora"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-3 font-display text-3xl font-semibold sm:text-4xl",
						children: "Canciones y frases"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mt-3 max-w-md text-sm text-muted-foreground",
						children: "Guarden las canciones que les recuerdan al otro y las frases que quieren releer siempre."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
						open: songOpen,
						onOpenChange: setSongOpen,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								className: "mt-6 rounded-full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 size-4" }), " Añadir canción"]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Nueva canción" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "s-title",
										children: "Canción"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "s-title",
										value: title,
										onChange: (e) => setTitle(e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "s-artist",
										children: "Artista"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "s-artist",
										value: artist,
										onChange: (e) => setArtist(e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "s-url",
										children: "Enlace (Spotify o YouTube)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "s-url",
										value: url,
										onChange: (e) => setUrl(e.target.value),
										placeholder: "https://"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "s-note",
										children: "¿Por qué es especial?"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										id: "s-note",
										rows: 3,
										value: note,
										onChange: (e) => setNote(e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									className: "w-full rounded-full",
									disabled: addSong.isPending,
									onClick: () => addSong.mutate(),
									children: "Guardar"
								})
							]
						})] })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-semibold",
					children: "Nuestra playlist"
				}), songs.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid gap-4 sm:grid-cols-2",
					children: songs.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						id: s.id,
						className: "surface scroll-mt-24 p-5 target:ring-2 target:ring-primary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music, { className: "mt-1 size-4 shrink-0 text-primary" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-display text-lg font-semibold",
											children: s.title
										}),
										s.artist && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted-foreground",
											children: s.artist
										}),
										s.note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-sm",
											children: s.note
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-2 text-xs text-muted-foreground",
											children: ["Agregada por ", nameOf(s.user_id)]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => favorite.mutate(s),
									"aria-label": "Destacar canción",
									className: "shrink-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-4", s.is_favorite ? "fill-primary text-primary" : "text-muted-foreground") })
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap items-center gap-1",
							children: [
								REACTIONS.map((r) => {
									const list = reactions.filter((x) => x.song_id === s.id && x.reaction_type === r.type);
									const mine = list.some((x) => x.user_id === user?.id);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										title: r.label,
										onClick: () => react.mutate({
											song: s,
											type: r.type
										}),
										className: cn("rounded-full px-2 py-1 text-sm transition-colors hover:bg-accent", mine && "bg-primary/15"),
										children: [r.emoji, list.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "ml-1 text-xs text-muted-foreground",
											children: list.length
										})]
									}, r.type);
								}),
								s.url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: s.url,
									target: "_blank",
									rel: "noreferrer",
									className: "ml-auto flex items-center gap-1 text-xs text-primary hover:underline",
									children: ["Escuchar ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3" })]
								}),
								s.user_id === user?.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "ml-2 text-muted-foreground hover:text-destructive",
									"aria-label": "Borrar canción",
									onClick: () => removeSong.mutate(s.id),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
								})
							]
						})]
					}, s.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "surface p-8 text-center text-sm text-muted-foreground",
					children: "Añadan la primera canción de los dos."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl font-semibold",
						children: "Frases favoritas"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							rows: 2,
							value: quote,
							onChange: (e) => setQuote(e.target.value),
							placeholder: "Una frase que quieras recordar siempre..."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "max-w-xs",
								value: author,
								onChange: (e) => setAuthor(e.target.value),
								placeholder: "¿De quién es? (opcional)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "rounded-full",
								disabled: addQuote.isPending,
								onClick: () => addQuote.mutate(),
								children: "Guardar frase"
							})]
						})]
					}),
					quotes.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-6 space-y-3",
						children: quotes.map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							id: `quote-${q.id}`,
							className: "scroll-mt-24 flex items-start gap-3 rounded-xl bg-muted/50 p-4 target:ring-2 target:ring-primary",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Quote, { className: "mt-0.5 size-4 shrink-0 text-primary" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm italic",
										children: [
											"“",
											q.content,
											"”"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: [
											q.author ? `${q.author} · ` : "",
											"guardada por ",
											nameOf(q.user_id)
										]
									})]
								}),
								q.user_id === user?.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "text-muted-foreground hover:text-destructive",
									"aria-label": "Borrar frase",
									onClick: () => removeQuote.mutate(q.id),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
								})
							]
						}, q.id))
					})
				]
			})
		]
	});
}
//#endregion
export { CancionesPage as component };
