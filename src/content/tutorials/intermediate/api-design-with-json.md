# JSON을 활용한 API 설계

RESTful API에서 JSON을 효과적으로 활용하여 일관성 있고 사용하기 쉬운 API를 설계하는 방법을 학습해봅시다.

## API 설계 기본 원칙

### 1. 일관성 있는 응답 구조

모든 API 응답은 일관된 구조를 가져야 합니다.

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "name": "홍길동",
      "email": "hong@example.com"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0",
    "request_id": "req-abc123"
  }
}
```

### 2. 오류 응답 표준화

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력 데이터가 유효하지 않습니다",
    "details": [
      {
        "field": "email",
        "code": "INVALID_FORMAT",
        "message": "이메일 형식이 올바르지 않습니다"
      },
      {
        "field": "age",
        "code": "OUT_OF_RANGE",
        "message": "나이는 0보다 커야 합니다"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req-def456"
  }
}
```

## RESTful API 설계 패턴

### 1. 리소스 중심 설계

#### 사용자 관리 API

```json
// GET /api/v1/users - 사용자 목록 조회
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "profile": {
          "first_name": "John",
          "last_name": "Doe",
          "avatar_url": "https://example.com/avatars/john.jpg"
        },
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ]
  },
  "meta": {
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total_pages": 5,
      "total_count": 100
    }
  }
}

// GET /api/v1/users/123 - 특정 사용자 조회
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "username": "hong_gildong",
      "email": "hong@example.com",
      "profile": {
        "first_name": "길동",
        "last_name": "홍",
        "bio": "소프트웨어 개발자",
        "location": "서울, 대한민국",
        "website": "https://hong.dev",
        "avatar_url": "https://example.com/avatars/hong.jpg"
      },
      "settings": {
        "theme": "dark",
        "language": "ko",
        "timezone": "Asia/Seoul",
        "notifications": {
          "email": true,
          "push": false,
          "sms": true
        }
      },
      "stats": {
        "posts_count": 42,
        "followers_count": 156,
        "following_count": 89
      },
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "last_login_at": "2024-01-15T09:45:00Z"
    }
  }
}

// POST /api/v1/users - 새 사용자 생성
// Request Body:
{
  "user": {
    "username": "new_user",
    "email": "newuser@example.com",
    "password": "securePassword123!",
    "profile": {
      "first_name": "새로운",
      "last_name": "사용자",
      "bio": "안녕하세요!"
    }
  }
}

// Response:
{
  "success": true,
  "data": {
    "user": {
      "id": 124,
      "username": "new_user",
      "email": "newuser@example.com",
      "profile": {
        "first_name": "새로운",
        "last_name": "사용자",
        "bio": "안녕하세요!",
        "avatar_url": null
      },
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  },
  "meta": {
    "message": "사용자가 성공적으로 생성되었습니다"
  }
}
```

### 2. 중첩 리소스 설계

#### 게시글과 댓글 API

```json
// GET /api/v1/posts/456/comments - 특정 게시글의 댓글 목록
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": 789,
        "content": "좋은 글이네요!",
        "author": {
          "id": 123,
          "username": "commenter1",
          "avatar_url": "https://example.com/avatars/commenter1.jpg"
        },
        "replies_count": 2,
        "likes_count": 5,
        "created_at": "2024-01-15T08:00:00Z",
        "updated_at": "2024-01-15T08:00:00Z"
      }
    ]
  },
  "meta": {
    "post_id": 456,
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total_count": 25
    }
  }
}

// POST /api/v1/posts/456/comments - 댓글 작성
// Request Body:
{
  "comment": {
    "content": "훌륭한 내용입니다. 감사합니다!",
    "parent_id": null
  }
}

// Response:
{
  "success": true,
  "data": {
    "comment": {
      "id": 790,
      "content": "훌륭한 내용입니다. 감사합니다!",
      "author": {
        "id": 124,
        "username": "new_user",
        "avatar_url": null
      },
      "parent_id": null,
      "replies_count": 0,
      "likes_count": 0,
      "created_at": "2024-01-15T10:35:00Z",
      "updated_at": "2024-01-15T10:35:00Z"
    }
  }
}
```

### 3. 필터링과 정렬

```json
// GET /api/v1/products?category=electronics&price_min=100000&price_max=500000&sort=price_asc&page=1&limit=20
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1001,
        "name": "무선 이어폰",
        "description": "고품질 무선 이어폰",
        "price": 150000,
        "currency": "KRW",
        "category": {
          "id": 10,
          "name": "전자제품",
          "slug": "electronics"
        },
        "brand": {
          "id": 5,
          "name": "TechBrand",
          "logo_url": "https://example.com/brands/techbrand.jpg"
        },
        "images": [
          {
            "id": 2001,
            "url": "https://example.com/products/1001/main.jpg",
            "alt": "무선 이어폰 메인 이미지",
            "is_primary": true
          }
        ],
        "specifications": {
          "color": "블랙",
          "weight": "45g",
          "battery_life": "24시간",
          "connectivity": ["Bluetooth 5.0", "USB-C"]
        },
        "inventory": {
          "in_stock": true,
          "quantity": 50,
          "warehouse_location": "서울"
        },
        "ratings": {
          "average": 4.5,
          "count": 128
        },
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ]
  },
  "meta": {
    "filters": {
      "category": "electronics",
      "price_range": {
        "min": 100000,
        "max": 500000
      }
    },
    "sort": {
      "field": "price",
      "direction": "asc"
    },
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total_pages": 3,
      "total_count": 45
    }
  }
}
```

## 고급 API 패턴

### 1. 배치 작업 API

```json
// POST /api/v1/users/batch - 여러 사용자 일괄 처리
// Request Body:
{
  "operations": [
    {
      "operation": "create",
      "data": {
        "username": "user1",
        "email": "user1@example.com",
        "profile": {
          "first_name": "사용자",
          "last_name": "일"
        }
      }
    },
    {
      "operation": "update",
      "id": 123,
      "data": {
        "profile": {
          "bio": "업데이트된 소개"
        }
      }
    },
    {
      "operation": "delete",
      "id": 124
    }
  ]
}

// Response:
{
  "success": true,
  "data": {
    "results": [
      {
        "operation": "create",
        "success": true,
        "data": {
          "user": {
            "id": 125,
            "username": "user1",
            "email": "user1@example.com"
          }
        }
      },
      {
        "operation": "update",
        "id": 123,
        "success": true,
        "data": {
          "user": {
            "id": 123,
            "profile": {
              "bio": "업데이트된 소개"
            }
          }
        }
      },
      {
        "operation": "delete",
        "id": 124,
        "success": false,
        "error": {
          "code": "USER_NOT_FOUND",
          "message": "사용자를 찾을 수 없습니다"
        }
      }
    ]
  },
  "meta": {
    "total_operations": 3,
    "successful_operations": 2,
    "failed_operations": 1
  }
}
```

### 2. 검색 API

```json
// POST /api/v1/search - 통합 검색
// Request Body:
{
  "query": "JSON 파서",
  "filters": {
    "type": ["posts", "users", "products"],
    "date_range": {
      "start": "2024-01-01",
      "end": "2024-01-15"
    },
    "tags": ["json", "parser", "tutorial"]
  },
  "sort": {
    "field": "relevance",
    "direction": "desc"
  },
  "pagination": {
    "page": 1,
    "limit": 20
  }
}

// Response:
{
  "success": true,
  "data": {
    "results": [
      {
        "type": "post",
        "id": 456,
        "title": "JSON 파서 구현하기",
        "excerpt": "JavaScript로 JSON 파서를 구현하는 방법을 알아봅시다...",
        "author": {
          "id": 123,
          "username": "developer",
          "avatar_url": "https://example.com/avatars/developer.jpg"
        },
        "tags": ["json", "parser", "javascript"],
        "created_at": "2024-01-10T15:30:00Z",
        "relevance_score": 0.95,
        "highlight": {
          "title": "<mark>JSON 파서</mark> 구현하기",
          "content": "JavaScript로 <mark>JSON</mark> <mark>파서</mark>를 구현하는..."
        }
      },
      {
        "type": "user",
        "id": 789,
        "username": "json_expert",
        "profile": {
          "first_name": "JSON",
          "last_name": "전문가",
          "bio": "JSON과 데이터 파싱 전문가입니다"
        },
        "stats": {
          "posts_count": 25,
          "followers_count": 340
        },
        "relevance_score": 0.87
      }
    ]
  },
  "meta": {
    "query": "JSON 파서",
    "total_results": 156,
    "results_by_type": {
      "posts": 89,
      "users": 12,
      "products": 55
    },
    "search_time_ms": 45,
    "suggestions": [
      "JSON parser",
      "JSON 라이브러리",
      "데이터 파싱"
    ]
  }
}
```

### 3. 파일 업로드 API

```json
// POST /api/v1/files/upload - 파일 업로드 (multipart/form-data)
// Response:
{
  "success": true,
  "data": {
    "file": {
      "id": "file_abc123",
      "original_name": "document.pdf",
      "filename": "2024/01/15/abc123_document.pdf",
      "mime_type": "application/pdf",
      "size": 2048576,
      "url": "https://cdn.example.com/files/2024/01/15/abc123_document.pdf",
      "thumbnail_url": "https://cdn.example.com/thumbnails/abc123_thumb.jpg",
      "metadata": {
        "width": null,
        "height": null,
        "pages": 10,
        "duration": null
      },
      "uploaded_by": {
        "id": 123,
        "username": "uploader"
      },
      "uploaded_at": "2024-01-15T10:30:00Z"
    }
  }
}

// GET /api/v1/files/file_abc123 - 파일 정보 조회
{
  "success": true,
  "data": {
    "file": {
      "id": "file_abc123",
      "original_name": "document.pdf",
      "filename": "2024/01/15/abc123_document.pdf",
      "mime_type": "application/pdf",
      "size": 2048576,
      "url": "https://cdn.example.com/files/2024/01/15/abc123_document.pdf",
      "download_url": "https://api.example.com/v1/files/file_abc123/download",
      "access_control": {
        "is_public": false,
        "allowed_users": [123, 456],
        "expires_at": "2024-02-15T10:30:00Z"
      },
      "stats": {
        "download_count": 15,
        "view_count": 42
      },
      "uploaded_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

## 버전 관리 전략

### 1. URL 기반 버전 관리

```json
// v1 API
// GET /api/v1/users/123
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "name": "홍길동",
      "email": "hong@example.com"
    }
  }
}

// v2 API - 구조 변경
// GET /api/v2/users/123
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "profile": {
        "full_name": "홍길동",
        "display_name": "길동",
        "contact": {
          "email": "hong@example.com",
          "phone": "+82-10-1234-5678"
        }
      }
    }
  },
  "meta": {
    "api_version": "2.0",
    "deprecated_fields": [],
    "migration_guide": "https://docs.example.com/api/v2/migration"
  }
}
```

### 2. 헤더 기반 버전 관리

```json
// Request Headers:
// Accept: application/vnd.api+json;version=2
// API-Version: 2.0

// Response:
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "attributes": {
        "full_name": "홍길동",
        "email": "hong@example.com"
      }
    }
  },
  "meta": {
    "api_version": "2.0",
    "supported_versions": ["1.0", "2.0"],
    "latest_version": "2.0"
  }
}
```

## 오류 처리 패턴

### 1. 표준 HTTP 상태 코드 활용

```json
// 400 Bad Request - 잘못된 요청
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "요청 데이터가 올바르지 않습니다",
    "details": [
      {
        "field": "email",
        "code": "REQUIRED",
        "message": "이메일은 필수 항목입니다"
      }
    ]
  }
}

// 401 Unauthorized - 인증 실패
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "인증이 필요합니다",
    "details": {
      "auth_url": "https://api.example.com/auth/login",
      "supported_methods": ["Bearer Token", "API Key"]
    }
  }
}

// 403 Forbidden - 권한 없음
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "이 리소스에 접근할 권한이 없습니다",
    "details": {
      "required_permissions": ["users:read", "users:write"],
      "current_permissions": ["users:read"]
    }
  }
}

// 404 Not Found - 리소스 없음
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "요청한 사용자를 찾을 수 없습니다",
    "details": {
      "resource_type": "user",
      "resource_id": 999,
      "suggestions": [
        "사용자 ID를 확인해주세요",
        "사용자 목록에서 올바른 ID를 찾아보세요"
      ]
    }
  }
}

// 422 Unprocessable Entity - 검증 실패
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력 데이터 검증에 실패했습니다",
    "details": [
      {
        "field": "password",
        "code": "TOO_WEAK",
        "message": "비밀번호는 최소 8자 이상이어야 하며, 대소문자, 숫자, 특수문자를 포함해야 합니다",
        "requirements": {
          "min_length": 8,
          "require_uppercase": true,
          "require_lowercase": true,
          "require_numbers": true,
          "require_symbols": true
        }
      }
    ]
  }
}

// 429 Too Many Requests - 요청 제한
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "요청 한도를 초과했습니다",
    "details": {
      "limit": 100,
      "remaining": 0,
      "reset_at": "2024-01-15T11:00:00Z",
      "retry_after": 300
    }
  }
}

// 500 Internal Server Error - 서버 오류
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "서버에서 오류가 발생했습니다",
    "details": {
      "error_id": "err_abc123",
      "timestamp": "2024-01-15T10:30:00Z",
      "support_contact": "support@example.com"
    }
  }
}
```

## 성능 최적화

### 1. 필드 선택 (Field Selection)

```json
// GET /api/v1/users/123?fields=id,name,email
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "name": "홍길동",
      "email": "hong@example.com"
    }
  }
}

// GET /api/v1/users/123?fields=id,name,profile.avatar_url,stats.posts_count
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "name": "홍길동",
      "profile": {
        "avatar_url": "https://example.com/avatars/hong.jpg"
      },
      "stats": {
        "posts_count": 42
      }
    }
  }
}
```

### 2. 관계 데이터 포함 (Include Relations)

```json
// GET /api/v1/posts/456?include=author,comments,tags
{
  "success": true,
  "data": {
    "post": {
      "id": 456,
      "title": "JSON API 설계 가이드",
      "content": "...",
      "author": {
        "id": 123,
        "name": "홍길동",
        "avatar_url": "https://example.com/avatars/hong.jpg"
      },
      "comments": [
        {
          "id": 789,
          "content": "좋은 글이네요!",
          "author": {
            "id": 124,
            "name": "김철수"
          }
        }
      ],
      "tags": [
        {"id": 1, "name": "JSON"},
        {"id": 2, "name": "API"},
        {"id": 3, "name": "설계"}
      ]
    }
  }
}
```

### 3. 캐싱 헤더

```json
// Response Headers:
// Cache-Control: public, max-age=3600
// ETag: "abc123def456"
// Last-Modified: Mon, 15 Jan 2024 10:30:00 GMT

{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "name": "홍길동"
    }
  },
  "meta": {
    "cache_info": {
      "cached_at": "2024-01-15T10:30:00Z",
      "expires_at": "2024-01-15T11:30:00Z",
      "etag": "abc123def456"
    }
  }
}
```

## 보안 고려사항

### 1. 민감한 정보 필터링

```json
// 공개 프로필 조회 시
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "username": "hong_gildong",
      "profile": {
        "display_name": "홍길동",
        "bio": "소프트웨어 개발자",
        "avatar_url": "https://example.com/avatars/hong.jpg"
      },
      "stats": {
        "posts_count": 42,
        "followers_count": 156
      }
      // email, phone 등 민감한 정보는 제외
    }
  }
}

// 본인 프로필 조회 시 (인증된 사용자)
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "username": "hong_gildong",
      "email": "hong@example.com",
      "phone": "+82-10-****-5678", // 부분 마스킹
      "profile": {
        "display_name": "홍길동",
        "bio": "소프트웨어 개발자"
      },
      "settings": {
        "privacy": {
          "show_email": false,
          "show_phone": false
        }
      }
    }
  }
}
```

### 2. 입력 검증 및 살균

```json
// 안전하지 않은 입력 처리
// Request Body:
{
  "post": {
    "title": "<script>alert('XSS')</script>제목",
    "content": "내용에 <img src=x onerror=alert('XSS')> 포함"
  }
}

// Response (입력 살균 후):
{
  "success": true,
  "data": {
    "post": {
      "id": 789,
      "title": "제목", // HTML 태그 제거
      "content": "내용에  포함", // 위험한 태그 제거
      "content_raw": "내용에 <img src=x onerror=alert('XSS')> 포함", // 원본 보관 (관리자만 접근)
      "sanitized": true
    }
  }
}
```

JSON을 활용한 효과적인 API 설계는 개발자 경험을 향상시키고 시스템의 확장성과 유지보수성을 높입니다. 일관된 패턴과 명확한 문서화를 통해 사용하기 쉬운 API를 만들어보세요.