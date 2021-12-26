ARG NODE_VERSION=16.10.0
FROM node:${NODE_VERSION}
ENV NODE_ENV=production
WORKDIR /app
COPY ./ /app/
RUN cd /app \
        && npm install --production
EXPOSE 3000
ENTRYPOINT [ "node" ]
CMD [ "/app/index.js" ]