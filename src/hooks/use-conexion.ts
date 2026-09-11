import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

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

  const { data: myCheckIns, isLoading } = useQuery({
    queryKey: ["checkins", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<CheckIn[]> => {
      const { data, error } = await supabase
        .from("couple_checkins")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  const createCheckIn = useMutation({
    mutationFn: async (input: Omit<CheckIn, "id" | "user_id" | "created_at">) => {
      const { data, error } = await supabase
        .from("couple_checkins")
        .insert({ ...input, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as CheckIn;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["checkins"] });
    },
  });

  return { myCheckIns, isLoading, createCheckIn };
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
      return data ?? [];
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
      return data as Agreement;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agreements"] });
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
      return data as Agreement;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agreements"] });
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
      return data ?? [];
    },
  });

  const { data: responses } = useQuery({
    queryKey: ["question_responses", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<QuestionResponse[]> => {
      const { data, error } = await supabase
        .from("question_responses")
        .select("*")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const saveResponse = useMutation({
    mutationFn: async ({ questionId, answer, isFavorite = false }: { questionId: string; answer: string; isFavorite?: boolean }) => {
      const { data, error } = await supabase
        .from("question_responses")
        .upsert({ question_id: questionId, user_id: user!.id, answer, is_favorite: isFavorite })
        .select()
        .single();
      if (error) throw error;
      return data as QuestionResponse;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["question_responses"] });
    },
  });

  return { questions, responses, saveResponse };
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
      return data ?? [];
    },
  });

  const createPlan = useMutation({
    mutationFn: async (input: Omit<CouplePlan, "id" | "user_id" | "created_at" | "updated_at" | "status">) => {
      const { data, error } = await supabase
        .from("couple_plans")
        .insert({ ...input, user_id: user!.id, status: "propuesto" })
        .select()
        .single();
      if (error) throw error;
      return data as CouplePlan;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["couple_plans"] });
    },
  });

  const votePlan = useMutation({
    mutationFn: async ({ planId, voteType }: { planId: string; voteType: "yes" | "maybe" | "no" }) => {
      const { data, error } = await supabase
        .from("plan_votes")
        .upsert({ plan_id: planId, user_id: user!.id, vote_type: voteType })
        .select()
        .single();
      if (error) throw error;
      return data as PlanVote;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["couple_plans"] });
    },
  });

  return { plans, isLoading, createPlan, votePlan };
}
