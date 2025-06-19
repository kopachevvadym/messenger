import { useEffect, useState } from 'react';
import { getUser, createUser } from '@/utils/user';
import { useRouter } from 'next/router';

export default function Home() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const u = getUser();
    if (u) setUser(u);
  }, []);

  const handleCreateUser = async () => {
    const newUser = await createUser(name);
    setUser(newUser);
  };

  const handleCreateChat = async () => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ user_id: user.id }),
    });
    const data = await res.json();
    router.push(`/chat/${data.id}/user/${user.id}`);
  };

  if (!user) {
    return (
      <div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" />
        <button onClick={handleCreateUser}>Start</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <button onClick={handleCreateChat}>New Chat</button>
    </div>
  );
}
