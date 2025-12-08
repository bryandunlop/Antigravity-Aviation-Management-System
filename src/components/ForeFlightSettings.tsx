import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Plane, 
  Key, 
  Settings, 
  CheckCircle2, 
  XCircle, 
  Activity,
  FileText,
  Fuel,
  MapPin,
  Cloud,
  BookOpen,
  Scale,
  AlertTriangle,
  Upload,
  Zap
} from 'lucide-react';
import { useForeFlightConfig, useForeFlightSyncStatus } from './hooks/useForeFlight';
import { createRealForeFlightClient } from '../utils/foreflight/realClient';
import { getSyncService } from '../utils/foreflight/syncService';
import { toast } from 'sonner';

export default function ForeFlightSettings() {
  const { config, updateConfig, toggleIntegration } = useForeFlightConfig();
  const { syncStatus } = useForeFlightSyncStatus();
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [accountUuid, setAccountUuid] = useState(config.accountUuid);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleSaveCredentials = () => {
    updateConfig({ apiKey, accountUuid, syncEnabled: true });
    toast.success('ForeFlight credentials saved', {
      description: 'Sync service will initialize automatically'
    });
  };

  const handleTestConnection = async () => {
    if (!apiKey || !accountUuid) {
      toast.error('Missing credentials', {
        description: 'Please enter API key and account UUID'
      });
      return;
    }

    setTesting(true);
    try {
      const client = createRealForeFlightClient(apiKey, accountUuid);
      const isConnected = await client.testConnection();
      
      if (isConnected) {
        toast.success('Connection successful!', {
          description: 'ForeFlight API is responding'
        });
      } else {
        toast.error('Connection failed', {
          description: 'Check your API credentials'
        });
      }
    } catch (error) {
      toast.error('Connection test failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleManualSync = async () => {
    const syncService = getSyncService();
    if (!syncService) {
      toast.error('Sync service not initialized', {
        description: 'Save credentials and enable sync first'
      });
      return;
    }

    setSyncing(true);
    try {
      await syncService.syncNow();
    } finally {
      setSyncing(false);
    }
  };

  const integrations = [
    {
      id: 'autoPopulateFRAT' as const,
      title: 'Auto-Populate FRAT Forms',
      description: 'Automatically fill FRAT forms with weather, NOTAMs, and flight plan data',
      icon: FileText,
      color: 'text-blue-500',
      recommended: true
    },
    {
      id: 'syncFlightTimes' as const,
      title: 'Sync Flight Times',
      description: 'Import actual block times, hobbs, and fuel burn from ForeFlight logbook',
      icon: Activity,
      color: 'text-green-500',
      recommended: true
    },
    {
      id: 'importSquawks' as const,
      title: 'Import Squawks',
      description: 'Pull in-flight squawks written in ForeFlight into maintenance tech log',
      icon: AlertTriangle,
      color: 'text-orange-500',
      recommended: true
    },
    {
      id: 'autoFuelRequest' as const,
      title: 'Auto Fuel Requests',
      description: 'Generate fuel requests from planned fuel load in ForeFlight',
      icon: Fuel,
      color: 'text-purple-500',
      recommended: true
    },
    {
      id: 'autoAirportEvaluation' as const,
      title: 'Airport Evaluation Upload',
      description: 'Automatically upload departure/arrival airport evaluations to flight files',
      icon: Upload,
      color: 'text-pink-500',
      recommended: true
    },
    {
      id: 'trackAircraftPosition' as const,
      title: 'Real-Time Aircraft Tracking',
      description: 'Show live GPS positions on fleet map',
      icon: MapPin,
      color: 'text-red-500'
    },
    {
      id: 'syncNOTAMs' as const,
      title: 'Sync NOTAMs/TFRs',
      description: 'Pull NOTAMs and TFRs for safety briefings',
      icon: Cloud,
      color: 'text-cyan-500'
    },
    {
      id: 'syncLogbook' as const,
      title: 'Logbook Currency Sync',
      description: 'Auto-update pilot currency tracking from ForeFlight logbook',
      icon: BookOpen,
      color: 'text-yellow-500'
    },
    {
      id: 'syncWeightBalance' as const,
      title: 'Weight & Balance Sync',
      description: 'Import passenger weights and W&B calculations',
      icon: Scale,
      color: 'text-indigo-500'
    },
    {
      id: 'weatherDeviationAlerts' as const,
      title: 'Weather Deviation Alerts',
      description: 'Alert ops team when weather causes delays or route changes',
      icon: AlertTriangle,
      color: 'text-amber-500'
    }
  ];

  const isConfigured = config.apiKey && config.accountUuid;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3">
            <Plane className="w-8 h-8 text-blue-600" />
            ForeFlight Integration
          </h1>
          <p className="text-gray-600 mt-2">
            Connect ForeFlight to automate flight operations workflows
          </p>
        </div>
        <div className="flex gap-2">
          {config.syncEnabled && isConfigured && (
            <Badge variant="outline" className="px-4 py-2 border-green-500 text-green-700">
              <Activity className="w-4 h-4 mr-2 animate-pulse" />
              Sync Active
            </Badge>
          )}
          <Badge variant={isConfigured ? "default" : "secondary"} className="px-4 py-2">
            {isConfigured ? (
              <><CheckCircle2 className="w-4 h-4 mr-2" />Connected</>
            ) : (
              <><XCircle className="w-4 h-4 mr-2" />Not Connected</>
            )}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="credentials" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="credentials">
            <Key className="w-4 h-4 mr-2" />
            Credentials
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Zap className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="status">
            <Activity className="w-4 h-4 mr-2" />
            Sync Status
          </TabsTrigger>
        </TabsList>

        {/* Credentials Tab */}
        <TabsContent value="credentials">
          <Card>
            <CardHeader>
              <CardTitle>API Credentials</CardTitle>
              <CardDescription>
                Enter your ForeFlight API key and account UUID to enable integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Settings className="w-4 h-4" />
                <AlertDescription>
                  Get your API credentials from ForeFlight's developer portal at{' '}
                  <a 
                    href="https://public-api.foreflight.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    public-api.foreflight.com
                  </a>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <div className="relative">
                    <Input
                      id="apiKey"
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your ForeFlight API key"
                      className="pr-24"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountUuid">Account UUID</Label>
                  <Input
                    id="accountUuid"
                    value={accountUuid}
                    onChange={(e) => setAccountUuid(e.target.value)}
                    placeholder="7cce5146-048f-445e-850c-07a86e9fb9e5"
                  />
                  <p className="text-sm text-gray-500">
                    Your unique account identifier from ForeFlight
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSaveCredentials} className="flex-1" disabled={!apiKey || !accountUuid}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Save Credentials
                  </Button>
                  <Button 
                    onClick={handleTestConnection} 
                    variant="outline" 
                    className="flex-1"
                    disabled={testing || !apiKey || !accountUuid}
                  >
                    <Activity className={`w-4 h-4 mr-2 ${testing ? 'animate-spin' : ''}`} />
                    {testing ? 'Testing...' : 'Test Connection'}
                  </Button>
                </div>
              </div>

              {!isConfigured && (
                <Alert variant="destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    Integrations are disabled until you configure your API credentials
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <div className="space-y-4">
            <div className="grid gap-4">
              {integrations.map((integration) => {
                const Icon = integration.icon;
                const enabled = config.integrations[integration.id];
                
                return (
                  <Card key={integration.id} className={enabled ? 'border-green-200 bg-green-50/50' : ''}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 flex-1">
                          <div className={`p-3 rounded-lg bg-gray-100 ${integration.color}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{integration.title}</h3>
                              {integration.recommended && (
                                <Badge variant="secondary" className="text-xs">
                                  Recommended
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {integration.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={enabled}
                          onCheckedChange={() => toggleIntegration(integration.id)}
                          disabled={!isConfigured}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Sync Status Tab */}
        <TabsContent value="status">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Sync Statistics</CardTitle>
                    <CardDescription>
                      Last synced: {new Date(syncStatus.lastSync).toLocaleString()}
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={handleManualSync} 
                    disabled={syncing || !isConfigured}
                    size="sm"
                  >
                    <Activity className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Syncing...' : 'Sync Now'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {syncStatus.stats.flightPlansSynced}
                    </div>
                    <div className="text-sm text-gray-600">Flight Plans</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {syncStatus.stats.logbookEntriesSynced}
                    </div>
                    <div className="text-sm text-gray-600">Logbook Entries</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {syncStatus.stats.squawksImported}
                    </div>
                    <div className="text-sm text-gray-600">Squawks Imported</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {syncStatus.stats.positionUpdates}
                    </div>
                    <div className="text-sm text-gray-600">Position Updates</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-pink-600">
                      {syncStatus.stats.filesSynced}
                    </div>
                    <div className="text-sm text-gray-600">Files Synced</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {syncStatus.errors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Recent Errors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {syncStatus.errors.slice(0, 5).map((error, index) => (
                      <Alert key={index} variant="destructive">
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription>
                          <div className="flex justify-between">
                            <span>{error.error}</span>
                            <span className="text-xs opacity-75">
                              {new Date(error.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
