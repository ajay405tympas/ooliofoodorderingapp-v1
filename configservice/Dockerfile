FROM golang:1.22-alpine AS builder

RUN apk add --no-cache git

WORKDIR /app
COPY . .

RUN go mod tidy
RUN go build -o config-service ./cmd

FROM alpine:3.19

WORKDIR /root/
COPY --from=builder /app/config-service .
COPY --from=builder /app/config.yaml .

EXPOSE 8085

CMD ["./config-service"]
