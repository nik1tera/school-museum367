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

// Функция для отображения текстового блока
function renderTextBlock(item, container) {
  const textBlock = document.createElement("div");
  textBlock.classList.add("text-content");
  textBlock.innerHTML = item.content || "Текст отсутствует";

  if (item.photos && item.photos.length > 0) {
      item.photos.forEach((photo) => {
          const photoContainer = document.createElement("div");
          photoContainer.classList.add("photo-container");

          const imgEl = document.createElement("img");
          imgEl.src = photo.image || "images/default.jpg";
          imgEl.alt = photo.caption || "";

          photoContainer.appendChild(imgEl);

          if (photo.caption) {
              const captionEl = document.createElement("p");
              captionEl.classList.add("photo-caption");
              captionEl.textContent = photo.caption;
              photoContainer.appendChild(captionEl);
          }

          textBlock.appendChild(photoContainer);
      });
  }

  container.appendChild(textBlock);
}

// Функция для отображения блока с модальным окном
function renderModalBlock(item, container, index) {
  // Создаем кнопку
  const button = document.createElement("button");
  button.classList.add("button");
  if (item.button_class) {
      button.classList.add(item.button_class);
  }
  button.textContent = item.button_text || "Открыть";

  // Генерируем уникальный ID для модального окна
  const modalId = "modal-" + index;

  // При клике на кнопку показываем модальное окно
  button.addEventListener("click", () => {
      const modalEl = document.getElementById(modalId);
      if (modalEl) {
          modalEl.style.display = "block";
      }
  });

  container.appendChild(button);

  // Создаем само модальное окно
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.id = modalId;

  const modalContent = document.createElement("div");
  modalContent.classList.add("modal-content");

  // Кнопка закрытия
  const closeSpan = document.createElement("span");
  closeSpan.classList.add("close-modal");
  closeSpan.innerHTML = "&times;";
  closeSpan.addEventListener("click", () => {
      modal.style.display = "none";
  });

  modalContent.appendChild(closeSpan);

  // Заголовок модального окна
  const h2 = document.createElement("h2");
  h2.textContent = item.title || "Модальное окно";
  modalContent.appendChild(h2);

  // Основное содержимое
  const contentDiv = document.createElement("div");
  contentDiv.innerHTML = item.content || "<p>Содержимое модального окна</p>";
  modalContent.appendChild(contentDiv);

  // Обработка вложенного контента (например, видео)
  if (Array.isArray(item.content)) {
      item.content.forEach(contentItem => {
          if (contentItem.video) {
              const videoContainer = document.createElement("div");
              videoContainer.innerHTML = contentItem.video;
              modalContent.appendChild(videoContainer);
              
              if (contentItem.caption) {
                  const captionEl = document.createElement("p");
                  captionEl.classList.add("photo-caption");
                  captionEl.textContent = contentItem.caption;
                  modalContent.appendChild(captionEl);
              }
          }
      });
  }

  // Фотографии в модальном окне
  if (item.photos && item.photos.length > 0) {
      const modalPhotos = document.createElement("div");
      modalPhotos.classList.add("modal-photos");

      item.photos.forEach((photo) => {
          const photoContainer = document.createElement("div");
          photoContainer.classList.add("photo-container");

          const imgEl = document.createElement("img");
          imgEl.src = photo.image || "images/default.jpg";
          imgEl.alt = photo.caption || "";

          photoContainer.appendChild(imgEl);

          if (photo.caption) {
              const captionEl = document.createElement("p");
              captionEl.classList.add("photo-caption");
              captionEl.textContent = photo.caption;
              photoContainer.appendChild(captionEl);
          }

          modalPhotos.appendChild(photoContainer);
      });

      modalContent.appendChild(modalPhotos);
  }

  modal.appendChild(modalContent);
  container.appendChild(modal);

  // Закрытие модального окна при клике вне контента
  window.addEventListener("click", (event) => {
      if (event.target === modal) {
          modal.style.display = "none";
      }
  });
}

// Основная функция инициализации страницы
async function initPage() {
  // Показываем индикатор загрузки
  const contentContainer = document.getElementById("content-blocks");
  contentContainer.innerHTML = '<div class="loading">Загрузка данных музея...</div>';

  // Загружаем данные
  const data = await fetchMuseumData();

  // Обновляем заголовок и описание
  document.getElementById("article-title").textContent = data.title || "";
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
}

// Запускаем инициализацию после загрузки DOM
document.addEventListener("DOMContentLoaded", initPage);