# Plum Framework Frontend

Клиентская часть приложения Plum Framework.

## Основные используемые технологии и библиотеки

- **Node.js** v20.14.0;
- **NPM** v10.7.0 - менеджер пакетов;
- **vite** - создание и запуск React проекта;
- **React** v18 - библиотека для создания пользовательских интерфейсов;
- **react-router-dom** - управление роутингом;
- **tanstack/query** и **axios** - запрос данных с сервера;
- **tanstack/tables** - функции для работы с таблицей;
- **TailwindCSS** - CSS фреймворк;
- **shadcn/ui** - компоненты для таблиц, toast сообщений и других элементов страницы;
- **zustand** - global state manager;
- **lucide-react** - библиотека иконок;
- **genio** - шрифт;

# Запуск frontend'а

1. Установить nvm

```shell
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
```

2. Установить node версии `20.14.0` и npm версии `10.7.0`

```shell
nvm install 20.14.0
```

```shell
nvm use 20.14.0
```

```shell
npm install -g npm@10.7.0
```

Убедиться в правильной версии npm

```console
foo@bar:~$ nvm current
v20.14.0

foo@bar:~$ npm --version
10.7.0
```

3. Установить зависимости

```bash
npm install
```

4. Заполнить файл [`.env`](./.env), используя следующую таблицу:

##### Параметры frontend'а

| Параметр         | Описание        | Значение по умолчанию        |
| ---------------- | --------------- | ---------------------------- |
| VITE_BACKEND_URL | Адрес backend'а | `http://127.0.0.1:8001/api/` |
| VITE_AIRFLOW_URL | Адрес Airflow   | `https://vtb-dev/airflow`    |

5. Запустить frontend в режиме разработки

```bash
npm run dev
```

Приложение будет доступно по адресу http://localhost:5173, если порт 5173 не занят.
