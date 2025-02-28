import React from 'react';
import { useGameResources } from '../../hooks/useGameResources';

interface ResourceDisplayProps {
  resourceId: string;
  showDetails?: boolean;
}

/**
 * Resource display component
 * Shows information about a resource from the game engine
 */
export const ResourceDisplay: React.FC<ResourceDisplayProps> = ({ 
  resourceId,
  showDetails = false
}) => {
  const { getResource } = useGameResources();
  const resource = getResource(resourceId);
  
  if (!resource) {
    return <div>Resource not found: {resourceId}</div>;
  }
  
  return (
    <div className="resource-display">
      <div className="resource-header">
        <h3>{resource.properties.name}</h3>
        <div className="resource-amount">
          {resource.getAmount().toFixed(1)} / {resource.getCapacity().toFixed(1)}
        </div>
      </div>
      
      {resource.getRate && (
        <div className="resource-rate">
          Rate: {resource.getRate().toFixed(2)}/sec
        </div>
      )}
      
      {showDetails && (
        <div className="resource-details">
          <div>Type: {resource.getType()}</div>
          <div>Capacity: {resource.getCapacity()}</div>
          {resource.getRate && (
            <div>Production Rate: {resource.getRate()} per second</div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Component that displays a list of resources
 */
export const ResourceList: React.FC = () => {
  const { resources } = useGameResources();
  
  return (
    <div className="resource-list">
      <h2>Resources</h2>
      {resources.length === 0 ? (
        <p>No resources available.</p>
      ) : (
        <div className="resource-grid">
          {resources.map(resource => (
            <ResourceDisplay 
              key={resource.getId()} 
              resourceId={resource.getId()} 
            />
          ))}
        </div>
      )}
    </div>
  );
}; 