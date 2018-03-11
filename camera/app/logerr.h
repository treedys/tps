/*
 * =====================================================================================
 *
 *       Filename:  logerr.h
 *
 *    Description:  Log errors
 *
 *        Version:  1.0
 *        Created:  09/23/2012 12:43:13 AM
 *       Revision:  none
 *       Compiler:  gcc
 *
 *         Author:  Atanas Palavrov (), palavrov@gmail.com
 *        Company:  codigi
 *
 * =====================================================================================
 */

#ifndef  LOGERR_LOGERR_INC
#define  LOGERR_LOGERR_INC

#include <stdarg.h>
#include <errno.h>

#define LOG_ERROR(format, ... ) do { log_error(    0, log_pc(), format, ##__VA_ARGS__); } while(0)
#define LOG_ERRNO(format, ... ) do { log_error(errno, log_pc(), format, ##__VA_ARGS__); } while(0)

#define LOG_MESSAGE(fmt, ...) // LOG_ERROR(fmt, ##__VA_ARGS__)

extern void (*logerr)(const char * const message);

const void * const log_pc(void);

__attribute__((format(printf,3,4)))
void log_error(int caller_errno, const void * const addr, const char * const format, ... );

#endif
