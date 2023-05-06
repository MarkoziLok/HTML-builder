const fs = require('fs');
const path = require('path');

const sourceFolderPath = path.join(__dirname, 'files');
const targetFolderPath = path.join(__dirname, 'files-copy');

// Функция для рекурсивного копирования папок
function copyFolderRecursive(source, target) {
  // Создаем целевую папку, если ее нет
  if (!fs.existsSync(target)) {
    fs.mkdir(target, (err) => {
      if (err) throw err;
      console.log(`Created directory: ${target}`);
    });
  }

  // Получаем список файлов и папок в исходной папке
  fs.readdir(source, { withFileTypes: true }, (err, files) => {
    if (err) throw err;

    // Копируем каждый файл или папку из исходной папки в целевую
    files.forEach(file => {
      const sourcePath = path.join(source, file.name);
      const targetPath = path.join(target, file.name);

      if (file.isDirectory()) {
        // Если это папка, то рекурсивно копируем ее содержимое
        copyFolderRecursive(sourcePath, targetPath);
      } else {
        // Если это файл, то копируем его
        fs.copyFile(sourcePath, targetPath, (err) => {
          if (err) throw err;
          console.log(`Copied file: ${sourcePath} -> ${targetPath}`);
        });
      }
    });
  });
}

// Копируем исходную папку в целевую
copyFolderRecursive(sourceFolderPath, targetFolderPath);

// Следим за исходной папкой на предмет изменений
fs.watch(sourceFolderPath, { recursive: true }, (eventType, filename) => {
  const sourcePath = path.join(sourceFolderPath, filename);
  const targetPath = path.join(targetFolderPath, filename);

  if (eventType === 'rename') {
    // Если файл или папка была удалена, то удаляем ее из целевой папки
    fs.access(sourcePath, (err) => {
      if (err) {
        // Файл или папка была удалена
        if (fs.existsSync(targetPath)) {
          if (fs.statSync(targetPath).isDirectory()) {
            fs.rmdir(targetPath, { recursive: true }, (err) => {
              if (err) throw err;
              console.log(`Deleted directory: ${targetPath}`);
            });
          } else {
            fs.unlink(targetPath, (err) => {
              if (err) throw err;
              console.log(`Deleted file: ${targetPath}`);
            });
          }
        }
      } else {
        // Файл или папка была добавлена или переименована
        fs.stat(sourcePath, (err, stats) => {
          if (err) throw err;

          if (stats.isDirectory()) {
            copyFolderRecursive(sourcePath, targetPath);
          } else {
            fs.copyFile(sourcePath, targetPath, (err) => {
              if (err) throw err;
              console.log(`Copied file: ${sourcePath} -> ${targetPath}`);
            });
          }
        });
      }
    });
  } else if (eventType === 'change') {
    // Если файл был изменен, то копируем его в целевую папку
    fs.copyFile(sourcePath, targetPath, (err) => {
      if (err) throw err;
      console.log(`Copied file: ${sourcePath} -> ${targetPath}`);
    });
  }
});