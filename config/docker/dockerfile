FROM node:15.8.0-alpine as build

WORKDIR /frontend
COPY package*.json ./
RUN npm cache verify 
# && npm --update-checksums
COPY . ./
CMD ["npm", "build"]
# RUN npm && npm run build

# Stage - Production
FROM nginx:1.17-alpine
COPY --from=build /frontend/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

#Development

# FROM node:15.8.0-alpine as dev 

# WORKDIR /frontend
# COPY package*.json ./
# RUN npm cache verify && npm --update-checksums
# COPY . ./
# EXPOSE 3000
# CMD ["npm", "start"]