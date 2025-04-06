// Здесь "данные", которые раньше загружались через Flask/EJS.
// Для примера взят тот же формат, что в main.py и index.html
const data = {
  title: "Школьный музей Школы №367",
  description: "Школьный музей школы №367 — это не просто место...",
  content: [
    {
      type: "text",
      id: "text_1",
      content: "Пример текстового блока",
      photos: [
        {
          image: "https://via.placeholder.com/400x300", // замените на свой путь
          caption: "Пример фотографии"
        }
      ]
    },
    {
      type: "modal",
      id: "modal_1",
      title: "Пример модального окна",
      content: "<p>Содержимое модального окна</p>",
      button_text: "Открыть модал",
      button_class: "btn-modal",
      photos: [
        {
          image: "https://via.placeholder.com/200x150",
          caption: "Фото внутри модального окна"
        }
      ]
    }
    // Можно добавлять другие блоки по аналогии
  ]
};

// Функция для инициализации страницы: подставляем заголовок, описание и генерируем контент
function initPage() {
  // Заголовок и описание
  const titleEl = document.getElementById("article-title");
  const descEl = document.getElementById("article-description");
  titleEl.textContent = data.title || "Без заголовка";
  descEl.textContent = data.description || "Описание отсутствует";

  // Рендерим основной контент (текстовые блоки и модальные окна)
  const contentContainer = document.getElementById("content-blocks");

  data.content.forEach((item, index) => {
    if (item.type === "text") {
      renderTextBlock(item, contentContainer);
    } else if (item.type === "modal") {
      renderModalBlock(item, contentContainer, index);
    }
  });
}

// Рендер текстового блока
function renderTextBlock(item, container) {
  const textBlock = document.createElement("div");
  textBlock.classList.add("text-content");
  textBlock.innerHTML = item.content || "Текст отсутствует";

  // Если есть фотографии, добавим их
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

// Рендер блока с модальным окном
function renderModalBlock(item, container, index) {
  // Создаём кнопку
  const button = document.createElement("button");
  button.classList.add("button");
  if (item.button_class) {
    button.classList.add(item.button_class);
  }
  button.textContent = item.button_text || "Открыть";

  // Генерируем уникальный ID для модального окна
  const modalId = "modal-" + index;

  // При клике на кнопку – показываем модальное окно
  button.addEventListener("click", () => {
    const modalEl = document.getElementById(modalId);
    if (modalEl) {
      modalEl.style.display = "block";
    }
  });

  container.appendChild(button);

  // Создаём само модальное окно
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
  // item.content может содержать HTML, потому что в исходном EJS/Flask
  // иногда передавался HTML. Чтобы вставить HTML, используем innerHTML:
  const contentDiv = document.createElement("div");
  contentDiv.innerHTML = item.content || "<p>Содержимое модального окна</p>";
  modalContent.appendChild(contentDiv);

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

  // Закрытие модального окна при клике вне контента (необязательно)
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
}

// После загрузки страницы вызываем initPage()
document.addEventListener("DOMContentLoaded", initPage);
