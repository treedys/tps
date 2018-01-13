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

#define LOG_ERROR(format, ... ) do { log_error(log_pc(), format, ##__VA_ARGS__); } while(0)
#define LOG_ERRNO(format, ... ) do { log_errno(log_pc(), format, ##__VA_ARGS__); } while(0)

#define LOG_MESSAGE(fmt, ...) // LOG_ERROR(fmt, ##__VA_ARGS__)

const void * const log_pc(void);

__attribute__((format(printf,2,3)))
void log_error(const void * const addr, const char * const format, ... );

__attribute__((format(printf,2,3)))
void log_errno(const void * const addr, const char * const format, ... );

#endif
