const fs = require('fs');
const path = require('path');

// Function to recursively find all files
function findAllFiles(dir, extensions) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        
        if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git') && !file.includes('build')) {
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

// Replace all old URLs with new backend URL
const replaceInFile = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Replace all old backend URLs with new one
    const replacements = [
      ['https://qxtrand.onrender.com', 'https://qxtrand.onrender.com'],
      ['https://qxtrand.onrender.com', 'https://qxtrand.onrender.com'],
      ['https://qxtrand.onrender.com/api', 'https://qxtrand.onrender.com/api'],
      ['https://qxtrand.onrender.com/api', 'https://qxtrand.onrender.com/api'],
      // For registration links, use current frontend URL
      ['https://qxtrand.onrender.com/register', 'https://qxtrand.onrender.com/register'],
      ['https://qxtrand.onrender.com/register', 'https://qxtrand.onrender.com/register'],
      // For deployment scripts, replace domain references
      ['qxtrand.onrender.com', 'qxtrand.onrender.com'],
      ['qxtrand.onrender.com', 'qxtrand.onrender.com'],
    ];
    
    replacements.forEach(([oldUrl, newUrl]) => {
      if (content.includes(oldUrl)) {
        content = content.replace(new RegExp(oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newUrl);
        changed = true;
      }
    });
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (err) {
    console.log(`❌ Error fixing ${filePath}:`, err.message);
    return false;
  }
};

// Main function
function fixAllUrls() {
  console.log('🔍 Finding all files with URLs...');
  
  // Search in entire project except build, node_modules, .git
  const allFiles = findAllFiles(__dirname, ['.js', '.jsx', '.ts', '.tsx', '.txt', '.sh', '.json']);
  
  console.log(`📁 Found ${allFiles.length} files to check`);
  
  let fixedCount = 0;
  
  allFiles.forEach(file => {
    if (replaceInFile(file)) {
      fixedCount++;
    }
  });
  
  console.log(`\n🎉 Fixed ${fixedCount} files`);
  console.log(`🔗 All URLs now point to: https://qxtrand.onrender.com`);
  console.log(`📝 Note: Some files may contain legitimate references to qxtrand.onrender.com for future use`);
}

// Run the fix
fixAllUrls();