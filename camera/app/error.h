#ifndef  ERROR_INC
#define  ERROR_INC

enum error_code {
    OK,
    ERROR
};

#define WARN_UNUSED __attribute__((warn_unused_result))

#endif
