import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, extname, dirname } from 'path'
import { fileURLToPath } from 'url'
import { gzipSync, brotliCompressSync } from 'zlib'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const distDir = join(__dirname, '../dist')

// File size formatting
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// Get all files recursively
function getAllFiles(dir, fileList = []) {
  const files = readdirSync(dir)
  
  files.forEach(file => {
    const filePath = join(dir, file)
    const stat = statSync(filePath)
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList)
    } else {
      fileList.push(filePath)
    }
  })
  
  return fileList
}

// Compress files with gzip and brotli
function compressFiles() {
  console.log('🗜️  Compressing static assets...')
  
  const files = getAllFiles(distDir)
  const compressibleExtensions = ['.html', '.css', '.js', '.json', '.xml', '.txt', '.svg']
  let totalOriginalSize = 0
  let totalGzipSize = 0
  let totalBrotliSize = 0
  let compressedCount = 0
  
  files.forEach(filePath => {
    const ext = extname(filePath).toLowerCase()
    
    if (compressibleExtensions.includes(ext)) {
      try {
        const content = readFileSync(filePath)
        const originalSize = content.length
        
        // Skip very small files (< 1KB)
        if (originalSize < 1024) return
        
        // Gzip compression
        const gzipContent = gzipSync(content, { level: 9 })
        writeFileSync(filePath + '.gz', gzipContent)
        
        // Brotli compression
        const brotliContent = brotliCompressSync(content)
        writeFileSync(filePath + '.br', brotliContent)
        
        totalOriginalSize += originalSize
        totalGzipSize += gzipContent.length
        totalBrotliSize += brotliContent.length
        compressedCount++
        
        const relativePath = filePath.replace(distDir, '')
        const gzipRatio = ((1 - gzipContent.length / originalSize) * 100).toFixed(1)
        const brotliRatio = ((1 - brotliContent.length / originalSize) * 100).toFixed(1)
        
        console.log(`  ✓ ${relativePath}`)
        console.log(`    Original: ${formatBytes(originalSize)}`)
        console.log(`    Gzip: ${formatBytes(gzipContent.length)} (-${gzipRatio}%)`)
        console.log(`    Brotli: ${formatBytes(brotliContent.length)} (-${brotliRatio}%)`)
        
      } catch (error) {
        console.error(`  ❌ Failed to compress ${filePath}:`, error.message)
      }
    }
  })
  
  if (compressedCount > 0) {
    const totalGzipRatio = ((1 - totalGzipSize / totalOriginalSize) * 100).toFixed(1)
    const totalBrotliRatio = ((1 - totalBrotliSize / totalOriginalSize) * 100).toFixed(1)
    
    console.log(`\n📊 Compression Summary:`)
    console.log(`  Files compressed: ${compressedCount}`)
    console.log(`  Total original size: ${formatBytes(totalOriginalSize)}`)
    console.log(`  Total gzip size: ${formatBytes(totalGzipSize)} (-${totalGzipRatio}%)`)
    console.log(`  Total brotli size: ${formatBytes(totalBrotliSize)} (-${totalBrotliRatio}%)`)
  } else {
    console.log('  No files were compressed (all files < 1KB)')
  }
}

// Optimize HTML files
function optimizeHtml() {
  console.log('\n🔧 Optimizing HTML files...')
  
  const htmlFiles = getAllFiles(distDir).filter(file => extname(file) === '.html')
  
  htmlFiles.forEach(filePath => {
    try {
      let content = readFileSync(filePath, 'utf8')
      const originalSize = content.length
      
      // Remove comments (but keep conditional comments)
      content = content.replace(/<!--(?!\[if)[\s\S]*?-->/g, '')
      
      // Remove extra whitespace between tags
      content = content.replace(/>\s+</g, '><')
      
      // Remove leading/trailing whitespace from lines
      content = content.replace(/^\s+|\s+$/gm, '')
      
      // Remove empty lines
      content = content.replace(/\n\s*\n/g, '\n')
      
      const optimizedSize = content.length
      const savings = originalSize - optimizedSize
      
      if (savings > 0) {
        writeFileSync(filePath, content)
        const relativePath = filePath.replace(distDir, '')
        const savingsPercent = ((savings / originalSize) * 100).toFixed(1)
        console.log(`  ✓ ${relativePath}: ${formatBytes(savings)} saved (-${savingsPercent}%)`)
      }
      
    } catch (error) {
      console.error(`  ❌ Failed to optimize ${filePath}:`, error.message)
    }
  })
}

// Generate build report
function generateBuildReport() {
  console.log('\n📋 Generating build report...')
  
  const files = getAllFiles(distDir)
  const report = {
    buildTime: new Date().toISOString(),
    totalFiles: files.length,
    filesByType: {},
    largestFiles: [],
    totalSize: 0
  }
  
  files.forEach(filePath => {
    const stat = statSync(filePath)
    const ext = extname(filePath).toLowerCase() || 'no-extension'
    const size = stat.size
    
    // Skip compressed files for the main report
    if (filePath.endsWith('.gz') || filePath.endsWith('.br')) {
      return
    }
    
    report.totalSize += size
    
    if (!report.filesByType[ext]) {
      report.filesByType[ext] = { count: 0, totalSize: 0 }
    }
    
    report.filesByType[ext].count++
    report.filesByType[ext].totalSize += size
    
    report.largestFiles.push({
      path: filePath.replace(distDir, ''),
      size: size,
      formattedSize: formatBytes(size)
    })
  })
  
  // Sort largest files
  report.largestFiles.sort((a, b) => b.size - a.size)
  report.largestFiles = report.largestFiles.slice(0, 10) // Top 10
  
  // Format file types
  Object.keys(report.filesByType).forEach(ext => {
    report.filesByType[ext].formattedSize = formatBytes(report.filesByType[ext].totalSize)
  })
  
  report.formattedTotalSize = formatBytes(report.totalSize)
  
  // Write report
  const reportPath = join(distDir, 'build-report.json')
  writeFileSync(reportPath, JSON.stringify(report, null, 2))
  
  console.log(`  ✓ Build report saved to: build-report.json`)
  console.log(`  📦 Total build size: ${report.formattedTotalSize}`)
  console.log(`  📁 Total files: ${report.totalFiles}`)
  
  // Show file type breakdown
  console.log('\n📊 File type breakdown:')
  Object.entries(report.filesByType)
    .sort(([,a], [,b]) => b.totalSize - a.totalSize)
    .forEach(([ext, data]) => {
      console.log(`  ${ext}: ${data.count} files, ${data.formattedSize}`)
    })
  
  // Show largest files
  console.log('\n📈 Largest files:')
  report.largestFiles.slice(0, 5).forEach((file, index) => {
    console.log(`  ${index + 1}. ${file.path} (${file.formattedSize})`)
  })
}

// Check for potential issues
function checkBuildIssues() {
  console.log('\n🔍 Checking for potential issues...')
  
  const files = getAllFiles(distDir)
  const issues = []
  
  files.forEach(filePath => {
    const stat = statSync(filePath)
    const ext = extname(filePath).toLowerCase()
    const size = stat.size
    const relativePath = filePath.replace(distDir, '')
    
    // Skip compressed files
    if (filePath.endsWith('.gz') || filePath.endsWith('.br')) {
      return
    }
    
    // Check for large JavaScript files
    if (ext === '.js' && size > 500 * 1024) { // > 500KB
      issues.push({
        type: 'large-js',
        file: relativePath,
        size: formatBytes(size),
        message: 'Large JavaScript file detected. Consider code splitting.'
      })
    }
    
    // Check for large CSS files
    if (ext === '.css' && size > 100 * 1024) { // > 100KB
      issues.push({
        type: 'large-css',
        file: relativePath,
        size: formatBytes(size),
        message: 'Large CSS file detected. Consider splitting or removing unused styles.'
      })
    }
    
    // Check for uncompressed images
    if (['.png', '.jpg', '.jpeg'].includes(ext) && size > 200 * 1024) { // > 200KB
      issues.push({
        type: 'large-image',
        file: relativePath,
        size: formatBytes(size),
        message: 'Large image file detected. Consider optimization or WebP format.'
      })
    }
  })
  
  if (issues.length > 0) {
    console.log(`  ⚠️  Found ${issues.length} potential issues:`)
    issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue.file} (${issue.size})`)
      console.log(`     ${issue.message}`)
    })
  } else {
    console.log('  ✅ No issues detected!')
  }
  
  return issues
}

// Main optimization function
async function optimizeBuild() {
  console.log('🚀 Starting build optimization...\n')
  
  try {
    // Check if dist directory exists
    try {
      statSync(distDir)
    } catch (error) {
      console.error('❌ dist directory not found. Please run "npm run build" first.')
      process.exit(1)
    }
    
    // Run optimizations
    optimizeHtml()
    compressFiles()
    generateBuildReport()
    const issues = checkBuildIssues()
    
    console.log('\n🎉 Build optimization completed!')
    
    if (issues.length > 0) {
      console.log(`\n⚠️  ${issues.length} potential issues found. See details above.`)
    }
    
  } catch (error) {
    console.error('❌ Build optimization failed:', error)
    process.exit(1)
  }
}

// Run optimization
optimizeBuild()