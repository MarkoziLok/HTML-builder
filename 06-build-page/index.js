const fs = require('fs').promises;
const path = require('path');

const componentsDir = path.join(__dirname, 'components');
const stylesDir = path.join(__dirname, 'styles');
const assetsDir = path.join(__dirname, 'assets');
const distDir = path.join(__dirname, 'project-dist');
const templateFile = path.join(__dirname, 'template.html');
const indexFile = path.join(distDir, 'index.html');
const styleFile = path.join(distDir, 'style.css');

async function buildPage() {
  try {
    // Create project-dist directory
    await fs.mkdir(distDir);

    // Read and parse template.html
    const templateContent = await fs.readFile(templateFile, 'utf-8');
    const sections = templateContent.match(/{{\s*([\w-]+)\s*}}/g);

    // Replace tags in template with component files
    let indexContent = templateContent;
    for (let section of sections) {
      const componentName = section.replace(/[{} ]/g, '');
      const componentFile = path.join(componentsDir, `${componentName}.html`);
      const componentContent = await fs.readFile(componentFile, 'utf-8');
      indexContent = indexContent.replace(section, componentContent);
    }

    // Write index.html
    await fs.writeFile(indexFile, indexContent);

    // Concatenate and write style.css
    const styles = await fs.readdir(stylesDir);
    let styleContent = '';
    for (let style of styles) {
      if (path.extname(style) === '.css') {
        const styleFile = path.join(stylesDir, style);
        const styleContentPart = await fs.readFile(styleFile, 'utf-8');
        styleContent += styleContentPart;
      }
    }
    await fs.writeFile(styleFile, styleContent);

    // Copy assets directory
    await copyDir(assetsDir, path.join(distDir, 'assets'));

    console.log('Page built successfully!');
  } catch (err) {
    console.error('Error building page:', err);
  }
}

async function copyDir(src, dest) {
  const entries = await fs.readdir(src, { withFileTypes: true });

  await fs.mkdir(dest);

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      if (path.extname(entry.name) === '.html') {
        throw new Error('Copying HTML files is not allowed!');
      }
      await fs.copyFile(srcPath, destPath);
    }
  }
}

buildPage();
