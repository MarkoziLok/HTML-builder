const fs = require('fs');
const path = require('path');

const stylesFolderPath = path.join(__dirname, 'styles');
const distFolderPath = path.join(__dirname, 'project-dist');
const bundleFilePath = path.join(distFolderPath, 'bundle.css');

// Функция для сборки css бандла
function buildCssBundle() {
  let cssContent = '';

  // Получаем список файлов в папке styles
  fs.readdir(stylesFolderPath, { withFileTypes: true }, (err, files) => {
    if (err) throw err;

    // Обрабатываем каждый файл в папке
    files.forEach(file => {
      const filePath = path.join(stylesFolderPath, file.name);

      // Если это css файл, то добавляем его содержимое в общую строку cssContent
      if (file.isFile() && path.extname(filePath) === '.css') {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        cssContent += fileContent;
      }
    });

    // Создаем целевую папку, если ее нет
    if (!fs.existsSync(distFolderPath)) {
      fs.mkdir(distFolderPath, (err) => {
        if (err) throw err;
        console.log(`Created directory: ${distFolderPath}`);
      });
    }

    // Записываем общую строку cssContent в файл bundleFilePath
    fs.writeFile(bundleFilePath, cssContent, (err) => {
      if (err) throw err;
      console.log(`Created file: ${bundleFilePath}`);
    });
  });
}

// Собираем css бандл при запуске программы
buildCssBundle();

// Следим за папкой styles на предмет изменений
fs.watch(stylesFolderPath, { recursive: true }, (eventType, filename) => {
  if (eventType === 'rename') {
    // Если файл был удален, то пересобираем css бандл
    const filePath = path.join(stylesFolderPath, filename);
    fs.access(filePath, (err) => {
      if (err) {
        buildCssBundle();
      }
    });
  } else if (eventType === 'change') {
    // Если файл был изменен, то пересобираем css бандл
    buildCssBundle();
  }
});