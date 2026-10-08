import {
  Award, Baby, Bike, BookHeart, Cake, Camera, Car, Coffee, Crown, Dog, Flame, Flower2, Gem, Gift, HandHeart, Handshake,
  Heart, HeartCrack, HeartHandshake, Home, IceCream, Laugh, type LucideIcon, Moon, Mountain, Music, PartyPopper, Pill,
  Plane, Salad, ShoppingBag, Smile, Sparkles, Star, Sun, ThumbsDown, ThumbsUp, Ticket, Utensils, Wind, Zap, FileText,
  Frown, Coffee as Cup, Drama, Leaf, CircleHelp, Kiss,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Íconos SVG disponibles por nombre. */
export const GLYPHS: Record<string, LucideIcon> = {
  heart: Heart, kiss: Kiss, laugh: Laugh, wow: Sparkles, cry: Drama, fire: Flame, clap: Award, star: Star,
  gift: Gift, party: PartyPopper, flower: Flower2, moon: Moon, sun: Sun, crown: Crown, gem: Gem, cake: Cake,
  home: Home, plane: Plane, ring: Gem, dog: Dog, music: Music, camera: Camera, coffee: Coffee, food: Utensils,
  icecream: IceCream, ticket: Ticket, shop: ShoppingBag, papers: FileText, health: Pill, couple: HeartHandshake,
  nature: Leaf, mountain: Mountain, car: Car, bike: Bike, hug: HandHeart, promise: Handshake, smile: Smile,
  sad: Frown, tired: Moon, stress: Zap, sick: Pill, craving: Salad, missing: Wind, inlove: Heart, sorry: HeartCrack,
  book: BookHeart, baby: Baby, yes: ThumbsUp, no: ThumbsDown, maybe: CircleHelp, cup: Cup,
};

/** Equivalencias para contenido guardado antes con emojis. */
const LEGACY: Record<string, string> = {
  "❤️": "heart", "❤": "heart", "💖": "heart", "💗": "heart", "💕": "heart", "💞": "heart", "😍": "inlove", "🥰": "inlove",
  "😘": "kiss", "💋": "kiss", "😂": "laugh", "🤣": "laugh", "😄": "laugh", "😮": "wow", "😲": "wow", "✨": "wow",
  "🥹": "cry", "😢": "cry", "😭": "cry", "🔥": "fire", "👏": "clap", "⭐": "star", "🌟": "star", "🎁": "gift",
  "🎉": "party", "🎊": "party", "🌹": "flower", "🌸": "flower", "🌷": "flower", "🌙": "moon", "☀️": "sun", "👑": "crown",
  "💍": "ring", "💎": "gem", "🎂": "cake", "🏠": "home", "🏡": "home", "✈️": "plane", "🐶": "dog", "🐾": "dog", "🎵": "music",
  "🎶": "music", "📸": "camera", "☕": "coffee", "🍽️": "food", "🍕": "food", "🍦": "icecream", "🍰": "cake", "🎟️": "ticket",
  "🎬": "ticket", "🛒": "shop", "📄": "papers", "💊": "health", "🌿": "nature", "🤗": "hug", "🫂": "hug", "🤝": "promise",
  "😊": "smile", "😔": "sad", "😴": "tired", "😤": "stress", "🤒": "sick", "🤤": "craving", "🥺": "missing", "🙏": "sorry",
  "💌": "book", "🧹": "home", "💆": "hug", "🥞": "food", "👍": "yes", "👎": "no", "🤔": "maybe", "📍": "star",
};

export function Glyph({ name, className }: { name: string | null | undefined; className?: string }) {
  const key = name ? (GLYPHS[name] ? name : LEGACY[name] ?? "heart") : "heart";
  const Icon = GLYPHS[key] ?? Heart;
  return <Icon aria-hidden="true" className={cn("inline-block size-[1.1em] shrink-0 align-[-0.15em] text-primary", className)} />;
}
