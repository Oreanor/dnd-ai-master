# D&D AI Master

Интерактивная ролевая игра Dungeons & Dragons с AI-мастером, построенная на Next.js и Socket.IO.

## 🎮 Описание

D&D AI Master - это веб-приложение для игры в D&D, где роль мастера игры выполняет искусственный интеллект. Игроки могут присоединяться к общей игровой комнате, выполнять действия и получать отзывчивые ответы от DND Master в реальном времени.

### Основные возможности:
- 🔐 Аутентификация через Google
- 🎲 Система бросков кубиков и проверок характеристик
- 🤖 DND Master, генерирующий описания и реакции на действия игроков
- 👥 Многопользовательская игра в реальном времени
- 📱 Адаптивный интерфейс

## 🚀 Быстрый старт

### Предварительные требования
- Node.js 18+ 
- npm, yarn, pnpm или bun
- API ключи для AI (OpenAI или Cohere)

### Установка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd dnd-ai-master
```

2. Установите зависимости:
```bash
npm install
# или
yarn install
# или
pnpm install
```

3. Настройте переменные окружения:
Создайте файл `.env.local` в корне проекта:
```env
# AI Configuration
OPENAI_API_KEY=your_openai_api_key
# или
COHERE_API_KEY=your_cohere_api_key

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth (опционально)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Socket Server Configuration
SOCKET_PORT=3001
SOCKET_PATH=/api/socket_io
SOCKET_CORS_ORIGIN=http://localhost:3000
```

### Запуск приложения

**Важно:** Приложение состоит из двух частей - веб-сервера и сокет-сервера. Оба должны быть запущены одновременно.

1. **Запустите сокет-сервер** (в первом терминале):
```bash
npm run socket
# или
yarn socket
# или
pnpm socket
```

2. **Запустите веб-сервер** (во втором терминале):
```bash
npm run dev
# или
yarn dev
# или
pnpm dev
# или
bun dev
```

3. Откройте [http://localhost:3000](http://localhost:3000) в браузере

## 🎯 Как играть

1. **Вход в игру**: Войдите через Google или играйте как гость
2. **Создание персонажа**: Система автоматически создаст персонажа с базовыми характеристиками
3. **Выполнение действий**: Вводите действия в текстовом поле (например, "атакую стража", "осматриваю комнату")
4. **DND Master**: Мастер игры опишет результат ваших действий и предложит варианты развития сюжета

## 🛠 Технологии

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Socket.IO для real-time коммуникации
- **AI**: OpenAI GPT или Cohere для генерации контента
- **Аутентификация**: NextAuth.js с Google OAuth
- **Стилизация**: Tailwind CSS

## 📁 Структура проекта

```
dnd-ai-master/
├── app/                    # Next.js App Router
│   ├── api/               # API маршруты
│   │   ├── auth/          # NextAuth конфигурация
│   │   └── socket/        # Socket.IO endpoint
│   ├── globals.css        # Глобальные стили
│   ├── layout.tsx         # Корневой layout
│   └── page.tsx           # Главная страница
├── components/            # React компоненты
│   ├── ActionForm.tsx     # Форма для действий игрока
│   ├── GameRoom.tsx       # Основная игровая комната
│   └── Providers.tsx      # Провайдеры контекста
├── lib/                   # Утилиты и конфигурация
│   ├── ai.ts             # AI интеграция
│   └── worldState.ts      # Состояние игрового мира
├── server/               # Socket сервер
│   └── socket.ts         # Основной socket сервер
└── public/               # Статические файлы
```

## 🔧 Доступные скрипты

- `npm run dev` - Запуск Next.js в режиме разработки
- `npm run socket` - Запуск Socket.IO сервера
- `npm run build` - Сборка для продакшена
- `npm run start` - Запуск продакшен сборки
- `npm run lint` - Проверка кода линтером

## 🚨 Важные замечания

- **Сокет-сервер обязателен**: Без запущенного сокет-сервера игра не будет работать
- **API ключи**: Убедитесь, что настроили хотя бы один AI провайдер
- **Порт 3001**: Сокет-сервер по умолчанию запускается на порту 3001
- **CORS**: Настройте CORS для продакшена в переменных окружения

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект использует MIT лицензию.
