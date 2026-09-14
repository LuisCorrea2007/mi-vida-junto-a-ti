import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { notifyPartner } from "@/lib/notify";

// ===================== CHECK-INS =====================
export type CheckIn = {
  id: string;
  user_id: string;
  emotion: string;
  energy_level: number;
  need: string | null;
  note: string | null;
  support_type: "escuchar" | "espacio" | "abrazar" | "conversar" | "ayudar";
  created_at: string;
};

export function useCheckIns() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: allCheckIns, isLoading } = useQuery({
    queryKey: ["checkins"],
    enabled: !!user,
    queryFn: async (): Promise<CheckIn[]> => {
      const { data, error } = await supabase
        .from("couple_checkins")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(80);
      if (error) throw error;
      return (data ?? []) as CheckIn[];
    },
  });

  const myCheckIns = (allCheckIns ?? []).filter((c) => c.user_id === user?.id);
  const partnerCheckIns = (allCheckIns ?? []).filter((c) => c.user_id !== user?.id);

  const createCheckIn = useMutation({
    mutationFn: async (input: Omit<CheckIn, "id" | "user_id" | "created_at">) => {
      const { data, error } = await supabase
        .from("couple_checkins")
        .insert({ ...input, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as CheckIn;
    },
    onSuccess: async (data) => {
      qc.invalidateQueries({ queryKey: ["checkins"] });
      // Notificar a la pareja usando la firma con userId
      if (user?.id) {
        try {
          await notifyPartner(user.id, {
            type: "conexion",
            link: "/conexion",
            title: "Nuevo check-in de tu pareja",
            message: `${data.emotion} · Energía: ${data.energy_level}/10`,
          });
        } catch {}
      }
    },
  });

  return { myCheckIns, partnerCheckIns, isLoading, createCheckIn };
}

// ===================== ACUERDOS =====================
export type Agreement = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: "propuesto" | "aceptado" | "en_progreso" | "cumplido" | "archivado";
  review_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AgreementComment = {
  id: string;
  agreement_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

export function useAgreements() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: agreements, isLoading } = useQuery({
    queryKey: ["agreements"],
    queryFn: async (): Promise<Agreement[]> => {
      const { data, error } = await supabase
        .from("couple_agreements")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Agreement[];
    },
  });

  const createAgreement = useMutation({
    mutationFn: async (input: Omit<Agreement, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("couple_agreements")
        .insert({ ...input, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Agreement;
    },
    onSuccess: async (data) => {
      qc.invalidateQueries({ queryKey: ["agreements"] });
      if (user?.id) {
        try {
          await notifyPartner(user.id, {
            type: "conexion",
            link: "/conexion",
            title: "Nuevo acuerdo propuesto",
            message: data.title,
          });
        } catch {}
      }
    },
  });

  const updateAgreement = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Agreement> }) => {
      const { data, error } = await supabase
        .from("couple_agreements")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Agreement;
    },
    onSuccess: async (data, { updates }) => {
      qc.invalidateQueries({ queryKey: ["agreements"] });
      if (user?.id && updates.status === "cumplido") {
        try {
          await notifyPartner(user.id, {
            type: "conexion",
            link: "/conexion",
            title: "¡Acuerdo cumplido! 🎉",
            message: data.title,
          });
        } catch {}
      }
    },
  });

  return { agreements, isLoading, createAgreement, updateAgreement };
}

// ===================== PREGUNTAS PROFUNDAS =====================
export type DeepQuestion = {
  id: string;
  category: "futuro" | "cariño" | "confianza" | "recuerdos" | "diversion";
  question: string;
  is_daily: boolean;
  user_id: string | null;
  created_at: string;
};

export type QuestionResponse = {
  id: string;
  question_id: string;
  user_id: string;
  answer: string;
  is_favorite: boolean;
  created_at: string;
};

export function useDeepQuestions() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: questions } = useQuery({
    queryKey: ["deep_questions"],
    queryFn: async (): Promise<DeepQuestion[]> => {
      const { data, error } = await supabase
        .from("deep_questions")
        .select("*")
        .order("is_daily", { ascending: false })
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as DeepQuestion[];
    },
  });

  // Respuestas de los dos (la política de lectura ya limita al espacio de pareja)
  const { data: allResponses } = useQuery({
    queryKey: ["question_responses"],
    enabled: !!user,
    queryFn: async (): Promise<QuestionResponse[]> => {
      const { data, error } = await supabase.from("question_responses").select("*");
      if (error) throw error;
      return (data ?? []) as QuestionResponse[];
    },
  });

  const responses = (allResponses ?? []).filter((r) => r.user_id === user?.id);
  const partnerResponses = (allResponses ?? []).filter((r) => r.user_id !== user?.id);

  const saveResponse = useMutation({
    mutationFn: async ({ questionId, answer, isFavorite = false }: { questionId: string; answer: string; isFavorite?: boolean }) => {
      const { data, error } = await supabase
        .from("question_responses")
        .upsert({ question_id: questionId, user_id: user!.id, answer, is_favorite: isFavorite })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as QuestionResponse;
    },
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ["question_responses"] });
      if (user?.id) {
        try {
          await notifyPartner(user.id, {
            type: "conexion",
            link: "/conexion",
            title: "Tu pareja respondió una pregunta",
            message: "Descúbrela si ya respondiste también",
          });
        } catch {}
      }
    },
  });

  const toggleFavorite = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      const { error } = await supabase
        .from("question_responses")
        .update({ is_favorite: isFavorite })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["question_responses"] }),
  });

  const createQuestion = useMutation({
    mutationFn: async ({ question, category }: { question: string; category: DeepQuestion["category"] }) => {
      const { data, error } = await supabase
        .from("deep_questions")
        .insert({ question, category, is_daily: false, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as DeepQuestion;
    },
    onSuccess: async (data) => {
      qc.invalidateQueries({ queryKey: ["deep_questions"] });
      if (user?.id) {
        try {
          await notifyPartner(user.id, {
            type: "conexion",
            link: "/conexion",
            title: "Nueva pregunta para ustedes",
            message: data.question,
          });
        } catch {}
      }
    },
  });

  const deleteQuestion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("deep_questions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deep_questions"] }),
  });

  return { questions, responses, partnerResponses, saveResponse, toggleFavorite, createQuestion, deleteQuestion };
}

// ===================== GRATITUD =====================
export type Gratitude = {
  id: string;
  user_id: string;
  content: string;
  is_favorite: boolean;
  created_at: string;
};

export function useGratitudes() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: gratitudes } = useQuery({
    queryKey: ["gratitudes"],
    enabled: !!user,
    queryFn: async (): Promise<Gratitude[]> => {
      const { data, error } = await supabase
        .from("gratitudes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as Gratitude[];
    },
  });

  const createGratitude = useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase
        .from("gratitudes")
        .insert({ content, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Gratitude;
    },
    onSuccess: async (data) => {
      qc.invalidateQueries({ queryKey: ["gratitudes"] });
      if (user?.id) {
        try {
          await notifyPartner(user.id, {
            type: "conexion",
            link: "/conexion",
            title: "Tu pareja te agradeció algo 💗",
            message: data.content,
          });
        } catch {}
      }
    },
  });

  const toggleGratitudeFavorite = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      const { error } = await supabase.from("gratitudes").update({ is_favorite: isFavorite }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gratitudes"] }),
  });

  const deleteGratitude = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gratitudes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gratitudes"] }),
  });

  return { gratitudes, createGratitude, toggleGratitudeFavorite, deleteGratitude };
}

// ===================== PLANES PARA DOS =====================
export type CouplePlan = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  time_available: "manana" | "tarde" | "noche" | "fin_de_semana" | "dia_completo";
  budget: "gratis" | "bajo" | "medio" | "alto";
  location_type: "casa" | "fuera" | "cercania" | "viaje";
  mood: "relajado" | "activo" | "romantico" | "divertido" | "creativo";
  status: "propuesto" | "votado" | "planificado" | "completado" | "archivado";
  planned_date: string | null;
  created_at: string;
  updated_at: string;
};

export type PlanVote = {
  id: string;
  plan_id: string;
  user_id: string;
  vote_type: "yes" | "maybe" | "no";
  created_at: string;
};

export function useCouplePlans() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: plans, isLoading } = useQuery({
    queryKey: ["couple_plans"],
    queryFn: async (): Promise<CouplePlan[]> => {
      const { data, error } = await supabase
        .from("couple_plans")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CouplePlan[];
    },
  });

  const { data: votes } = useQuery({
    queryKey: ["plan_votes"],
    queryFn: async (): Promise<PlanVote[]> => {
      const { data, error } = await supabase.from("plan_votes").select("*");
      if (error) throw error;
      return (data ?? []) as PlanVote[];
    },
  });

  const updatePlan = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CouplePlan> }) => {
      const { error } = await supabase.from("couple_plans").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["couple_plans"] }),
  });

  const deletePlan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("couple_plans").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["couple_plans"] }),
  });

  const createPlan = useMutation({
    mutationFn: async (input: Omit<CouplePlan, "id" | "user_id" | "created_at" | "updated_at" | "status">) => {
      const { data, error } = await supabase
        .from("couple_plans")
        .insert({ ...input, user_id: user!.id, status: "propuesto" })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as CouplePlan;
    },
    onSuccess: async (data) => {
      qc.invalidateQueries({ queryKey: ["couple_plans"] });
      if (user?.id) {
        try {
          await notifyPartner(user.id, {
            type: "conexion",
            link: "/conexion",
            title: "Nuevo plan propuesto",
            message: data.title,
          });
        } catch {}
      }
    },
  });

  const votePlan = useMutation({
    mutationFn: async ({ planId, voteType }: { planId: string; voteType: "yes" | "maybe" | "no" }) => {
      await supabase.from("plan_votes").delete().eq("plan_id", planId).eq("user_id", user!.id);
      const { data, error } = await supabase
        .from("plan_votes")
        .insert({ plan_id: planId, user_id: user!.id, vote_type: voteType })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as PlanVote;
    },
    onSuccess: async (_, { voteType }) => {
      qc.invalidateQueries({ queryKey: ["plan_votes"] });
      qc.invalidateQueries({ queryKey: ["couple_plans"] });
      if (user?.id && voteType === "yes") {
        try {
          await notifyPartner(user.id, {
            type: "conexion",
            link: "/conexion",
            title: "¡A tu pareja le gusta un plan!",
            message: "Revisa si coinciden sus votos",
          });
        } catch {}
      }
    },
  });

  return { plans, votes, isLoading, createPlan, votePlan, updatePlan, deletePlan };
}
