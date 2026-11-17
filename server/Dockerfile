# L'image du SERVEUR (l'API) de Quiz M9. Contexte de construction : la
# racine du dépôt, là où vivent package-lock.json et les workspaces.
FROM node:24-alpine
WORKDIR /app

# Les manifestes d'abord, le code ensuite : tant qu'ils ne changent pas,
# la couche npm ci est reprise du cache au prochain build.
COPY package.json package-lock.json ./
COPY server/package.json server/
COPY client/package.json client/
RUN npm ci -w server --omit=dev

COPY server/ server/

WORKDIR /app/server
# La base n'est plus dans l'image : DATABASE_URL vient de compose.yml.
ENV PORT=3000
EXPOSE 3000
CMD ["node", "src/server.js"]
