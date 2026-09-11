import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DLsAaqJR.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useAuth } from "./use-auth-DGYwFkQT.mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { r as notifyPartner } from "./notify-BAmHhUK-.mjs";
import { t as Button } from "./button-BhpwCH7y.mjs";
import { t as Input } from "./input-uKI_ipPV.mjs";
import { t as Label } from "./label-_AN6BsJs.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { W as Heart, dt as CalendarHeart, lt as Check, m as Send, pt as Brain, q as Handshake, v as Plus } from "../_libs/lucide-react.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-0Uv_3mYh.mjs";
import { t as Textarea } from "./textarea-DrdjxuB0.mjs";
import { t as Badge } from "./badge-Cs-bUju5.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-XqsetAbP.mjs";
import { t as ScrollArea } from "./scroll-area-C3DfG48C.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/conexion-C3ouP0y5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useCheckIns() {
	const { user } = useAuth();
	const qc = useQueryClient();
	const { data: myCheckIns, isLoading } = useQuery({
		queryKey: ["checkins", user?.id],
		enabled: !!user,
		queryFn: async () => {
			const { data, error } = await supabase.from("couple_checkins").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
			if (error) throw error;
			return data ?? [];
		}
	});
	return {
		myCheckIns,
		isLoading,
		createCheckIn: useMutation({
			mutationFn: async (input) => {
				const { data, error } = await supabase.from("couple_checkins").insert({
					...input,
					user_id: user.id
				}).select().single();
				if (error) throw error;
				return data;
			},
			onSuccess: async (data) => {
				qc.invalidateQueries({ queryKey: ["checkins"] });
				if (user?.id) try {
					await notifyPartner(user.id, {
						title: "Nuevo check-in de tu pareja",
						body: `${data.emotion} · Energía: ${data.energy_level}/10`,
						tag: `checkin-${data.id}`
					});
				} catch {}
			}
		})
	};
}
function useAgreements() {
	const { user } = useAuth();
	const qc = useQueryClient();
	const { data: agreements, isLoading } = useQuery({
		queryKey: ["agreements"],
		queryFn: async () => {
			const { data, error } = await supabase.from("couple_agreements").select("*").order("created_at", { ascending: false });
			if (error) throw error;
			return data ?? [];
		}
	});
	return {
		agreements,
		isLoading,
		createAgreement: useMutation({
			mutationFn: async (input) => {
				const { data, error } = await supabase.from("couple_agreements").insert({
					...input,
					user_id: user.id
				}).select().single();
				if (error) throw error;
				return data;
			},
			onSuccess: async (data) => {
				qc.invalidateQueries({ queryKey: ["agreements"] });
				if (user?.id) try {
					await notifyPartner(user.id, {
						title: "Nuevo acuerdo propuesto",
						body: data.title,
						tag: `agreement-${data.id}`
					});
				} catch {}
			}
		}),
		updateAgreement: useMutation({
			mutationFn: async ({ id, updates }) => {
				const { data, error } = await supabase.from("couple_agreements").update({
					...updates,
					updated_at: (/* @__PURE__ */ new Date()).toISOString()
				}).eq("id", id).select().single();
				if (error) throw error;
				return data;
			},
			onSuccess: async (data, { updates }) => {
				qc.invalidateQueries({ queryKey: ["agreements"] });
				if (user?.id && updates.status === "cumplido") try {
					await notifyPartner(user.id, {
						title: "¡Acuerdo cumplido! 🎉",
						body: data.title,
						tag: `agreement-done-${data.id}`
					});
				} catch {}
			}
		})
	};
}
function useDeepQuestions() {
	const { user } = useAuth();
	const qc = useQueryClient();
	const { data: questions } = useQuery({
		queryKey: ["deep_questions"],
		queryFn: async () => {
			const { data, error } = await supabase.from("deep_questions").select("*").order("is_daily", { ascending: false }).order("created_at");
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: responses } = useQuery({
		queryKey: ["question_responses", user?.id],
		enabled: !!user,
		queryFn: async () => {
			const { data, error } = await supabase.from("question_responses").select("*").eq("user_id", user.id);
			if (error) throw error;
			return data ?? [];
		}
	});
	return {
		questions,
		responses,
		saveResponse: useMutation({
			mutationFn: async ({ questionId, answer, isFavorite = false }) => {
				const { data, error } = await supabase.from("question_responses").upsert({
					question_id: questionId,
					user_id: user.id,
					answer,
					is_favorite: isFavorite
				}).select().single();
				if (error) throw error;
				return data;
			},
			onSuccess: async () => {
				qc.invalidateQueries({ queryKey: ["question_responses"] });
				if (user?.id) try {
					await notifyPartner(user.id, {
						title: "Tu pareja respondió una pregunta",
						body: "Descúbrela si ya respondiste también",
						tag: "question-response"
					});
				} catch {}
			}
		})
	};
}
function useCouplePlans() {
	const { user } = useAuth();
	const qc = useQueryClient();
	const { data: plans, isLoading } = useQuery({
		queryKey: ["couple_plans"],
		queryFn: async () => {
			const { data, error } = await supabase.from("couple_plans").select("*").order("created_at", { ascending: false });
			if (error) throw error;
			return data ?? [];
		}
	});
	return {
		plans,
		isLoading,
		createPlan: useMutation({
			mutationFn: async (input) => {
				const { data, error } = await supabase.from("couple_plans").insert({
					...input,
					user_id: user.id,
					status: "propuesto"
				}).select().single();
				if (error) throw error;
				return data;
			},
			onSuccess: async (data) => {
				qc.invalidateQueries({ queryKey: ["couple_plans"] });
				if (user?.id) try {
					await notifyPartner(user.id, {
						title: "Nuevo plan propuesto",
						body: data.title,
						tag: `plan-${data.id}`
					});
				} catch {}
			}
		}),
		votePlan: useMutation({
			mutationFn: async ({ planId, voteType }) => {
				const { data, error } = await supabase.from("plan_votes").upsert({
					plan_id: planId,
					user_id: user.id,
					vote_type: voteType
				}).select().single();
				if (error) throw error;
				return data;
			},
			onSuccess: async (_, { planId, voteType }) => {
				qc.invalidateQueries({ queryKey: ["couple_plans"] });
				if (user?.id && voteType === "yes") try {
					await notifyPartner(user.id, {
						title: "¡A tu pareja le gusta un plan!",
						body: "Revisa si coinciden sus votos",
						tag: `plan-vote-${planId}`
					});
				} catch {}
			}
		})
	};
}
var EMOTIONS = [
	"😊 Feliz",
	"😌 Tranquilo",
	"😔 Triste",
	"😤 Estresado",
	"😴 Cansado",
	"💪 Energético"
];
var SUPPORT_TYPES = [
	{
		value: "escuchar",
		label: "Escuchar"
	},
	{
		value: "espacio",
		label: "Dar espacio"
	},
	{
		value: "abrazar",
		label: "Abrazar"
	},
	{
		value: "conversar",
		label: "Conversar"
	},
	{
		value: "ayudar",
		label: "Ayudar"
	}
];
var QUESTION_CATEGORIES = {
	futuro: "🔮 Futuro",
	cariño: "💕 Cariño",
	confianza: "🤝 Confianza",
	recuerdos: "📸 Recuerdos",
	diversion: "🎉 Diversión"
};
function CheckInSection() {
	const { myCheckIns, createCheckIn } = useCheckIns();
	const [emotion, setEmotion] = (0, import_react.useState)("");
	const [energy, setEnergy] = (0, import_react.useState)(5);
	const [note, setNote] = (0, import_react.useState)("");
	const [supportType, setSupportType] = (0, import_react.useState)("escuchar");
	const handleSubmit = () => {
		if (!emotion) {
			toast.error("Elige una emoción");
			return;
		}
		createCheckIn.mutate({
			emotion,
			energy_level: energy,
			need: null,
			note: note || null,
			support_type: supportType
		}, {
			onSuccess: () => {
				toast.success("Check-in guardado 💕");
				setEmotion("");
				setNote("");
				setEnergy(5);
			},
			onError: () => toast.error("Error al guardar")
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "text-lg",
			children: "¿Cómo estás hoy?"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Comparte tu estado emocional con tu pareja" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Emoción" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex flex-wrap gap-2",
					children: EMOTIONS.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: emotion === e ? "default" : "outline",
						size: "sm",
						onClick: () => setEmotion(e),
						className: "rounded-full",
						children: e
					}, e))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: [
					"Nivel de energía: ",
					energy,
					"/10"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "range",
					min: "1",
					max: "10",
					value: energy,
					onChange: (e) => setEnergy(parseInt(e.target.value)),
					className: "mt-2 w-full"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "¿Qué necesitas de tu pareja?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex flex-wrap gap-2",
					children: SUPPORT_TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: supportType === t.value ? "default" : "outline",
						size: "sm",
						onClick: () => setSupportType(t.value),
						className: "rounded-full",
						children: [t.label, supportType === t.value && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "ml-1 size-3" })]
					}, t.value))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nota opcional" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					value: note,
					onChange: (e) => setNote(e.target.value),
					placeholder: "Cuéntale más...",
					className: "mt-2"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: handleSubmit,
					disabled: !emotion || createCheckIn.isPending,
					className: "w-full",
					children: [createCheckIn.isPending ? "Guardando..." : "Compartir", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "ml-2 size-4" })]
				})
			]
		})] }), myCheckIns && myCheckIns.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "text-lg",
			children: "Check-ins recientes"
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
			className: "h-48",
			children: myCheckIns.slice(0, 5).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 rounded-lg border p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: c.emotion
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							"Energía: ",
							c.energy_level,
							"/10 · ",
							c.support_type,
							c.note && ` · ${c.note}`
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: new Date(c.created_at).toLocaleDateString("es", {
							weekday: "long",
							hour: "2-digit",
							minute: "2-digit"
						})
					})
				]
			}, c.id))
		}) })] })]
	});
}
function AgreementsSection() {
	const { agreements, createAgreement, updateAgreement } = useAgreements();
	const [title, setTitle] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [reviewDate, setReviewDate] = (0, import_react.useState)("");
	const handleCreate = () => {
		if (!title.trim()) {
			toast.error("El acuerdo necesita un título");
			return;
		}
		createAgreement.mutate({
			title: title.trim(),
			description: description.trim() || null,
			status: "propuesto",
			review_date: reviewDate ? new Date(reviewDate).toISOString() : null,
			completed_at: null
		}, {
			onSuccess: () => {
				toast.success("Acuerdo creado 🤝");
				setTitle("");
				setDescription("");
				setReviewDate("");
			},
			onError: () => toast.error("Error al crear")
		});
	};
	const handleStatusChange = (id, newStatus) => {
		updateAgreement.mutate({
			id,
			updates: {
				status: newStatus,
				completed_at: newStatus === "cumplido" ? (/* @__PURE__ */ new Date()).toISOString() : null
			}
		}, { onSuccess: () => toast.success("Estado actualizado") });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "text-lg",
			children: "Nuevo acuerdo"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Creen metas o compromisos juntos" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Título" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: title,
					onChange: (e) => setTitle(e.target.value),
					placeholder: "Ej: Llamar los domingos..."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Descripción" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					value: description,
					onChange: (e) => setDescription(e.target.value),
					placeholder: "Detalles..."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Fecha de revisión" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "date",
					value: reviewDate,
					onChange: (e) => setReviewDate(e.target.value)
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: handleCreate,
					disabled: createAgreement.isPending,
					className: "w-full",
					children: [createAgreement.isPending ? "Creando..." : "Crear acuerdo", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "ml-2 size-4" })]
				})
			]
		})] }), agreements && agreements.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "text-lg",
			children: "Acuerdos"
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
			className: "h-64",
			children: agreements.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 rounded-lg border p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: a.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: a.status === "cumplido" ? "default" : "secondary",
							children: a.status.replace("_", " ")
						})]
					}),
					a.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: a.description
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: [
							a.status === "propuesto" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								onClick: () => handleStatusChange(a.id, "aceptado"),
								children: "Aceptar"
							}),
							a.status === "aceptado" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: () => handleStatusChange(a.id, "en_progreso"),
								children: "Iniciar"
							}),
							a.status === "en_progreso" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: () => handleStatusChange(a.id, "cumplido"),
								children: "Cumplido"
							})
						]
					})
				]
			}, a.id))
		}) })] })]
	});
}
function QuestionsSection() {
	const { questions, responses, saveResponse } = useDeepQuestions();
	const [selectedCategory, setSelectedCategory] = (0, import_react.useState)(null);
	const [currentAnswer, setCurrentAnswer] = (0, import_react.useState)("");
	const [activeQuestionId, setActiveQuestionId] = (0, import_react.useState)(null);
	const filteredQuestions = selectedCategory ? questions?.filter((q) => q.category === selectedCategory) : questions;
	const handleSave = (questionId) => {
		if (!currentAnswer.trim()) {
			toast.error("Escribe una respuesta");
			return;
		}
		saveResponse.mutate({
			questionId,
			answer: currentAnswer.trim()
		}, {
			onSuccess: () => {
				toast.success("Respuesta guardada 💭");
				setCurrentAnswer("");
				setActiveQuestionId(null);
			},
			onError: () => toast.error("Error")
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "text-lg",
			children: "Preguntas profundas"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Descubran cosas nuevas" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex flex-wrap gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: !selectedCategory ? "default" : "outline",
				size: "sm",
				onClick: () => setSelectedCategory(null),
				children: "Todas"
			}), Object.keys(QUESTION_CATEGORIES).map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: selectedCategory === cat ? "default" : "outline",
				size: "sm",
				onClick: () => setSelectedCategory(cat),
				children: QUESTION_CATEGORIES[cat]
			}, cat))]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
			className: "h-96",
			children: filteredQuestions?.map((q) => {
				const myResponse = responses?.find((r) => r.question_id === q.id);
				const isExpanded = activeQuestionId === q.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 rounded-lg border p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: "mb-2",
									children: QUESTION_CATEGORIES[q.category]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: q.question
								}),
								q.is_daily && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									className: "mt-1",
									children: "Diaria"
								})
							] }), myResponse && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-5 text-green-500" })]
						}),
						isExpanded && !myResponse && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: currentAnswer,
								onChange: (e) => setCurrentAnswer(e.target.value),
								placeholder: "Tu respuesta...",
								className: "min-h-[80px]"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									onClick: () => handleSave(q.id),
									disabled: saveResponse.isPending,
									children: "Guardar"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									onClick: () => setActiveQuestionId(null),
									children: "Cancelar"
								})]
							})]
						}),
						!isExpanded && !myResponse && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							className: "mt-2",
							onClick: () => setActiveQuestionId(q.id),
							children: "Responder"
						}),
						myResponse && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 rounded bg-muted p-2 text-sm italic",
							children: [
								"\"",
								myResponse.answer,
								"\""
							]
						})
					]
				}, q.id);
			})
		})] })] })
	});
}
function PlansSection() {
	const { plans, createPlan, votePlan } = useCouplePlans();
	const [title, setTitle] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [filters, setFilters] = (0, import_react.useState)({
		time_available: "tarde",
		budget: "bajo",
		location_type: "casa",
		mood: "relajado"
	});
	const [showForm, setShowForm] = (0, import_react.useState)(false);
	const handleCreate = () => {
		if (!title.trim()) {
			toast.error("El plan necesita un título");
			return;
		}
		createPlan.mutate({
			title: title.trim(),
			description: description.trim() || null,
			...filters
		}, {
			onSuccess: () => {
				toast.success("Plan creado 📅");
				setTitle("");
				setDescription("");
				setShowForm(false);
			},
			onError: () => toast.error("Error")
		});
	};
	const handleVote = (planId, vote) => {
		votePlan.mutate({
			planId,
			voteType: vote
		}, { onSuccess: () => toast.success("Voto registrado") });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-lg",
				children: "Planes para dos"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Propongan citas y voten" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				onClick: () => setShowForm(!showForm),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), showForm ? "Cancelar" : "Nuevo"]
			})]
		}) }), showForm && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Título" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: title,
					onChange: (e) => setTitle(e.target.value),
					placeholder: "Ej: Noche de películas..."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Descripción" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					value: description,
					onChange: (e) => setDescription(e.target.value),
					placeholder: "Detalles..."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Tiempo" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "mt-1 w-full rounded-md border bg-background p-2 text-sm",
							value: filters.time_available,
							onChange: (e) => setFilters({
								...filters,
								time_available: e.target.value
							}),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "manana",
									children: "Mañana"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "tarde",
									children: "Tarde"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "noche",
									children: "Noche"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "fin_de_semana",
									children: "Fin de semana"
								})
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Presupuesto" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "mt-1 w-full rounded-md border bg-background p-2 text-sm",
							value: filters.budget,
							onChange: (e) => setFilters({
								...filters,
								budget: e.target.value
							}),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "gratis",
									children: "Gratis"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "bajo",
									children: "Bajo"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "medio",
									children: "Medio"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "alto",
									children: "Alto"
								})
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Lugar" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "mt-1 w-full rounded-md border bg-background p-2 text-sm",
							value: filters.location_type,
							onChange: (e) => setFilters({
								...filters,
								location_type: e.target.value
							}),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "casa",
									children: "Casa"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "fuera",
									children: "Fuera"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "cercania",
									children: "Cercanía"
								})
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Ánimo" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "mt-1 w-full rounded-md border bg-background p-2 text-sm",
							value: filters.mood,
							onChange: (e) => setFilters({
								...filters,
								mood: e.target.value
							}),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "relajado",
									children: "Relajado"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "activo",
									children: "Activo"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "romantico",
									children: "Romántico"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "divertido",
									children: "Divertido"
								})
							]
						})] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: handleCreate,
					disabled: createPlan.isPending,
					className: "w-full",
					children: createPlan.isPending ? "Creando..." : "Proponer plan"
				})
			]
		})] }), plans && plans.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "text-lg",
			children: "Planes propuestos"
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
			className: "h-80",
			children: plans.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 rounded-lg border p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: p.title
						}),
						p.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: p.description
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex flex-wrap gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									children: p.time_available
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									children: p.budget
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									children: p.location_type
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									children: p.mood
								})
							]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: p.status === "planificado" ? "default" : "secondary",
						children: p.status.replace("_", " ")
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => handleVote(p.id, "yes"),
							children: "👍 Sí"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => handleVote(p.id, "maybe"),
							children: "🤔 Quizás"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => handleVote(p.id, "no"),
							children: "👎 No"
						})
					]
				})]
			}, p.id))
		}) })] })]
	});
}
function ConexionPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-bold",
				children: "Conexión"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground",
				children: "Nuevas formas de conectar como pareja"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			defaultValue: "checkin",
			className: "w-full",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "grid w-full grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "checkin",
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: "Check-in"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "acuerdos",
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Handshake, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: "Acuerdos"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "preguntas",
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brain, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: "Preguntas"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "planes",
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarHeart, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: "Planes"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "checkin",
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckInSection, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "acuerdos",
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgreementsSection, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "preguntas",
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuestionsSection, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "planes",
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlansSection, {})
				})
			]
		})]
	});
}
//#endregion
export { ConexionPage as component };
