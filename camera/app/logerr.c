
#include "logerr.h"

#include <pthread.h>

#include <stdio.h>
#include <stdint.h>
#include <string.h>
#include <inttypes.h>

/* TODO: Print GIT SHA1 on startup */

#define LOGERR_THREAD_SAFE

#ifdef LOGERR_THREAD_SAFE
static pthread_mutex_t logerr_mutex = PTHREAD_MUTEX_INITIALIZER;
#endif

void (*logerr)(const char * const message) = NULL;

const void * const log_pc(void)
{
    return __builtin_return_address(0);
}

static void log_message(const char * const message)
{
    (void)fputs(message, stderr);
    (void)fputs("\n", stderr);

    if(logerr)
        logerr(message);
}

void log_error(int caller_errno, const void * const addr, const char * const format, ... )
{
    /* Get the time as soon as possible */
    time_t t;
    errno = 0;
    t = time(NULL);
    int result;

    char message[1024];

#ifdef LOGERR_THREAD_SAFE
    /* Try to lock. In case of error report it and continue,
     * we cannot do something better. */
    int lock_err = pthread_mutex_lock(&logerr_mutex);
    if(lock_err!=0)
    {
        result = snprintf(&message[0], sizeof(message), "L%08X", lock_err);

        if(result>0)
            log_message(message);
    }
#endif

    size_t size = 0;

    /* Print error time and address */
    result = snprintf(&message[size], sizeof(message)-size, "%08X %08"PRIXPTR" ", (uint32_t)t, (uintptr_t)addr);

    if(result>0)
        size += result;

    /* Print human readable errno */
    if(caller_errno)
    {
        errno = 0;
        const char * strerr = strerror(caller_errno);

        result = snprintf(&message[size], sizeof(message)-size, ": \"%s\" errno(%d)", errno==0 ? strerr : "Unknown", caller_errno);

        if(result>0)
            size += result;
    }

    /* Print actual error */
    va_list ap;
    va_start(ap, format);
    result = vsnprintf(&message[size], sizeof(message)-size, format, ap);
    va_end(ap);

    if(result>0)
        size += result;

    log_message(message);

#ifdef LOGERR_THREAD_SAFE
    /* Unlock if lock was successful */
    if(lock_err==0)
    {
        int unlock_err = pthread_mutex_unlock(&logerr_mutex);

        if(unlock_err!=0)
        {
            result = snprintf(&message[0], sizeof(message), "U%08X\n", unlock_err);

            if(result>0)
                log_message(message);
        }
    }
#endif
}

