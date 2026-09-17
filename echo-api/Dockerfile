# A digest-pinned official Go image is required for reproducible builds, e.g.
# docker build --build-arg GO_BUILDER_IMAGE=golang:1.26.4-alpine@sha256:<digest> .
ARG GO_BUILDER_IMAGE
FROM ${GO_BUILDER_IMAGE} AS build

WORKDIR /src
COPY go.mod ./
COPY main.go ./

# The module uses only the Go standard library. Trim host paths and build IDs
# so the executable is repeatable for a fixed digest-pinned builder image.
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags='-s -w -buildid=' -o /out/echo-backend .

FROM scratch
COPY --from=build /out/echo-backend /echo-backend

EXPOSE 8080
USER 65532:65532
ENTRYPOINT ["/echo-backend"]
