declare module 'soundfont-player' {
  const Soundfont: {
    instrument: (
      ctx: AudioContext,
      name: string,
      options?: {
        soundfont?: string;
        nameToUrl?: (name: string, sf: string, format: string) => string;
        format?: string;
        destination?: AudioNode;
      }
    ) => Promise<{
      play: (
        note: string | number,
        when?: number,
        options?: { duration?: number; gain?: number; destination?: AudioNode }
      ) => unknown;
      stop: () => void;
    }>;
  };
  export default Soundfont;
}
