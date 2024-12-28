FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json ./
COPY .env ./

RUN export $(grep -v '^#' .env | xargs -d '\n') && npm run build

RUN npm install
RUN npm list

COPY . .
ENV NODE_ENV=production
RUN npm run build


FROM nginx:alpine

COPY --from=0 /app/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d

CMD ["nginx", "-g", "daemon off;"]