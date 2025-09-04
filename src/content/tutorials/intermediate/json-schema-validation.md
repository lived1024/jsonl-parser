# JSON Schema를 활용한 데이터 검증

JSON Schema를 사용하여 JSON 데이터의 구조와 내용을 검증하는 방법을 학습해봅시다.

## JSON Schema란?

JSON Schema는 JSON 데이터의 구조, 내용, 의미를 기술하는 어휘입니다. 데이터 검증, 문서화, 하이퍼링크 네비게이션, 상호작용 제어에 사용됩니다.

### 기본 개념

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/user.schema.json",
  "title": "User",
  "description": "사용자 정보를 나타내는 스키마",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "사용자의 이름"
    },
    "age": {
      "type": "integer",
      "minimum": 0,
      "maximum": 150
    }
  },
  "required": ["name"]
}
```

## 기본 데이터 타입 검증

### 1. 문자열 (String) 검증

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "phone": {
      "type": "string",
      "pattern": "^\\+?[1-9]\\d{1,14}$"
    },
    "description": {
      "type": "string",
      "minLength": 10,
      "maxLength": 500
    }
  }
}
```

**검증 예제:**
```json
// ✅ 유효한 데이터
{
  "name": "홍길동",
  "email": "hong@example.com",
  "phone": "+82-10-1234-5678",
  "description": "소프트웨어 개발자입니다."
}

// ❌ 유효하지 않은 데이터
{
  "name": "",                           // minLength 위반
  "email": "invalid-email",             // format 위반
  "phone": "abc",                       // pattern 위반
  "description": "짧음"                 // minLength 위반
}
```

### 2. 숫자 (Number) 검증

```json
{
  "type": "object",
  "properties": {
    "age": {
      "type": "integer",
      "minimum": 0,
      "maximum": 150
    },
    "salary": {
      "type": "number",
      "minimum": 0,
      "multipleOf": 1000
    },
    "rating": {
      "type": "number",
      "minimum": 0,
      "maximum": 5,
      "exclusiveMaximum": false
    },
    "percentage": {
      "type": "number",
      "minimum": 0,
      "maximum": 100
    }
  }
}
```

### 3. 배열 (Array) 검증

```json
{
  "type": "object",
  "properties": {
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "minItems": 1,
      "maxItems": 10,
      "uniqueItems": true
    },
    "scores": {
      "type": "array",
      "items": {
        "type": "number",
        "minimum": 0,
        "maximum": 100
      },
      "minItems": 3,
      "maxItems": 5
    },
    "mixed_array": {
      "type": "array",
      "items": [
        {"type": "string"},
        {"type": "number"},
        {"type": "boolean"}
      ],
      "additionalItems": false
    }
  }
}
```

### 4. 객체 (Object) 검증

```json
{
  "type": "object",
  "properties": {
    "user": {
      "type": "object",
      "properties": {
        "id": {"type": "integer"},
        "name": {"type": "string"},
        "email": {"type": "string", "format": "email"}
      },
      "required": ["id", "name"],
      "additionalProperties": false
    },
    "settings": {
      "type": "object",
      "patternProperties": {
        "^[a-zA-Z_][a-zA-Z0-9_]*$": {
          "type": ["string", "number", "boolean"]
        }
      },
      "additionalProperties": false
    }
  }
}
```

## 고급 검증 기법

### 1. 조건부 검증 (Conditional Validation)

```json
{
  "type": "object",
  "properties": {
    "user_type": {
      "type": "string",
      "enum": ["individual", "business"]
    },
    "name": {"type": "string"},
    "business_name": {"type": "string"},
    "tax_id": {"type": "string"}
  },
  "required": ["user_type", "name"],
  "if": {
    "properties": {
      "user_type": {"const": "business"}
    }
  },
  "then": {
    "required": ["business_name", "tax_id"]
  },
  "else": {
    "not": {
      "anyOf": [
        {"required": ["business_name"]},
        {"required": ["tax_id"]}
      ]
    }
  }
}
```

**사용 예제:**
```json
// ✅ 개인 사용자
{
  "user_type": "individual",
  "name": "홍길동"
}

// ✅ 기업 사용자
{
  "user_type": "business",
  "name": "김대표",
  "business_name": "테크 컴퍼니",
  "tax_id": "123-45-67890"
}

// ❌ 기업 사용자인데 필수 필드 누락
{
  "user_type": "business",
  "name": "김대표"
}
```

### 2. 다중 스키마 검증 (Multiple Schema Validation)

```json
{
  "type": "object",
  "properties": {
    "contact": {
      "oneOf": [
        {
          "properties": {
            "type": {"const": "email"},
            "value": {"type": "string", "format": "email"}
          },
          "required": ["type", "value"],
          "additionalProperties": false
        },
        {
          "properties": {
            "type": {"const": "phone"},
            "value": {"type": "string", "pattern": "^\\+?[1-9]\\d{1,14}$"}
          },
          "required": ["type", "value"],
          "additionalProperties": false
        },
        {
          "properties": {
            "type": {"const": "address"},
            "street": {"type": "string"},
            "city": {"type": "string"},
            "zipcode": {"type": "string"}
          },
          "required": ["type", "street", "city"],
          "additionalProperties": false
        }
      ]
    }
  }
}
```

### 3. 참조 및 재사용 (References and Reuse)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/schemas/user.json",
  
  "$defs": {
    "address": {
      "type": "object",
      "properties": {
        "street": {"type": "string"},
        "city": {"type": "string"},
        "country": {"type": "string"},
        "zipcode": {"type": "string"}
      },
      "required": ["street", "city", "country"]
    },
    "contact_info": {
      "type": "object",
      "properties": {
        "email": {"type": "string", "format": "email"},
        "phone": {"type": "string"}
      }
    }
  },
  
  "type": "object",
  "properties": {
    "personal_info": {
      "type": "object",
      "properties": {
        "name": {"type": "string"},
        "age": {"type": "integer", "minimum": 0}
      }
    },
    "home_address": {"$ref": "#/$defs/address"},
    "work_address": {"$ref": "#/$defs/address"},
    "contact": {"$ref": "#/$defs/contact_info"}
  }
}
```

## 실제 사용 사례

### 1. API 요청/응답 검증

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://api.example.com/schemas/create-user-request.json",
  "title": "Create User Request",
  "type": "object",
  "properties": {
    "user": {
      "type": "object",
      "properties": {
        "username": {
          "type": "string",
          "minLength": 3,
          "maxLength": 20,
          "pattern": "^[a-zA-Z0-9_]+$"
        },
        "email": {
          "type": "string",
          "format": "email"
        },
        "password": {
          "type": "string",
          "minLength": 8,
          "pattern": "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]"
        },
        "profile": {
          "type": "object",
          "properties": {
            "first_name": {"type": "string", "minLength": 1},
            "last_name": {"type": "string", "minLength": 1},
            "birth_date": {"type": "string", "format": "date"},
            "bio": {"type": "string", "maxLength": 500}
          },
          "required": ["first_name", "last_name"]
        }
      },
      "required": ["username", "email", "password", "profile"],
      "additionalProperties": false
    }
  },
  "required": ["user"],
  "additionalProperties": false
}
```

### 2. 설정 파일 검증

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Application Configuration",
  "type": "object",
  "properties": {
    "app": {
      "type": "object",
      "properties": {
        "name": {"type": "string"},
        "version": {"type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$"},
        "environment": {"type": "string", "enum": ["development", "staging", "production"]},
        "debug": {"type": "boolean"}
      },
      "required": ["name", "version", "environment"]
    },
    "database": {
      "type": "object",
      "properties": {
        "host": {"type": "string"},
        "port": {"type": "integer", "minimum": 1, "maximum": 65535},
        "name": {"type": "string"},
        "ssl": {"type": "boolean"},
        "pool_size": {"type": "integer", "minimum": 1, "maximum": 100}
      },
      "required": ["host", "port", "name"]
    },
    "features": {
      "type": "object",
      "patternProperties": {
        "^[a-z_]+$": {
          "type": "object",
          "properties": {
            "enabled": {"type": "boolean"},
            "config": {"type": "object"}
          },
          "required": ["enabled"]
        }
      }
    }
  },
  "required": ["app", "database"]
}
```

### 3. 폼 데이터 검증

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Contact Form",
  "type": "object",
  "properties": {
    "personal": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "minLength": 2,
          "maxLength": 50,
          "title": "이름",
          "description": "성과 이름을 모두 입력해주세요"
        },
        "email": {
          "type": "string",
          "format": "email",
          "title": "이메일",
          "description": "연락 가능한 이메일 주소"
        },
        "phone": {
          "type": "string",
          "pattern": "^\\d{2,3}-\\d{3,4}-\\d{4}$",
          "title": "전화번호",
          "description": "예: 010-1234-5678"
        }
      },
      "required": ["name", "email"]
    },
    "inquiry": {
      "type": "object",
      "properties": {
        "category": {
          "type": "string",
          "enum": ["general", "technical", "billing", "partnership"],
          "title": "문의 유형"
        },
        "subject": {
          "type": "string",
          "minLength": 5,
          "maxLength": 100,
          "title": "제목"
        },
        "message": {
          "type": "string",
          "minLength": 20,
          "maxLength": 2000,
          "title": "내용"
        },
        "priority": {
          "type": "string",
          "enum": ["low", "medium", "high"],
          "default": "medium",
          "title": "우선순위"
        }
      },
      "required": ["category", "subject", "message"]
    },
    "consent": {
      "type": "object",
      "properties": {
        "privacy_policy": {
          "type": "boolean",
          "const": true,
          "title": "개인정보 처리방침 동의"
        },
        "marketing": {
          "type": "boolean",
          "title": "마케팅 정보 수신 동의"
        }
      },
      "required": ["privacy_policy"]
    }
  },
  "required": ["personal", "inquiry", "consent"]
}
```

## JavaScript에서 JSON Schema 사용

### 1. AJV 라이브러리 사용

```javascript
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

// AJV 인스턴스 생성
const ajv = new Ajv({allErrors: true});
addFormats(ajv); // 이메일, 날짜 등 형식 지원

// 스키마 정의
const userSchema = {
  type: 'object',
  properties: {
    name: {type: 'string', minLength: 1},
    email: {type: 'string', format: 'email'},
    age: {type: 'integer', minimum: 0, maximum: 150}
  },
  required: ['name', 'email'],
  additionalProperties: false
};

// 검증 함수 컴파일
const validate = ajv.compile(userSchema);

// 데이터 검증
function validateUser(userData) {
  const valid = validate(userData);
  
  if (!valid) {
    return {
      valid: false,
      errors: validate.errors.map(error => ({
        field: error.instancePath || error.schemaPath,
        message: error.message,
        value: error.data
      }))
    };
  }
  
  return {valid: true, errors: []};
}

// 사용 예제
const user1 = {
  name: '홍길동',
  email: 'hong@example.com',
  age: 30
};

const user2 = {
  name: '',
  email: 'invalid-email',
  age: -5
};

console.log(validateUser(user1)); // {valid: true, errors: []}
console.log(validateUser(user2)); // {valid: false, errors: [...]}
```

### 2. 커스텀 검증 함수

```javascript
class JSONSchemaValidator {
  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      removeAdditional: true,
      useDefaults: true,
      coerceTypes: true
    });
    
    addFormats(this.ajv);
    this.addCustomKeywords();
  }
  
  addCustomKeywords() {
    // 한국 전화번호 검증
    this.ajv.addKeyword({
      keyword: 'koreanPhone',
      type: 'string',
      schemaType: 'boolean',
      compile: function(schemaVal) {
        return function validate(data) {
          if (!schemaVal) return true;
          const phoneRegex = /^01[016789]-?\d{3,4}-?\d{4}$/;
          return phoneRegex.test(data);
        };
      }
    });
    
    // 한국 주민등록번호 검증 (마스킹된 형태)
    this.ajv.addKeyword({
      keyword: 'koreanSSN',
      type: 'string',
      schemaType: 'boolean',
      compile: function(schemaVal) {
        return function validate(data) {
          if (!schemaVal) return true;
          const ssnRegex = /^\d{6}-\*{7}$/;
          return ssnRegex.test(data);
        };
      }
    });
  }
  
  validate(data, schema) {
    const validate = this.ajv.compile(schema);
    const valid = validate(data);
    
    return {
      valid,
      errors: valid ? [] : this.formatErrors(validate.errors),
      data: data // 변환된 데이터 (coerceTypes, useDefaults 적용)
    };
  }
  
  formatErrors(errors) {
    return errors.map(error => {
      const field = error.instancePath.replace(/^\//, '').replace(/\//g, '.');
      
      switch (error.keyword) {
        case 'required':
          return {
            field: error.params.missingProperty,
            message: `'${error.params.missingProperty}' 필드는 필수입니다.`
          };
        case 'format':
          return {
            field,
            message: `'${field}' 필드의 형식이 올바르지 않습니다.`
          };
        case 'minLength':
          return {
            field,
            message: `'${field}' 필드는 최소 ${error.params.limit}자 이상이어야 합니다.`
          };
        case 'maxLength':
          return {
            field,
            message: `'${field}' 필드는 최대 ${error.params.limit}자까지 입력 가능합니다.`
          };
        default:
          return {
            field,
            message: error.message
          };
      }
    });
  }
}

// 사용 예제
const validator = new JSONSchemaValidator();

const userSchema = {
  type: 'object',
  properties: {
    name: {type: 'string', minLength: 2, maxLength: 50},
    email: {type: 'string', format: 'email'},
    phone: {type: 'string', koreanPhone: true},
    age: {type: 'string'}, // 문자열로 입력되어도 숫자로 변환
    newsletter: {type: 'boolean', default: false}
  },
  required: ['name', 'email']
};

const result = validator.validate({
  name: '홍길동',
  email: 'hong@example.com',
  phone: '010-1234-5678',
  age: '30' // 문자열이지만 숫자로 변환됨
}, userSchema);

console.log(result);
```

### 3. 실시간 폼 검증

```javascript
class FormValidator {
  constructor(formElement, schema) {
    this.form = formElement;
    this.schema = schema;
    this.validator = new JSONSchemaValidator();
    this.errors = {};
    
    this.bindEvents();
  }
  
  bindEvents() {
    // 실시간 검증
    this.form.addEventListener('input', (e) => {
      this.validateField(e.target);
    });
    
    // 폼 제출 시 전체 검증
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.validateForm();
    });
  }
  
  validateField(field) {
    const fieldName = field.name;
    const fieldValue = field.value;
    
    // 필드별 스키마 추출
    const fieldSchema = this.getFieldSchema(fieldName);
    if (!fieldSchema) return;
    
    // 단일 필드 검증
    const result = this.validator.validate(fieldValue, fieldSchema);
    
    if (result.valid) {
      this.clearFieldError(field);
      delete this.errors[fieldName];
    } else {
      this.showFieldError(field, result.errors[0].message);
      this.errors[fieldName] = result.errors;
    }
  }
  
  validateForm() {
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData.entries());
    
    const result = this.validator.validate(data, this.schema);
    
    if (result.valid) {
      this.onValidSubmit(result.data);
    } else {
      this.showFormErrors(result.errors);
    }
  }
  
  getFieldSchema(fieldName) {
    const properties = this.schema.properties;
    return properties[fieldName] ? {
      type: properties[fieldName].type,
      ...properties[fieldName]
    } : null;
  }
  
  showFieldError(field, message) {
    const errorElement = field.parentNode.querySelector('.error-message');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
    field.classList.add('error');
  }
  
  clearFieldError(field) {
    const errorElement = field.parentNode.querySelector('.error-message');
    if (errorElement) {
      errorElement.style.display = 'none';
    }
    field.classList.remove('error');
  }
  
  showFormErrors(errors) {
    errors.forEach(error => {
      const field = this.form.querySelector(`[name="${error.field}"]`);
      if (field) {
        this.showFieldError(field, error.message);
      }
    });
  }
  
  onValidSubmit(data) {
    console.log('폼 검증 성공:', data);
    // 서버로 데이터 전송
  }
}

// HTML 폼에 적용
const formSchema = {
  type: 'object',
  properties: {
    name: {type: 'string', minLength: 2, maxLength: 50},
    email: {type: 'string', format: 'email'},
    message: {type: 'string', minLength: 10, maxLength: 1000}
  },
  required: ['name', 'email', 'message']
};

const contactForm = document.getElementById('contact-form');
const formValidator = new FormValidator(contactForm, formSchema);
```

## 모범 사례

### 1. 스키마 설계 원칙

```json
{
  // 명확한 제목과 설명 제공
  "title": "User Profile",
  "description": "사용자 프로필 정보를 나타내는 스키마",
  
  // 버전 관리
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://api.example.com/schemas/user-profile/v1.0.0",
  
  "type": "object",
  "properties": {
    // 각 필드에 대한 상세한 설명
    "username": {
      "type": "string",
      "title": "사용자명",
      "description": "로그인에 사용되는 고유한 사용자명",
      "minLength": 3,
      "maxLength": 20,
      "pattern": "^[a-zA-Z0-9_]+$",
      "examples": ["john_doe", "user123"]
    }
  },
  
  // 명확한 필수 필드 정의
  "required": ["username"],
  
  // 추가 속성 제어
  "additionalProperties": false
}
```

### 2. 오류 메시지 개선

```javascript
const customErrorMessages = {
  required: (field) => `${field} 필드는 필수입니다.`,
  minLength: (field, limit) => `${field}는 최소 ${limit}자 이상 입력해주세요.`,
  maxLength: (field, limit) => `${field}는 최대 ${limit}자까지 입력 가능합니다.`,
  format: (field, format) => {
    const formatMessages = {
      email: '올바른 이메일 형식을 입력해주세요.',
      date: '날짜 형식(YYYY-MM-DD)으로 입력해주세요.',
      uri: '올바른 URL 형식을 입력해주세요.'
    };
    return formatMessages[format] || `${field}의 형식이 올바르지 않습니다.`;
  }
};
```

### 3. 성능 최적화

```javascript
class OptimizedValidator {
  constructor() {
    this.compiledSchemas = new Map();
    this.ajv = new Ajv({
      loadSchema: this.loadExternalSchema.bind(this),
      cache: true // 스키마 캐싱 활성화
    });
  }
  
  async validate(data, schemaId) {
    let validator = this.compiledSchemas.get(schemaId);
    
    if (!validator) {
      const schema = await this.loadSchema(schemaId);
      validator = await this.ajv.compileAsync(schema);
      this.compiledSchemas.set(schemaId, validator);
    }
    
    return validator(data);
  }
  
  async loadSchema(schemaId) {
    // 스키마를 외부에서 로드하는 로직
    const response = await fetch(`/schemas/${schemaId}.json`);
    return response.json();
  }
  
  async loadExternalSchema(uri) {
    // 외부 참조 스키마 로드
    const response = await fetch(uri);
    return response.json();
  }
}
```

JSON Schema를 효과적으로 활용하면 데이터의 일관성과 품질을 보장하고, API 문서화와 클라이언트-서버 간 계약을 명확히 할 수 있습니다.