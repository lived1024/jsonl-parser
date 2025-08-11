/**
 * English translations
 */

export default {
  header: {
    title: 'JSONL Parser',
    subtitle: 'Parse & Visualize JSON Data'
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
  meta: {
    title: 'JSONL Parser',
    description: 'Parse and visualize JSON data with interactive tree structure'
  }
} as const