// Функция для загрузки JSON файла
async function fetchMuseumData() {
  try {
      const response = await fetch('museum_data.json');
      if (!response.ok) {
          throw new Error('Не удалось загрузить данные музея');
      }
      return await response.json();
  } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      // Возвращаем данные по умолчанию в случае ошибки
      return {
          title: "Школьный музей Школы №367",
          description: "Не удалось загрузить данные. Пожалуйста, попробуйте позже.",
          content: []
      };
  }
}

// Функция для создания элемента с фото и подписью
function createPhotoElement(photo) {
  const photoContainer = document.createElement("div");
  photoContainer.classList.add("photo-container");

  const imgEl = document.createElement("img");
  imgEl.src = photo.image || "images/default.jpg";
  imgEl.alt = photo.caption || "";
  imgEl.loading = "lazy"; // Ленивая загрузка для оптимизации

  photoContainer.appendChild(imgEl);

  if (photo.caption) {
      const captionEl = document.createElement("p");
      captionEl.classList.add("photo-caption");
      captionEl.textContent = photo.caption;
      photoContainer.appendChild(captionEl);
  }

  return photoContainer;
}

// Функция для создания видео элемента с подписью
function createVideoElement(video) {
  const videoContainer = document.createElement("div");
  videoContainer.style.margin = "20px 0";
  videoContainer.innerHTML = video.embed;

  if (video.caption) {
      const captionEl = document.createElement("p");
      captionEl.classList.add("photo-caption");
      captionEl.textContent = video.caption;
      videoContainer.appendChild(captionEl);
  }

  return videoContainer;
}

// Функция для отображения текстового блока
function renderTextBlock(item, container) {
  const textBlock = document.createElement("div");
  textBlock.classList.add("text-content");
  textBlock.innerHTML = item.content || "Текст отсутствует";

  if (item.photos && item.photos.length > 0) {
      item.photos.forEach((photo) => {
          textBlock.appendChild(createPhotoElement(photo));
      });
  }

  container.appendChild(textBlock);
}

// Функция для отображения блока с модальным окном
function renderModalBlock(item, container, index) {
  // Создаем кнопку для открытия модального окна
  const button = document.createElement("button");
  button.classList.add("button");
  if (item.button_class) {
      button.classList.add(item.button_class);
  }
  button.textContent = item.button_text || "Открыть";
  button.setAttribute("aria-label", `Открыть модальное окно: ${item.title || 'без названия'}`);

  // Генерируем уникальный ID для модального окна
  const modalId = `modal-${index}-${Date.now()}`;

  // При клике на кнопку показываем модальное окно
  button.addEventListener("click", () => {
      const modalEl = document.getElementById(modalId);
      if (modalEl) {
          modalEl.style.display = "block";
          document.body.style.overflow = "hidden"; // Блокируем прокрутку страницы
      }
  });

  container.appendChild(button);

  // Создаем само модальное окно
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.id = modalId;
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("role", "dialog");

  const modalContent = document.createElement("div");
  modalContent.classList.add("modal-content");

  // Кнопка закрытия
  const closeSpan = document.createElement("span");
  closeSpan.classList.add("close-modal");
  closeSpan.innerHTML = "&times;";
  closeSpan.setAttribute("aria-label", "Закрыть модальное окно");
  closeSpan.addEventListener("click", () => {
      modal.style.display = "none";
      document.body.style.overflow = ""; // Восстанавливаем прокрутку
  });

  modalContent.appendChild(closeSpan);

  // Заголовок модального окна
  if (item.title) {
      const h2 = document.createElement("h2");
      h2.textContent = item.title;
      modalContent.appendChild(h2);
  }

  // Основное содержимое
  if (item.content) {
      const contentDiv = document.createElement("div");
      contentDiv.innerHTML = item.content;
      modalContent.appendChild(contentDiv);
  }

  // Обработка видео
  if (item.videos && item.videos.length > 0) {
      const videosContainer = document.createElement("div");
      videosContainer.classList.add("videos-container");
      
      item.videos.forEach(video => {
          videosContainer.appendChild(createVideoElement(video));
      });
      
      modalContent.appendChild(videosContainer);
  }

  // Фотографии в модальном окне
  if (item.photos && item.photos.length > 0) {
      const modalPhotos = document.createElement("div");
      modalPhotos.classList.add("modal-photos");

      item.photos.forEach((photo) => {
          modalPhotos.appendChild(createPhotoElement(photo));
      });

      modalContent.appendChild(modalPhotos);
  }

  modal.appendChild(modalContent);
  container.appendChild(modal);

  // Закрытие модального окна при клике вне контента
  modal.addEventListener("click", (event) => {
      if (event.target === modal) {
          modal.style.display = "none";
          document.body.style.overflow = ""; // Восстанавливаем прокрутку
      }
  });

  // Закрытие модального окна по клавише Esc
  document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.style.display === "block") {
          modal.style.display = "none";
          document.body.style.overflow = ""; // Восстанавливаем прокрутку
      }
  });
}

// Основная функция инициализации страницы
async function initPage() {
  // Показываем индикатор загрузки
  const contentContainer = document.getElementById("content-blocks");
  contentContainer.innerHTML = '<div class="loading">Загрузка данных музея...</div>';

  try {
      // Загружаем данные
      const data = await fetchMuseumData();

      // Обновляем заголовок и описание
      document.getElementById("article-title").textContent = data.title || "Школьный музей";
      document.getElementById("article-description").textContent = data.description || "";

      // Очищаем контейнер перед добавлением нового контента
      contentContainer.innerHTML = "";

      // Рендерим контент
      if (data.content && data.content.length > 0) {
          data.content.forEach((item, index) => {
              if (item.type === "text") {
                  renderTextBlock(item, contentContainer);
              } else if (item.type === "modal") {
                  renderModalBlock(item, contentContainer, index);
              }
          });
      } else {
          contentContainer.innerHTML = '<div class="no-data">Нет данных для отображения</div>';
      }
  } catch (error) {
      console.error("Ошибка инициализации страницы:", error);
      contentContainer.innerHTML = '<div class="error">Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.</div>';
  }
}

// Запускаем инициализацию после загрузки DOM
document.addEventListener("DOMContentLoaded", initPage);