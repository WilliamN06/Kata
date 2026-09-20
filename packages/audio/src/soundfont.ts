import { getAudioContext } from './useAudioContext';

export type GmInstrument =
  | 'acoustic_grand_piano'
  | 'bright_acoustic_piano'
  | 'electric_grand_piano'
  | 'honkytonk_piano'
  | 'acoustic_guitar_nylon'
  | 'acoustic_guitar_steel'
  | 'electric_guitar_jazz'
  | 'electric_guitar_clean'
  | 'electric_guitar_muted'
  | 'overdriven_guitar'
  | 'distortion_guitar'
  | 'violin'
  | 'viola'
  | 'cello'
  | 'contrabass'
  | 'tremolo_strings'
  | 'pizzicato_strings'
  | 'orchestral_harp'
  | 'timpani'
  | 'string_ensemble_1'
  | 'string_ensemble_2'
  | 'synth_strings_1'
  | 'choir_aahs'
  | 'voice_oohs'
  | 'trumpet'
  | 'trombone'
  | 'tuba'
  | 'muted_trumpet'
  | 'french_horn'
  | 'brass_section'
  | 'synth_brass_1'
  | 'synth_brass_2'
  | 'soprano_sax'
  | 'alto_sax'
  | 'tenor_sax'
  | 'baritone_sax'
  | 'oboe'
  | 'english_horn'
  | 'bassoon'
  | 'clarinet'
  | 'piccolo'
  | 'flute'
  | 'recorder'
  | 'pan_flute'
  | 'blown_bottle'
  | 'shakuhachi'
  | 'whistle'
  | 'ocarina'
  | 'sitar'
  | 'banjo'
  | 'shamisen'
  | 'koto'
  | 'kalimba'
  | 'bagpipe'
  | 'fiddle'
  | 'shanai'
  | 'tinkle_bell'
  | 'agogo'
  | 'steel_drums'
  | 'woodblock'
  | 'taiko_drum'
  | 'melodic_tom'
  | 'synth_drum'
  | 'tubular_bells'
  | 'glockenspiel'
  | 'music_box'
  | 'xylophone'
  | 'marimba'
  | 'celesta'
  | 'drawbar_organ';

const PROGRAM: Record<GmInstrument, number> = {
  acoustic_grand_piano: 0, bright_acoustic_piano: 1, electric_grand_piano: 2, honkytonk_piano: 3,
  acoustic_guitar_nylon: 24, acoustic_guitar_steel: 25, electric_guitar_jazz: 26,
  electric_guitar_clean: 27, electric_guitar_muted: 28, overdriven_guitar: 29, distortion_guitar: 30,
  violin: 40, viola: 41, cello: 42, contrabass: 43, tremolo_strings: 44, pizzicato_strings: 45,
  orchestral_harp: 46, timpani: 47, string_ensemble_1: 48, string_ensemble_2: 49, synth_strings_1: 50,
  choir_aahs: 52, voice_oohs: 53,
  trumpet: 56, trombone: 57, tuba: 58, muted_trumpet: 59, french_horn: 60,
  brass_section: 61, synth_brass_1: 62, synth_brass_2: 63,
  soprano_sax: 64, alto_sax: 65, tenor_sax: 66, baritone_sax: 67,
  oboe: 68, english_horn: 69, bassoon: 70, clarinet: 71,
  piccolo: 72, flute: 73, recorder: 74, pan_flute: 75, blown_bottle: 76, shakuhachi: 77,
  whistle: 78, ocarina: 79,
  sitar: 104, banjo: 105, shamisen: 106, koto: 107, kalimba: 108,
  bagpipe: 109, fiddle: 110, shanai: 111,
  tinkle_bell: 112, agogo: 113, steel_drums: 114, woodblock: 115, taiko_drum: 116,
  melodic_tom: 117, synth_drum: 118,
  tubular_bells: 14, glockenspiel: 9, music_box: 10, xylophone: 13, marimba: 12, celesta: 8,
  drawbar_organ: 16,
};

interface LoadedSynth {
  synth: any;
  ready: boolean;
}

let synthPromise: Promise<LoadedSynth | null> | null = null;

async function loadSynth(): Promise<LoadedSynth | null> {
  try {
    const libMod: any = await import('spessasynth_lib');
    const ctx = getAudioContext();

    // ── 1. Worklet ─────────────────────────────────────────────────
    if ((ctx as any).__kataWorkletLoaded !== true) {
      await ctx.audioWorklet.addModule('/spessasynth_processor.min.js');
      (ctx as any).__kataWorkletLoaded = true;
      console.log('[soundfont] worklet loaded');
    }

    // ── 2. Resume the context ──────────────────────────────────────
    if (ctx.state === 'suspended') {
      try { await ctx.resume(); } catch { /* noop */ }
    }
    console.log('[soundfont] ctx state:', ctx.state);

    // ── 3. Construct the synth ────────────────────────────────────
    const WorkletSynthesizer = libMod.WorkletSynthesizer;
    if (!WorkletSynthesizer) {
      console.warn('[soundfont] WorkletSynthesizer missing');
      return null;
    }
    const synth = new WorkletSynthesizer(ctx);

    // ── 4. Wait for the worklet to be alive ───────────────────────
    await synth.isReady;
    console.log('[soundfont] synth base ready');

    // ── 5. Connect (after isReady) ────────────────────────────────
    if (typeof synth.connect === 'function') {
      try {
        synth.connect(ctx.destination);
        console.log('[soundfont] connected to destination');
      } catch (e) {
        console.warn('[soundfont] connect failed', e);
      }
    }

    // ── 6. Fetch the SF3 ──────────────────────────────────────────
    const response = await fetch('/GeneralUserGS.sf3');
    if (!response.ok) {
      console.warn('[soundfont] SF3 fetch failed', response.status);
      return null;
    }
    const arrayBuf = await response.arrayBuffer();
    console.log('[soundfont] SF3 fetched, size', arrayBuf.byteLength);

    // ── 7. Attach the soundbank ───────────────────────────────────
    // Signature from the library source:
    //   addSoundBank(soundBankBuffer, id, bankOffset = 0)
    // soundBankBuffer is posted as a transferable — must be a fresh
    // ArrayBuffer that has not been transferred before.
    const mgr = synth.soundBankManager;
    if (!mgr || typeof mgr.addSoundBank !== 'function') {
      console.warn('[soundfont] no addSoundBank on soundBankManager');
      return null;
    }

    const transferBuffer = arrayBuf.slice(0);
    console.log('[soundfont] addSoundBank: ArrayBuffer', transferBuffer.byteLength, 'id main');

    await mgr.addSoundBank(transferBuffer, 'main');
    console.log('[soundfont] soundbank attached, list length:', mgr.soundBankList?.length);

    // ── 8. Create MIDI channels ───────────────────────────────────
    let channelCount = typeof synth.channelCount === 'number' ? synth.channelCount : 0;
    if (channelCount === 0 && typeof synth.addNewChannel === 'function') {
      try {
        synth.addNewChannel();
        channelCount = typeof synth.channelCount === 'number' ? synth.channelCount : 1;
        console.log('[soundfont] channel created, count now', channelCount);
      } catch (e) {
        console.warn('[soundfont] addNewChannel failed', e);
      }
    } else {
      console.log('[soundfont] channel count already', channelCount);
    }

    // ── 9. Bind bank 0 / program 0 on every channel ───────────────
    for (let ch = 0; ch < Math.max(1, channelCount); ch++) {
      try {
        if (typeof synth.controllerChange === 'function') {
          synth.controllerChange(ch, 0, 0);
          synth.controllerChange(ch, 32, 0);
        }
        if (typeof synth.programChange === 'function') {
          synth.programChange(ch, 0);
        }
      } catch (e) {
        console.warn('[soundfont] binding channel', ch, 'failed', e);
      }
    }
    console.log('[soundfont] channel programs bound');

    // ── 10. Final check ───────────────────────────────────────────
    try {
      const ch = synth.midiChannels?.[0];
      console.log('[soundfont] channel 0 state:', {
        midiPreset: ch?.midiPreset,
        preset: ch?.preset,
        program: ch?.program,
      });
    } catch { /* noop */ }

    console.log('[soundfont] synth ready');
    return { synth, ready: true };
  } catch (err) {
    console.warn('[soundfont] init failed', err);
    return null;
  }
}

function getSynth(): Promise<LoadedSynth | null> {
  if (!synthPromise) synthPromise = loadSynth();
  return synthPromise;
}

export async function playSampled(
  instrument: GmInstrument,
  midi: number,
  duration: number,
  startAt: number,
  velocity = 90,
): Promise<boolean> {
  const loaded = await getSynth();
  if (!loaded || !loaded.ready) {
    console.log('[soundfont] playSampled skipped — synth not ready');
    return false;
  }

  const synth = loaded.synth;
  const ctx = getAudioContext();
  const program = PROGRAM[instrument] ?? 0;

  if (ctx.state === 'suspended') {
    try { await ctx.resume(); } catch { /* noop */ }
  }

  // Bind the instrument's GM program.
  try {
    if (typeof synth.controllerChange === 'function') {
      synth.controllerChange(0, 0, 0);
      synth.controllerChange(0, 32, 0);
    }
    if (typeof synth.programChange === 'function') {
      synth.programChange(0, program);
    }
  } catch { /* noop */ }

  // Compute the delay in milliseconds. startAt is an AudioContext
  // currentTime value in seconds.
  const now = ctx.currentTime;
  const delayMs = Math.max(0, (startAt - now) * 1000);
  const stopMs = delayMs + Math.max(80, duration * 1000);

  try {
    if (typeof synth.noteOn !== 'function') return false;

    setTimeout(() => {
      try { synth.noteOn(0, midi, velocity); } catch (e) {
        console.warn('[soundfont] noteOn failed', e);
      }
    }, delayMs);

    setTimeout(() => {
      try { synth.noteOff(0, midi); } catch { /* noop */ }
    }, stopMs);

    return true;
  } catch (err) {
    console.warn('[soundfont] playSampled failed', err);
    return false;
  }
}

export function isSampledInstrument(name: string): name is GmInstrument {
  return Object.prototype.hasOwnProperty.call(PROGRAM, name);
}

export function resetSoundfont(): void {
  synthPromise = null;
}
export function stopSampled(): void {
  if (!synthPromise) return;
  synthPromise.then((loaded) => {
    if (!loaded?.ready) return;
    const synth = loaded.synth;
    try {
      if (typeof synth.stopAll === 'function') {
        synth.stopAll(true);
      }
    } catch { /* noop */ }
  });
}