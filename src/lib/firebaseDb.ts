import { db, auth } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";

export type DiaryEntry = {
  id?: string;
  userId: string;
  date: string;
  mood: string;
  moodCategory?: string;
  text: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

const COLLECTION_NAME = "diaryEntries";

/**
 * Add or update a diary entry
 */
export async function saveDiaryEntry(
  date: string,
  mood: string,
  text: string
): Promise<string> {
  const user = auth.currentUser;
  console.debug("saveDiaryEntry called", { date, mood, textLength: text?.length, userId: user && user.uid });
  if (!user) {
    console.error("saveDiaryEntry: no authenticated user");
    throw new Error("User not authenticated");
  }

  try {
    // classify mood into a category (e.g., happy, neutral, sad, angry, love)
    const moodCategory = classifyMood(mood);

    // Always create a new diary entry document. Store moodCategory for filtering.
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      userId: user.uid,
      date,
      mood,
      moodCategory,
      text,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.debug("Diary entry saved", { docId: docRef.id });

    return docRef.id;
  } catch (error) {
    console.error("Error saving diary entry:", error);
    throw error;
  }
}

/**
 * Simple mood classification helper. Adjust mappings as needed.
 */
function classifyMood(mood: string): string {
  const m = (mood || "").toLowerCase();
  // emoji-first checks
  if (/[😊😀😃😄😁😍🤩🙂\u263A]/.test(mood)) return "happy";
  if (/[😐😶]/.test(mood)) return "neutral";
  if (/[😔😢😞😥😭]/.test(mood)) return "sad";
  if (/[😡😠🤬😤😖]/.test(mood)) return "angry";
  if (/[😴😪💤]/.test(mood)) return "tired";

  // keyword matching (more natural-language patterns)
  if (/\b(angry|mad|furious|annoyed|irritat|pissed)\b/.test(m)) return "angry";
  if (/\b(sad|down|depressed|unhappy|blue|lonely)\b/.test(m)) return "sad";
  if (/\b(okay|ok|fine|meh|so-so|neutral)\b/.test(m)) return "neutral";
  if (/\b(happy|good|great|joy|glad|cheerful|excited)\b/.test(m)) return "happy";
  if (/\b(tired|sleepy|exhausted|drained)\b/.test(m)) return "tired";
  if (/\b(anxious|nervous|worried|stressed)\b/.test(m)) return "anxious";

  return "other";
}

/**
 * Get diary entries grouped by `moodCategory`.
 */
export async function getDiaryEntriesGroupedByMood(): Promise<Record<string, DiaryEntry[]>> {
  const entries = await getDiaryEntries();
  const grouped: Record<string, DiaryEntry[]> = {};
  for (const e of entries) {
    const cat = e.moodCategory || classifyMood(e.mood || "");
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(e);
  }
  return grouped;
}

/**
 * Return a short prompt tailored to the mood category to help user express details.
 */
export function getMoodPrompt(category: string): string {
  switch ((category || "").toLowerCase()) {
    case "angry":
      return "What made you angry or annoyed today? Describe the frustrating event.";
    case "sad":
      return "What happened that made you feel sad? Share the details if you want.";
    case "happy":
      return "What's the best part of your day? Celebrate the moment!";
    case "neutral":
      return "How was your day? Any small moments you noticed?";
    case "tired":
      return "Feeling tired—what drained your energy today?";
    case "anxious":
      return "What's worrying you right now? Writing it down can help.";
    default:
      return "What's on your mind today? Describe any moment you'd like to remember.";
  }
}

/**
 * Get all diary entries for current user
 */
export async function getDiaryEntries(): Promise<DiaryEntry[]> {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", user.uid),
      orderBy("date", "desc")
    );

    let querySnapshot;
    try {
      querySnapshot = await getDocs(q);
    } catch (err) {
      console.warn("Primary query failed, retrying without orderBy (index may be building):", err);
      const fallbackQ = query(
        collection(db, COLLECTION_NAME),
        where("userId", "==", user.uid)
      );
      querySnapshot = await getDocs(fallbackQ);
    }

    const entries: DiaryEntry[] = [];

    querySnapshot.forEach((d) => {
      entries.push({
        id: d.id,
        ...(d.data() as Omit<DiaryEntry, "id">),
      } as DiaryEntry);
    });

    return entries;
  } catch (error) {
    console.error("Error fetching diary entries:", error);
    throw error;
  }
}

/**
 * Delete a diary entry
 */
export async function deleteDiaryEntry(entryId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  try {
    await deleteDoc(doc(db, COLLECTION_NAME, entryId));
  } catch (error) {
    console.error("Error deleting diary entry:", error);
    throw error;
  }
}
