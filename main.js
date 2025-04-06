const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const flash = require('connect-flash');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;

// Настройки приложения
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));
app.use(flash());

// Настройки загрузки файлов
const UPLOAD_FOLDER = 'public/uploads';
const ALLOWED_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif']);
const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB

if (!fs.existsSync(UPLOAD_FOLDER)) {
  fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_FOLDER);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const extname = path.extname(file.originalname);
    cb(null, `${timestamp}_${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const extname = path.extname(file.originalname).toLowerCase().substring(1);
    if (ALLOWED_EXTENSIONS.has(extname)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Функции для работы с данными
function allowedFile(filename) {
  const extname = path.extname(filename).toLowerCase().substring(1);
  return ALLOWED_EXTENSIONS.has(extname);
}

function loadData() {
  const defaultData = {
    "title": "Школьный музей Школы №367",
    "description": "Школьный музей школы №367 — это не просто место...",
    "content": [
      {
        "type": "text",
        "id": "text_1",
        "content": "Пример текстового блока",
        "photos": [
          {
            "image": "public/uploads/example.jpg",
            "caption": "Пример фотографии"
          }
        ]
      }
    ]
  };

  try {
    if (fs.existsSync('museum_data.json')) {
      const data = fs.readFileSync('museum_data.json', 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error loading data: ${err}`);
  }

  return defaultData;
}

function saveData(data) {
  try {
    fs.writeFileSync('museum_data.json', JSON.stringify(data, null, 4), 'utf8');
  } catch (err) {
    console.error(`Error saving data: ${err}`);
    req.flash('danger', 'Ошибка сохранения данных');
  }
}

// Маршруты
app.get('/', (req, res) => {
  const data = loadData();
  res.render('templates', { data });
});

app.route('/admin')
  .get((req, res) => {
    const data = loadData();
    res.render('admin', { data, messages: req.flash() });
  })
  .post(upload.any(), (req, res) => {
    const data = loadData();
    const filePaths = {};

    try {
      // Обработка загрузки файлов
      req.files.forEach(file => {
        const fieldName = file.fieldname;
        filePaths[fieldName] = `uploads/${file.filename}`;
        req.flash('success', `Файл ${file.originalname} успешно загружен`);
      });

      // Обработка добавления фото
      if (req.body.add_photo !== undefined) {
        const contentIndex = parseInt(req.body.add_photo);
        if (contentIndex >= 0 && contentIndex < data.content.length) {
          data.content[contentIndex].photos.push({
            "image": "",
            "caption": ""
          });
          saveData(data);
        }
        return res.redirect('/admin');
      }

      // Удаление контента
      if (req.body.delete_content !== undefined) {
        const index = parseInt(req.body.delete_content);
        if (index >= 0 && index < data.content.length) {
          data.content.splice(index, 1);
          saveData(data);
        }
        return res.redirect('/admin');
      }

      // Добавление нового контента
      if (req.body.add_content !== undefined) {
        const contentType = req.body.new_content_type || 'text';
        const newId = `${contentType}_${data.content.length + 1}`;

        const newItem = {
          "type": contentType,
          "id": newId,
          "photos": []
        };

        if (contentType === 'text') {
          newItem.content = "Новый текстовый блок";
        } else if (contentType === 'modal') {
          newItem.title = "Новое модальное окно";
          newItem.content = "<p>Содержимое модального окна</p>";
          newItem.button_text = "Кнопка";
          newItem.button_class = "btn-modal";
        }

        data.content.push(newItem);
        saveData(data);
        return res.redirect('/admin');
      }

      // Обновление основных данных
      data.title = req.body.title || data.title;
      data.description = req.body.description || data.description;

      // Обработка контента
      const newContent = [];
      let i = 0;

      while (true) {
        const contentType = req.body[`content_${i}_type`];
        if (!contentType) break;

        // Обработка фотографий
        const photos = [];
        let j = 1;

        while (true) {
          const imageKey = `content_${i}_photos_${j}_image`;
          const captionKey = `content_${i}_photos_${j}_caption`;
          const fileKey = `content_${i}_photo_${j}`;

          let image = req.body[imageKey] || '';
          const caption = req.body[captionKey] || '';

          // Проверяем загружен ли файл для этого поля
          if (filePaths[fileKey]) {
            image = filePaths[fileKey];
          }

          if (!image && !caption) break;

          photos.push({
            image: image,
            caption: caption
          });
          j++;
        }

        // Создаем элемент контента
        const contentItem = {
          type: contentType,
          id: req.body[`content_${i}_id`] || `${contentType}_${i}`,
          photos: photos
        };

        if (contentType === 'text') {
          contentItem.content = req.body[`content_${i}_text`] || '';
        } else if (contentType === 'modal') {
          contentItem.title = req.body[`content_${i}_modal_title`] || '';
          contentItem.content = req.body[`content_${i}_modal_content`] || '';
          contentItem.button_text = req.body[`content_${i}_button_text`] || '';
          contentItem.button_class = req.body[`content_${i}_button_class`] || 'btn-modal';
        }

        newContent.push(contentItem);
        i++;
      }

      data.content = newContent;
      saveData(data);
      req.flash('success', 'Все изменения успешно сохранены');

    } catch (err) {
      console.error(`Error processing form: ${err}`);
      req.flash('danger', 'Произошла ошибка при обработке формы');
    }

    res.redirect('/admin');
  });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});