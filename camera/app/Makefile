
CFLAGS += -DSTANDALONE -D__STDC_CONSTANT_MACROS -D__STDC_LIMIT_MACROS \
		  -DTARGET_POSIX -D_LINUX -DPIC -D_REENTRANT -D_LARGEFILE64_SOURCE \
		  -D_FILE_OFFSET_BITS=64 -U_FORTIFY_SOURCE -DHAVE_LIBOPENMAX=2 -DOMX \
		  -DOMX_SKIP64BIT -ftree-vectorize -pipe -DUSE_EXTERNAL_OMX \
		  -DHAVE_LIBBCM_HOST -DUSE_EXTERNAL_LIBBCM_HOST -DUSE_VCHIQ_ARM -fPIC \
		  -ftree-vectorize -pipe -Werror -g -Wall

LDFLAGS += -lopenmaxil -lbcm_host -lvcos -lvchiq_arm -lpthread

camera-app: camera-app.o dump.o logerr.o omx.o omx_config.o omx_parameter.o omx_component.o omx_still.o

clean:
	rm -f camera-app camera-app.o dump.o logerr.o omx.o omx_config.o omx_parameter.o omx_component.o omx_still.o

all: camera-app

.PHONY: clean
