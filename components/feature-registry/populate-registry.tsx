/**
 * Component to populate the Feature Registry with existing project features
 * 
 * This component provides a one-time setup to register all existing features
 * found in the codebase to establish a baseline in the Feature Registry.
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, Database, Loader2, AlertTriangle } from 'lucide-react'
import { useFeatureRegistryStore } from '@/lib/stores/feature-registry-store'
import { getInitialFeaturesForRegistration } from '@/scripts/populate-feature-registry'

export function PopulateRegistry() {
  const [isPopulating, setIsPopulating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { features, registerFeature } = useFeatureRegistryStore()
  const existingFeatureCount = Object.keys(features).length
  const hasExistingFeatures = existingFeatureCount > 0

  const handlePopulate = async () => {
    console.log('🚀 Starting feature population...')
    
    try {
      const featuresToRegister = getInitialFeaturesForRegistration()
      console.log(`📋 Found ${featuresToRegister.length} features to register`)
      console.log('📝 First feature sample:', featuresToRegister[0]?.name)
      
      if (featuresToRegister.length === 0) {
        setError('No features found in the populate script. Please check the script file.')
        return
      }
    } catch (err) {
      console.error('❌ Error loading features from script:', err)
      setError(`Failed to load features from script: ${err instanceof Error ? err.message : 'Unknown error'}`)
      return
    }

    if (hasExistingFeatures) {
      const confirmed = window.confirm(
        `You already have ${existingFeatureCount} features registered. This will add ${getInitialFeaturesForRegistration().length} more features from the codebase. Continue?`
      )
      if (!confirmed) return
    }

    setIsPopulating(true)
    setError(null)
    setProgress(0)

    try {
      const featuresToRegister = getInitialFeaturesForRegistration()
      const total = featuresToRegister.length
      let addedCount = 0

      console.log(`🔄 Processing ${total} features...`)

      for (let i = 0; i < featuresToRegister.length; i++) {
        const feature = featuresToRegister[i]
        
        // Check if feature already exists (by name)
        const existingFeature = Object.values(features).find(f => f.name === feature.name)
        if (existingFeature) {
          console.log(`⏭️ Skipping existing feature: ${feature.name}`)
          setProgress(((i + 1) / total) * 100)
          continue
        }

        // Register the feature
        console.log(`✅ Registering feature: ${feature.name}`)
        registerFeature(feature)
        addedCount++
        
        // Update progress
        setProgress(((i + 1) / total) * 100)
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 50))
      }

      console.log(`🎉 Population complete! Added ${addedCount} new features`)
      setCompleted(true)
    } catch (err) {
      console.error('❌ Error during population:', err)
      setError(err instanceof Error ? err.message : 'Failed to populate registry')
    } finally {
      setIsPopulating(false)
    }
  }

  if (completed) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <CardTitle className="text-green-800">Registry Populated Successfully!</CardTitle>
          </div>
          <CardDescription className="text-green-700">
            All existing features have been registered in the Feature Registry system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-green-700">
              ✅ {getInitialFeaturesForRegistration().length} features registered<br/>
              ✅ Status tracking enabled<br/>
              ✅ Validation rules active<br/>
              ✅ Dashboard ready for use
            </div>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Next Steps:</strong> Review the registered features in the dashboard above. 
                Update any that need status changes or additional validation. From now on, 
                all new features MUST be registered before implementation.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-6 w-6" />
          <CardTitle>Populate Feature Registry</CardTitle>
        </div>
        <CardDescription>
          Register all existing features from the codebase to establish a baseline in the Feature Registry system.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {hasExistingFeatures && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                You already have {existingFeatureCount} features registered. This will add {getInitialFeaturesForRegistration().length} more features discovered in the codebase.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="text-lg font-semibold text-orange-600">⚠️ FEATURE REGISTRY IS EMPTY</p>
            <p className="text-base"><strong>Click the button below to populate with all {getInitialFeaturesForRegistration().length} features:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>2 Pages:</strong> Home page, Designer page</li>
              <li><strong>25 Report Components:</strong> Text, data, tables, charts, shapes, headers, footers, etc.</li>
              <li><strong>11 Designer UI Features:</strong> Toolbar buttons, zoom, search, categories, scrolling, etc.</li>
              <li><strong>11 Utilities:</strong> Command system, data binding, property system, feature registry, etc.</li>
              <li><strong>3 Critical MVP Features:</strong> CSV upload, visual data binding, new report workflow</li>
              <li><strong>Total:</strong> {getInitialFeaturesForRegistration().length} features</li>
            </ul>
            <p className="text-xs text-amber-600 mt-2">
              ⚠️ <strong>Note:</strong> Several features are marked as &ldquo;UI-only&rdquo; and will show warnings requiring backend implementation.
            </p>
          </div>

          {isPopulating && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Registering features...</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="text-xs text-muted-foreground text-center">
                {Math.round(progress)}% complete
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handlePopulate} 
            disabled={isPopulating}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 text-lg"
            size="lg"
          >
            {isPopulating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Populating Registry...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Populate Feature Registry
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}