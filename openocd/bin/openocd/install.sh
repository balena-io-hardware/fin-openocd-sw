#!/usr/bin/env bash

cp -R share/openocd /usr/share/
cp -R board/balena-fin /usr/share/openocd/scripts/board/ 
chmod +x bin/openocd && cp bin/openocd /usr/bin/openocd
