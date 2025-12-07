import React, { useEffect } from 'react';
import { useForeFlightConfig } from './hooks/useForeFlight';
import { createForeFlightClient } from '../utils/foreflight/client';
import { initializeSyncService } from '../utils/foreflight/syncService';

interface ForeFlightSyncProviderProps {
  children: React.ReactNode;
}

export default function ForeFlightSyncProvider({ children }: ForeFlightSyncProviderProps) {
  const { config } = useForeFlightConfig();

  useEffect(() => {
    // Initialize ForeFlight sync service when config changes
    if (config.apiKey && config.accountUuid && config.syncEnabled) {
      console.log('[ForeFlight] Initializing sync service...');
      
      const client = createForeFlightClient(config.apiKey, config.accountUuid);
      const syncService = initializeSyncService(client as any, config);

      // Set up event listeners for synced data
      syncService.onFlightPlans((flightPlans) => {
        console.log(`[ForeFlight] ${flightPlans.length} flight plans synced`);
        // Dispatch custom event so other components can listen
        window.dispatchEvent(new CustomEvent('foreflight:flightPlans', { detail: flightPlans }));
      });

      syncService.onLogbook((entries) => {
        console.log(`[ForeFlight] ${entries.length} logbook entries synced`);
        window.dispatchEvent(new CustomEvent('foreflight:logbook', { detail: entries }));
      });

      syncService.onSquawks((squawks) => {
        console.log(`[ForeFlight] ${squawks.length} squawks synced`);
        window.dispatchEvent(new CustomEvent('foreflight:squawks', { detail: squawks }));
      });

      syncService.onPosition((positions) => {
        console.log(`[ForeFlight] ${positions.length} aircraft positions updated`);
        window.dispatchEvent(new CustomEvent('foreflight:positions', { detail: positions }));
      });

      syncService.onFiles((files) => {
        console.log(`[ForeFlight] ${files.length} files synced`);
        window.dispatchEvent(new CustomEvent('foreflight:files', { detail: files }));
      });

      return () => {
        // Cleanup on unmount
        syncService.stop();
      };
    }
  }, [config.apiKey, config.accountUuid, config.syncEnabled]);

  return <>{children}</>;
}
