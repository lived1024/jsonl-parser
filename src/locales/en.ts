/**
 * English translations
 */

export default {
  header: {
    title: 'JSONL Parser',
    subtitle: 'Parse & Visualize JSON Data'
  },
  common: {
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    export: 'Export',
    loading: 'Loading...'
  },
  privacy: {
    pageTitle: 'Privacy Settings',
    pageDescription: 'Manage your privacy and data usage preferences',
    title: 'Privacy & Data Protection',
    description: 'Control how your data is collected and used. All data is stored locally and never transmitted externally.',
    tracking: {
      title: 'Tracking Settings',
      enabled: 'Enable user behavior tracking',
      enabledDescription: 'Analyze usage patterns to provide better experience.'
    },
    analytics: {
      consent: 'Analytics data collection consent',
      consentDescription: 'Collect anonymized usage statistics to improve the service.'
    },
    personalization: {
      enabled: 'Enable personalized content',
      enabledDescription: 'Provide customized recommendations based on usage patterns.'
    },
    dataRetention: {
      title: 'Data Retention',
      period: 'Retention period',
      days: '{days} days',
      periodDescription: 'Set how long to keep your user data.'
    },
    cookies: {
      title: 'Cookie Settings',
      consent: 'Cookie usage consent',
      consentDescription: 'Consent to use cookies for basic functionality.'
    },
    dataManagement: {
      title: 'Data Management',
      export: 'Export Data',
      clear: 'Clear All Data'
    },
    clearData: {
      confirmTitle: 'Clear All Data',
      confirmMessage: 'Are you sure you want to delete all user data? This action cannot be undone.',
      preferences: 'User preferences',
      behaviorData: 'Behavior data',
      analytics: 'Analytics data',
      settings: 'Privacy settings',
      confirm: 'Delete'
    },
    compliance: {
      title: 'Compliance Status',
      compliant: 'Privacy regulations are being complied with',
      nonCompliant: 'There are privacy compliance issues'
    }
  },
  preferences: {
    dashboard: {
      title: 'User Preferences Dashboard',
      description: 'View your usage patterns and personalized insights'
    },
    analytics: {
      title: 'Usage Analytics',
      usage: 'Usage Overview',
      avgSession: 'Avg Session Time',
      featuresUsed: 'Features Used',
      learning: 'Learning Progress',
      completedTutorials: 'Completed Tutorials',
      learningVelocity: 'Weekly Learning Velocity',
      tools: 'Tool Usage',
      favoriteTools: 'Favorite Tools',
      toolEfficiency: 'Tool Efficiency'
    },
    recommendations: {
      title: 'Personalized Recommendations',
      tutorials: 'Recommended Tutorials',
      tools: 'Recommended Tools',
      content: 'Recommended Content'
    },
    activity: {
      title: 'Recent Activity',
      recentTools: 'Recent Tools',
      recentContent: 'Recent Content',
      recentSamples: 'Recent Samples'
    },
    learning: {
      title: 'Learning Progress',
      completed: 'Completed',
      inProgress: 'In Progress'
    },
    insights: {
      title: 'Behavioral Insights',
      patterns: 'Usage Patterns',
      behavioral: 'Behavioral Analysis',
      recommendations: 'Improvement Suggestions'
    },
    privacy: {
      title: 'Privacy Status',
      tracking: 'Tracking',
      trackingEnabled: 'Tracking is enabled',
      trackingDisabled: 'Tracking is disabled',
      personalization: 'Personalization',
      personalizationEnabled: 'Personalization is enabled',
      personalizationDisabled: 'Personalization is disabled',
      analytics: 'Analytics',
      analyticsEnabled: 'Analytics is enabled',
      analyticsDisabled: 'Analytics is disabled',
      settings: 'Privacy Settings'
    },
    actions: {
      title: 'Actions',
      refresh: 'Refresh Analytics',
      privacySettings: 'Privacy Settings',
      exportData: 'Export Data'
    }
  },
  input: {
    title: 'JSON Input',
    description: 'Paste your JSON or JSONL data',
    placeholder: 'Enter your JSON data here...',
    json: {
      name: 'JSON',
      description: 'Single object'
    },
    jsonl: {
      name: 'JSONL',
      description: 'Multiple lines'
    }
  },
  output: {
    title: 'JSON Tree',
    description: 'Interactive tree visualization',
    stats: {
      nodes: 'nodes',
      levels: 'levels',
      lines: 'lines'
    },
    controls: {
      expandAll: 'Expand All',
      collapseAll: 'Collapse All',
      preserveBreaks: 'Preserve Breaks',
      byLevel: 'By Level:'
    },
    empty: {
      title: 'Ready to visualize your JSON',
      description: 'Enter JSON or JSONL data in the input panel to see a beautiful tree structure here',
      tips: {
        focus: 'Use {{key}} to focus input',
        parse: 'Use {{key}} to parse'
      }
    },
    error: {
      title: 'JSON Parsing Error',
      detailsHeader: 'Error Details',
      location: {
        line: 'Line {{line}}',
        column: 'Column {{column}}',
        position: 'Position {{position}}'
      },
      suggestions: {
        title: 'Common Solutions:',
        items: [
          'Check for missing or extra commas',
          'Ensure all strings are properly quoted',
          'Verify bracket and brace matching',
          'Remove trailing commas in objects/arrays'
        ]
      },
      actions: {
        retry: 'Try Again',
        clear: 'Clear Input'
      },
      partial: {
        title: 'Partial Parsing Success'
      },
      jsonlDetected: {
        title: 'JSONL Format Detected',
        description: 'The input data appears to be in JSONL (JSON Lines) format. Would you like to switch to JSONL mode?',
        switchButton: 'Switch to JSONL'
      }
    }
  },
  shortcuts: {
    title: 'Keyboard Shortcuts',
    subtitle: 'Speed up your workflow',
    close: 'Close',
    sections: {
      global: 'Global',
      editor: 'Text Editor',
      navigation: 'Tree Navigation',
      control: 'Tree Control'
    },
    global: {
      focusInput: 'Focus input area',
      parseJson: 'Parse JSON',
      clearFocus: 'Clear focus'
    },
    editor: {
      addIndent: 'Add indentation',
      removeIndent: 'Remove indentation',
      formatJson: 'Format JSON'
    },
    navigation: {
      toggleNode: 'Toggle node',
      expandNode: 'Expand node',
      collapseNode: 'Collapse node'
    },
    control: {
      expandAll: 'Expand all nodes',
      collapseAll: 'Collapse all nodes',
      expandToLevel: 'Expand to level'
    }
  },
  status: {
    loading: 'Parsing JSON...',
    error: 'Parsing Error',
    warning: 'Partial Success',
    success: 'Successfully Parsed',
    idle: 'Ready to Parse',
    idleDescription: 'Enter JSON or JSONL data to visualize',
    location: {
      line: 'Line {{line}}',
      column: 'Col {{column}}'
    }
  },
  editor: {
    placeholder: 'Enter your JSON data here...',
    placeholders: {
      json: `Enter JSON data...

Example:
{
  "name": "John Doe",
  "age": 30,
  "hobbies": ["reading", "movies"]
}`,
      jsonl: `Enter JSONL data (one JSON per line)...

Example:
{"name": "John Doe", "age": 30}
{"name": "Jane Smith", "age": 25}
{"name": "Bob Johnson", "age": 28}`
    },
    descriptions: {
      json: 'Enter a single JSON object or array. Example: {"name": "John", "age": 30}',
      jsonl: 'Enter one JSON object per line. Each line must be valid JSON.'
    },
    info: {
      chars: '{{count}} chars',
      lines: '{{count}} lines'
    },
    actions: {
      format: 'Format',
      clear: 'Clear',
      formatTitle: 'Format JSON (Alt+Shift+F)',
      clearTitle: 'Clear input (Alt+I)'
    },
    dragDrop: {
      title: 'Drop JSON File',
      description: 'Drag and drop JSON or JSONL files here'
    },
    loading: {
      title: 'Processing file...',
      description: 'Reading and parsing the file'
    }
  },
  validation: {
    jsonlRequired: 'JSONL format requires at least one line of JSON data.',
    inputTooLarge: 'Input size is too large. Maximum {{maxSize}}MB is supported.',
    memoryWarning: 'Input data is too large and may cause memory issues. Please use smaller data.',
    jsonlTooManyLines: 'JSONL format supports up to 10,000 lines maximum.',
    tooManyErrors: 'Too many errors occurred. Only showing the first 10 errors.',
    partialSuccess: '{{errorCount}} lines had errors. {{successCount}} lines were successfully parsed.'
  },
  accessibility: {
    mainArea: 'JSONL Parser main area',
    inputPanel: 'JSON input panel',
    outputPanel: 'JSON tree output panel',
    keyboardHelp: 'Keyboard shortcuts help',
    expandAllNodes: 'Expand all nodes',
    collapseAllNodes: 'Collapse all nodes',
    toggleLineBreaks: 'Toggle line break preservation',
    expandToLevel: 'Expand to level {{level}}',
    treeStructure: 'JSON tree structure',
    languageSelector: {
      label: 'Language selector',
      currentLanguage: 'Current language: {{language}}'
    },
    panelResizer: 'Panel resizer',
    jsonInput: 'JSON data input',
    errorLocation: 'Error location information'
  },
  help: {
    title: 'Help',
    close: 'Close',
    openHelp: 'Open help',
    tabs: {
      overview: 'Overview',
      shortcuts: 'Shortcuts',
      examples: 'Examples',
      datatypes: 'Data Types',
      faq: 'FAQ',
      performance: 'Performance',
      troubleshooting: 'Troubleshooting'
    },
    whatIs: {
      title: 'What is JSONL Parser?',
      description: 'A web application that visualizes JSON and JSONL data in an interactive tree structure. It helps you easily navigate and understand complex JSON data.'
    },
    howToUse: {
      title: 'How to Use',
      step1: 'Enter JSON or JSONL data in the left panel',
      step2: 'Select the data format (JSON/JSONL)',
      step3: 'View the automatically generated tree structure on the right',
      step4: 'Click nodes to expand or collapse them'
    },
    features: {
      title: 'Key Features',
      multiFormat: {
        title: 'Multi-format Support',
        description: 'Supports both JSON and JSONL formats'
      },
      treeView: {
        title: 'Interactive Tree View',
        description: 'Color-coded by data type with expand/collapse functionality'
      },
      realtime: {
        title: 'Real-time Parsing',
        description: 'Automatically parses input and displays errors in real-time'
      },
      responsive: {
        title: 'Responsive Design',
        description: 'Optimized user experience on all devices'
      },
      lineBreaks: {
        title: 'Preserve Line Breaks',
        description: 'Display line breaks in strings as they appear in the original data'
      },
      expandLevels: {
        title: 'Expand by Levels',
        description: 'Automatically expand the tree to your desired depth level'
      }
    },
    shortcuts: {
      title: 'Keyboard Shortcuts',
      focusInput: 'Focus input area',
      parseJson: 'Parse JSON',
      expandAll: 'Expand all nodes',
      collapseAll: 'Collapse all nodes',
      formatJson: 'Format JSON',
      help: 'Open help'
    },
    examples: {
      title: 'Examples',
      complex: 'Complex Structure',
      tryIt: 'Try it'
    }
  },
  onboarding: {
    close: 'Close',
    skip: 'Skip',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish',
    steps: {
      welcome: {
        title: 'Welcome to JSONL Parser!',
        description: 'A tool to visualize JSON and JSONL data in beautiful tree structures.',
        tip1: 'Press F1 anytime to access help',
        tip2: 'Use keyboard shortcuts for faster workflow'
      },
      inputPanel: {
        title: 'Input Panel',
        description: 'Enter your JSON or JSONL data here. It will be parsed in real-time.',
        tip1: 'Press Alt+I to quickly focus the input area',
        tip2: 'You can also drag and drop files to upload'
      },
      formatSelector: {
        title: 'Format Selector',
        description: 'Choose between JSON and JSONL formats. Auto-detection is also supported.'
      },
      outputPanel: {
        title: 'Output Panel',
        description: 'Parsed data is displayed as an interactive tree. Click nodes to explore.',
        tip1: 'Click nodes or use Enter/Space to expand/collapse',
        tip2: 'Data types are color-coded for easy identification'
      },
      shortcuts: {
        title: 'Keyboard Shortcuts',
        description: 'Click this button to see all available keyboard shortcuts.',
        tip1: 'Press Alt+H to open the shortcuts panel',
        tip2: 'Learning shortcuts will greatly improve your efficiency'
      }
    }
  },
  tooltip: {
    shortcut: 'Shortcut',
    tips: 'Tips'
  },
  faq: {
    title: 'Frequently Asked Questions',
    subtitle: 'Find answers to common questions',
    searchPlaceholder: 'Search FAQ...',
    clearSearch: 'Clear search',
    noResults: 'No results found',
    noResultsDescription: 'Try different keywords or clear filters.',
    clearFilters: 'Clear filters',
    relatedLinks: 'Related Links',
    example: 'Example',
    categories: {
      all: 'All',
      basics: 'Basics',
      parsing: 'Parsing',
      navigation: 'Navigation',
      performance: 'Performance',
      troubleshooting: 'Troubleshooting'
    },
    items: {
      whatIsJsonl: {
        question: 'What is JSONL?',
        answer: 'JSONL (JSON Lines) is a text format where each line contains one JSON object. It\'s commonly used for large data streaming and log files.'
      },
      jsonVsJsonl: {
        question: 'What\'s the difference between JSON and JSONL?',
        answer: 'JSON represents a single structured data, while JSONL lists multiple JSON objects separated by newlines. JSONL is better suited for streaming data processing.'
      },
      largeFiles: {
        question: 'Can it handle large files?',
        answer: 'Supports up to 10MB with performance optimization through lazy loading. Files with 50+ child nodes are loaded progressively.'
      },
      parsingErrors: {
        question: 'What to do when parsing errors occur?',
        answer: 'Error messages show exact location and cause. Common causes include missing commas, incorrect quotes, and bracket mismatches.'
      },
      keyboardShortcuts: {
        question: 'Are there keyboard shortcuts?',
        answer: 'Yes, various shortcuts are supported. Press Alt+H for shortcuts list or F1 for help.'
      },
      dataPersistence: {
        question: 'Is input data saved?',
        answer: 'Input data is automatically saved to browser\'s local storage and persists after page refresh. It\'s not sent to servers.'
      }
    }
  },
  dataTypeGuide: {
    title: 'JSON Data Types Guide',
    subtitle: 'Learn about all data types available in JSON and how to use them',
    examples: 'Examples',
    rules: 'Rules',
    tips: 'Tips',
    commonErrors: 'Common Errors',
    wrong: 'Wrong',
    correct: 'Correct',
    types: {
      string: {
        name: 'String',
        description: 'Represents text data. Must be enclosed in double quotes.',
        examples: {
          basic: 'Basic string',
          empty: 'Empty string',
          special: 'Special characters',
          unicode: 'Unicode'
        },
        rules: [
          'Must be enclosed in double quotes (")',
          'Special characters must be escaped with backslash (\\)',
          'Supports Unicode characters'
        ],
        tips: [
          'Use \\n for multi-line strings',
          'Single quotes (\') are not valid in JSON'
        ]
      },
      number: {
        name: 'Number',
        description: 'Represents integers and decimals. Written without quotes.',
        examples: {
          integer: 'Integer',
          decimal: 'Decimal',
          negative: 'Negative',
          scientific: 'Scientific notation'
        },
        rules: [
          'Not enclosed in quotes',
          'Use period (.) for decimal point',
          'Supports scientific notation (e, E)'
        ],
        tips: [
          'Very large numbers may lose precision',
          'Infinity and NaN are not valid in JSON'
        ]
      },
      boolean: {
        name: 'Boolean',
        description: 'Represents true or false values.',
        examples: {
          true: 'True',
          false: 'False'
        },
        rules: [
          'Written in lowercase only (true, false)',
          'Not enclosed in quotes'
        ],
        tips: [
          'Used for conditional logic',
          'Useful for flags or states'
        ]
      },
      null: {
        name: 'Null',
        description: 'Represents absence of value.',
        examples: {
          basic: 'Basic null'
        },
        rules: [
          'Written in lowercase only (null)',
          'Not enclosed in quotes'
        ],
        tips: [
          'Represents missing or unknown values',
          'undefined is not valid in JSON'
        ]
      },
      array: {
        name: 'Array',
        description: 'An ordered list of values. Enclosed in square brackets.',
        examples: {
          numbers: 'Number array',
          strings: 'String array',
          mixed: 'Mixed types',
          empty: 'Empty array'
        },
        rules: [
          'Enclosed in square brackets []',
          'Elements separated by commas',
          'No comma after the last element'
        ],
        tips: [
          'Order of elements matters',
          'Nested arrays are possible'
        ]
      },
      object: {
        name: 'Object',
        description: 'A collection of key-value pairs. Enclosed in curly braces.',
        examples: {
          simple: 'Simple object',
          nested: 'Nested object',
          empty: 'Empty object'
        },
        rules: [
          'Enclosed in curly braces {}',
          'Keys must be strings',
          'Keys and values separated by colon (:)',
          'Key-value pairs separated by commas'
        ],
        tips: [
          'Key order is not guaranteed',
          'Deep nesting is possible'
        ]
      }
    },
    nesting: {
      title: 'Nested Structures',
      description: 'JSON allows nesting objects and arrays to create complex data structures.'
    },
    validation: {
      title: 'Validation Tips',
      tips: [
        'Ensure all brackets and braces are properly closed',
        'Check that string keys and values have quotes',
        'Remove unnecessary trailing commas',
        'Verify data types are correct',
        'Ensure the overall structure is valid JSON'
      ]
    }
  },
  troubleshooting: {
    title: 'Troubleshooting Guide',
    subtitle: 'Find solutions to common problems',
    searchPlaceholder: 'Search problems...',
    clearSearch: 'Clear search',
    noResults: 'No results found',
    noResultsDescription: 'Try different keywords or clear filters.',
    clearFilters: 'Clear filters',
    quickFix: 'Quick Fix',
    detailedSteps: 'Detailed Steps',
    example: 'Example',
    wrongExample: 'Wrong Example',
    correctExample: 'Correct Example',
    prevention: 'Prevention',
    relatedProblems: 'Related Problems',
    stillNeedHelp: 'Still need help?',
    contactDescription: 'If the problem persists, please use the options below.',
    checkFAQ: 'Check FAQ',
    reportIssue: 'Report Issue',
    frequency: {
      rare: 'Rare',
      occasional: 'Occasional',
      common: 'Common',
      frequent: 'Frequent'
    },
    categories: {
      all: 'All',
      parsing: 'Parsing',
      display: 'Display',
      performance: 'Performance',
      navigation: 'Navigation',
      input: 'Input'
    },
    problems: {
      jsonSyntaxError: {
        title: 'JSON Syntax Error',
        description: 'JSON data contains syntax errors and cannot be parsed.',
        quickFixes: {
          checkCommas: 'Check for missing or extra commas',
          checkQuotes: 'Check for missing quotes',
          checkBrackets: 'Check bracket matching'
        },
        steps: {
          locate: 'Locate exact position from error message',
          identify: 'Identify error type (comma, quote, bracket, etc.)',
          fix: 'Fix syntax at the specified location',
          validate: 'Try parsing again after fix'
        },
        prevention: {
          validator: 'Use JSON validation tools',
          formatter: 'Check structure with JSON formatter',
          careful: 'Work carefully when editing manually'
        }
      },
      largeFileSlow: {
        title: 'Large File Performance Issues',
        description: 'File is too large causing slow parsing or rendering.',
        quickFixes: {
          reduce: 'Reduce file size',
          collapse: 'Collapse all nodes',
          refresh: 'Refresh page'
        },
        steps: {
          check: 'Check file size (recommended under 5MB)',
          split: 'Split file into smaller chunks',
          optimize: 'Remove unnecessary data',
          monitor: 'Check performance monitor'
        },
        prevention: {
          limit: 'Keep file size under 5MB',
          jsonl: 'Consider using JSONL format',
          sample: 'Test with sample data first'
        }
      },
      treeNotExpanding: {
        title: 'Tree Nodes Not Expanding',
        description: 'Nodes don\'t expand when clicked or are unresponsive.',
        quickFixes: {
          click: 'Click directly on node icon',
          keyboard: 'Use Enter or Space key',
          refresh: 'Refresh page'
        },
        steps: {
          verify: 'Check if node has child elements',
          try: 'Check if same issue occurs with other nodes',
          check: 'Check browser console for errors',
          reload: 'Refresh page and retry'
        }
      },
      jsonlNotDetected: {
        title: 'JSONL Format Not Detected',
        description: 'JSONL data is incorrectly recognized as JSON causing parsing errors.',
        quickFixes: {
          manual: 'Manually select JSONL format',
          format: 'Verify each line is valid JSON',
          validate: 'Check line break characters'
        }
      },
      memoryError: {
        title: 'Memory Error',
        description: 'Browser runs out of memory and cannot process the data.',
        quickFixes: {
          close: 'Close other tabs',
          reduce: 'Reduce data size',
          restart: 'Restart browser'
        },
        steps: {
          save: 'Save current work',
          close: 'Close all unused tabs',
          restart: 'Completely restart browser',
          reduce: 'Retry with smaller data'
        },
        prevention: {
          monitor: 'Regularly check memory usage',
          limit: 'Follow file size limits',
          close: 'Clean up unused tabs'
        }
      }
    }
  },
  navigation: {
    mainLabel: 'Main navigation',
    toggleMenu: 'Toggle menu',
    items: {
      parser: {
        label: 'Parser',
        description: 'JSON/JSONL parsing tool'
      },
      learn: {
        label: 'Learn',
        description: 'Tutorials and guides'
      },
      info: {
        label: 'Info Hub',
        description: 'JSON and API development guides'
      },
      tools: {
        label: 'Tools',
        description: 'Conversion and validation tools'
      },
      reference: {
        label: 'Reference',
        description: 'Syntax and pattern guides'
      },
      samples: {
        label: 'Samples',
        description: 'Example data library'
      },
      preferences: {
        label: 'Preferences',
        description: 'Usage patterns and personalization'
      },
      privacy: {
        label: 'Privacy',
        description: 'Privacy protection and data settings'
      }
    }
  },
  meta: {
    title: 'JSONL Parser',
    description: 'Parse and visualize JSON data with interactive tree structure'
  }
} as const