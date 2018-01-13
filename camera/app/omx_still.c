#include "omx_still.h"

#include <bcm_host.h>

#include "logerr.h"

#include "omx.h"
#include "omx_config.h"
#include "omx_parameter.h"
#include "omx_component.h"

#define JPEG_QUALITY                75        //    1 ..  100
#define JPEG_EXIF_DISABLE           OMX_FALSE
#define JPEG_IJG_ENABLE             OMX_FALSE
#define JPEG_THUMBNAIL_ENABLE       OMX_TRUE
#define JPEG_THUMBNAIL_WIDTH        64        //    0 .. 1024
#define JPEG_THUMBNAIL_HEIGHT       48        //    0 .. 1024
#define JPEG_PREVIEW                OMX_FALSE

//Some settings doesn't work well
#define CAM_WIDTH                   3280 // 2592
#define CAM_HEIGHT                  2464 // 1944
#define CAM_SHARPNESS               0         // -100 ..  100
#define CAM_CONTRAST                0         // -100 ..  100
#define CAM_BRIGHTNESS              50        //    0 ..  100
#define CAM_SATURATION              0         // -100 ..  100
#define CAM_SHUTTER_SPEED_AUTO      OMX_TRUE
//In microseconds, (1/8)*1e6
#define CAM_SHUTTER_SPEED           16000    //    1 ..
#define CAM_ISO_AUTO                OMX_TRUE
#define CAM_ISO                     100       //  100 ..  800
#define CAM_EXPOSURE                OMX_ExposureControlAuto
#define CAM_EXPOSURE_COMPENSATION   0         //  -24 ..   24
#define CAM_MIRROR                  OMX_MirrorNone
#define CAM_ROTATION                0         // 0 90 180 270
#define CAM_COLOR_ENABLE            OMX_FALSE
#define CAM_COLOR_U                 128       //    0 ..  255
#define CAM_COLOR_V                 128       //    0 ..  255
#define CAM_NOISE_REDUCTION         OMX_TRUE
#define CAM_FRAME_STABILIZATION     OMX_FALSE
#define CAM_METERING                OMX_MeteringModeAverage
#define CAM_WHITE_BALANCE           OMX_WhiteBalControlAuto
//The gains are used if the white balance is set to off
#define CAM_WHITE_BALANCE_RED_GAIN  1000      //    0 ..
#define CAM_WHITE_BALANCE_BLUE_GAIN 1000      //    0 ..
#define CAM_IMAGE_FILTER            OMX_ImageFilterNone
#define CAM_ROI_TOP                 0         //    0 ..  100
#define CAM_ROI_LEFT                0         //    0 ..  100
#define CAM_ROI_WIDTH               100       //    0 ..  100
#define CAM_ROI_HEIGHT              100       //    0 ..  100
#define CAM_DRC                     OMX_DynRangeExpOff

/*
   Possible values:

   CAM_EXPOSURE
   OMX_ExposureControlOff
   OMX_ExposureControlAuto
   OMX_ExposureControlNight
   OMX_ExposureControlBackLight
   OMX_ExposureControlSpotlight
   OMX_ExposureControlSports
   OMX_ExposureControlSnow
   OMX_ExposureControlBeach
   OMX_ExposureControlLargeAperture
   OMX_ExposureControlSmallAperture
   OMX_ExposureControlVeryLong
   OMX_ExposureControlFixedFps
   OMX_ExposureControlNightWithPreview
   OMX_ExposureControlAntishake
   OMX_ExposureControlFireworks

   CAM_IMAGE_FILTER
   OMX_ImageFilterNone
   OMX_ImageFilterEmboss
   OMX_ImageFilterNegative
   OMX_ImageFilterSketch
   OMX_ImageFilterOilPaint
   OMX_ImageFilterHatch
   OMX_ImageFilterGpen
   OMX_ImageFilterSolarize
   OMX_ImageFilterWatercolor
   OMX_ImageFilterPastel
   OMX_ImageFilterFilm
   OMX_ImageFilterBlur
   OMX_ImageFilterColourSwap
   OMX_ImageFilterWashedOut
   OMX_ImageFilterColourPoint
   OMX_ImageFilterPosterise
   OMX_ImageFilterColourBalance
   OMX_ImageFilterCartoon

   CAM_METERING
   OMX_MeteringModeAverage
   OMX_MeteringModeSpot
   OMX_MeteringModeMatrix

   CAM_MIRROR
   OMX_MirrorNone
   OMX_MirrorHorizontal
   OMX_MirrorVertical
   OMX_MirrorBoth

   CAM_WHITE_BALANCE
   OMX_WhiteBalControlOff
   OMX_WhiteBalControlAuto
   OMX_WhiteBalControlSunLight
   OMX_WhiteBalControlCloudy
   OMX_WhiteBalControlShade
   OMX_WhiteBalControlTungsten
   OMX_WhiteBalControlFluorescent
   OMX_WhiteBalControlIncandescent
   OMX_WhiteBalControlFlash
   OMX_WhiteBalControlHorizon

   CAM_DRC
   OMX_DynRangeExpOff
   OMX_DynRangeExpLow
   OMX_DynRangeExpMedium
   OMX_DynRangeExpHigh
   */

component_t camera;
component_t null_sink;
component_t encoder;

OMX_BUFFERHEADERTYPE* output_buffer;

void set_camera_settings(void) {
    LOG_COMPONENT(&camera, "configuring settings");

    OMX_ERRORTYPE error;

    error = omx_config_sharpness (camera.handle, OMX_ALL, CAM_SHARPNESS ); if(error) { exit(1); }
    error = omx_config_contrast  (camera.handle, OMX_ALL, CAM_CONTRAST  ); if(error) { exit(1); }
    error = omx_config_saturation(camera.handle, OMX_ALL, CAM_SATURATION); if(error) { exit(1); }
    error = omx_config_brightness(camera.handle, OMX_ALL, CAM_BRIGHTNESS); if(error) { exit(1); }
    error = omx_config_exposure_value(
            camera.handle,
            OMX_ALL,
            CAM_METERING,
            (CAM_EXPOSURE_COMPENSATION << 16)/6,
            0,
            OMX_FALSE,
            CAM_SHUTTER_SPEED,
            CAM_SHUTTER_SPEED_AUTO,
            CAM_ISO,
            CAM_ISO_AUTO); if(error) { exit(1); }
    error = omx_config_exposure           (camera.handle, OMX_ALL, CAM_EXPOSURE           ); if(error) { exit(1); }
    error = omx_config_frame_stabilisation(camera.handle, OMX_ALL, CAM_FRAME_STABILIZATION); if(error) { exit(1); }
    error = omx_config_white_balance      (camera.handle, OMX_ALL, CAM_WHITE_BALANCE      ); if(error) { exit(1); }

    //White balance gains (if white balance is set to off)
    if(!CAM_WHITE_BALANCE) {
        error = omx_config_white_balance_gains(camera.handle,
                (CAM_WHITE_BALANCE_RED_GAIN  << 16)/1000,
                (CAM_WHITE_BALANCE_BLUE_GAIN << 16)/1000); if(error) { exit(1); }
    }

    error = omx_config_image_filter(camera.handle, OMX_ALL, CAM_IMAGE_FILTER); if(error) { exit(1); }
    error = omx_config_mirror      (camera.handle,      72, CAM_MIRROR      ); if(error) { exit(1); }
    error = omx_config_rotation    (camera.handle,      72, CAM_ROTATION    ); if(error) { exit(1); }
    error = omx_config_color_enhancement(camera.handle, OMX_ALL, CAM_COLOR_ENABLE, CAM_COLOR_U, CAM_COLOR_V); if(error) { exit(1); }
    error = omx_config_denoise     (camera.handle,       CAM_NOISE_REDUCTION); if(error) { exit(1); }
    error = omx_config_input_crop_percentage(camera.handle, OMX_ALL,
            (CAM_ROI_LEFT   << 16)/100,
            (CAM_ROI_TOP    << 16)/100,
            (CAM_ROI_WIDTH  << 16)/100,
            (CAM_ROI_HEIGHT << 16)/100); if(error) { exit(1); }
    error = omx_config_dynamic_range_expansion(camera.handle, CAM_DRC); if(error) { exit(1); }
}

void set_jpeg_settings(void) {
    LOG_COMPONENT(&encoder, "configuring settings");

    OMX_ERRORTYPE error;

    error = omx_parameter_qfactor         (encoder.handle, 341, JPEG_QUALITY     ); if(error) { exit(1); }
    error = omx_parameter_brcm_exif       (encoder.handle,      JPEG_EXIF_DISABLE); if(error) { exit(1); }
    error = omx_parameter_brcm_ijg_scaling(encoder.handle, 341, JPEG_IJG_ENABLE  ); if(error) { exit(1); }
    error = omx_parameter_brcm_thumbnail  (encoder.handle,
            JPEG_THUMBNAIL_ENABLE,
            JPEG_PREVIEW,
            JPEG_THUMBNAIL_WIDTH,
            JPEG_THUMBNAIL_HEIGHT); if(error) { exit(1); }

    //EXIF tags
    //See firmware/documentation/ilcomponents/image_decode.html for valid keys
    error = omx_config_metadata_item(encoder.handle, OMX_MetadataScopePortLevel, 341, "IFD0.Make", "Raspberry Pi"); if(error) { exit(1); }
}

int round_up(int value, int divisor) {
    return (divisor + value - 1) & ~(divisor - 1);
}

void omx_still_open(void) {
    OMX_ERRORTYPE error;
    camera.name = "OMX.broadcom.camera";
    null_sink.name = "OMX.broadcom.null_sink";
    encoder.name = "OMX.broadcom.image_encode";

    //Initialize Broadcom's VideoCore APIs
    bcm_host_init();

    //Initialize OpenMAX IL
    error = omx_init(); if(error) { exit(1); }

    //Initialize components
    init_component(&camera);
    init_component(&null_sink);
    init_component(&encoder);

    //Initialize camera drivers
    load_camera_drivers(&camera);

    //Configure camera sensor
    LOG_COMPONENT(&camera, "configuring sensor");

    OMX_PARAM_SENSORMODETYPE sensor; OMX_INIT_STRUCTURE (sensor);

    sensor.nPortIndex = OMX_ALL;

    OMX_INIT_STRUCTURE (sensor.sFrameSize);

    sensor.sFrameSize.nPortIndex = OMX_ALL;

    error = omx_get_parameter(camera.handle, OMX_IndexParamCommonSensorMode, &sensor); if(error) { exit(1); }

    sensor.bOneShot = OMX_TRUE;
    sensor.sFrameSize.nWidth = CAM_WIDTH;
    sensor.sFrameSize.nHeight = CAM_HEIGHT;

    error = omx_set_parameter(camera.handle, OMX_IndexParamCommonSensorMode, &sensor); if(error) { exit(1); }

    //Configure camera port definition
    LOG_COMPONENT(&camera, "configuring still port definition");

    OMX_PARAM_PORTDEFINITIONTYPE port_def; OMX_INIT_STRUCTURE (port_def);

    port_def.nPortIndex = 72;

    error = omx_get_parameter(camera.handle, OMX_IndexParamPortDefinition, &port_def); if(error) { exit(1); }

    port_def.format.image.nFrameWidth        = CAM_WIDTH;
    port_def.format.image.nFrameHeight       = CAM_HEIGHT;
    port_def.format.image.eCompressionFormat = OMX_IMAGE_CodingUnused;
    port_def.format.image.eColorFormat       = OMX_COLOR_FormatYUV420PackedPlanar;
    //Stride is byte-per-pixel*width, YUV has 1 byte per pixel, so the stride is
    //the width (rounded up to the nearest multiple of 16).
    //See mmal/util/mmal_util.c, mmal_encoding_width_to_stride()
    port_def.format.image.nStride            = round_up(CAM_WIDTH, 32);

    error = omx_set_parameter(camera.handle, OMX_IndexParamPortDefinition, &port_def); if(error) { exit(1); }

    LOG_COMPONENT(&camera, "configuring preview port definition");

    //Configure preview port
    //In theory the fastest resolution and framerate are 1920x1080 @30fps because
    //these are the default settings for the preview port, so the frames don't
    //need to be resized. In practice, this is not true. The fastest way to
    //produce stills is setting the lowest resolution, that is, 640x480 @30fps.
    //The difference between 1920x1080 @30fps and 640x480 @30fps is a speed boost
    //of ~4%, from ~1083ms to ~1039ms
    port_def.nPortIndex = 70;

    error = omx_get_parameter(camera.handle, OMX_IndexParamPortDefinition, &port_def); if(error) { exit(1); }

    port_def.format.video.nFrameWidth = 640;
    port_def.format.video.nFrameHeight = 480;
    port_def.format.video.eCompressionFormat = OMX_IMAGE_CodingUnused;
    port_def.format.video.eColorFormat = OMX_COLOR_FormatYUV420PackedPlanar;
    //Setting the framerate to 0 unblocks the shutter speed from 66ms to 772ms
    //The higher the speed, the higher the capture time
    port_def.format.video.xFramerate = 0;
    port_def.format.video.nStride = 640;

    error = omx_set_parameter(camera.handle, OMX_IndexParamPortDefinition, &port_def); if(error) { exit(1); }

    //Configure camera settings
    set_camera_settings();

    //Configure encoder port definition
    LOG_COMPONENT(&encoder, "configuring encoder port definition");

    OMX_INIT_STRUCTURE (port_def);

    port_def.nPortIndex = 341;

    error = omx_get_parameter(encoder.handle, OMX_IndexParamPortDefinition, &port_def); if(error) { exit(1); }

    port_def.format.image.nFrameWidth        = CAM_WIDTH;
    port_def.format.image.nFrameHeight       = CAM_HEIGHT;
    port_def.format.image.eCompressionFormat = OMX_IMAGE_CodingJPEG;
    port_def.format.image.eColorFormat       = OMX_COLOR_FormatUnused;

    error = omx_set_parameter(encoder.handle, OMX_IndexParamPortDefinition, &port_def); if(error) { exit(1); }

    //Configure JPEG settings
    set_jpeg_settings();

    //Setup tunnels: camera (still) -> image_encode, camera (preview) -> null_sink
    LOG_MESSAGE("configuring tunnels");

    error = omx_setup_tunnel(camera.handle, 72, encoder.handle,   340); if(error) { exit(1); }
    error = omx_setup_tunnel(camera.handle, 70, null_sink.handle, 240); if(error) { exit(1); }

    //Change state to IDLE
    change_state(&camera,    OMX_StateIdle); wait(&camera,    EVENT_STATE_SET, 0);
    change_state(&null_sink, OMX_StateIdle); wait(&null_sink, EVENT_STATE_SET, 0);
    change_state(&encoder,   OMX_StateIdle); wait(&encoder,   EVENT_STATE_SET, 0);

    //Enable the tunnel ports
    enable_port(&camera,     72); wait(&camera,    EVENT_PORT_ENABLE, 0);
    enable_port(&camera,     70); wait(&camera,    EVENT_PORT_ENABLE, 0);
    enable_port(&null_sink, 240); wait(&null_sink, EVENT_PORT_ENABLE, 0);
    enable_port(&encoder,   340); wait(&encoder,   EVENT_PORT_ENABLE, 0);

    port_enable_allocate_buffer(&encoder, &output_buffer, 341);

}

void omx_still_close(void) {
    OMX_ERRORTYPE error;

    //Disable the tunnel ports
    port_disable_free_buffer(&encoder, output_buffer, 341);

    disable_port(&camera,     72);
    disable_port(&camera,     70);
    disable_port(&null_sink, 240);
    disable_port(&encoder,   340);

    //Change state to LOADED
    change_state(&camera,    OMX_StateLoaded); wait(&camera,    EVENT_STATE_SET, 0);
    change_state(&null_sink, OMX_StateLoaded); wait(&null_sink, EVENT_STATE_SET, 0);
    change_state(&encoder,   OMX_StateLoaded); wait(&encoder,   EVENT_STATE_SET, 0);

    //Deinitialize components
    deinit_component(&camera   );
    deinit_component(&null_sink);
    deinit_component(&encoder  );

    //Deinitialize OpenMAX IL
    error = omx_deinit(); if(error) { exit(1); }

    //Deinitialize Broadcom's VideoCore APIs
    bcm_host_deinit();
}

void omx_still_shoot(const buffer_output_handler handler) {
    OMX_ERRORTYPE error;

    //Change state to EXECUTING
    change_state(&camera,    OMX_StateExecuting); wait(&camera,    EVENT_STATE_SET, 0);
    change_state(&null_sink, OMX_StateExecuting); wait(&null_sink, EVENT_STATE_SET, 0);
    change_state(&encoder,   OMX_StateExecuting); wait(&encoder,   EVENT_STATE_SET, 0);

    //Enable camera capture port. This basically says that the port 72 will be
    //used to get data from the camera. If you're capturing video, the port 71
    //must be used
    LOG_COMPONENT(&camera, "enabling capture port");
    error = omx_config_port_capturing(camera.handle, 72, OMX_TRUE); if(error) { exit(1); }

    //Start consuming the buffers
    VCOS_UNSIGNED end_flags = EVENT_BUFFER_FLAG | EVENT_FILL_BUFFER_DONE;
    VCOS_UNSIGNED retrieves_events;

    while(1) {
        //Get the buffer data (a slice of the image)
        error = omx_fill_this_buffer(encoder.handle, output_buffer); if(error) { exit(1); }

        //Wait until it's filled
        wait(&encoder, EVENT_FILL_BUFFER_DONE, &retrieves_events);

        handler(&output_buffer->pBuffer[output_buffer->nOffset], output_buffer->nFilledLen);

        //When it's the end of the stream, an OMX_EventBufferFlag is emitted in the
        //camera and image_encode components. Then the FillBufferDone function is
        //called in the image_encode
        if(retrieves_events == end_flags) {
            //Clear the EOS flags
            wait(&camera, EVENT_BUFFER_FLAG, 0);
            wait(&encoder, EVENT_BUFFER_FLAG, 0);
            break;
        }
    }

    LOG_MESSAGE("------------------------------------------------");

    //Disable camera capture port
    LOG_COMPONENT(&camera, "disabling capture port");
    error = omx_config_port_capturing(camera.handle, 72, OMX_FALSE); if(error) { exit(1); }

    //Change state to IDLE
    change_state(&camera,    OMX_StateIdle); wait(&camera,    EVENT_STATE_SET, 0);
    change_state(&null_sink, OMX_StateIdle); wait(&null_sink, EVENT_STATE_SET, 0);
    change_state(&encoder,   OMX_StateIdle); wait(&encoder,   EVENT_STATE_SET, 0);
}

