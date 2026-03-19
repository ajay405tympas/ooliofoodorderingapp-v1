FROM golang:1.22-alpine

WORKDIR /app
COPY . .

RUN go mod tidy
RUN go build -o order-service ./cmd

EXPOSE 8083

CMD ["./order-service"]
