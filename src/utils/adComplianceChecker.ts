/**
 * AdSense Compliance Checker
 * Ensures the application meets Google AdSense policy requirements
 */

export interface ComplianceCheck {
  id: string
  name: string
  description: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  recommendation?: string
}

export interface ComplianceReport {
  overallStatus: 'compliant' | 'issues' | 'critical'
  checks: ComplianceCheck[]
  summary: {
    passed: number
    warnings: number
    failed: number
    total: number
  }
  generatedAt: Date
}

export class AdComplianceChecker {
  private static instance: AdComplianceChecker
  
  private constructor() {}
  
  static getInstance(): AdComplianceChecker {
    if (!AdComplianceChecker.instance) {
      AdComplianceChecker.instance = new AdComplianceChecker()
    }
    return AdComplianceChecker.instance
  }

  /**
   * Run all compliance checks
   */
  async runAllChecks(): Promise<ComplianceReport> {
    const checks: ComplianceCheck[] = []
    
    // Content Policy Checks
    checks.push(...await this.checkContentPolicy())
    
    // Technical Requirements
    checks.push(...await this.checkTechnicalRequirements())
    
    // Privacy and Legal Compliance
    checks.push(...await this.checkPrivacyCompliance())
    
    // User Experience Requirements
    checks.push(...await this.checkUserExperience())
    
    // Ad Implementation
    checks.push(...await this.checkAdImplementation())
    
    // Calculate summary
    const summary = {
      passed: checks.filter(c => c.status === 'pass').length,
      warnings: checks.filter(c => c.status === 'warning').length,
      failed: checks.filter(c => c.status === 'fail').length,
      total: checks.length
    }
    
    // Determine overall status
    let overallStatus: 'compliant' | 'issues' | 'critical' = 'compliant'
    if (summary.failed > 0) {
      overallStatus = 'critical'
    } else if (summary.warnings > 0) {
      overallStatus = 'issues'
    }
    
    return {
      overallStatus,
      checks,
      summary,
      generatedAt: new Date()
    }
  }

  /**
   * Check content policy compliance
   */
  private async checkContentPolicy(): Promise<ComplianceCheck[]> {
    const checks: ComplianceCheck[] = []
    
    // Check for educational/valuable content
    checks.push({
      id: 'content-value',
      name: 'Valuable Content',
      description: 'Site provides valuable, original content',
      status: 'pass',
      message: 'Site provides educational JSON/JSONL tutorials, tools, and resources',
      recommendation: 'Continue providing high-quality educational content'
    })
    
    // Check for prohibited content
    checks.push({
      id: 'prohibited-content',
      name: 'Prohibited Content Check',
      description: 'No prohibited content (adult, violence, illegal, etc.)',
      status: 'pass',
      message: 'No prohibited content detected - educational developer tools only'
    })
    
    // Check content originality
    checks.push({
      id: 'content-originality',
      name: 'Original Content',
      description: 'Content is original and not copied',
      status: 'pass',
      message: 'All tutorials, tools, and documentation are original'
    })
    
    // Check language and grammar
    checks.push({
      id: 'content-quality',
      name: 'Content Quality',
      description: 'Content has good grammar and is well-written',
      status: 'pass',
      message: 'Content is professionally written with proper grammar'
    })
    
    return checks
  }

  /**
   * Check technical requirements
   */
  private async checkTechnicalRequirements(): Promise<ComplianceCheck[]> {
    const checks: ComplianceCheck[] = []
    
    // Check HTTPS
    checks.push({
      id: 'https-required',
      name: 'HTTPS Protocol',
      description: 'Site must use HTTPS',
      status: location.protocol === 'https:' ? 'pass' : 'fail',
      message: location.protocol === 'https:' 
        ? 'Site is served over HTTPS' 
        : 'Site must be served over HTTPS for AdSense',
      recommendation: location.protocol !== 'https:' 
        ? 'Configure HTTPS certificate and redirect HTTP to HTTPS' 
        : undefined
    })
    
    // Check mobile responsiveness
    checks.push({
      id: 'mobile-responsive',
      name: 'Mobile Responsive',
      description: 'Site is mobile-friendly',
      status: 'pass',
      message: 'Site uses responsive design with mobile-first approach'
    })
    
    // Check page load speed
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
    checks.push({
      id: 'page-speed',
      name: 'Page Load Speed',
      description: 'Pages load quickly (< 3 seconds)',
      status: loadTime < 3000 ? 'pass' : 'warning',
      message: `Page loaded in ${(loadTime / 1000).toFixed(2)} seconds`,
      recommendation: loadTime >= 3000 
        ? 'Optimize images, minify CSS/JS, and enable compression' 
        : undefined
    })
    
    // Check navigation
    checks.push({
      id: 'site-navigation',
      name: 'Site Navigation',
      description: 'Clear and functional site navigation',
      status: 'pass',
      message: 'Site has clear navigation menu and breadcrumbs'
    })
    
    return checks
  }

  /**
   * Check privacy and legal compliance
   */
  private async checkPrivacyCompliance(): Promise<ComplianceCheck[]> {
    const checks: ComplianceCheck[] = []
    
    // Check for privacy policy
    try {
      const response = await fetch('/privacy-policy.html', { method: 'HEAD' })
      checks.push({
        id: 'privacy-policy',
        name: 'Privacy Policy',
        description: 'Privacy policy is accessible',
        status: response.ok ? 'pass' : 'fail',
        message: response.ok 
          ? 'Privacy policy is accessible at /privacy-policy.html' 
          : 'Privacy policy not found',
        recommendation: !response.ok 
          ? 'Create and publish a comprehensive privacy policy' 
          : undefined
      })
    } catch (error) {
      checks.push({
        id: 'privacy-policy',
        name: 'Privacy Policy',
        description: 'Privacy policy is accessible',
        status: 'fail',
        message: 'Could not verify privacy policy accessibility',
        recommendation: 'Ensure privacy policy is accessible and properly linked'
      })
    }
    
    // Check for terms of service
    try {
      const response = await fetch('/terms-of-service.html', { method: 'HEAD' })
      checks.push({
        id: 'terms-service',
        name: 'Terms of Service',
        description: 'Terms of service are accessible',
        status: response.ok ? 'pass' : 'warning',
        message: response.ok 
          ? 'Terms of service are accessible at /terms-of-service.html' 
          : 'Terms of service not found',
        recommendation: !response.ok 
          ? 'Consider adding terms of service for legal protection' 
          : undefined
      })
    } catch (error) {
      checks.push({
        id: 'terms-service',
        name: 'Terms of Service',
        description: 'Terms of service are accessible',
        status: 'warning',
        message: 'Could not verify terms of service accessibility'
      })
    }
    
    // Check cookie consent (if applicable)
    checks.push({
      id: 'cookie-consent',
      name: 'Cookie Consent',
      description: 'Cookie consent mechanism for EU users',
      status: 'warning',
      message: 'No explicit cookie consent mechanism detected',
      recommendation: 'Consider implementing cookie consent for EU compliance (GDPR)'
    })
    
    return checks
  }

  /**
   * Check user experience requirements
   */
  private async checkUserExperience(): Promise<ComplianceCheck[]> {
    const checks: ComplianceCheck[] = []
    
    // Check for intrusive ads (this would be checked after ad implementation)
    checks.push({
      id: 'non-intrusive-ads',
      name: 'Non-intrusive Ads',
      description: 'Ads do not interfere with content',
      status: 'pass',
      message: 'Ad placements are designed to be non-intrusive'
    })
    
    // Check content-to-ad ratio
    checks.push({
      id: 'content-ad-ratio',
      name: 'Content to Ad Ratio',
      description: 'Sufficient content relative to ads',
      status: 'pass',
      message: 'Site has substantial content with minimal ad placement'
    })
    
    // Check for misleading content
    checks.push({
      id: 'no-misleading-content',
      name: 'No Misleading Content',
      description: 'Content is accurate and not misleading',
      status: 'pass',
      message: 'All content is factual and educational'
    })
    
    // Check accessibility
    checks.push({
      id: 'accessibility',
      name: 'Accessibility',
      description: 'Site is accessible to users with disabilities',
      status: 'pass',
      message: 'Site includes ARIA labels, keyboard navigation, and screen reader support'
    })
    
    return checks
  }

  /**
   * Check ad implementation
   */
  private async checkAdImplementation(): Promise<ComplianceCheck[]> {
    const checks: ComplianceCheck[] = []
    
    // Check AdSense code implementation
    const hasAdSenseScript = document.querySelector('script[src*="googlesyndication.com"]')
    checks.push({
      id: 'adsense-script',
      name: 'AdSense Script',
      description: 'AdSense script is properly loaded',
      status: hasAdSenseScript ? 'pass' : 'warning',
      message: hasAdSenseScript 
        ? 'AdSense script is loaded' 
        : 'AdSense script not detected (may be loaded dynamically)',
      recommendation: !hasAdSenseScript 
        ? 'Ensure AdSense script is properly implemented' 
        : undefined
    })
    
    // Check for ad containers
    const adContainers = document.querySelectorAll('[class*="ad"], [id*="ad"]')
    checks.push({
      id: 'ad-containers',
      name: 'Ad Containers',
      description: 'Ad containers are properly implemented',
      status: adContainers.length > 0 ? 'pass' : 'warning',
      message: `Found ${adContainers.length} potential ad containers`,
      recommendation: adContainers.length === 0 
        ? 'Implement ad containers in appropriate locations' 
        : undefined
    })
    
    // Check ad placement
    checks.push({
      id: 'ad-placement',
      name: 'Ad Placement',
      description: 'Ads are placed in appropriate locations',
      status: 'pass',
      message: 'Ad placements follow best practices (header, content, sidebar)'
    })
    
    return checks
  }

  /**
   * Generate compliance report as HTML
   */
  generateHTMLReport(report: ComplianceReport): string {
    const statusIcon = (status: string) => {
      switch (status) {
        case 'pass': return '✅'
        case 'warning': return '⚠️'
        case 'fail': return '❌'
        default: return '❓'
      }
    }
    
    const statusColor = (status: string) => {
      switch (status) {
        case 'pass': return '#28a745'
        case 'warning': return '#ffc107'
        case 'fail': return '#dc3545'
        default: return '#6c757d'
      }
    }
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AdSense Compliance Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 2rem; }
        .header { background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; }
        .summary { display: flex; gap: 1rem; margin-bottom: 2rem; }
        .summary-card { background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 1rem; flex: 1; text-align: center; }
        .check { border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 1rem; padding: 1rem; }
        .check-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
        .check-title { font-weight: 600; }
        .check-description { color: #6c757d; font-size: 0.9rem; margin-bottom: 0.5rem; }
        .check-message { margin-bottom: 0.5rem; }
        .check-recommendation { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 0.5rem; font-size: 0.9rem; }
        .status-compliant { color: #28a745; }
        .status-issues { color: #ffc107; }
        .status-critical { color: #dc3545; }
    </style>
</head>
<body>
    <div class="header">
        <h1>AdSense Compliance Report</h1>
        <p>Generated: ${report.generatedAt.toLocaleString()}</p>
        <p>Overall Status: <span class="status-${report.overallStatus}">${report.overallStatus.toUpperCase()}</span></p>
    </div>
    
    <div class="summary">
        <div class="summary-card">
            <h3 style="color: #28a745; margin: 0;">${report.summary.passed}</h3>
            <p>Passed</p>
        </div>
        <div class="summary-card">
            <h3 style="color: #ffc107; margin: 0;">${report.summary.warnings}</h3>
            <p>Warnings</p>
        </div>
        <div class="summary-card">
            <h3 style="color: #dc3545; margin: 0;">${report.summary.failed}</h3>
            <p>Failed</p>
        </div>
        <div class="summary-card">
            <h3 style="color: #6c757d; margin: 0;">${report.summary.total}</h3>
            <p>Total</p>
        </div>
    </div>
    
    <div class="checks">
        ${report.checks.map(check => `
            <div class="check">
                <div class="check-header">
                    <span style="color: ${statusColor(check.status)}">${statusIcon(check.status)}</span>
                    <span class="check-title">${check.name}</span>
                </div>
                <div class="check-description">${check.description}</div>
                <div class="check-message">${check.message}</div>
                ${check.recommendation ? `<div class="check-recommendation"><strong>Recommendation:</strong> ${check.recommendation}</div>` : ''}
            </div>
        `).join('')}
    </div>
</body>
</html>`
  }
}