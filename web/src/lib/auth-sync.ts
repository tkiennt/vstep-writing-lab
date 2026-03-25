import { User as FirebaseUser } from 'firebase/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://localhost:7133';

export interface UserDoc {
  userId: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
  onboardingCompleted: boolean;
  currentLevel?: string;
  targetLevel?: string;
  isNewUser: boolean;
}

/**
 * Syncs the Firebase user with the backend Firestore database.
 * Called after every successful Firebase login.
 */
export async function syncUser(firebaseUser: FirebaseUser): Promise<UserDoc> {
  const token = await firebaseUser.getIdToken();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Sync failed with status ${response.status}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}
