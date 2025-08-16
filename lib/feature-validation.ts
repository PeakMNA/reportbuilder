/**
 * Feature Validation and Testing Workflow
 * 
 * Automated validation system to ensure features meet completion criteria
 * and prevent UI/functionality gaps.
 */

import type { RegisteredFeature, FeatureValidation, FeatureStatus } from '@/types/feature-registry'

export interface ValidationResult {
  isValid: boolean
  score: number // 0-100
  issues: ValidationIssue[]
  recommendations: string[]
  suggestedStatus: FeatureStatus
}

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info'
  category: 'functional' | 'ui' | 'testing' | 'documentation' | 'integration'
  message: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  autoFixable: boolean
}

export interface ValidationRule {
  id: string
  name: string
  description: string
  category: ValidationIssue['category']
  severity: ValidationIssue['severity']
  check: (feature: RegisteredFeature) => ValidationIssue | null
}

// Core validation rules
const VALIDATION_RULES: ValidationRule[] = [
  {
    id: 'has_functional_backend',
    name: 'Functional Backend Implementation',
    description: 'Feature must have working backend functionality, not just UI',
    category: 'functional',
    severity: 'critical',
    check: (feature) => {
      if (feature.status === 'ui_only') {
        return {
          type: 'error',
          category: 'functional',
          message: 'Feature has UI implementation but lacks functional backend',
          severity: 'critical',
          autoFixable: false
        }
      }
      
      if (!feature.validation.hasFunctionalBackend && 
          ['functional', 'testing', 'complete'].includes(feature.status)) {
        return {
          type: 'error',
          category: 'functional',
          message: 'Status indicates completion but backend functionality not validated',
          severity: 'high',
          autoFixable: false
        }
      }
      
      return null
    }
  },
  
  {
    id: 'has_complete_ui',
    name: 'Complete UI Implementation',
    description: 'Feature must have complete user interface implementation',
    category: 'ui',
    severity: 'high',
    check: (feature) => {
      if (['functional', 'testing', 'complete'].includes(feature.status) && 
          !feature.validation.hasCompleteUI) {
        return {
          type: 'error',
          category: 'ui',
          message: 'Feature marked as functional but UI implementation not validated',
          severity: 'high',
          autoFixable: false
        }
      }
      
      if (feature.requirements.ui.length === 0) {
        return {
          type: 'warning',
          category: 'ui',
          message: 'No UI requirements specified - may indicate missing interface design',
          severity: 'medium',
          autoFixable: false
        }
      }
      
      return null
    }
  },
  
  {
    id: 'has_test_coverage',
    name: 'Adequate Test Coverage',
    description: 'Feature must have appropriate testing coverage',
    category: 'testing',
    severity: 'high',
    check: (feature) => {
      if (['testing', 'complete'].includes(feature.status) && 
          !feature.validation.hasTestCoverage) {
        return {
          type: 'error',
          category: 'testing',
          message: 'Feature in testing/complete status but test coverage not validated',
          severity: 'high',
          autoFixable: false
        }
      }
      
      if (feature.requirements.testing.length === 0) {
        return {
          type: 'warning',
          category: 'testing',
          message: 'No testing requirements specified',
          severity: 'medium',
          autoFixable: false
        }
      }
      
      return null
    }
  },
  
  {
    id: 'has_documentation',
    name: 'Proper Documentation',
    description: 'Feature must have adequate documentation',
    category: 'documentation',
    severity: 'medium',
    check: (feature) => {
      const hasAnyDocs = Object.values(feature.documentation).some(doc => doc && doc.trim())
      
      if (['complete'].includes(feature.status) && !hasAnyDocs) {
        return {
          type: 'warning',
          category: 'documentation',
          message: 'Feature marked complete but lacks documentation',
          severity: 'medium',
          autoFixable: false
        }
      }
      
      if (!feature.validation.hasDocumentation && feature.status !== 'planned') {
        return {
          type: 'info',
          category: 'documentation',
          message: 'Consider adding documentation as feature progresses',
          severity: 'low',
          autoFixable: false
        }
      }
      
      return null
    }
  },
  
  {
    id: 'acceptance_criteria',
    name: 'Acceptance Criteria Met',
    description: 'Feature must meet all defined acceptance criteria',
    category: 'functional',
    severity: 'critical',
    check: (feature) => {
      if (['complete'].includes(feature.status) && 
          !feature.validation.passesAcceptanceCriteria) {
        return {
          type: 'error',
          category: 'functional',
          message: 'Feature marked complete but acceptance criteria not validated',
          severity: 'critical',
          autoFixable: false
        }
      }
      
      if (feature.requirements.successCriteria.length === 0) {
        return {
          type: 'warning',
          category: 'functional',
          message: 'No success criteria defined - unclear what constitutes completion',
          severity: 'medium',
          autoFixable: false
        }
      }
      
      return null
    }
  },
  
  {
    id: 'status_consistency',
    name: 'Status Consistency',
    description: 'Feature status must be consistent with validation state',
    category: 'integration',
    severity: 'high',
    check: (feature) => {
      // Check for status-validation mismatches
      if (feature.status === 'complete') {
        const requiredValidations = [
          feature.validation.hasFunctionalBackend,
          feature.validation.hasCompleteUI,
          feature.validation.hasTestCoverage,
          feature.validation.passesAcceptanceCriteria
        ]
        
        if (!requiredValidations.every(v => v)) {
          return {
            type: 'error',
            category: 'integration',
            message: 'Feature marked complete but not all validation criteria are met',
            severity: 'high',
            autoFixable: false
          }
        }
      }
      
      if (feature.status === 'blocked' && !feature.validation.validationNotes) {
        return {
          type: 'warning',
          category: 'integration',
          message: 'Feature is blocked but no reason provided in validation notes',
          severity: 'medium',
          autoFixable: false
        }
      }
      
      return null
    }
  },
  
  {
    id: 'file_association',
    name: 'File Association',
    description: 'Feature should be associated with relevant files',
    category: 'integration',
    severity: 'low',
    check: (feature) => {
      if (['in_progress', 'functional', 'testing', 'complete'].includes(feature.status) && 
          feature.filePaths.length === 0) {
        return {
          type: 'info',
          category: 'integration',
          message: 'Consider associating files with this feature for better tracking',
          severity: 'low',
          autoFixable: false
        }
      }
      
      return null
    }
  },
  
  {
    id: 'stale_feature',
    name: 'Stale Feature Detection',
    description: 'Detect features that have been inactive for too long',
    category: 'integration',
    severity: 'medium',
    check: (feature) => {
      const now = new Date()
      const daysSinceUpdate = (now.getTime() - new Date(feature.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
      
      if (feature.status === 'in_progress' && daysSinceUpdate > 7) {
        return {
          type: 'warning',
          category: 'integration',
          message: `Feature has been in progress for ${Math.round(daysSinceUpdate)} days without update`,
          severity: 'medium',
          autoFixable: false
        }
      }
      
      if (feature.status === 'blocked' && daysSinceUpdate > 14) {
        return {
          type: 'warning',
          category: 'integration',
          message: `Feature has been blocked for ${Math.round(daysSinceUpdate)} days`,
          severity: 'medium',
          autoFixable: false
        }
      }
      
      return null
    }
  }
]

/**
 * Validate a feature against all validation rules
 */
export function validateFeature(feature: RegisteredFeature): ValidationResult {
  const issues: ValidationIssue[] = []
  
  // Run all validation rules
  for (const rule of VALIDATION_RULES) {
    const issue = rule.check(feature)
    if (issue) {
      issues.push(issue)
    }
  }
  
  // Calculate validation score (0-100)
  const maxScore = 100
  const errorPenalty = 25
  const warningPenalty = 10
  const infoPenalty = 2
  
  let penalty = 0
  issues.forEach(issue => {
    switch (issue.type) {
      case 'error':
        penalty += errorPenalty
        break
      case 'warning':
        penalty += warningPenalty
        break
      case 'info':
        penalty += infoPenalty
        break
    }
  })
  
  const score = Math.max(0, maxScore - penalty)
  
  // Generate recommendations
  const recommendations = generateRecommendations(feature, issues)
  
  // Suggest appropriate status
  const suggestedStatus = suggestFeatureStatus(feature, issues)
  
  return {
    isValid: issues.filter(i => i.type === 'error').length === 0,
    score,
    issues,
    recommendations,
    suggestedStatus
  }
}

/**
 * Generate recommendations based on validation issues
 */
function generateRecommendations(feature: RegisteredFeature, issues: ValidationIssue[]): string[] {
  const recommendations: string[] = []
  
  // Status-specific recommendations
  if (feature.status === 'ui_only') {
    recommendations.push('Implement backend functionality to match UI capabilities')
    recommendations.push('Update validation to mark hasFunctionalBackend as true once backend is complete')
  }
  
  if (feature.status === 'blocked') {
    recommendations.push('Add detailed notes about what is blocking this feature')
    recommendations.push('Identify dependencies or resources needed to unblock')
  }
  
  if (feature.status === 'in_progress') {
    recommendations.push('Regularly update status and validation as work progresses')
    recommendations.push('Add implementation notes to track progress')
  }
  
  // Issue-specific recommendations
  const criticalIssues = issues.filter(i => i.severity === 'critical')
  if (criticalIssues.length > 0) {
    recommendations.push('Address critical issues before proceeding to next status')
  }
  
  const testingIssues = issues.filter(i => i.category === 'testing')
  if (testingIssues.length > 0) {
    recommendations.push('Define and implement testing strategy')
    recommendations.push('Add test cases to requirements')
  }
  
  const docIssues = issues.filter(i => i.category === 'documentation')
  if (docIssues.length > 0) {
    recommendations.push('Add documentation for implementation details')
    recommendations.push('Document API interfaces and usage examples')
  }
  
  return recommendations
}

/**
 * Suggest appropriate feature status based on validation
 */
function suggestFeatureStatus(feature: RegisteredFeature, issues: ValidationIssue[]): FeatureStatus {
  const criticalIssues = issues.filter(i => i.severity === 'critical')
  const hasUiOnlyIssue = issues.some(i => i.message.includes('UI implementation but lacks functional backend'))
  
  // If there are critical issues, suggest appropriate status
  if (hasUiOnlyIssue) {
    return 'ui_only'
  }
  
  if (criticalIssues.length > 0) {
    return feature.status === 'complete' ? 'testing' : feature.status
  }
  
  // Suggest progression based on validation state
  const validation = feature.validation
  
  if (validation.hasFunctionalBackend && 
      validation.hasCompleteUI && 
      validation.hasTestCoverage && 
      validation.passesAcceptanceCriteria) {
    return 'complete'
  }
  
  if (validation.hasFunctionalBackend && 
      validation.hasCompleteUI && 
      validation.hasTestCoverage) {
    return 'testing'
  }
  
  if (validation.hasFunctionalBackend && validation.hasCompleteUI) {
    return 'functional'
  }
  
  if (validation.hasFunctionalBackend || validation.hasCompleteUI) {
    return 'in_progress'
  }
  
  return 'planned'
}

/**
 * Bulk validate multiple features
 */
export function validateFeatures(features: RegisteredFeature[]): {
  results: Map<string, ValidationResult>
  summary: {
    totalFeatures: number
    validFeatures: number
    criticalIssues: number
    averageScore: number
    needingAttention: string[]
  }
} {
  const results = new Map<string, ValidationResult>()
  let totalScore = 0
  let criticalIssues = 0
  const needingAttention: string[] = []
  
  features.forEach(feature => {
    const result = validateFeature(feature)
    results.set(feature.id, result)
    
    totalScore += result.score
    criticalIssues += result.issues.filter(i => i.severity === 'critical').length
    
    if (!result.isValid || result.score < 70) {
      needingAttention.push(feature.id)
    }
  })
  
  return {
    results,
    summary: {
      totalFeatures: features.length,
      validFeatures: Array.from(results.values()).filter(r => r.isValid).length,
      criticalIssues,
      averageScore: features.length > 0 ? totalScore / features.length : 0,
      needingAttention
    }
  }
}

/**
 * Auto-fix issues where possible
 */
export function autoFixFeature(feature: RegisteredFeature): RegisteredFeature {
  // Currently no auto-fixable issues, but framework is here for future enhancements
  return feature
}

/**
 * Generate validation report
 */
export function generateValidationReport(features: RegisteredFeature[]): string {
  const validation = validateFeatures(features)
  const { results, summary } = validation
  
  let report = `# Feature Validation Report\n\n`
  report += `Generated: ${new Date().toISOString()}\n\n`
  report += `## Summary\n\n`
  report += `- Total Features: ${summary.totalFeatures}\n`
  report += `- Valid Features: ${summary.validFeatures}\n`
  report += `- Critical Issues: ${summary.criticalIssues}\n`
  report += `- Average Score: ${Math.round(summary.averageScore)}/100\n\n`
  
  if (summary.needingAttention.length > 0) {
    report += `## Features Needing Attention\n\n`
    summary.needingAttention.forEach(featureId => {
      const feature = features.find(f => f.id === featureId)
      const result = results.get(featureId)
      if (feature && result) {
        report += `### ${feature.name} (Score: ${result.score}/100)\n\n`
        result.issues.forEach(issue => {
          report += `- **${issue.type.toUpperCase()}**: ${issue.message}\n`
        })
        report += '\n'
      }
    })
  }
  
  return report
}