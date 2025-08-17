import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting E2E test teardown...')
  
  // Add cleanup logic here, such as:
  // - Stopping additional services
  // - Cleaning up test data
  // - Finalizing test reports
  
  console.log('✅ E2E test teardown completed')
}

export default globalTeardown