FROM node:18 AS build
COPY . /nodeproj/
WORKDIR /nodeproj/
RUN npm install
RUN npm run build

FROM nginx:alpine
COPY --from=build /nodeproj/dist /usr/share/nginx/html/