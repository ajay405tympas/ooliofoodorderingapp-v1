# ---------- Stage 1: Build ----------
FROM golang:1.22-alpine AS builder

# Install git (required for Go modules sometimes)
RUN apk add --no-cache git

WORKDIR /app

# Copy go mod files first (for caching)
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o menuService ./cmd

# ---------- Stage 2: Runtime ----------
FROM alpine:3.19

# Install certificates (for HTTPS calls if needed)
RUN apk add --no-cache ca-certificates

WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/menuService .

# Expose port
EXPOSE 8082

# Run binary
CMD ["./menuService"]