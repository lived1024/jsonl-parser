# JSON 일반적인 패턴 모음

실제 개발에서 자주 사용되는 JSON 패턴들을 모아놓은 참조 자료입니다.

## API 응답 패턴

### 1. 표준 성공 응답
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

### 2. 표준 오류 응답
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
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req-def456"
  }
}
```

### 3. 목록 조회 응답
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "title": "첫 번째 항목",
        "created_at": "2024-01-15T10:30:00Z"
      },
      {
        "id": 2,
        "title": "두 번째 항목",
        "created_at": "2024-01-15T11:00:00Z"
      }
    ]
  },
  "meta": {
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total_pages": 5,
      "total_count": 100,
      "has_next": true,
      "has_prev": false
    },
    "filters": {
      "status": "active",
      "category": "tech"
    },
    "sort": {
      "field": "created_at",
      "direction": "desc"
    }
  }
}
```

### 4. 배치 작업 응답
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "item_1",
        "success": true,
        "data": {
          "created_id": 123
        }
      },
      {
        "id": "item_2",
        "success": false,
        "error": {
          "code": "DUPLICATE_EMAIL",
          "message": "이미 존재하는 이메일입니다"
        }
      }
    ]
  },
  "meta": {
    "total_items": 2,
    "successful_items": 1,
    "failed_items": 1,
    "processing_time_ms": 150
  }
}
```

## 데이터 모델 패턴

### 1. 사용자 프로필
```json
{
  "user": {
    "id": 123,
    "username": "hong_gildong",
    "email": "hong@example.com",
    "profile": {
      "first_name": "길동",
      "last_name": "홍",
      "display_name": "홍길동",
      "bio": "소프트웨어 개발자",
      "avatar_url": "https://example.com/avatars/123.jpg",
      "location": {
        "country": "KR",
        "city": "서울",
        "timezone": "Asia/Seoul"
      },
      "social_links": {
        "website": "https://hong.dev",
        "github": "https://github.com/hong",
        "linkedin": "https://linkedin.com/in/hong"
      }
    },
    "settings": {
      "theme": "dark",
      "language": "ko",
      "notifications": {
        "email": true,
        "push": false,
        "sms": true
      },
      "privacy": {
        "profile_visibility": "public",
        "show_email": false,
        "show_location": true
      }
    },
    "stats": {
      "posts_count": 42,
      "followers_count": 156,
      "following_count": 89,
      "reputation_score": 850
    },
    "timestamps": {
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "last_login_at": "2024-01-15T09:45:00Z",
      "email_verified_at": "2024-01-01T12:00:00Z"
    },
    "status": {
      "is_active": true,
      "is_verified": true,
      "is_premium": false,
      "account_status": "active"
    }
  }
}
```

### 2. 제품 정보
```json
{
  "product": {
    "id": "PROD-001",
    "sku": "WE-001-BLK",
    "name": "무선 이어폰",
    "description": "고품질 무선 이어폰으로 뛰어난 음질을 제공합니다",
    "category": {
      "id": 10,
      "name": "전자제품",
      "path": ["전자제품", "오디오", "이어폰"],
      "slug": "electronics/audio/earphones"
    },
    "brand": {
      "id": 5,
      "name": "TechBrand",
      "logo_url": "https://example.com/brands/techbrand.jpg"
    },
    "pricing": {
      "base_price": 150000,
      "sale_price": 135000,
      "currency": "KRW",
      "discount": {
        "type": "percentage",
        "value": 10,
        "valid_until": "2024-12-31T23:59:59Z"
      },
      "tax": {
        "included": true,
        "rate": 0.1
      }
    },
    "inventory": {
      "in_stock": true,
      "quantity": 50,
      "reserved_quantity": 5,
      "warehouse_locations": ["SEOUL-01", "BUSAN-01"],
      "restock_date": "2024-02-01T00:00:00Z"
    },
    "specifications": {
      "color": "블랙",
      "weight": "45g",
      "dimensions": {
        "width": 25,
        "height": 30,
        "depth": 15,
        "unit": "mm"
      },
      "battery_life": "24시간",
      "connectivity": ["Bluetooth 5.0", "USB-C"],
      "features": [
        "노이즈 캔슬링",
        "방수 기능 (IPX4)",
        "터치 컨트롤",
        "음성 어시스턴트 지원"
      ]
    },
    "media": {
      "images": [
        {
          "id": 1,
          "url": "https://example.com/products/prod-001/main.jpg",
          "alt": "무선 이어폰 메인 이미지",
          "type": "main",
          "order": 1
        },
        {
          "id": 2,
          "url": "https://example.com/products/prod-001/side.jpg",
          "alt": "무선 이어폰 측면 이미지",
          "type": "detail",
          "order": 2
        }
      ],
      "videos": [
        {
          "id": 1,
          "url": "https://example.com/products/prod-001/demo.mp4",
          "title": "제품 데모 영상",
          "duration": 120,
          "thumbnail": "https://example.com/products/prod-001/video-thumb.jpg"
        }
      ]
    },
    "reviews": {
      "average_rating": 4.5,
      "total_reviews": 128,
      "rating_distribution": {
        "5": 65,
        "4": 40,
        "3": 15,
        "2": 5,
        "1": 3
      }
    },
    "seo": {
      "meta_title": "무선 이어폰 - 고품질 오디오 경험",
      "meta_description": "뛰어난 음질과 편안한 착용감을 제공하는 무선 이어폰",
      "keywords": ["무선이어폰", "블루투스", "노이즈캔슬링"],
      "canonical_url": "https://example.com/products/wireless-earphones"
    },
    "timestamps": {
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "published_at": "2024-01-05T00:00:00Z"
    }
  }
}
```

### 3. 주문 정보
```json
{
  "order": {
    "id": "ORD-2024-001",
    "order_number": "240115001",
    "status": "processing",
    "customer": {
      "id": 123,
      "name": "홍길동",
      "email": "hong@example.com",
      "phone": "+82-10-1234-5678"
    },
    "shipping_address": {
      "recipient": "홍길동",
      "phone": "+82-10-1234-5678",
      "address_line1": "서울시 강남구 테헤란로 123",
      "address_line2": "456호",
      "city": "서울",
      "state": "서울특별시",
      "postal_code": "06234",
      "country": "KR"
    },
    "billing_address": {
      "same_as_shipping": true
    },
    "items": [
      {
        "id": "item_1",
        "product_id": "PROD-001",
        "sku": "WE-001-BLK",
        "name": "무선 이어폰",
        "quantity": 2,
        "unit_price": 135000,
        "total_price": 270000,
        "options": {
          "color": "블랙",
          "warranty": "1년"
        }
      }
    ],
    "pricing": {
      "subtotal": 270000,
      "shipping_cost": 3000,
      "tax": 27300,
      "discount": 0,
      "total": 300300,
      "currency": "KRW"
    },
    "payment": {
      "method": "credit_card",
      "status": "paid",
      "transaction_id": "txn_abc123",
      "paid_at": "2024-01-15T10:30:00Z",
      "card": {
        "last_four": "1234",
        "brand": "visa",
        "exp_month": 12,
        "exp_year": 2025
      }
    },
    "shipping": {
      "method": "standard",
      "carrier": "CJ대한통운",
      "tracking_number": "123456789",
      "estimated_delivery": "2024-01-17T18:00:00Z",
      "shipped_at": "2024-01-15T15:00:00Z"
    },
    "timeline": [
      {
        "status": "placed",
        "timestamp": "2024-01-15T10:30:00Z",
        "note": "주문이 접수되었습니다"
      },
      {
        "status": "paid",
        "timestamp": "2024-01-15T10:31:00Z",
        "note": "결제가 완료되었습니다"
      },
      {
        "status": "processing",
        "timestamp": "2024-01-15T11:00:00Z",
        "note": "주문을 처리 중입니다"
      }
    ],
    "timestamps": {
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T11:00:00Z"
    }
  }
}
```

## 설정 파일 패턴

### 1. 애플리케이션 설정
```json
{
  "app": {
    "name": "MyApp",
    "version": "2.1.0",
    "environment": "production",
    "debug": false,
    "timezone": "Asia/Seoul",
    "locale": "ko-KR"
  },
  "server": {
    "host": "0.0.0.0",
    "port": 3000,
    "ssl": {
      "enabled": true,
      "cert_path": "/etc/ssl/cert.pem",
      "key_path": "/etc/ssl/key.pem"
    },
    "cors": {
      "enabled": true,
      "origins": ["https://example.com", "https://app.example.com"],
      "methods": ["GET", "POST", "PUT", "DELETE"],
      "credentials": true
    }
  },
  "database": {
    "primary": {
      "type": "postgresql",
      "host": "db.example.com",
      "port": 5432,
      "name": "myapp_prod",
      "username": "app_user",
      "password": "${DB_PASSWORD}",
      "ssl": true,
      "pool": {
        "min": 5,
        "max": 20,
        "idle_timeout": 30000
      }
    },
    "replica": {
      "type": "postgresql",
      "host": "db-replica.example.com",
      "port": 5432,
      "name": "myapp_prod",
      "username": "readonly_user",
      "password": "${DB_REPLICA_PASSWORD}",
      "ssl": true
    },
    "redis": {
      "host": "redis.example.com",
      "port": 6379,
      "password": "${REDIS_PASSWORD}",
      "db": 0,
      "ttl": 3600
    }
  },
  "logging": {
    "level": "info",
    "format": "json",
    "outputs": [
      {
        "type": "console",
        "enabled": true
      },
      {
        "type": "file",
        "enabled": true,
        "path": "/var/log/myapp.log",
        "rotation": {
          "max_size": "10MB",
          "max_files": 5,
          "compress": true
        }
      }
    ]
  },
  "features": {
    "authentication": {
      "enabled": true,
      "providers": ["google", "github", "email"],
      "session_timeout": 3600,
      "password_policy": {
        "min_length": 8,
        "require_uppercase": true,
        "require_lowercase": true,
        "require_numbers": true,
        "require_symbols": true
      }
    },
    "analytics": {
      "enabled": true,
      "provider": "google_analytics",
      "tracking_id": "GA-XXXXXXXX",
      "events": ["pageview", "click", "conversion"]
    },
    "notifications": {
      "email": {
        "enabled": true,
        "provider": "sendgrid",
        "api_key": "${SENDGRID_API_KEY}",
        "from_address": "noreply@example.com"
      },
      "push": {
        "enabled": true,
        "provider": "firebase",
        "server_key": "${FCM_SERVER_KEY}"
      }
    }
  }
}
```

### 2. 빌드 설정
```json
{
  "build": {
    "target": "es2020",
    "format": ["esm", "cjs"],
    "platform": "browser",
    "minify": true,
    "sourcemap": true,
    "outdir": "dist"
  },
  "dev": {
    "port": 5173,
    "host": "localhost",
    "open": true,
    "hmr": true,
    "proxy": {
      "/api": {
        "target": "http://localhost:3000",
        "changeOrigin": true,
        "rewrite": {
          "^/api": ""
        }
      }
    }
  },
  "optimization": {
    "treeshaking": true,
    "code_splitting": true,
    "chunk_size_limit": 500,
    "asset_optimization": {
      "images": {
        "webp": true,
        "quality": 80
      },
      "css": {
        "purge": true,
        "minify": true
      }
    }
  },
  "plugins": [
    {
      "name": "typescript",
      "options": {
        "strict": true,
        "target": "es2020"
      }
    },
    {
      "name": "vue",
      "options": {
        "template": {
          "compilerOptions": {
            "isCustomElement": "tag => tag.startsWith('custom-')"
          }
        }
      }
    }
  ]
}
```

## 이벤트 및 로그 패턴

### 1. 애플리케이션 로그
```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "level": "info",
  "message": "User login successful",
  "service": "auth-service",
  "version": "1.2.3",
  "environment": "production",
  "request_id": "req-abc123",
  "user_id": 123,
  "session_id": "sess-def456",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "context": {
    "action": "login",
    "method": "email",
    "duration_ms": 150,
    "success": true
  },
  "metadata": {
    "hostname": "web-01",
    "process_id": 12345,
    "thread_id": "main"
  }
}
```

### 2. 에러 로그
```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "level": "error",
  "message": "Database connection failed",
  "service": "user-service",
  "version": "1.2.3",
  "environment": "production",
  "request_id": "req-xyz789",
  "error": {
    "type": "DatabaseConnectionError",
    "message": "Connection timeout after 5000ms",
    "code": "CONN_TIMEOUT",
    "stack": "DatabaseConnectionError: Connection timeout...\n    at Database.connect (/app/db.js:45:12)",
    "details": {
      "host": "db.example.com",
      "port": 5432,
      "database": "myapp_prod",
      "timeout": 5000
    }
  },
  "context": {
    "operation": "user_fetch",
    "user_id": 123,
    "retry_count": 3,
    "last_retry_at": "2024-01-15T10:29:55.000Z"
  }
}
```

### 3. 비즈니스 이벤트
```json
{
  "event_id": "evt-abc123",
  "event_type": "order.placed",
  "event_version": "1.0",
  "timestamp": "2024-01-15T10:30:00Z",
  "source": "order-service",
  "correlation_id": "corr-def456",
  "aggregate": {
    "type": "order",
    "id": "ORD-2024-001",
    "version": 1
  },
  "data": {
    "order_id": "ORD-2024-001",
    "customer_id": 123,
    "total_amount": 300300,
    "currency": "KRW",
    "items": [
      {
        "product_id": "PROD-001",
        "quantity": 2,
        "unit_price": 135000
      }
    ],
    "shipping_address": {
      "city": "서울",
      "country": "KR"
    }
  },
  "metadata": {
    "user_id": 123,
    "session_id": "sess-ghi789",
    "ip_address": "192.168.1.100",
    "user_agent": "Mozilla/5.0...",
    "source_system": "web-app",
    "trace_id": "trace-jkl012"
  }
}
```

## 검색 및 필터 패턴

### 1. 검색 요청
```json
{
  "query": {
    "text": "JSON 파서",
    "filters": {
      "category": ["tutorial", "reference"],
      "difficulty": ["beginner", "intermediate"],
      "language": "ko",
      "date_range": {
        "start": "2024-01-01",
        "end": "2024-01-31"
      },
      "tags": {
        "include": ["json", "parser"],
        "exclude": ["deprecated"]
      },
      "author": {
        "verified": true,
        "reputation_min": 100
      }
    },
    "sort": [
      {
        "field": "relevance",
        "direction": "desc"
      },
      {
        "field": "created_at",
        "direction": "desc"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20
    },
    "highlight": {
      "fields": ["title", "content"],
      "fragment_size": 150,
      "max_fragments": 3
    }
  }
}
```

### 2. 검색 응답
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "doc_123",
        "type": "tutorial",
        "title": "JSON 파서 구현하기",
        "excerpt": "JavaScript로 JSON 파서를 구현하는 방법을 알아봅시다...",
        "url": "/tutorials/json-parser-implementation",
        "author": {
          "id": 456,
          "name": "개발자",
          "avatar_url": "https://example.com/avatars/456.jpg",
          "verified": true
        },
        "metadata": {
          "category": "tutorial",
          "difficulty": "intermediate",
          "language": "ko",
          "tags": ["json", "parser", "javascript"],
          "reading_time": 15,
          "created_at": "2024-01-10T15:30:00Z",
          "updated_at": "2024-01-12T10:00:00Z"
        },
        "stats": {
          "views": 1250,
          "likes": 89,
          "comments": 12
        },
        "relevance_score": 0.95,
        "highlight": {
          "title": "<mark>JSON 파서</mark> 구현하기",
          "content": [
            "JavaScript로 <mark>JSON</mark> <mark>파서</mark>를 구현하는...",
            "이 튜토리얼에서는 <mark>JSON</mark> 문법을 분석하고..."
          ]
        }
      }
    ]
  },
  "meta": {
    "query": "JSON 파서",
    "total_results": 156,
    "search_time_ms": 45,
    "facets": {
      "category": {
        "tutorial": 89,
        "reference": 45,
        "example": 22
      },
      "difficulty": {
        "beginner": 67,
        "intermediate": 78,
        "advanced": 11
      },
      "language": {
        "ko": 134,
        "en": 22
      }
    },
    "suggestions": [
      "JSON parser",
      "JSON 라이브러리",
      "데이터 파싱"
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total_pages": 8,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

## 실시간 데이터 패턴

### 1. WebSocket 메시지
```json
{
  "type": "message",
  "id": "msg_abc123",
  "timestamp": "2024-01-15T10:30:00Z",
  "channel": "chat_room_456",
  "sender": {
    "id": 123,
    "username": "hong_gildong",
    "display_name": "홍길동",
    "avatar_url": "https://example.com/avatars/123.jpg"
  },
  "content": {
    "text": "안녕하세요! JSON 파싱에 대해 질문이 있습니다.",
    "mentions": [
      {
        "user_id": 789,
        "username": "expert_dev",
        "start": 25,
        "length": 10
      }
    ],
    "attachments": [
      {
        "type": "image",
        "url": "https://example.com/uploads/image123.jpg",
        "filename": "json_example.jpg",
        "size": 245760
      }
    ]
  },
  "metadata": {
    "client_id": "client_def456",
    "ip_address": "192.168.1.100",
    "user_agent": "Mozilla/5.0..."
  }
}
```

### 2. 실시간 업데이트
```json
{
  "type": "update",
  "event": "user.status_changed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "user_id": 123,
    "previous_status": "away",
    "current_status": "online",
    "last_seen": "2024-01-15T10:29:45Z"
  },
  "affected_channels": [
    "chat_room_456",
    "project_team_789"
  ]
}
```

이러한 패턴들을 참조하여 일관성 있고 확장 가능한 JSON 구조를 설계해보세요. 각 패턴은 실제 프로덕션 환경에서 검증된 구조들입니다.