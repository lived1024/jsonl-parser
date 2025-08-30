# JSON 문법 완전 가이드

JSON(JavaScript Object Notation)의 모든 문법 규칙을 상세히 알아보고 실제 예제를 통해 학습해봅시다.

## JSON 문법의 핵심 원칙

JSON은 간단하지만 엄격한 문법 규칙을 가지고 있습니다. 이 규칙들을 정확히 이해하는 것이 JSON을 효과적으로 사용하는 첫걸음입니다.

### 기본 구조

JSON은 두 가지 기본 구조로 구성됩니다:

1. **객체 (Object)**: 키-값 쌍의 순서 없는 집합
2. **배열 (Array)**: 값들의 순서 있는 목록

```json
{
  "객체": {
    "키": "값"
  },
  "배열": [1, 2, 3]
}
```

## 데이터 타입 상세 가이드

### 1. 문자열 (String)

문자열은 반드시 큰따옴표로 감싸야 합니다.

```json
{
  "올바른_문자열": "안녕하세요",
  "유니코드_지원": "🌟 Unicode characters are supported",
  "빈_문자열": "",
  "숫자_문자열": "123"
}
```

#### 이스케이프 시퀀스

특수 문자는 백슬래시를 사용해 이스케이프합니다:

```json
{
  "따옴표": "그는 \"안녕\"이라고 말했다",
  "백슬래시": "파일 경로: C:\\Users\\Name",
  "줄바꿈": "첫 번째 줄\n두 번째 줄",
  "탭": "이름:\t홍길동",
  "캐리지_리턴": "Windows 줄바꿈\r\n",
  "유니코드": "별표: \\u2605"
}
```

#### 일반적인 문자열 실수

```json
// ❌ 잘못된 형식들
{
  "작은따옴표": 'Hello World',           // 작은따옴표 사용 불가
  "따옴표_없음": Hello World,            // 따옴표 없음
  "잘못된_이스케이프": "Hello\World"      // 잘못된 이스케이프
}

// ✅ 올바른 형식
{
  "올바른_형식": "Hello World",
  "올바른_이스케이프": "Hello\\World"
}
```

### 2. 숫자 (Number)

JSON은 정수와 실수를 구분하지 않으며, 다양한 숫자 형식을 지원합니다.

```json
{
  "정수": 42,
  "음수": -17,
  "실수": 3.14159,
  "지수표기법": 1.23e10,
  "음의_지수": 1.23e-10,
  "영": 0,
  "매우_큰_수": 1.7976931348623157e+308
}
```

#### 숫자 형식 규칙

```json
// ✅ 올바른 숫자 형식
{
  "유효한_숫자들": [
    0,
    -0,
    123,
    -123,
    1.23,
    -1.23,
    1e10,
    1E10,
    1e+10,
    1e-10
  ]
}

// ❌ 잘못된 숫자 형식
{
  "잘못된_형식들": [
    // 01,        // 앞에 0이 오면 안됨
    // .5,        // 소수점 앞에 숫자 필요
    // 5.,        // 소수점 뒤에 숫자 필요
    // +5,        // 양수 기호 사용 불가
    // Infinity,  // 무한대 사용 불가
    // NaN        // NaN 사용 불가
  ]
}
```

### 3. 불린 (Boolean)

불린 값은 `true` 또는 `false`만 가능합니다.

```json
{
  "활성화": true,
  "비활성화": false,
  "설정": {
    "자동_저장": true,
    "알림_허용": false,
    "다크_모드": true
  }
}
```

### 4. null

`null`은 값이 없음을 나타냅니다.

```json
{
  "중간_이름": null,
  "선택적_필드": null,
  "초기화되지_않은_값": null
}
```

#### null vs undefined vs 빈 문자열

```json
{
  "null_값": null,           // 값이 명시적으로 없음
  "빈_문자열": "",           // 빈 문자열 (값이 있음)
  "빈_배열": [],             // 빈 배열 (값이 있음)
  "빈_객체": {}              // 빈 객체 (값이 있음)
  // "undefined": undefined  // JSON에서 undefined 사용 불가
}
```

### 5. 객체 (Object)

객체는 키-값 쌍의 집합입니다.

```json
{
  "사용자": {
    "이름": "홍길동",
    "나이": 30,
    "이메일": "hong@example.com",
    "주소": {
      "도시": "서울",
      "구": "강남구",
      "상세주소": "테헤란로 123"
    },
    "취미": ["독서", "영화감상", "등산"]
  }
}
```

#### 객체 키 규칙

```json
{
  "일반_키": "값",
  "숫자_키": "키는 항상 문자열",
  "특수문자_키": "값",
  "공백이 있는 키": "값",
  "한글_키": "값",
  "": "빈 문자열도 키가 될 수 있음"
}
```

#### 중첩 객체 예제

```json
{
  "회사": {
    "정보": {
      "이름": "테크 컴퍼니",
      "설립년도": 2020,
      "직원수": 150
    },
    "부서": {
      "개발팀": {
        "팀장": "김개발",
        "인원": 20,
        "프로젝트": ["웹앱", "모바일앱"]
      },
      "디자인팀": {
        "팀장": "이디자인",
        "인원": 8,
        "도구": ["Figma", "Sketch", "Adobe XD"]
      }
    }
  }
}
```

### 6. 배열 (Array)

배열은 순서가 있는 값들의 목록입니다.

```json
{
  "숫자_배열": [1, 2, 3, 4, 5],
  "문자열_배열": ["사과", "바나나", "오렌지"],
  "혼합_배열": ["문자열", 123, true, null],
  "중첩_배열": [[1, 2], [3, 4], [5, 6]],
  "객체_배열": [
    {"이름": "홍길동", "나이": 30},
    {"이름": "김철수", "나이": 25}
  ]
}
```

#### 복잡한 배열 구조

```json
{
  "메뉴": [
    {
      "카테고리": "메인 요리",
      "항목들": [
        {
          "이름": "스테이크",
          "가격": 25000,
          "옵션": ["레어", "미디움", "웰던"],
          "알레르기": null
        },
        {
          "이름": "파스타",
          "가격": 18000,
          "옵션": ["토마토", "크림", "오일"],
          "알레르기": ["글루텐"]
        }
      ]
    }
  ]
}
```

## 문법 규칙 상세

### 1. 공백 처리

JSON에서 공백, 탭, 줄바꿈은 구조적 요소 사이에서 무시됩니다.

```json
{
  "압축된_형식": {"이름":"홍길동","나이":30},
  "읽기_쉬운_형식": {
    "이름": "홍길동",
    "나이": 30
  }
}
```

### 2. 쉼표 규칙

```json
{
  "올바른_쉼표_사용": {
    "첫번째": "값",
    "두번째": "값",
    "마지막": "값"
  },
  "배열에서의_쉼표": [
    "첫번째",
    "두번째",
    "마지막"
  ]
}

// ❌ 잘못된 쉼표 사용
// {
//   "trailing_comma": "값",  // 마지막 요소 뒤 쉼표 금지
// }
```

### 3. 주석 사용 불가

JSON은 주석을 지원하지 않습니다.

```json
{
  "_comment": "주석이 필요한 경우 이런 식으로 키를 사용",
  "실제_데이터": "값"
}
```

## 실제 사용 사례

### 1. API 응답 형식

```json
{
  "status": "success",
  "code": 200,
  "message": "데이터를 성공적으로 조회했습니다",
  "data": {
    "users": [
      {
        "id": 1,
        "username": "user1",
        "profile": {
          "name": "사용자1",
          "email": "user1@example.com",
          "avatar": "https://example.com/avatar1.jpg",
          "preferences": {
            "theme": "dark",
            "language": "ko",
            "notifications": {
              "email": true,
              "push": false,
              "sms": true
            }
          }
        },
        "lastLogin": "2024-01-15T10:30:00Z",
        "isActive": true
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 100,
      "itemsPerPage": 10
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 2. 설정 파일 예제

```json
{
  "application": {
    "name": "MyApp",
    "version": "2.1.0",
    "environment": "production",
    "debug": false,
    "features": {
      "authentication": {
        "enabled": true,
        "providers": ["google", "github", "email"],
        "sessionTimeout": 3600
      },
      "analytics": {
        "enabled": true,
        "trackingId": "GA-XXXXXXXX",
        "events": ["pageview", "click", "conversion"]
      },
      "cache": {
        "enabled": true,
        "ttl": 300,
        "maxSize": "100MB"
      }
    }
  },
  "database": {
    "primary": {
      "host": "db.example.com",
      "port": 5432,
      "name": "myapp_prod",
      "ssl": true,
      "poolSize": 20
    },
    "replica": {
      "host": "db-replica.example.com",
      "port": 5432,
      "name": "myapp_prod",
      "ssl": true,
      "poolSize": 10
    }
  },
  "logging": {
    "level": "info",
    "format": "json",
    "outputs": ["console", "file"],
    "rotation": {
      "enabled": true,
      "maxSize": "10MB",
      "maxFiles": 5
    }
  }
}
```

### 3. 데이터 모델 예제

```json
{
  "product": {
    "id": "PROD-001",
    "name": "무선 이어폰",
    "description": "고품질 무선 이어폰으로 뛰어난 음질을 제공합니다",
    "category": {
      "id": "ELEC-001",
      "name": "전자제품",
      "path": ["전자제품", "오디오", "이어폰"]
    },
    "pricing": {
      "basePrice": 150000,
      "currency": "KRW",
      "discounts": [
        {
          "type": "percentage",
          "value": 10,
          "validUntil": "2024-12-31T23:59:59Z",
          "conditions": {
            "minQuantity": 2
          }
        }
      ]
    },
    "inventory": {
      "inStock": true,
      "quantity": 50,
      "warehouse": "SEOUL-01",
      "reservedQuantity": 5
    },
    "specifications": {
      "color": ["블랙", "화이트", "블루"],
      "weight": "45g",
      "batteryLife": "24시간",
      "connectivity": ["Bluetooth 5.0", "USB-C"],
      "features": [
        "노이즈 캔슬링",
        "방수 기능",
        "터치 컨트롤"
      ]
    },
    "media": {
      "images": [
        {
          "url": "https://example.com/product1-main.jpg",
          "alt": "무선 이어폰 메인 이미지",
          "type": "main"
        },
        {
          "url": "https://example.com/product1-side.jpg",
          "alt": "무선 이어폰 측면 이미지",
          "type": "detail"
        }
      ],
      "videos": [
        {
          "url": "https://example.com/product1-demo.mp4",
          "title": "제품 데모 영상",
          "duration": 120
        }
      ]
    },
    "reviews": {
      "averageRating": 4.5,
      "totalReviews": 128,
      "ratingDistribution": {
        "5": 65,
        "4": 40,
        "3": 15,
        "2": 5,
        "1": 3
      }
    },
    "metadata": {
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "createdBy": "admin",
      "tags": ["인기상품", "신제품", "할인"]
    }
  }
}
```

## 검증 및 디버깅

### 일반적인 JSON 오류

```json
// ❌ 문법 오류 예제들 (실제로는 파싱 실패)

// 1. 쉼표 누락
{
  "name": "홍길동"
  "age": 30
}

// 2. 따옴표 누락
{
  name: "홍길동",
  "age": 30
}

// 3. 마지막 쉼표
{
  "name": "홍길동",
  "age": 30,
}

// 4. 작은따옴표 사용
{
  'name': '홍길동',
  'age': 30
}

// 5. 주석 사용
{
  // 이것은 주석입니다
  "name": "홍길동",
  "age": 30
}
```

### JSON 검증 체크리스트

1. **문법 검사**
   - [ ] 모든 문자열이 큰따옴표로 감싸져 있는가?
   - [ ] 객체와 배열이 올바르게 열리고 닫혔는가?
   - [ ] 쉼표가 올바른 위치에 있는가?
   - [ ] 마지막 요소 뒤에 쉼표가 없는가?

2. **데이터 타입 검사**
   - [ ] 숫자 형식이 올바른가?
   - [ ] 불린 값이 true/false인가?
   - [ ] null 값이 올바르게 표현되었는가?

3. **구조 검사**
   - [ ] 중첩 구조가 올바른가?
   - [ ] 키가 모두 문자열인가?
   - [ ] 순환 참조가 없는가?

## 모범 사례

### 1. 일관된 명명 규칙

```json
{
  "user_profile": {
    "first_name": "홍",
    "last_name": "길동",
    "email_address": "hong@example.com",
    "phone_number": "+82-10-1234-5678"
  }
}
```

### 2. 의미 있는 구조

```json
{
  "response": {
    "metadata": {
      "timestamp": "2024-01-15T10:30:00Z",
      "version": "1.0",
      "requestId": "req-12345"
    },
    "data": {
      "users": []
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100
    }
  }
}
```

### 3. 오류 처리 구조

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력 데이터가 유효하지 않습니다",
    "details": [
      {
        "field": "email",
        "message": "이메일 형식이 올바르지 않습니다"
      },
      {
        "field": "age",
        "message": "나이는 0보다 커야 합니다"
      }
    ]
  }
}
```

JSON 문법을 정확히 이해하고 활용하면 효율적이고 안정적인 데이터 교환이 가능합니다. 실제 프로젝트에서 이러한 규칙들을 일관되게 적용하여 유지보수하기 쉬운 코드를 작성해보세요.