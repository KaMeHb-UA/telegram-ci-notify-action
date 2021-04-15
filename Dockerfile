FROM alpine

RUN apk add --no-cache curl bash

COPY entrypoint.sh /

ENTRYPOINT [ "/entrypoint.sh" ]
