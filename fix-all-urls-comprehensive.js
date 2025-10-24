const fs = require('fs');
const path = require('path');

// Comprehensive URL replacement script
const replaceInFile = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    const originalContent = content;
    
    // All possible old URLs and their replacements
    const replacements = [
      // API URLs
      ['https://qxtrand.onrender.com/api', 'https://qxtrand.onrender.com/api'],
      ['https://qxtrand.onrender.com/api', 'https://qxtrand.onrender.com/api'],
      ['https://qxtrand.onrender.com/api', 'https://qxtrand.onrender.com/api'],
      ['https://qxtrand.onrender.com/api', 'https://qxtrand.onrender.com/api'],
      
      // Base URLs
      ['https://qxtrand.onrender.com', 'https://qxtrand.onrender.com'],
      ['https://qxtrand.onrender.com', 'https://qxtrand.onrender.com'],
      
      // Registration URLs
      ['https://qxtrand.onrender.com/register', 'https://qxtrand.onrender.com/register'],
      
      // Domain names (for deployment files)
      ['qxtrand.onrender.com', 'qxtrand.onrender.com'],
      ['www.qxtrand.onrender.com', 'www.qxtrand.onrender.com'],
      
      // Protocol + domain
      ['https://qxtrand.onrender.com', 'https://qxtrand.onrender.com'],
      ['http://qxtrand.onrender.com', 'http://qxtrand.onrender.com'],
      
      // Email domains
      ['admin@qxtrand.onrender.com', 'admin@qxtrand.onrender.com'],
    ];
    
    replacements.forEach(([oldUrl, newUrl]) => {
      if (content.includes(oldUrl)) {
        const regex = new RegExp(oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        content = content.replace(regex, newUrl);
        changed = true;
      }
    });
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${path.relative(__dirname, filePath)}`);
      return true;
    }
    
    return false;
  } catch (err) {
    console.log(`⚠️ Skip: ${path.relative(__dirname, filePath)} (${err.message})`);
    return false;
  }
};

// Find all files recursively
function findAllFiles(dir, extensions) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        
        if (stat && stat.isDirectory() && 
            !file.includes('node_modules') && 
            !file.includes('.git') && 
            !file.includes('build') &&
            !file.includes('.next')) {
          results = results.concat(findAllFiles(filePath, extensions));
        } else if (extensions.some(ext => file.endsWith(ext))) {
          results.push(filePath);
        }
      } catch (err) {
        // Skip files that can't be accessed
      }
    });
  } catch (err) {
    // Skip directories that can't be accessed
  }
  
  return results;
}

// Main function
function fixAllUrls() {
  console.log('🔍 Starting comprehensive URL replacement...');
  
  // Search all relevant file types
  const allFiles = findAllFiles(__dirname, [
    '.js', '.jsx', '.ts', '.tsx', 
    '.txt', '.sh', '.json', '.md',
    '.html', '.css', '.yml', '.yaml'
  ]);
  
  console.log(`📁 Found ${allFiles.length} files to check`);
  
  let fixedCount = 0;
  
  allFiles.forEach(file => {
    if (replaceInFile(file)) {
      fixedCount++;
    }
  });
  
  console.log(`\n🎉 Fixed ${fixedCount} files`);
  console.log(`🔗 All URLs now point to: https://qxtrand.onrender.com`);
}

// Run the fix
fixAllUrls();