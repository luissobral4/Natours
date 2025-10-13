FROM node:22-alpine as final
WORKDIR /app

COPY package*.json ./
RUN npm install --only=prodution

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]


FROM node:22-alpine as update-db-build
WORKDIR /app

COPY ./dev-data/ ./dev-data/
COPY ./models/ ./models/ 

RUN npm install mongoose dotenv slugify validator bcryptjs


FROM update-db-build as update-db
CMD ["node", "dev-data/data/import-dev-data.js", "--import"]

FROM update-db-build as clean-db
CMD ["node", "dev-data/data/import-dev-data.js", "--delete"]