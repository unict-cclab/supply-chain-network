# build environment
FROM node:13.12.0-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --silent
RUN npm install react-scripts@3.4.1 -g --silent
COPY . ./
RUN npm run build

# production environment
FROM nginx:stable-alpine
RUN apk add --no-cache jq
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
COPY docker-entrypoint.sh generate_config_js.sh /
RUN chmod +x docker-entrypoint.sh generate_config_js.sh
 
ENTRYPOINT ["/docker-entrypoint.sh"]
