# Build stage
FROM golang:1.22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache git
COPY go.mod ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o app .

# Run stage
FROM alpine:3.19
WORKDIR /app
RUN adduser -D appuser
USER appuser
COPY --from=builder /app/app /app/app
ENV PORT=8080
EXPOSE 8080
CMD ["/app/app"]
