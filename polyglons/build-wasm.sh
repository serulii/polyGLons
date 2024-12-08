#!/bin/bash

set -eu

docker build -t rust-builder -f- . <<EOF
FROM rust:latest
RUN rustup target add wasm32-unknown-unknown
RUN apt update && apt install -y curl
RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
WORKDIR /code
COPY Cargo.toml .
RUN mkdir src && touch src/lib.rs # empty so we can cache deps
RUN wasm-pack build --release --target web --out-dir /tmp/ignore-cache-deps
RUN rm src/lib.rs
COPY src src
RUN wasm-pack build --release --target web --out-dir /target
RUN rm /target/.gitignore
EOF

docker run --name running-rust-builder rust-builder
rm -rf src/polyglons-wasm
docker cp running-rust-builder:/target src/polyglons-wasm
docker rm running-rust-builder

