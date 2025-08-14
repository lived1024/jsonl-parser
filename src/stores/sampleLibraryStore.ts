import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SampleData, SampleMetadata } from '../types'
import { useJsonTreeStore } from './jsonTreeStore'

interface SampleFilter {
  category?: string
  difficulty?: string
  size?: string
  search?: string
}

export const useSampleLibraryStore = defineStore('sampleLibrary', () => {
  // 상태
  const samples = ref<SampleData[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const recentSamples = ref<string[]>([])

  // 계산된 속성
  const samplesByCategory = computed(() => {
    const grouped: Record<string, SampleData[]> = {}
    samples.value.forEach(sample => {
      if (!grouped[sample.category]) {
        grouped[sample.category] = []
      }
      grouped[sample.category].push(sample)
    })
    return grouped
  })

  const categories = computed(() => {
    return [...new Set(samples.value.map(sample => sample.category))]
  })

  const difficulties = computed(() => {
    return [...new Set(samples.value.map(sample => sample.difficulty))]
  })

  const sizes = computed(() => {
    return [...new Set(samples.value.map(sample => sample.size))]
  })

  // 액션
  const loadSamples = async () => {
    if (samples.value.length > 0) return // 이미 로드됨

    isLoading.value = true
    error.value = null

    try {
      // 정적 샘플 데이터 로드
      samples.value = await loadStaticSamples()
      loadRecentSamples()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '샘플 데이터를 로드하는 중 오류가 발생했습니다.'
      console.error('샘플 로드 오류:', err)
    } finally {
      isLoading.value = false
    }
  }

  const getSampleById = (id: string): SampleData | undefined => {
    return samples.value.find(sample => sample.id === id)
  }

  const getFilteredSamples = (filter: SampleFilter): SampleData[] => {
    return samples.value.filter(sample => {
      // 카테고리 필터
      if (filter.category && sample.category !== filter.category) {
        return false
      }

      // 복잡도 필터
      if (filter.difficulty && sample.difficulty !== filter.difficulty) {
        return false
      }

      // 크기 필터
      if (filter.size && sample.size !== filter.size) {
        return false
      }

      // 검색 필터
      if (filter.search) {
        const searchLower = filter.search.toLowerCase()
        const matchesName = sample.name.toLowerCase().includes(searchLower)
        const matchesDescription = sample.description.toLowerCase().includes(searchLower)
        const matchesUseCase = sample.metadata.useCase.toLowerCase().includes(searchLower)
        const matchesFeatures = sample.metadata.features.some(feature => 
          feature.toLowerCase().includes(searchLower)
        )
        
        if (!matchesName && !matchesDescription && !matchesUseCase && !matchesFeatures) {
          return false
        }
      }

      return true
    })
  }

  const loadSampleInParser = (sample: SampleData) => {
    const jsonTreeStore = useJsonTreeStore()
    
    try {
      // 파서에 샘플 데이터 로드
      jsonTreeStore.setInputData(sample.data)
      
      // 최근 사용한 샘플에 추가
      addToRecentSamples(sample.id)
      
      // 성공 메시지 (선택적)
      console.log(`샘플 "${sample.name}"이 파서에 로드되었습니다.`)
    } catch (err) {
      console.error('샘플 로드 오류:', err)
      throw new Error('샘플을 파서에 로드하는 중 오류가 발생했습니다.')
    }
  }

  const addToRecentSamples = (sampleId: string) => {
    // 중복 제거
    const filtered = recentSamples.value.filter(id => id !== sampleId)
    
    // 맨 앞에 추가
    recentSamples.value = [sampleId, ...filtered].slice(0, 10) // 최대 10개 유지
    
    // 로컬 스토리지에 저장
    saveRecentSamples()
  }

  const getRecentSamples = (): SampleData[] => {
    return recentSamples.value
      .map(id => getSampleById(id))
      .filter((sample): sample is SampleData => sample !== undefined)
  }

  const saveRecentSamples = () => {
    try {
      localStorage.setItem('jsonl-parser-recent-samples', JSON.stringify(recentSamples.value))
    } catch (err) {
      console.warn('최근 샘플 저장 실패:', err)
    }
  }

  const loadRecentSamples = () => {
    try {
      const saved = localStorage.getItem('jsonl-parser-recent-samples')
      if (saved) {
        recentSamples.value = JSON.parse(saved)
      }
    } catch (err) {
      console.warn('최근 샘플 로드 실패:', err)
      recentSamples.value = []
    }
  }

  const clearRecentSamples = () => {
    recentSamples.value = []
    saveRecentSamples()
  }

  return {
    // 상태
    samples,
    isLoading,
    error,
    recentSamples,
    
    // 계산된 속성
    samplesByCategory,
    categories,
    difficulties,
    sizes,
    
    // 액션
    loadSamples,
    getSampleById,
    getFilteredSamples,
    loadSampleInParser,
    addToRecentSamples,
    getRecentSamples,
    clearRecentSamples
  }
})

// 정적 샘플 데이터 로드 함수
async function loadStaticSamples(): Promise<SampleData[]> {
  // 실제 구현에서는 정적 파일에서 로드하거나 API에서 가져올 수 있습니다
  return [
    {
      id: 'api-user-profile',
      name: '사용자 프로필 API 응답',
      description: '소셜 미디어 플랫폼의 사용자 프로필 정보를 포함한 전형적인 REST API 응답 예제입니다.',
      category: 'api',
      difficulty: 'simple',
      size: 'small',
      data: JSON.stringify({
        "id": 12345,
        "username": "john_doe",
        "email": "john.doe@example.com",
        "profile": {
          "firstName": "John",
          "lastName": "Doe",
          "avatar": "https://example.com/avatars/john_doe.jpg",
          "bio": "Software developer passionate about web technologies",
          "location": "Seoul, South Korea",
          "website": "https://johndoe.dev"
        },
        "settings": {
          "theme": "dark",
          "notifications": {
            "email": true,
            "push": false,
            "sms": true
          },
          "privacy": {
            "profileVisible": true,
            "showEmail": false
          }
        },
        "stats": {
          "followers": 1234,
          "following": 567,
          "posts": 89
        },
        "createdAt": "2023-01-15T10:30:00Z",
        "lastLogin": "2024-01-20T14:22:33Z"
      }, null, 2),
      metadata: {
        source: '소셜 미디어 API',
        useCase: 'REST API 응답 구조 학습',
        features: ['중첩 객체', '배열', '타임스탬프', '불린 값'],
        learningPoints: [
          'REST API 응답의 일반적인 구조',
          '사용자 데이터 모델링',
          '중첩된 설정 객체 처리',
          'ISO 8601 날짜 형식'
        ]
      }
    },
    {
      id: 'config-webpack',
      name: 'Webpack 설정 파일',
      description: '복잡한 웹팩 설정 파일의 예제로, 다양한 로더와 플러그인 설정을 포함합니다.',
      category: 'config',
      difficulty: 'complex',
      size: 'large',
      data: JSON.stringify({
        "mode": "production",
        "entry": {
          "main": "./src/index.js",
          "vendor": ["react", "react-dom", "lodash"]
        },
        "output": {
          "path": "/dist",
          "filename": "[name].[contenthash].js",
          "chunkFilename": "[name].[contenthash].chunk.js",
          "publicPath": "/assets/"
        },
        "module": {
          "rules": [
            {
              "test": "/\\.jsx?$/",
              "exclude": "/node_modules/",
              "use": {
                "loader": "babel-loader",
                "options": {
                  "presets": ["@babel/preset-env", "@babel/preset-react"],
                  "plugins": ["@babel/plugin-syntax-dynamic-import"]
                }
              }
            },
            {
              "test": "/\\.css$/",
              "use": ["style-loader", "css-loader", "postcss-loader"]
            },
            {
              "test": "/\\.(png|jpe?g|gif|svg)$/",
              "type": "asset/resource",
              "generator": {
                "filename": "images/[name].[hash][ext]"
              }
            }
          ]
        },
        "plugins": [
          {
            "name": "HtmlWebpackPlugin",
            "options": {
              "template": "./src/index.html",
              "minify": true
            }
          },
          {
            "name": "MiniCssExtractPlugin",
            "options": {
              "filename": "[name].[contenthash].css"
            }
          }
        ],
        "optimization": {
          "splitChunks": {
            "chunks": "all",
            "cacheGroups": {
              "vendor": {
                "test": "/[\\\\/]node_modules[\\\\/]/",
                "name": "vendors",
                "chunks": "all"
              }
            }
          },
          "minimizer": ["TerserPlugin", "CssMinimizerPlugin"]
        },
        "resolve": {
          "extensions": [".js", ".jsx", ".json"],
          "alias": {
            "@": "./src",
            "components": "./src/components"
          }
        },
        "devServer": {
          "port": 3000,
          "hot": true,
          "historyApiFallback": true,
          "static": {
            "directory": "./public"
          }
        }
      }, null, 2),
      metadata: {
        source: '웹팩 공식 문서',
        useCase: '빌드 도구 설정 파일 분석',
        features: ['복잡한 중첩 구조', '정규식 패턴', '배열 설정', '조건부 설정'],
        learningPoints: [
          '웹팩 설정 구조 이해',
          '로더와 플러그인 설정',
          '최적화 옵션 구성',
          '개발 서버 설정'
        ]
      }
    },
    {
      id: 'data-ecommerce-orders',
      name: '전자상거래 주문 데이터',
      description: '온라인 쇼핑몰의 주문 내역 데이터로, 고객 정보, 상품 목록, 결제 정보를 포함합니다.',
      category: 'data',
      difficulty: 'medium',
      size: 'medium',
      data: JSON.stringify({
        "orders": [
          {
            "orderId": "ORD-2024-001234",
            "orderDate": "2024-01-20T09:15:30Z",
            "status": "shipped",
            "customer": {
              "customerId": "CUST-789012",
              "name": "김민수",
              "email": "minsu.kim@example.com",
              "phone": "+82-10-1234-5678",
              "address": {
                "street": "강남대로 123",
                "city": "서울",
                "state": "서울특별시",
                "zipCode": "06234",
                "country": "KR"
              }
            },
            "items": [
              {
                "productId": "PROD-001",
                "name": "무선 블루투스 헤드폰",
                "category": "전자제품",
                "price": 89000,
                "quantity": 1,
                "discount": 0.1,
                "finalPrice": 80100
              },
              {
                "productId": "PROD-002",
                "name": "스마트폰 케이스",
                "category": "액세서리",
                "price": 25000,
                "quantity": 2,
                "discount": 0,
                "finalPrice": 50000
              }
            ],
            "payment": {
              "method": "credit_card",
              "cardType": "visa",
              "lastFourDigits": "1234",
              "subtotal": 139000,
              "tax": 13900,
              "shipping": 3000,
              "total": 155900,
              "currency": "KRW"
            },
            "shipping": {
              "method": "standard",
              "carrier": "CJ대한통운",
              "trackingNumber": "123456789012",
              "estimatedDelivery": "2024-01-23T18:00:00Z",
              "actualDelivery": "2024-01-22T16:30:00Z"
            }
          }
        ],
        "pagination": {
          "currentPage": 1,
          "totalPages": 45,
          "totalOrders": 1340,
          "ordersPerPage": 30
        },
        "summary": {
          "totalRevenue": 15590000,
          "averageOrderValue": 116343,
          "topSellingCategory": "전자제품",
          "returnRate": 0.03
        }
      }, null, 2),
      metadata: {
        source: '전자상거래 플랫폼',
        useCase: '주문 관리 시스템 데이터 분석',
        features: ['중첩 배열', '계산된 값', '다국가 주소', '결제 정보'],
        learningPoints: [
          '전자상거래 데이터 모델',
          '주문 상태 관리',
          '결제 및 배송 정보 구조',
          '페이지네이션 처리'
        ]
      }
    },
    {
      id: 'complex-analytics-dashboard',
      name: '분석 대시보드 데이터',
      description: '웹 분석 대시보드의 복합 데이터로, 다차원 메트릭과 시계열 데이터를 포함합니다.',
      category: 'complex',
      difficulty: 'complex',
      size: 'large',
      data: JSON.stringify({
        "dashboard": {
          "id": "analytics-2024-q1",
          "name": "Q1 2024 웹사이트 분석",
          "dateRange": {
            "start": "2024-01-01T00:00:00Z",
            "end": "2024-03-31T23:59:59Z"
          },
          "metrics": {
            "overview": {
              "totalVisitors": 125430,
              "uniqueVisitors": 89234,
              "pageViews": 456789,
              "bounceRate": 0.34,
              "avgSessionDuration": 245.67,
              "conversionRate": 0.0234
            },
            "traffic": {
              "organic": {
                "visitors": 45678,
                "percentage": 0.364,
                "growth": 0.12
              },
              "direct": {
                "visitors": 23456,
                "percentage": 0.187,
                "growth": -0.05
              },
              "social": {
                "visitors": 12345,
                "percentage": 0.098,
                "growth": 0.23
              },
              "referral": {
                "visitors": 7755,
                "percentage": 0.062,
                "growth": 0.08
              }
            },
            "devices": {
              "desktop": {
                "sessions": 67890,
                "percentage": 0.541,
                "avgSessionDuration": 312.45
              },
              "mobile": {
                "sessions": 45678,
                "percentage": 0.364,
                "avgSessionDuration": 189.23
              },
              "tablet": {
                "sessions": 11862,
                "percentage": 0.095,
                "avgSessionDuration": 267.89
              }
            }
          },
          "timeSeries": {
            "daily": [
              {
                "date": "2024-01-01",
                "visitors": 1234,
                "pageViews": 5678,
                "conversions": 23
              },
              {
                "date": "2024-01-02",
                "visitors": 1456,
                "pageViews": 6234,
                "conversions": 31
              }
            ],
            "hourly": [
              {
                "hour": 0,
                "avgVisitors": 45,
                "avgPageViews": 123
              },
              {
                "hour": 1,
                "avgVisitors": 23,
                "avgPageViews": 67
              }
            ]
          },
          "topPages": [
            {
              "path": "/",
              "title": "홈페이지",
              "views": 123456,
              "uniqueViews": 89012,
              "avgTimeOnPage": 145.67,
              "exitRate": 0.23
            },
            {
              "path": "/products",
              "title": "제품 목록",
              "views": 67890,
              "uniqueViews": 45678,
              "avgTimeOnPage": 234.56,
              "exitRate": 0.34
            }
          ],
          "goals": [
            {
              "id": "newsletter-signup",
              "name": "뉴스레터 가입",
              "completions": 1234,
              "conversionRate": 0.0234,
              "value": 15.50
            },
            {
              "id": "purchase",
              "name": "구매 완료",
              "completions": 567,
              "conversionRate": 0.0108,
              "value": 89.99
            }
          ],
          "segments": {
            "newUsers": {
              "count": 34567,
              "percentage": 0.387,
              "avgSessionDuration": 189.45,
              "bounceRate": 0.45
            },
            "returningUsers": {
              "count": 54663,
              "percentage": 0.613,
              "avgSessionDuration": 287.89,
              "bounceRate": 0.28
            }
          }
        }
      }, null, 2),
      metadata: {
        source: '웹 분석 플랫폼',
        useCase: '복합 분석 데이터 시각화',
        features: ['다차원 메트릭', '시계열 데이터', '중첩 통계', '백분율 계산'],
        learningPoints: [
          '복잡한 분석 데이터 구조',
          '시계열 데이터 처리',
          '다차원 메트릭 분석',
          '세그먼트별 데이터 분류'
        ]
      }
    },
    {
      id: 'jsonl-log-entries',
      name: '서버 로그 엔트리 (JSONL)',
      description: '웹 서버의 구조화된 로그 데이터를 JSONL 형식으로 저장한 예제입니다.',
      category: 'data',
      difficulty: 'simple',
      size: 'medium',
      data: `{"timestamp": "2024-01-20T10:15:30.123Z", "level": "INFO", "service": "api-gateway", "message": "Request processed successfully", "request_id": "req_123456", "user_id": "user_789", "endpoint": "/api/v1/users", "method": "GET", "status_code": 200, "response_time_ms": 45, "ip_address": "192.168.1.100"}
{"timestamp": "2024-01-20T10:15:31.456Z", "level": "WARN", "service": "auth-service", "message": "Rate limit approaching", "request_id": "req_123457", "user_id": "user_456", "endpoint": "/api/v1/auth/login", "method": "POST", "status_code": 429, "response_time_ms": 12, "ip_address": "192.168.1.101", "rate_limit": {"current": 95, "limit": 100, "window": "1m"}}
{"timestamp": "2024-01-20T10:15:32.789Z", "level": "ERROR", "service": "database", "message": "Connection timeout", "request_id": "req_123458", "error": {"type": "ConnectionTimeoutError", "code": "DB_TIMEOUT", "details": "Connection to primary database timed out after 30s"}, "retry_count": 2, "max_retries": 3}
{"timestamp": "2024-01-20T10:15:33.012Z", "level": "INFO", "service": "payment-service", "message": "Payment processed", "request_id": "req_123459", "user_id": "user_321", "transaction": {"id": "txn_987654", "amount": 29.99, "currency": "USD", "payment_method": "credit_card", "status": "completed"}, "processing_time_ms": 1250}
{"timestamp": "2024-01-20T10:15:34.345Z", "level": "DEBUG", "service": "cache-service", "message": "Cache miss", "request_id": "req_123460", "cache_key": "user_profile_789", "ttl": 3600, "fallback": "database_query"}`,
      metadata: {
        source: '웹 서버 로그',
        useCase: 'JSONL 로그 분석 및 모니터링',
        features: ['JSONL 형식', '시계열 데이터', '다양한 로그 레벨', '중첩 객체'],
        learningPoints: [
          'JSONL 형식의 구조화된 로그',
          '시계열 데이터 처리',
          '로그 레벨별 분류',
          '오류 추적 및 디버깅'
        ]
      }
    },
    {
      id: 'config-package-json',
      name: 'Node.js Package.json',
      description: 'Node.js 프로젝트의 package.json 설정 파일로, 의존성과 스크립트 설정을 포함합니다.',
      category: 'config',
      difficulty: 'medium',
      size: 'medium',
      data: JSON.stringify({
        "name": "jsonl-parser-app",
        "version": "1.2.0",
        "description": "Interactive JSON and JSONL parser with tree visualization",
        "type": "module",
        "main": "dist/index.js",
        "scripts": {
          "dev": "vite",
          "build": "vue-tsc && vite build",
          "preview": "vite preview",
          "test": "vitest",
          "test:run": "vitest run",
          "test:coverage": "vitest run --coverage",
          "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix --ignore-path .gitignore",
          "format": "prettier --write src/",
          "type-check": "vue-tsc --noEmit"
        },
        "dependencies": {
          "vue": "^3.4.0",
          "vue-router": "^4.2.5",
          "pinia": "^2.1.7",
          "highlight.js": "^11.9.0",
          "marked": "^11.1.1",
          "lucide-vue-next": "^0.294.0"
        },
        "devDependencies": {
          "@types/node": "^20.10.0",
          "@vitejs/plugin-vue": "^4.5.2",
          "@vue/test-utils": "^2.4.3",
          "eslint": "^8.56.0",
          "eslint-plugin-vue": "^9.19.2",
          "jsdom": "^23.0.1",
          "prettier": "^3.1.1",
          "typescript": "^5.3.3",
          "vite": "^5.0.8",
          "vitest": "^1.1.0",
          "vue-tsc": "^1.8.25"
        },
        "engines": {
          "node": ">=18.0.0",
          "npm": ">=8.0.0"
        },
        "keywords": [
          "json",
          "jsonl",
          "parser",
          "vue",
          "typescript",
          "visualization"
        ],
        "author": {
          "name": "JSONL Parser Team",
          "email": "team@jsonlparser.com",
          "url": "https://jsonlparser.com"
        },
        "license": "MIT",
        "repository": {
          "type": "git",
          "url": "https://github.com/jsonl-parser/app.git"
        },
        "bugs": {
          "url": "https://github.com/jsonl-parser/app/issues"
        },
        "homepage": "https://jsonlparser.com"
      }, null, 2),
      metadata: {
        source: 'Node.js 프로젝트',
        useCase: 'JavaScript 프로젝트 설정 관리',
        features: ['의존성 관리', '스크립트 설정', '메타데이터', '버전 관리'],
        learningPoints: [
          'package.json 구조 이해',
          '의존성 vs 개발 의존성',
          'npm 스크립트 설정',
          '프로젝트 메타데이터 관리'
        ]
      }
    },
    {
      id: 'api-github-user',
      name: 'GitHub 사용자 API 응답',
      description: 'GitHub REST API에서 사용자 정보를 조회했을 때의 응답 데이터입니다.',
      category: 'api',
      difficulty: 'medium',
      size: 'medium',
      data: JSON.stringify({
        "login": "octocat",
        "id": 1,
        "node_id": "MDQ6VXNlcjE=",
        "avatar_url": "https://github.com/images/error/octocat_happy.gif",
        "gravatar_id": "",
        "url": "https://api.github.com/users/octocat",
        "html_url": "https://github.com/octocat",
        "followers_url": "https://api.github.com/users/octocat/followers",
        "following_url": "https://api.github.com/users/octocat/following{/other_user}",
        "gists_url": "https://api.github.com/users/octocat/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/octocat/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/octocat/subscriptions",
        "organizations_url": "https://api.github.com/users/octocat/orgs",
        "repos_url": "https://api.github.com/users/octocat/repos",
        "events_url": "https://api.github.com/users/octocat/events{/privacy}",
        "received_events_url": "https://api.github.com/users/octocat/received_events",
        "type": "User",
        "site_admin": false,
        "name": "The Octocat",
        "company": "@github",
        "blog": "https://github.blog",
        "location": "San Francisco",
        "email": "octocat@github.com",
        "hireable": null,
        "bio": "There once was...",
        "twitter_username": null,
        "public_repos": 8,
        "public_gists": 8,
        "followers": 9999,
        "following": 9,
        "created_at": "2008-01-14T04:33:35Z",
        "updated_at": "2008-01-14T04:33:35Z"
      }, null, 2),
      metadata: {
        source: 'GitHub REST API',
        useCase: 'REST API 응답 구조 학습',
        features: ['URL 템플릿', 'ISO 날짜', '중첩 링크', 'null 값 처리'],
        learningPoints: [
          'REST API 응답 구조',
          'HATEOAS 링크 패턴',
          'API 버전 관리',
          'null 값과 빈 문자열 구분'
        ]
      }
    },
    {
      id: 'complex-nested-data',
      name: '복잡한 중첩 데이터 구조',
      description: '깊은 중첩과 다양한 데이터 타입을 포함한 복잡한 JSON 구조의 예제입니다.',
      category: 'complex',
      difficulty: 'complex',
      size: 'large',
      data: JSON.stringify({
        "metadata": {
          "version": "2.1.0",
          "generated_at": "2024-01-20T15:30:45.123Z",
          "generator": {
            "name": "DataExporter",
            "version": "1.5.2",
            "config": {
              "format": "json",
              "compression": false,
              "include_metadata": true,
              "filters": ["active", "verified"],
              "sort_by": "created_at",
              "limit": 1000
            }
          }
        },
        "data": {
          "organizations": [
            {
              "id": "org_001",
              "name": "TechCorp Inc.",
              "type": "enterprise",
              "status": "active",
              "founded": "2010-03-15",
              "headquarters": {
                "address": {
                  "street": "123 Innovation Drive",
                  "city": "San Francisco",
                  "state": "CA",
                  "zip": "94105",
                  "country": "US",
                  "coordinates": {
                    "latitude": 37.7749,
                    "longitude": -122.4194,
                    "accuracy": "high"
                  }
                },
                "timezone": "America/Los_Angeles",
                "phone": "+1-555-0123"
              },
              "departments": [
                {
                  "id": "dept_eng",
                  "name": "Engineering",
                  "budget": {
                    "annual": 5000000,
                    "currency": "USD",
                    "breakdown": {
                      "salaries": 0.70,
                      "equipment": 0.15,
                      "training": 0.10,
                      "other": 0.05
                    }
                  },
                  "teams": [
                    {
                      "id": "team_frontend",
                      "name": "Frontend Development",
                      "lead": {
                        "id": "emp_001",
                        "name": "Alice Johnson",
                        "email": "alice.johnson@techcorp.com",
                        "role": "Senior Frontend Engineer",
                        "skills": ["React", "TypeScript", "Vue.js", "CSS"],
                        "experience_years": 8,
                        "certifications": [
                          {
                            "name": "AWS Certified Developer",
                            "issued_by": "Amazon Web Services",
                            "issued_date": "2023-06-15",
                            "expires_date": "2026-06-15",
                            "credential_id": "AWS-DEV-123456"
                          }
                        ]
                      },
                      "members": [
                        {
                          "id": "emp_002",
                          "name": "Bob Smith",
                          "role": "Frontend Developer",
                          "level": "mid",
                          "projects": [
                            {
                              "id": "proj_001",
                              "name": "Customer Portal Redesign",
                              "status": "in_progress",
                              "progress": 0.65,
                              "milestones": [
                                {
                                  "name": "Design System",
                                  "completed": true,
                                  "completion_date": "2024-01-10"
                                },
                                {
                                  "name": "Component Library",
                                  "completed": true,
                                  "completion_date": "2024-01-15"
                                },
                                {
                                  "name": "User Authentication",
                                  "completed": false,
                                  "due_date": "2024-01-25"
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ],
              "metrics": {
                "employees": {
                  "total": 1250,
                  "by_department": {
                    "engineering": 450,
                    "sales": 200,
                    "marketing": 150,
                    "hr": 50,
                    "finance": 75,
                    "operations": 325
                  },
                  "by_level": {
                    "junior": 300,
                    "mid": 500,
                    "senior": 350,
                    "lead": 75,
                    "executive": 25
                  }
                },
                "financial": {
                  "revenue": {
                    "2023": {
                      "q1": 12500000,
                      "q2": 13200000,
                      "q3": 14100000,
                      "q4": 15800000,
                      "total": 55600000
                    },
                    "2024": {
                      "q1": 16200000,
                      "projected_annual": 68000000
                    }
                  },
                  "expenses": {
                    "2023": {
                      "salaries": 28000000,
                      "benefits": 8400000,
                      "infrastructure": 5600000,
                      "marketing": 4200000,
                      "other": 3800000,
                      "total": 50000000
                    }
                  }
                }
              }
            }
          ]
        },
        "pagination": {
          "current_page": 1,
          "total_pages": 1,
          "total_records": 1,
          "per_page": 1000,
          "has_next": false,
          "has_previous": false
        },
        "links": {
          "self": "https://api.example.com/v2/organizations?page=1",
          "first": "https://api.example.com/v2/organizations?page=1",
          "last": "https://api.example.com/v2/organizations?page=1"
        }
      }, null, 2),
      metadata: {
        source: '기업 데이터 관리 시스템',
        useCase: '복잡한 조직 데이터 구조 분석',
        features: ['깊은 중첩', '배열 내 객체', '다양한 데이터 타입', '계층적 구조'],
        learningPoints: [
          '복잡한 중첩 구조 탐색',
          '계층적 데이터 모델링',
          '다차원 메트릭 처리',
          '대용량 JSON 구조 최적화'
        ]
      }
    },
    {
      id: 'config-docker-compose',
      name: 'Docker Compose 설정',
      description: '마이크로서비스 아키텍처를 위한 Docker Compose 설정 파일입니다.',
      category: 'config',
      difficulty: 'medium',
      size: 'medium',
      data: JSON.stringify({
        "version": "3.8",
        "services": {
          "frontend": {
            "build": {
              "context": "./frontend",
              "dockerfile": "Dockerfile",
              "args": {
                "NODE_ENV": "production",
                "API_URL": "http://api:3000"
              }
            },
            "ports": ["80:80"],
            "depends_on": ["api"],
            "environment": {
              "NODE_ENV": "production",
              "API_BASE_URL": "http://api:3000"
            },
            "volumes": ["./frontend/nginx.conf:/etc/nginx/nginx.conf:ro"],
            "restart": "unless-stopped",
            "healthcheck": {
              "test": ["CMD", "curl", "-f", "http://localhost/health"],
              "interval": "30s",
              "timeout": "10s",
              "retries": 3,
              "start_period": "40s"
            }
          },
          "api": {
            "build": {
              "context": "./api",
              "dockerfile": "Dockerfile"
            },
            "ports": ["3000:3000"],
            "depends_on": {
              "database": {
                "condition": "service_healthy"
              },
              "redis": {
                "condition": "service_started"
              }
            },
            "environment": {
              "NODE_ENV": "production",
              "DATABASE_URL": "postgresql://user:password@database:5432/myapp",
              "REDIS_URL": "redis://redis:6379",
              "JWT_SECRET": "${JWT_SECRET}",
              "PORT": "3000"
            },
            "volumes": ["./api/uploads:/app/uploads"],
            "restart": "unless-stopped"
          },
          "database": {
            "image": "postgres:15-alpine",
            "environment": {
              "POSTGRES_DB": "myapp",
              "POSTGRES_USER": "user",
              "POSTGRES_PASSWORD": "password"
            },
            "volumes": [
              "postgres_data:/var/lib/postgresql/data",
              "./database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro"
            ],
            "ports": ["5432:5432"],
            "restart": "unless-stopped",
            "healthcheck": {
              "test": ["CMD-SHELL", "pg_isready -U user -d myapp"],
              "interval": "10s",
              "timeout": "5s",
              "retries": 5
            }
          },
          "redis": {
            "image": "redis:7-alpine",
            "ports": ["6379:6379"],
            "volumes": ["redis_data:/data"],
            "restart": "unless-stopped",
            "command": "redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}"
          },
          "nginx": {
            "image": "nginx:alpine",
            "ports": ["443:443"],
            "volumes": [
              "./nginx/nginx.conf:/etc/nginx/nginx.conf:ro",
              "./nginx/ssl:/etc/nginx/ssl:ro"
            ],
            "depends_on": ["frontend"],
            "restart": "unless-stopped"
          }
        },
        "volumes": {
          "postgres_data": {
            "driver": "local"
          },
          "redis_data": {
            "driver": "local"
          }
        },
        "networks": {
          "default": {
            "driver": "bridge",
            "ipam": {
              "config": [
                {
                  "subnet": "172.20.0.0/16"
                }
              ]
            }
          }
        }
      }, null, 2),
      metadata: {
        source: 'Docker 컨테이너 오케스트레이션',
        useCase: '마이크로서비스 배포 설정',
        features: ['서비스 의존성', '환경 변수', '볼륨 마운트', '헬스체크'],
        learningPoints: [
          'Docker Compose 구조',
          '서비스 간 의존성 관리',
          '환경 변수 및 시크릿 관리',
          '컨테이너 네트워킹'
        ]
      }
    },
    {
      id: 'data-sensor-readings',
      name: 'IoT 센서 데이터 (JSONL)',
      description: 'IoT 디바이스에서 수집된 센서 데이터를 JSONL 형식으로 저장한 예제입니다.',
      category: 'data',
      difficulty: 'medium',
      size: 'medium',
      data: `{"device_id": "sensor_001", "timestamp": "2024-01-20T10:00:00.000Z", "location": {"building": "A", "floor": 3, "room": "301"}, "readings": {"temperature": 22.5, "humidity": 45.2, "pressure": 1013.25, "light": 350, "motion": false}, "battery": 87, "signal_strength": -45}
{"device_id": "sensor_002", "timestamp": "2024-01-20T10:00:15.000Z", "location": {"building": "A", "floor": 3, "room": "302"}, "readings": {"temperature": 23.1, "humidity": 48.7, "pressure": 1013.18, "light": 420, "motion": true}, "battery": 92, "signal_strength": -38}
{"device_id": "sensor_003", "timestamp": "2024-01-20T10:00:30.000Z", "location": {"building": "B", "floor": 1, "room": "101"}, "readings": {"temperature": 21.8, "humidity": 52.3, "pressure": 1013.31, "light": 280, "motion": false}, "battery": 76, "signal_strength": -52}
{"device_id": "sensor_001", "timestamp": "2024-01-20T10:01:00.000Z", "location": {"building": "A", "floor": 3, "room": "301"}, "readings": {"temperature": 22.7, "humidity": 45.8, "pressure": 1013.22, "light": 365, "motion": true}, "battery": 87, "signal_strength": -46}
{"device_id": "sensor_004", "timestamp": "2024-01-20T10:01:15.000Z", "location": {"building": "C", "floor": 2, "room": "205"}, "readings": {"temperature": 24.2, "humidity": 41.5, "pressure": 1013.15, "light": 510, "motion": false}, "battery": 68, "signal_strength": -41, "alerts": [{"type": "low_battery", "threshold": 70, "message": "Battery level below 70%"}]}
{"device_id": "sensor_002", "timestamp": "2024-01-20T10:01:30.000Z", "location": {"building": "A", "floor": 3, "room": "302"}, "readings": {"temperature": 23.3, "humidity": 49.1, "pressure": 1013.16, "light": 435, "motion": false}, "battery": 91, "signal_strength": -39}`,
      metadata: {
        source: 'IoT 센서 네트워크',
        useCase: 'IoT 데이터 수집 및 모니터링',
        features: ['시계열 데이터', 'JSONL 스트림', '센서 메트릭', '알림 시스템'],
        learningPoints: [
          'IoT 데이터 구조 이해',
          'JSONL 스트리밍 데이터',
          '시계열 데이터 처리',
          '센서 데이터 분석'
        ]
      }
    },
    {
      id: 'api-weather-forecast',
      name: '날씨 예보 API 응답',
      description: '날씨 서비스 API에서 제공하는 5일 날씨 예보 데이터입니다.',
      category: 'api',
      difficulty: 'simple',
      size: 'medium',
      data: JSON.stringify({
        "location": {
          "name": "Seoul",
          "country": "South Korea",
          "region": "Seoul",
          "lat": 37.57,
          "lon": 126.98,
          "tz_id": "Asia/Seoul",
          "localtime_epoch": 1705737600,
          "localtime": "2024-01-20 15:00"
        },
        "current": {
          "last_updated_epoch": 1705737300,
          "last_updated": "2024-01-20 14:55",
          "temp_c": -2.0,
          "temp_f": 28.4,
          "is_day": 1,
          "condition": {
            "text": "Partly cloudy",
            "icon": "//cdn.weatherapi.com/weather/64x64/day/116.png",
            "code": 1003
          },
          "wind_mph": 8.1,
          "wind_kph": 13.0,
          "wind_degree": 270,
          "wind_dir": "W",
          "pressure_mb": 1025.0,
          "pressure_in": 30.27,
          "precip_mm": 0.0,
          "precip_in": 0.0,
          "humidity": 65,
          "cloud": 25,
          "feelslike_c": -5.2,
          "feelslike_f": 22.6,
          "vis_km": 10.0,
          "vis_miles": 6.0,
          "uv": 2.0,
          "gust_mph": 12.5,
          "gust_kph": 20.2
        },
        "forecast": {
          "forecastday": [
            {
              "date": "2024-01-20",
              "date_epoch": 1705708800,
              "day": {
                "maxtemp_c": 1.0,
                "maxtemp_f": 33.8,
                "mintemp_c": -5.0,
                "mintemp_f": 23.0,
                "avgtemp_c": -2.0,
                "avgtemp_f": 28.4,
                "maxwind_mph": 10.5,
                "maxwind_kph": 16.9,
                "totalprecip_mm": 0.0,
                "totalprecip_in": 0.0,
                "totalsnow_cm": 0.0,
                "avgvis_km": 10.0,
                "avgvis_miles": 6.0,
                "avghumidity": 68.0,
                "daily_will_it_rain": 0,
                "daily_chance_of_rain": 0,
                "daily_will_it_snow": 0,
                "daily_chance_of_snow": 0,
                "condition": {
                  "text": "Partly cloudy",
                  "icon": "//cdn.weatherapi.com/weather/64x64/day/116.png",
                  "code": 1003
                },
                "uv": 2.0
              },
              "astro": {
                "sunrise": "07:32 AM",
                "sunset": "05:48 PM",
                "moonrise": "02:15 PM",
                "moonset": "04:32 AM",
                "moon_phase": "Waxing Gibbous",
                "moon_illumination": "78"
              },
              "hour": [
                {
                  "time_epoch": 1705708800,
                  "time": "2024-01-20 00:00",
                  "temp_c": -3.0,
                  "temp_f": 26.6,
                  "is_day": 0,
                  "condition": {
                    "text": "Clear",
                    "icon": "//cdn.weatherapi.com/weather/64x64/night/113.png",
                    "code": 1000
                  },
                  "wind_mph": 6.9,
                  "wind_kph": 11.2,
                  "wind_degree": 285,
                  "wind_dir": "WNW",
                  "pressure_mb": 1026.0,
                  "pressure_in": 30.3,
                  "precip_mm": 0.0,
                  "precip_in": 0.0,
                  "humidity": 72,
                  "cloud": 8,
                  "feelslike_c": -6.8,
                  "feelslike_f": 19.8,
                  "windchill_c": -6.8,
                  "windchill_f": 19.8,
                  "heatindex_c": -3.0,
                  "heatindex_f": 26.6,
                  "dewpoint_c": -7.2,
                  "dewpoint_f": 19.0,
                  "will_it_rain": 0,
                  "chance_of_rain": 0,
                  "will_it_snow": 0,
                  "chance_of_snow": 0,
                  "vis_km": 10.0,
                  "vis_miles": 6.0,
                  "gust_mph": 10.3,
                  "gust_kph": 16.6,
                  "uv": 1.0
                }
              ]
            }
          ]
        }
      }, null, 2),
      metadata: {
        source: '날씨 API 서비스',
        useCase: '날씨 데이터 시각화 및 분석',
        features: ['중첩 배열', '시간대 데이터', '다단위 측정값', '천문 데이터'],
        learningPoints: [
          '날씨 API 응답 구조',
          '시간대별 데이터 처리',
          '다양한 측정 단위 변환',
          '예보 데이터 모델링'
        ]
      }
    }
  ]
}