#ifndef  OMX_CONFIG_INC
#define  OMX_CONFIG_INC

/*****************************************************************************/

#include <IL/OMX_Broadcom.h>

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_config_sharpness(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_S32        nSharpness);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_config_contrast(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_S32        nContrast);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_config_saturation(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_S32        nSaturation);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_config_brightness(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_S32        nBrightness);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_config_exposure_value(
        OMX_IN OMX_HANDLETYPE   hComponent,
        OMX_U32                 nPortIndex,
        OMX_IN OMX_METERINGTYPE eMetering,
        OMX_IN OMX_S32          xEVCompensation,
        OMX_IN OMX_U32          nApertureFNumber,
        OMX_IN OMX_BOOL         bAutoAperture,
        OMX_IN OMX_U32          nShutterSpeedMsec,
        OMX_IN OMX_BOOL         bAutoShutterSpeed,
        OMX_IN OMX_U32          nSensitivity,
        OMX_IN OMX_BOOL         bAutoSensitivity);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_config_exposure(
        OMX_IN OMX_HANDLETYPE          hComponent,
        OMX_IN OMX_U32                 nPortIndex,
        OMX_IN OMX_EXPOSURECONTROLTYPE eExposureControl);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_config_frame_stabilisation(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_BOOL       bStab);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_config_white_balance(
        OMX_IN OMX_HANDLETYPE   hComponent,
        OMX_IN OMX_U32          nPortIndex,
        OMX_WHITEBALCONTROLTYPE eWhiteBalControl);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_config_white_balance_gains(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        xGainR,
        OMX_IN OMX_U32        xGainB);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_config_image_filter(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IMAGEFILTERTYPE   eImageFilter);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_config_mirror(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_MIRRORTYPE        eMirror);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_config_rotation(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_S32        nRotation);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_config_color_enhancement(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_BOOL       bColorEnhancement,
        OMX_IN OMX_U8         nCustomizedU,
        OMX_IN OMX_U8         nCustomizedV);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_config_denoise(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_BOOL       bEnabled);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_config_input_crop_percentage(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_U32        xLeft,
        OMX_IN OMX_U32        xTop,
        OMX_IN OMX_U32        xWidth,
        OMX_IN OMX_U32        xHeight);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_config_dynamic_range_expansion(
        OMX_IN OMX_HANDLETYPE                    hComponent,
        OMX_IN OMX_DYNAMICRANGEEXPANSIONMODETYPE eMode);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_config_port_capturing(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_BOOL       bEnabled);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_config_request_callback(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_INDEXTYPE  nIndex,
        OMX_IN OMX_BOOL       bEnable);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_config_metadata_item(
        OMX_IN OMX_HANDLETYPE        hComponent,
        OMX_IN OMX_METADATASCOPETYPE eScopeMode,
        OMX_IN OMX_U32               nScopeSpecifier,
        OMX_IN char                 *nKey,
        OMX_IN char                 *nValue);

/*****************************************************************************/

#endif
