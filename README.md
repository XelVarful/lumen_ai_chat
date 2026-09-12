# LUMEN

Минималистичный веб-чат с потоковыми ответами на базе Groq. Проект состоит из независимых приложений на Next.js и FastAPI, не требует регистрации и сохраняет диалоги локально в браузере.

## Возможности

- Потоковая генерация ответа
- Несколько локальных диалогов
- Отмена и повтор генерации
- Markdown, таблицы и блоки кода
- Копирование кода в буфер обмена
- Светлая и тёмная темы
- Адаптивный интерфейс
- Обработка ошибок API и превышения лимитов

## Стек

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- React Markdown
- Vitest и Testing Library

### Backend

- Python 3.11+
- FastAPI
- Pydantic
- HTTPX
- Pytest
- Groq API

## Структура проекта

```text
.
├── backend
│   ├── app
│   │   ├── api         # HTTP-маршруты
│   │   ├── core        # Конфигурация приложения
│   │   ├── models      # Pydantic-модели
│   │   ├── services    # Интеграция с Groq
│   │   └── main.py     # Точка входа FastAPI
│   ├── tests
│   └── requirements.txt
├── frontend
│   ├── app             # Next.js App Router и глобальные стили
│   ├── components      # Компоненты интерфейса
│   ├── hooks           # Состояние и потоковая генерация
│   ├── lib             # API-клиент и утилиты
│   ├── tests
│   └── types
└── README.md
```

## Локальный запуск

### Требования

- Node.js 20 или новее
- Python 3.11 или новее
- API-ключ Groq

### Backend

Перейдите в директорию backend и создайте виртуальное окружение:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

Для Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

Установите зависимости:

```bash
python -m pip install -r requirements.txt
```

Создайте локальный файл настроек:

```bash
cp .env.example .env
```

Укажите в нём API-ключ:

```env
GROQ_API_KEY=gsk_your_key
GROQ_MODEL=openai/gpt-oss-20b
FRONTEND_ORIGIN=http://localhost:3000
```

Запустите сервер:

```bash
uvicorn app.main:app --reload
```

Backend будет доступен на `http://localhost:8000`. Документация OpenAPI находится по адресу `http://localhost:8000/docs`.

### Frontend

Откройте второй терминал:

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Откройте `http://localhost:3000` в браузере.

## Переменные окружения

### Backend

| Переменная | Обязательна | По умолчанию | Назначение |
| --- | --- | --- | --- |
| `GROQ_API_KEY` | Да | — | API-ключ Groq |
| `GROQ_MODEL` | Нет | `openai/gpt-oss-20b` | Модель для генерации |
| `FRONTEND_ORIGIN` | Нет | `http://localhost:3000` | Разрешённый CORS origin |

### Frontend

| Переменная | Обязательна | По умолчанию | Назначение |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Нет | `http://localhost:8000` | Адрес FastAPI-сервера |

Файлы `.env` и `.env.local` исключены из Git. В репозитории должны находиться только файлы-примеры без рабочих ключей.

## API

### Проверка состояния

```http
GET /api/health
```

Ответ:

```json
{
  "status": "ok"
}
```

### Отправка сообщения

```http
POST /api/chat
Content-Type: application/json
```

Тело запроса:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Объясни, как работает FastAPI"
    }
  ]
}
```

Ответ передаётся с типом `text/event-stream`:

```text
event: delta
data: {"type":"delta","content":"FastAPI"}

event: done
data: {"type":"done","content":""}
```

Типы событий:

| Событие | Назначение |
| --- | --- |
| `delta` | Следующий фрагмент ответа |
| `done` | Генерация завершена |
| `error` | Во время генерации произошла ошибка |

## Проверка проекта

Backend:

```bash
cd backend
python -m pip install -r requirements-dev.txt
pytest
```

Frontend:

```bash
cd frontend
npm test
npm run lint
npm run build
```

Тесты backend используют подменённый сервис и не отправляют запросы в Groq.

## Безопасность

- API-ключ хранится только на backend.
- Не добавляйте рабочие `.env`-файлы в Git.
- Не используйте секреты в переменных с префиксом `NEXT_PUBLIC_`.
- Если ключ попал в историю Git или публичное сообщение, отзовите его и создайте новый.

## Ограничения

- История хранится только в текущем браузере.
- Нет регистрации и синхронизации между устройствами.
- Поддерживаются только текстовые сообщения.
- Доступность модели зависит от лимитов Groq.
