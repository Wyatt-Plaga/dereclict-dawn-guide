import React, { useEffect, useState } from 'react';
import {
  AwardIcon,
  ChevronRightIcon,
  CompassIcon,
  Brain,
  ShieldIcon,
  MapIcon,
  ActivityIcon,
  Sword
} from 'lucide-react';
import { EmptyEncounter, StoryEncounter, ResourceReward, RegionType, BaseEncounter, EncounterChoice, BuffReward } from '@/game-engine/types';
import { useSystemStatus } from "@/components/providers/system-status-provider";
import { useGame } from '@/game-engine/hooks/useGame';
import { useRouter } from 'next/navigation';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import ResourceRewardList from './encounters/ResourceRewardList';

interface EncounterDisplayProps {
  encounter: BaseEncounter;
  onComplete: (choiceId?: string) => void;
}

const REGION_ICONS: Record<string, { icon: typeof CompassIcon; color: string }> = {
  void: { icon: CompassIcon, color: "text-slate-400" },
  nebula: { icon: ActivityIcon, color: "text-purple-400" },
  asteroid: { icon: ShieldIcon, color: "text-amber-400" },
  deepspace: { icon: MapIcon, color: "text-blue-400" },
  blackhole: { icon: CompassIcon, color: "text-zinc-400" },
};

const REGION_EFFECTS: Record<string, string> = {
  nebula: "nebula-effect",
  blackhole: "blackhole-effect",
  asteroid: "asteroid-effect",
  deepspace: "deepspace-effect",
};

const EMPTY_QUOTES = [
  "The void offers no material comfort, only the silent companionship of endless stars.",
  "Sometimes the journey itself is the only reward we find among the cosmos.",
  "Not all discoveries can be measured in units and resources.",
  "The Dawn continues its journey through the emptiness, gathering only memories.",
  "The sensors remain quiet. Perhaps the next jump will yield more tangible results.",
  "The crew logs another unremarkable sector in the ship's vast database.",
  "What cannot be seen may still be valuable; knowledge often comes in mysterious forms.",
  "The ship's storage remains unchanged, but the crew's perspective shifts slightly.",
  "Empty-handed but not empty-hearted, the Dawn presses onward through the cosmos."
];

const EncounterDisplay: React.FC<EncounterDisplayProps> = ({ encounter, onComplete }) => {
  const { shouldFlicker } = useSystemStatus();
  const { dispatch } = useGame();
  const router = useRouter();
  const [showRewards, setShowRewards] = useState(false);
  const [emptyQuote, setEmptyQuote] = useState("");
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [outcomeText, setOutcomeText] = useState<string | null>(null);
  const [outcomeResources, setOutcomeResources] = useState<ResourceReward[] | null>(null);
  const [outcomeBuff, setOutcomeBuff] = useState<BuffReward | null>(null);

  const isEmptyEncounter = encounter.type === 'empty';
  const isStoryEncounter = encounter.type === 'story';
  const isCombatEncounter = encounter.type === 'combat';

  const emptyEncounter = isEmptyEncounter ? encounter as EmptyEncounter : null;
  const hasRewards = emptyEncounter?.resources && emptyEncounter.resources.length > 0;
  const storyEncounter = isStoryEncounter ? encounter as StoryEncounter : null;

  const regionConfig = REGION_ICONS[encounter.region] ?? REGION_ICONS.void;
  const RegionIcon = regionConfig.icon;
  const effectClass = REGION_EFFECTS[encounter.region] ?? "void-effect";

  const handleChoiceSelect = (choice: EncounterChoice) => {
    setSelectedChoice(choice.id);
    setOutcomeText(choice.outcome.text);
    setOutcomeResources(choice.outcome.resources || null);
    setOutcomeBuff(choice.outcome.buff || null);
    setTimeout(() => setShowRewards(true), 375);
  };

  const handleComplete = () => {
    if (isStoryEncounter && selectedChoice) {
      onComplete(selectedChoice);
    } else if (isCombatEncounter) {
      Logger.info(LogCategory.COMBAT, 'Combat encounter initiated - redirecting to battle page', LogContext.COMBAT);
      onComplete();
      router.push('/battle');
    } else {
      onComplete();
    }
  };

  useEffect(() => {
    if (isEmptyEncounter && !hasRewards) {
      setEmptyQuote(EMPTY_QUOTES[Math.floor(Math.random() * EMPTY_QUOTES.length)]);
    }
  }, [isEmptyEncounter, hasRewards]);

  useEffect(() => {
    if (isEmptyEncounter) {
      const timer = setTimeout(() => setShowRewards(true), 375);
      return () => clearTimeout(timer);
    }
  }, [isEmptyEncounter, hasRewards]);

  return (
    <div className="relative w-full">
      {/* Region-specific background effect */}
      <div className="absolute inset-0 -m-4 md:-m-8 z-0 overflow-hidden opacity-20">
        <div className={effectClass} />
      </div>

      <div className="system-panel p-6 mb-6 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 border-b border-accent/30 pb-4">
          <RegionIcon className={`h-6 w-6 ${regionConfig.color}`} />
          <div>
            <h1 className={`text-3xl font-bold mb-1 ${shouldFlicker('encounters') ? 'flickering-text' : ''}`}>
              {encounter.title}
            </h1>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>Region: {encounter.region ? encounter.region.charAt(0).toUpperCase() + encounter.region.slice(1) : 'Unknown'}</span>
              {isCombatEncounter && (
                <div className="ml-3 flex items-center text-red-500">
                  <Sword className="h-4 w-4 mr-1" />
                  <span>Combat</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8 system-panel p-6">
          <p className="text-xl mb-4 leading-relaxed">{encounter.description}</p>

          {isEmptyEncounter && emptyEncounter && (
            <p className="italic text-lg">{emptyEncounter.message}</p>
          )}

          {isCombatEncounter && (
            <div className="mt-6 border-t border-accent/30 pt-4">
              <p className="text-lg text-red-400 flex items-center gap-2">
                <Sword className="h-5 w-5" />
                <span>Hostile entity detected - prepare for combat!</span>
              </p>
              <p className="mt-2 text-muted-foreground">
                Initializing combat systems... Transferring to battle interface...
              </p>
            </div>
          )}
        </div>

        {/* Story Encounter Choices */}
        {isStoryEncounter && storyEncounter && !selectedChoice && (
          <div className="mb-8">
            <h2 className="text-xl font-medium mb-4 terminal-text flex items-center gap-2">
              <Brain className="h-5 w-5 text-chart-2" />
              Available Actions
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {storyEncounter.choices.map((choice) => (
                <button
                  key={choice.id}
                  className="text-left system-panel p-4 hover:bg-accent/10 transition-all border-l-4 border-transparent hover:border-accent"
                  onClick={() => handleChoiceSelect(choice)}
                >
                  <p className="text-lg font-medium">{choice.text}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Story Encounter Outcome */}
        {isStoryEncounter && selectedChoice && (
          <div className={`transition-all duration-700 mb-8 ${outcomeText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-xl font-medium mb-4 terminal-text flex items-center gap-2">
              <ActivityIcon className="h-5 w-5 text-chart-3" />
              Outcome
            </h2>
            <div className="system-panel p-6">
              <p className="text-lg mb-6 leading-relaxed">{outcomeText}</p>

              {(outcomeResources?.length || outcomeBuff) && (
                <div className={`transition-all duration-700 mt-6 ${showRewards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                  <h3 className="text-lg font-medium mb-4 terminal-text flex items-center gap-2">
                    <AwardIcon className="h-5 w-5 text-chart-1" />
                    {outcomeBuff && !outcomeResources?.length ? 'Effect Acquired' : 'Rewards'}
                  </h3>
                  {outcomeBuff && (
                    <div className="system-panel p-4 mb-4 border-l-4 border-primary animate-pulse-slow">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-primary font-semibold">{outcomeBuff.name}</span>
                        <span className="text-xs font-mono text-muted-foreground">
                          {Math.round(outcomeBuff.durationMs / 60000)}min
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{outcomeBuff.description}</p>
                    </div>
                  )}
                  {outcomeResources && outcomeResources.length > 0 && (
                    <ResourceRewardList rewards={outcomeResources} />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty Encounter Resources */}
        {isEmptyEncounter && (
          <div className={`transition-all duration-700 mb-8 ${showRewards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-xl font-medium mb-4 terminal-text flex items-center gap-2">
              <AwardIcon className="h-5 w-5 text-chart-1" />
              Discovered Resources
            </h2>
            <div className="system-panel p-6">
              {hasRewards ? (
                <ResourceRewardList rewards={emptyEncounter!.resources!} />
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="text-lg text-muted-foreground mb-2">No resources acquired</div>
                  <p className="text-center italic text-sm max-w-lg">{emptyQuote}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-10">
          <button
            onClick={handleComplete}
            disabled={isStoryEncounter && !selectedChoice}
            className={`w-full flex items-center justify-center gap-2 system-panel py-3 px-6 hover:bg-accent/10 transition-colors ${shouldFlicker('navigation') ? 'flickering-text' : ''} ${isStoryEncounter && !selectedChoice ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="text-lg">
              {isCombatEncounter ? 'All Hands to Battle Stations!' : 'Continue Journey'}
            </span>
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EncounterDisplay;
