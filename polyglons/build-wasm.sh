#!/bin/bash

set -eu

docker build -t rust-builder -f- . <<EOF
FROM rust:latest
WORKDIR /code
RUN apt update && apt install -y curl
RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
COPY Cargo.toml .
COPY src src
RUN wasm-pack build --release --target web --out-dir /target
RUN rm /target/.gitignore
EOF

rm -rf src/polyglons-wasm
docker run --name running-rust-builder rust-builder
docker cp running-rust-builder:/target src/polyglons-wasm
docker rm running-rust-builder

