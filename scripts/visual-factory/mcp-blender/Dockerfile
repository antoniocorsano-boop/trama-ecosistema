FROM ubuntu@sha256:73b999393d07f2bf65a40373778a44dc9a6d54ad7718d29247d8ff9413c4d6a8
ARG LAB_UID
ARG LAB_GID
RUN apt-get update -q && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    python3 python3-venv xvfb xauth x11-utils ca-certificates fontconfig fonts-dejavu-core \
    libegl1 libegl-mesa0 libgl1 libgl1-mesa-dri libglx-mesa0 libvulkan1 \
    libx11-6 libxext6 libxi6 libxfixes3 libxrender1 libxxf86vm1 libxrandr2 \
    libxcursor1 libxinerama1 libxkbcommon0 libxkbcommon-x11-0 libxcomposite1 libxdamage1 \
    libsm6 libice6 libglib2.0-0t64 libdbus-1-3 libfontconfig1 libfreetype6 \
    libpulse0 libasound2t64 libgomp1 libstdc++6 libwayland-client0 \
    && rm -rf /var/lib/apt/lists/*
RUN (getent group "$LAB_GID" >/dev/null || groupadd -g "$LAB_GID" vf3d) \
    && (getent passwd "$LAB_UID" >/dev/null || useradd -M -u "$LAB_UID" -g "$LAB_GID" -d /work/home vf3d)
