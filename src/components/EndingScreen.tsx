import React, { useState } from 'react';
import { Skull, Heart, Crown, RotateCcw } from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

interface EndingScreenProps {
  onRestart: () => void;
}

export const EndingScreen: React.FC<EndingScreenProps> = ({ onRestart }) => {
  const [choice, setChoice] = useState<'none' | 'revenge' | 'mercy'>('none');

  const handleSelect = (selected: 'revenge' | 'mercy') => {
    setChoice(selected);
    if (selected === 'revenge') {
      sounds.playBossSting();
    } else {
      sounds.playVictory();
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-950 flex items-center justify-center p-6 select-none overflow-y-auto">
      <div className="max-w-2xl w-full bg-[#031526] border border-cyan-500/40 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(6,182,212,0.4)] text-center">
        {choice === 'none' && (
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase mb-4">
              <Crown className="w-3.5 h-3.5" />
              <span>THE MORGANA WAR ENDS</span>
            </div>

            <h1 className="text-2xl md:text-4xl font-black font-serif text-slate-100 mb-3 tracking-wide">
              Ascension of the Water King
            </h1>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8 max-w-xl mx-auto">
              Morgana has dissolved into the abyssal deep. King Thalor’s soul is freed from corruption.
              Before the throne kneel Ronan, Lira, and Elder Varun—trembling in their monstrous forms,
              awaiting your judgment.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {/* Option 1: Revenge Ending */}
              <button
                onClick={() => handleSelect('revenge')}
                className="p-5 rounded-xl bg-rose-950/40 border border-rose-500/50 hover:bg-rose-900/40 transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center space-x-2 text-rose-400 font-bold font-serif text-lg mb-2 group-hover:text-rose-300">
                    <Skull className="w-5 h-5" />
                    <span>Revenge Ending</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Execute Ronan, Lira, and Varun. Seize absolute dominion over all seven oceans.
                    Rule the seas with an iron fist as the Dread King.
                  </p>
                </div>
                <div className="mt-4 text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
                  Strike Them Down →
                </div>
              </button>

              {/* Option 2: Mercy Ending */}
              <button
                onClick={() => handleSelect('mercy')}
                className="p-5 rounded-xl bg-cyan-950/40 border border-cyan-500/50 hover:bg-cyan-900/40 transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center space-x-2 text-cyan-300 font-bold font-serif text-lg mb-2 group-hover:text-cyan-200">
                    <Heart className="w-5 h-5" />
                    <span>Mercy Ending</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Cleanse their curses and forgive their weakness. Stand beside King Thalor to rebuild
                    the Coral Kingdom as the true, benevolent Water King.
                  </p>
                </div>
                <div className="mt-4 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  Grant Cleansing Mercy →
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Revenge Epilogue */}
        {choice === 'revenge' && (
          <div className="space-y-4">
            <div className="text-rose-400 font-serif text-3xl font-black">The Dread Sovereign</div>
            <div className="text-xs font-mono text-rose-500 uppercase">Ending 1 of 2: Blood and Iron</div>
            <div className="text-slate-300 text-sm md:text-base leading-relaxed space-y-3 text-left bg-slate-900/70 p-5 rounded-xl border border-rose-900/40">
              <p>
                With a gesture of Thalor’s golden trident, the currents snap. Ronan, Lira, and Varun are swept into
                the crushing void of the trench, their cries swallowed by the abyss.
              </p>
              <p>
                King Thalor turns away with heavy sorrow: <em>"You have broken the witch, Kael... but you have let her hatred live inside your heart."</em>
              </p>
              <p>
                Kael dons the dark Leviathan crown. The seven oceans bow in silent terror. Tidefall village builds stone
                monuments to pacify their forgotten son, praying the tide never rises again.
              </p>
            </div>
            <button
              onClick={onRestart}
              className="mt-6 inline-flex items-center space-x-2 px-8 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition cursor-pointer shadow-lg"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY AGAIN (NEW GAME+)</span>
            </button>
          </div>
        )}

        {/* Mercy Epilogue */}
        {choice === 'mercy' && (
          <div className="space-y-4">
            <div className="text-cyan-300 font-serif text-3xl font-black">The True Water King</div>
            <div className="text-xs font-mono text-cyan-400 uppercase">Ending 2 of 2: Harmony of the Oceans</div>
            <div className="text-slate-300 text-sm md:text-base leading-relaxed space-y-3 text-left bg-slate-900/70 p-5 rounded-xl border border-cyan-900/40">
              <p>
                Kael lowers the trident. Using his Water King magic, he purges Morgana’s dark venom from their veins.
                Ronan collapses in tears, recognizing the little brother he betrayed. Lira weeps in gratitude,
                her siren voice singing a melody of restoration.
              </p>
              <p>
                King Thalor places the golden crown on Kael’s brow with a proud smile:
                <em>"The ocean is not a weapon of destruction, Kael. It is the cradle of life. You have proven yourself worthy of all seven seas."</em>
              </p>
              <p>
                Together, human and merfolk rebuild the sunken sanctuaries. Surface and ocean unite in peace,
                guided by Kael, the boy who began with no magic and rose to command the tide.
              </p>
            </div>
            <button
              onClick={onRestart}
              className="mt-6 inline-flex items-center space-x-2 px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.5)]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY AGAIN (NEW GAME+)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
