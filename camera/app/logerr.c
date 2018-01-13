
#include "logerr.h"

#include <pthread.h>
#include <errno.h>

#include <stdio.h>
#include <stdint.h>
#include <string.h>
#include <inttypes.h>

/* TODO: Print GIT SHA1 on startup */

#define LOGERR_THREAD_SAFE

#ifdef LOGERR_THREAD_SAFE
static pthread_mutex_t logerr_mutex = PTHREAD_MUTEX_INITIALIZER;
#endif

const void * const log_pc(void)
{
    return __builtin_return_address(0);
}

void log_error(const void * const addr, const char * const format, ... )
{
    /* Get the time as soon as possible */
    time_t t;
    errno = 0;
    t = time(NULL);
    int t_errno = (t==-1) ? errno : 0;

#ifdef LOGERR_THREAD_SAFE
    /* Try to lock. In case of error report it and continue,
     * we cannot do something better. */
    int lock_err = pthread_mutex_lock(&logerr_mutex);
    if(lock_err!=0)
        (void)fprintf(stderr, "L%07X\n", lock_err);
#endif

    /* Print time or error and address */
    if(t_errno==0)
        (void)fprintf(stderr, "%08X %08"PRIXPTR" ", (uint32_t)t, (uintptr_t)addr);
    else
        (void)fprintf(stderr, "T%07X %08"PRIXPTR" ", (uint32_t)t_errno, (uintptr_t)addr);

    /* Print actual error */
    va_list ap;
    va_start(ap, format);
    (void)vfprintf(stderr, format, ap);
    va_end(ap);

    (void)printf("\n");

#ifdef LOGERR_THREAD_SAFE
    /* Unlock if lock was successful */
    if(lock_err==0)
    {
        int unlock_err = pthread_mutex_unlock(&logerr_mutex);

        if(unlock_err!=0)
            (void)fprintf(stderr, "U%07X\n", unlock_err);
    }
#endif
}

void log_errno(const void * const addr, const char * const format, ... )
{
    int caller_errno = errno;

    /* Get the time as soon as possible */
    time_t t;
    errno = 0;
    t = time(NULL);
    int t_errno = (t==-1) ? errno : 0;

#ifdef LOGERR_THREAD_SAFE
    /* Try to lock. In case of error report it and continue,
     * we cannot do something better. */
    int lock_err = pthread_mutex_lock(&logerr_mutex);
    if(lock_err!=0)
        (void)fprintf(stderr, "L%07X\n", lock_err);
#endif

    /* Print time or error and address */
    if(t_errno==0)
        (void)fprintf(stderr, "%08X %08"PRIXPTR" ", (uint32_t)t, (uintptr_t)addr);
    else
        (void)fprintf(stderr, "T%07X %08"PRIXPTR" ", (uint32_t)t_errno, (uintptr_t)addr);

    /* Print user error message */
    va_list ap;
    va_start(ap, format);
    (void)vfprintf(stderr, format, ap);
    va_end(ap);

    /* Print human readable errno */
    errno = 0;
    const char * strerr = strerror(caller_errno);

    if(errno==0)
        (void)fprintf(stderr, ": %s\n", strerr);
    else
        (void)fprintf(stderr, ": Unknown error (%d)\n", caller_errno);

#ifdef LOGERR_THREAD_SAFE
    /* Unlock if lock was successful */
    if(lock_err==0)
    {
        int unlock_err = pthread_mutex_unlock(&logerr_mutex);

        if(unlock_err!=0)
            (void)fprintf(stderr, "U%07X\n", unlock_err);
    }
#endif
}

