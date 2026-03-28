FROM golang:1.21-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download || true
RUN go mod tidy

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/server/main.go

# ---- Runtime ----
FROM alpine:3.19

WORKDIR /app

RUN apk --no-cache add ca-certificates

COPY --from=builder /app/main .

EXPOSE 8080

CMD ["/app/main"]
