## buildstep base image
FROM balenalib/raspberrypi3-debian:buster-build

ENV OPENOCD_REPO  git://git.code.sf.net/p/openocd/code

WORKDIR /usr/src/app

## install required packages
RUN install_packages \
    git \
    pkg-config \
    autotools-dev \
    autoconf \
    automake \
    texinfo \
    libtool \
    libtool-bin \
    libusb-1.0 \
    libftdi-dev

COPY ./install.sh .
COPY ./board ./board
# clone and install openocd
RUN git clone --depth 1 --recursive ${OPENOCD_REPO} openocd-code && cd openocd-code && \
    autoreconf -vfi || autoreconf -vfi && ./configure \
        --enable-sysfsgpio \
        --enable-ft2232_libftdi \
    && make && make install
RUN mkdir -p /usr/src/app/openocd/local/share && \
    cp -R /usr/local/share/openocd /usr/src/app/openocd/local/share/ && \
    cp -R /usr/src/app/board/balena-fin /usr/src/app/openocd/local/share/openocd/scripts/board/ && \
    cp /usr/local/bin/openocd /usr/src/app/openocd/ && \
    cp /usr/src/app/install.sh /usr/src/app/openocd/ && cd /usr/src/app/openocd && \
    tar -czf openocd.tar.gz * && mv openocd.tar.gz /usr/src/app/

COPY ./start.sh ./

CMD ["bash", "/usr/src/app/start.sh"]
