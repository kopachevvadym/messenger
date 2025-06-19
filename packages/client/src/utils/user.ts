const LS_KEY = 'chat_user';

export function getUser() {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem(LS_KEY);
  return user ? JSON.parse(user) : null;
}

export async function createUser(name: string) {
  const res = await fetch('/api/user', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  const data = await res.json();
  localStorage.setItem(LS_KEY, JSON.stringify(data));
  return data;
}

