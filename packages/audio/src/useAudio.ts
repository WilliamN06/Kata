import { useEffect, useState } from 'react';
import { getAudioContext, resumeAudio } from './context';

export function useAudio() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      getAudioContext();
      setReady(true);
    } catch (e) {
      setError(e as Error);
    }
  }, []);

  return { ready, error, resume: resumeAudio };
}
