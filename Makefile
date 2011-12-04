SRC_DIR = src
THEMES_DIR = themes
BUILD_DIR = build

PREFIX = .
DIST_DIR = ${PREFIX}/dist

JS_ENGINE ?= `which node nodejs 2>/dev/null`
COMPILER = ${JS_ENGINE} ${BUILD_DIR}/uglify.js --unsafe
POST_COMPILER = ${JS_ENGINE} ${BUILD_DIR}/post-compile.js

BASE_FILES = ${SRC_DIR}/markupParams.js\
    ${SRC_DIR}/metroTile.js\
	${SRC_DIR}/metroTileGroup.js\
	${SRC_DIR}/metroSection.js\
	${SRC_DIR}/metroScrollBar.js\
	${SRC_DIR}/metroControlsMenu.js\
	${SRC_DIR}/metro.js

MODULES = ${SRC_DIR}/intro.js\
	${BASE_FILES}\
	${SRC_DIR}/outro.js

JQM = ${DIST_DIR}/jquery.metro.js
JQM_MIN = ${DIST_DIR}/jquery.metro.min.js

JQM_VER = $(shell cat version.txt)
VER = sed "s/@VERSION/${JQM_VER}/"

DATE=$(shell git log -1 --pretty=format:%ad)

all: core

core: jquery_metro min
	@@echo "jQuery Metro Plugin build complete."

${DIST_DIR}:
	@@mkdir -p ${DIST_DIR}

jquery_metro: ${JQM}
	@@cp -R ${THEMES_DIR} ${DIST_DIR}

${JQM}: ${MODULES} | ${DIST_DIR}
	@@echo "Building" ${JQM}

	@@cat ${MODULES} | \
		sed 's/.function..jQuery...{//' | \
		sed 's/}...jQuery..;//' | \
		sed 's/@DATE/'"${DATE}"'/' | \
		${VER} > ${JQM};

min: jquery_metro ${JQM_MIN}

${JQM_MIN}: ${JQM}
	@@if test ! -z ${JS_ENGINE}; then \
		echo "Minifying jQuery Metro Plugin" ${JQ_MIN}; \
		${COMPILER} ${JQM} > ${JQM_MIN}.tmp; \
		${POST_COMPILER} ${JQM_MIN}.tmp > ${JQM_MIN}; \
		rm -f ${JQM_MIN}.tmp; \
	else \
		echo "You must have NodeJS installed in order to minify jQuery Metro Plugin."; \
	fi

clean:
	@@echo "Removing Distribution directory:" ${DIST_DIR}
	@@rm -rf ${DIST_DIR}

distclean: clean

.PHONY: all jquery_metro min clean distclean core