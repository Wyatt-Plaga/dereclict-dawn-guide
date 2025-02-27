import { useState } from 'react';
import { CpuIcon, Users, Wrench } from 'lucide-react';
import { useSupabase } from "@/utils/supabase/context";

interface WingSelectionProps {
  onClose: () => void;
}

export function WingSelection({ onClose }: WingSelectionProps) {
  const [selectedWing, setSelectedWing] = useState<string | null>(null);
  const { gameProgress, triggerSave, unlockLog } = useSupabase();
  
  const wings = [
    {
      id: 'processor',
      title: 'Quantum Processor',
      description: 'Restore the ship\'s cognitive systems and data processing capabilities',
      icon: CpuIcon,
      logId: 12, // Processor initialization log
      iconColor: 'text-chart-2' // Purple color for processor
    },
    {
      id: 'crew-quarters',
      title: 'Crew Quarters',
      description: 'Access the stasis chambers where the crew remains in suspended animation',
      icon: Users,
      logId: 15, // Stasis pod assessment log
      iconColor: 'text-chart-3' // Red/Pink color for crew
    },
    {
      id: 'manufacturing',
      title: 'Manufacturing Bay',
      description: 'Reactivate the ship\'s fabrication and repair systems',
      icon: Wrench,
      logId: 18, // Structural damage assessment log
      iconColor: 'text-chart-4' // Gold/Amber color for manufacturing
    }
  ];
  
  const confirmSelection = () => {
    if (!selectedWing || !gameProgress) return;
    
    // Get the selected wing data
    const wing = wings.find(w => w.id === selectedWing);
    if (!wing) return;
    
    // Add the selected wing to available pages
    const updatedAvailablePages = [...(gameProgress.availablePages || ['reactor']), selectedWing];
    
    // Update game progress
    const updatedProgress = {
      ...gameProgress,
      availablePages: updatedAvailablePages
    };
    
    // Save changes
    triggerSave(updatedProgress);
    
    // Unlock the corresponding log
    unlockLog(wing.logId);
    
    // Close the dialog
    onClose();
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="system-panel max-w-2xl w-full p-6">
        <h2 className="text-2xl font-bold text-primary mb-4">Ship Wing Selection</h2>
        
        <p className="text-muted-foreground mb-6">
          With sufficient energy reserves, you can now restore power to one wing of the ship. 
          Each choice offers different capabilities and a unique path forward. 
          Choose carefully - this decision will shape your immediate future.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {wings.map(wing => (
            <div 
              key={wing.id}
              className={`system-panel p-4 cursor-pointer transition-all ${
                selectedWing === wing.id 
                  ? 'border-2 border-primary' 
                  : 'hover:bg-accent/10'
              }`}
              onClick={() => setSelectedWing(wing.id)}
            >
              <div className="flex items-center justify-center mb-4">
                <wing.icon className={`h-12 w-12 ${wing.iconColor}`} />
              </div>
              <h3 className="text-center font-bold mb-2">{wing.title}</h3>
              <p className="text-xs text-muted-foreground text-center">{wing.description}</p>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end space-x-2">
          <button 
            className="system-panel px-4 py-2 hover:bg-accent/10 transition-colors"
            onClick={confirmSelection}
            disabled={!selectedWing}
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
} 