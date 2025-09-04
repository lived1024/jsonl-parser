# JSON 데이터 변환 가이드

JSON 데이터를 다양한 형태로 변환하고 처리하는 실용적인 기법들을 알아봅시다.

## 데이터 변환의 필요성

### 1. 시스템 간 데이터 교환
서로 다른 시스템이나 API 간에 데이터를 주고받을 때 형식 변환이 필요합니다.

### 2. 레거시 시스템 통합
기존 시스템과 새로운 시스템 간의 데이터 형식 차이를 해결해야 합니다.

### 3. 데이터 분석 및 시각화
분석 도구나 시각화 라이브러리에서 요구하는 형식으로 변환이 필요합니다.

## JSON to CSV 변환

### 1. 단순한 객체 배열
```javascript
function jsonToCsv(jsonArray) {
  if (jsonArray.length === 0) return '';
  
  // 헤더 추출
  const headers = Object.keys(jsonArray[0]);
  const csvHeaders = headers.join(',');
  
  // 데이터 행 생성
  const csvRows = jsonArray.map(obj => 
    headers.map(header => {
      const value = obj[header];
      // 쉼표나 따옴표가 있는 경우 처리
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
}

// 사용 예제
const users = [
  { id: 1, name: "홍길동", email: "hong@example.com", age: 30 },
  { id: 2, name: "김철수", email: "kim@example.com", age: 25 }
];

const csv = jsonToCsv(users);
console.log(csv);
// id,name,email,age
// 1,홍길동,hong@example.com,30
// 2,김철수,kim@example.com,25
```

### 2. 중첩된 객체 처리
```javascript
function flattenObject(obj, prefix = '') {
  const flattened = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(flattened, flattenObject(obj[key], newKey));
      } else if (Array.isArray(obj[key])) {
        flattened[newKey] = obj[key].join(';'); // 배열을 세미콜론으로 구분
      } else {
        flattened[newKey] = obj[key];
      }
    }
  }
  
  return flattened;
}

function nestedJsonToCsv(jsonArray) {
  const flattenedArray = jsonArray.map(obj => flattenObject(obj));
  return jsonToCsv(flattenedArray);
}

// 사용 예제
const nestedUsers = [
  {
    id: 1,
    name: "홍길동",
    profile: {
      age: 30,
      location: { city: "서울", country: "KR" }
    },
    hobbies: ["독서", "영화감상"]
  }
];

const nestedCsv = nestedJsonToCsv(nestedUsers);
console.log(nestedCsv);
// id,name,profile.age,profile.location.city,profile.location.country,hobbies
// 1,홍길동,30,서울,KR,독서;영화감상
```

## JSON to XML 변환

```javascript
function jsonToXml(obj, rootName = 'root') {
  function objectToXml(obj, indent = '') {
    let xml = '';
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        
        if (Array.isArray(value)) {
          value.forEach(item => {
            xml += `${indent}<${key}>\n`;
            if (typeof item === 'object') {
              xml += objectToXml(item, indent + '  ');
            } else {
              xml += `${indent}  ${escapeXml(item)}\n`;
            }
            xml += `${indent}</${key}>\n`;
          });
        } else if (typeof value === 'object' && value !== null) {
          xml += `${indent}<${key}>\n`;
          xml += objectToXml(value, indent + '  ');
          xml += `${indent}</${key}>\n`;
        } else {
          xml += `${indent}<${key}>${escapeXml(value)}</${key}>\n`;
        }
      }
    }
    
    return xml;
  }
  
  function escapeXml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  
  return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n${objectToXml(obj, '  ')}</${rootName}>`;
}

// 사용 예제
const user = {
  id: 1,
  name: "홍길동",
  profile: {
    age: 30,
    bio: "소프트웨어 개발자"
  },
  hobbies: ["독서", "영화감상"]
};

const xml = jsonToXml(user, 'user');
console.log(xml);
```

## JSON to YAML 변환

```javascript
function jsonToYaml(obj, indent = 0) {
  const spaces = '  '.repeat(indent);
  let yaml = '';
  
  if (Array.isArray(obj)) {
    obj.forEach(item => {
      yaml += `${spaces}- `;
      if (typeof item === 'object' && item !== null) {
        yaml += '\n' + jsonToYaml(item, indent + 1);
      } else {
        yaml += formatYamlValue(item) + '\n';
      }
    });
  } else if (typeof obj === 'object' && obj !== null) {
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      yaml += `${spaces}${key}: `;
      
      if (Array.isArray(value)) {
        yaml += '\n' + jsonToYaml(value, indent + 1);
      } else if (typeof value === 'object' && value !== null) {
        yaml += '\n' + jsonToYaml(value, indent + 1);
      } else {
        yaml += formatYamlValue(value) + '\n';
      }
    });
  }
  
  return yaml;
}

function formatYamlValue(value) {
  if (typeof value === 'string') {
    // 특수 문자가 있으면 따옴표로 감싸기
    if (value.includes(':') || value.includes('\n') || value.includes('"')) {
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    return value;
  }
  return String(value);
}

// 사용 예제
const config = {
  app: {
    name: "MyApp",
    version: "1.0.0",
    debug: true
  },
  database: {
    host: "localhost",
    port: 5432
  },
  features: ["auth", "logging", "caching"]
};

const yaml = jsonToYaml(config);
console.log(yaml);
```

## 데이터 구조 변환

### 1. 배열을 객체로 변환
```javascript
function arrayToObject(array, keyField) {
  return array.reduce((obj, item) => {
    obj[item[keyField]] = item;
    return obj;
  }, {});
}

// 사용 예제
const users = [
  { id: 1, name: "홍길동", email: "hong@example.com" },
  { id: 2, name: "김철수", email: "kim@example.com" }
];

const userMap = arrayToObject(users, 'id');
console.log(userMap);
// {
//   "1": { id: 1, name: "홍길동", email: "hong@example.com" },
//   "2": { id: 2, name: "김철수", email: "kim@example.com" }
// }
```

### 2. 객체를 배열로 변환
```javascript
function objectToArray(obj, keyName = 'key', valueName = 'value') {
  return Object.entries(obj).map(([key, value]) => ({
    [keyName]: key,
    [valueName]: value
  }));
}

// 사용 예제
const settings = {
  theme: "dark",
  language: "ko",
  notifications: true
};

const settingsArray = objectToArray(settings, 'setting', 'value');
console.log(settingsArray);
// [
//   { setting: "theme", value: "dark" },
//   { setting: "language", value: "ko" },
//   { setting: "notifications", value: true }
// ]
```

### 3. 데이터 그룹화
```javascript
function groupBy(array, keyFunction) {
  return array.reduce((groups, item) => {
    const key = typeof keyFunction === 'function' ? keyFunction(item) : item[keyFunction];
    
    if (!groups[key]) {
      groups[key] = [];
    }
    
    groups[key].push(item);
    return groups;
  }, {});
}

// 사용 예제
const orders = [
  { id: 1, customer: "홍길동", status: "completed", amount: 100000 },
  { id: 2, customer: "김철수", status: "pending", amount: 50000 },
  { id: 3, customer: "홍길동", status: "completed", amount: 75000 }
];

const ordersByCustomer = groupBy(orders, 'customer');
const ordersByStatus = groupBy(orders, order => order.status);

console.log(ordersByCustomer);
// {
//   "홍길동": [
//     { id: 1, customer: "홍길동", status: "completed", amount: 100000 },
//     { id: 3, customer: "홍길동", status: "completed", amount: 75000 }
//   ],
//   "김철수": [
//     { id: 2, customer: "김철수", status: "pending", amount: 50000 }
//   ]
// }
```

## 데이터 필터링 및 변환

### 1. 조건부 필터링
```javascript
function filterAndTransform(data, filterFn, transformFn) {
  return data
    .filter(filterFn)
    .map(transformFn);
}

// 사용 예제
const products = [
  { id: 1, name: "노트북", price: 1200000, category: "전자제품", inStock: true },
  { id: 2, name: "마우스", price: 25000, category: "전자제품", inStock: false },
  { id: 3, name: "책", price: 15000, category: "도서", inStock: true }
];

const availableElectronics = filterAndTransform(
  products,
  product => product.category === "전자제품" && product.inStock,
  product => ({
    id: product.id,
    name: product.name,
    formattedPrice: `₩${product.price.toLocaleString()}`
  })
);

console.log(availableElectronics);
// [
//   { id: 1, name: "노트북", formattedPrice: "₩1,200,000" }
// ]
```

### 2. 데이터 집계
```javascript
function aggregateData(data, groupKey, aggregations) {
  const grouped = groupBy(data, groupKey);
  
  return Object.entries(grouped).map(([key, items]) => {
    const result = { [groupKey]: key };
    
    Object.entries(aggregations).forEach(([aggKey, aggFn]) => {
      result[aggKey] = aggFn(items);
    });
    
    return result;
  });
}

// 사용 예제
const salesData = [
  { region: "서울", product: "A", sales: 100, profit: 20 },
  { region: "서울", product: "B", sales: 150, profit: 30 },
  { region: "부산", product: "A", sales: 80, profit: 15 },
  { region: "부산", product: "B", sales: 120, profit: 25 }
];

const regionSummary = aggregateData(salesData, 'region', {
  totalSales: items => items.reduce((sum, item) => sum + item.sales, 0),
  totalProfit: items => items.reduce((sum, item) => sum + item.profit, 0),
  productCount: items => items.length,
  avgSales: items => items.reduce((sum, item) => sum + item.sales, 0) / items.length
});

console.log(regionSummary);
// [
//   { region: "서울", totalSales: 250, totalProfit: 50, productCount: 2, avgSales: 125 },
//   { region: "부산", totalSales: 200, totalProfit: 40, productCount: 2, avgSales: 100 }
// ]
```

## 스키마 변환

### 1. 필드 매핑
```javascript
function transformSchema(data, fieldMapping) {
  if (Array.isArray(data)) {
    return data.map(item => transformSchema(item, fieldMapping));
  }
  
  const transformed = {};
  
  Object.entries(fieldMapping).forEach(([newField, oldField]) => {
    if (typeof oldField === 'string') {
      transformed[newField] = getNestedValue(data, oldField);
    } else if (typeof oldField === 'function') {
      transformed[newField] = oldField(data);
    }
  });
  
  return transformed;
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key];
  }, obj);
}

// 사용 예제
const apiResponse = [
  {
    user_id: 1,
    full_name: "홍길동",
    email_address: "hong@example.com",
    profile_data: {
      birth_date: "1990-01-01",
      location: { city: "서울" }
    }
  }
];

const fieldMapping = {
  id: 'user_id',
  name: 'full_name',
  email: 'email_address',
  birthDate: 'profile_data.birth_date',
  city: 'profile_data.location.city',
  displayName: (data) => `${data.full_name} (${data.user_id})`
};

const transformed = transformSchema(apiResponse, fieldMapping);
console.log(transformed);
// [
//   {
//     id: 1,
//     name: "홍길동",
//     email: "hong@example.com",
//     birthDate: "1990-01-01",
//     city: "서울",
//     displayName: "홍길동 (1)"
//   }
// ]
```

## 성능 최적화

### 1. 스트리밍 변환
```javascript
class StreamingTransformer {
  constructor(transformFn) {
    this.transformFn = transformFn;
    this.buffer = [];
    this.batchSize = 1000;
  }
  
  async processChunk(chunk) {
    this.buffer.push(...chunk);
    
    if (this.buffer.length >= this.batchSize) {
      return this.processBatch();
    }
    
    return [];
  }
  
  async processBatch() {
    const batch = this.buffer.splice(0, this.batchSize);
    
    return new Promise(resolve => {
      setTimeout(() => {
        const transformed = batch.map(this.transformFn);
        resolve(transformed);
      }, 0);
    });
  }
  
  async flush() {
    if (this.buffer.length > 0) {
      return this.processBatch();
    }
    return [];
  }
}

// 사용 예제
const transformer = new StreamingTransformer(item => ({
  ...item,
  processed: true,
  timestamp: Date.now()
}));

// 대용량 데이터 처리
async function processLargeDataset(largeArray) {
  const results = [];
  const chunkSize = 500;
  
  for (let i = 0; i < largeArray.length; i += chunkSize) {
    const chunk = largeArray.slice(i, i + chunkSize);
    const processed = await transformer.processChunk(chunk);
    results.push(...processed);
  }
  
  // 남은 데이터 처리
  const remaining = await transformer.flush();
  results.push(...remaining);
  
  return results;
}
```

이러한 데이터 변환 기법들을 활용하면 다양한 시스템 간의 데이터 호환성을 확보하고 효율적인 데이터 처리를 구현할 수 있습니다.