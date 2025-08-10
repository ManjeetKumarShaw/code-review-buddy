import { useState, useEffect, useCallback } from 'react';
import { Brain, TestTube, Lightbulb, MessageCircle, Copy, Moon, Sun, AlertTriangle, Code, Zap } from 'lucide-react';
import { detectLanguage, validateLanguageMatch } from './utils/languageDetection';
import { AIService } from './utils/aiService';
import './App.css';

const PROGRAMMING_LANGUAGES = ['Python', 'JavaScript', 'Java', 'C++', 'Other'];

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('Python');
  const [languageWarning, setLanguageWarning] = useState('');
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [realTimeAnalysis, setRealTimeAnalysis] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<number | null>(null);

  useEffect(() => {
    // Apply dark mode class to body
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    // Validate language match when code or language changes
    if (code.trim() && selectedLanguage !== 'Other') {
      const isValid = validateLanguageMatch(code, selectedLanguage);
      if (!isValid) {
        const detectedLang = detectLanguage(code);
        if (detectedLang && detectedLang !== selectedLanguage) {
          setLanguageWarning(`⚠️ Code appears to be ${detectedLang}, but ${selectedLanguage} is selected.`);
        } else {
          setLanguageWarning('⚠️ Code doesn\'t clearly match the selected language.');
        }
      } else {
        setLanguageWarning('');
      }
    } else {
      setLanguageWarning('');
    }
  }, [code, selectedLanguage]);

  // Real-time analysis with debouncing
  const performRealTimeAnalysis = useCallback(async (inputCode: string, language: string) => {
    if (!inputCode.trim() || !realTimeAnalysis) return;

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer for debounced analysis
    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await AIService.reviewCode(inputCode, language);
        if (response.success && response.data) {
          setAnalysisResult(response.data);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Real-time analysis error:', error);
        setIsLoading(false);
      }
    }, 1500); // Wait 1.5 seconds after user stops typing

    setDebounceTimer(timer);
  }, [debounceTimer, realTimeAnalysis]);

  // Enhanced code change handler
  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    
    // Clear results when code changes significantly
    if (Math.abs(newCode.length - code.length) > 50) {
      setAnalysisResult('');
      setError('');
    }

    // Trigger real-time analysis
    performRealTimeAnalysis(newCode, selectedLanguage);
  }, [code, selectedLanguage, performRealTimeAnalysis]);

  const handleAnalysis = async (type: 'explanation' | 'review' | 'improvements' | 'pr-comment') => {
    if (!code.trim()) {
      alert('Please paste some code first!');
      return;
    }

    setIsLoading(true);
    setError('');
    setAnalysisResult('');

    try {
      let response;
      switch (type) {
        case 'explanation':
          response = await AIService.explainCode(code, selectedLanguage);
          break;
        case 'review':
          response = await AIService.reviewCode(code, selectedLanguage);
          break;
        case 'improvements':
          response = await AIService.suggestImprovements(code, selectedLanguage);
          break;
        case 'pr-comment':
          response = await AIService.generatePRComment(code, selectedLanguage);
          break;
      }

      if (response.success && response.data) {
        setAnalysisResult(response.data);
      } else {
        setError(response.error || 'Analysis failed');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering for basic formatting
    return content
      .replace(/^## (.*$)/gm, '<h2 class="content-h2">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="content-h3">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="content-strong">$1</strong>')
      .replace(/^- (.*$)/gm, '<li class="content-li">$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li class="content-li">$2</li>')
      .replace(/`(.*?)`/g, '<code class="content-code">$1</code>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header-section">
        <div className="header-container">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-icon">
                <Code className="icon" />
              </div>
              <div className="title-section">
                <h1 className="main-title">
                  Code Review Buddy
                </h1>
                <p className="subtitle">AI-powered code analysis</p>
              </div>
            </div>

            <div className="header-controls">
              {/* Real-time toggle */}
              <label className="realtime-toggle">
                <div className="toggle-container">
                  <input
                    type="checkbox"
                    checked={realTimeAnalysis}
                    onChange={(e) => setRealTimeAnalysis(e.target.checked)}
                    className="toggle-input"
                  />
                  <div className={`toggle-track ${realTimeAnalysis ? 'toggle-active' : ''}`}>
                    <div className={`toggle-thumb ${realTimeAnalysis ? 'toggle-thumb-active' : ''}`} />
                  </div>
                </div>
                <span className="toggle-label">
                  <Zap className="toggle-icon" />
                  <span>Real-time</span>
                </span>
              </label>

              {/* Theme toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="theme-toggle"
              >
                {darkMode ? <Sun className="theme-icon" /> : <Moon className="theme-icon" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="main-container">
        {/* Two Column Layout */}
        <div className="two-column-grid">
          {/* Left Column - Controls and Results */}
          <div className="left-section">
            <div className="controls-card">
              <div className="card-header">
                <h2 className="card-title">Code Analysis</h2>
              </div>
              <div className="card-content">
                <div className="form-group">
                  <label className="form-label">Programming Language</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="form-select"
                  >
                    {PROGRAMMING_LANGUAGES.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
                
                {/* Analysis Tools Section - Always Above Results */}
                <div className="tools-section">
                  <h3 className="tools-title">Analysis Tools</h3>
                  <div className="button-group-horizontal">
                    <button
                      onClick={() => handleAnalysis('explanation')}
                      disabled={isLoading}
                      className="analysis-btn btn-explain"
                    >
                      <Brain className="btn-icon" />
                      <span className="btn-text">Explain</span>
                    </button>

                    <button
                      onClick={() => handleAnalysis('review')}
                      disabled={isLoading}
                      className="analysis-btn btn-review"
                    >
                      <TestTube className="btn-icon" />
                      <span className="btn-text">Review</span>
                    </button>

                    <button
                      onClick={() => handleAnalysis('improvements')}
                      disabled={isLoading}
                      className="analysis-btn btn-improve"
                    >
                      <Lightbulb className="btn-icon" />
                      <span className="btn-text">Improve</span>
                    </button>

                    <button
                      onClick={() => handleAnalysis('pr-comment')}
                      disabled={isLoading}
                      className="analysis-btn btn-pr"
                    >
                      <MessageCircle className="btn-icon" />
                      <span className="btn-text">PR Comment</span>
                    </button>
                  </div>
                </div>

                {/* Analysis Results Section - Always Below Tools */}
                <div className="results-section">
                  <div className="result-content-header">
                    <div className="result-content-title-section">
                      <Code className="tab-icon" />
                      <h3 className="result-content-title">Analysis Result</h3>
                    </div>
                    {analysisResult && !isLoading && (
                      <button
                        onClick={() => copyToClipboard(analysisResult)}
                        className="copy-btn"
                      >
                        <Copy className="copy-icon" />
                      </button>
                    )}
                  </div>

                  <div className="result-content-body">
                    {isLoading && (
                      <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">Analyzing code...</p>
                      </div>
                    )}

                    {error && (
                      <div className="error-state">
                        <AlertTriangle className="error-icon" />
                        <div>
                          <h4 className="error-title">Analysis Error</h4>
                          <p className="error-text">{error}</p>
                        </div>
                      </div>
                    )}

                    {analysisResult && !isLoading && (
                      <div 
                        className="content-text"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(analysisResult) }}
                      />
                    )}

                    {!analysisResult && !isLoading && !error && (
                      <div className="empty-state">
                        <div className="empty-icon">
                          <Code className="tab-icon" />
                        </div>
                        <h3 className="empty-title">Ready for Analysis</h3>
                        <p className="empty-text">
                          Select an analysis tool above to analyze your code.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Code Input Only */}
          <div className="right-section">
            <div className="input-card">
              <div className="card-header">
                <div className="header-row">
                  <h2 className="card-title">Code Input</h2>
                  {realTimeAnalysis && (
                    <div className="live-indicator">
                      <div className="pulse-dot"></div>
                      <span className="live-text">Live Analysis</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="card-content">
                <div className="form-group code-input-group">
                  <label className="form-label">Code</label>
                  
                  {languageWarning && (
                    <div className="warning-alert">
                      <AlertTriangle className="warning-icon" />
                      <span className="warning-text">{languageWarning}</span>
                    </div>
                  )}
                  
                  <textarea
                    value={code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    placeholder="Paste your code here for AI-powered analysis..."
                    className="code-textarea extra-large-textarea"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer-section">
        <div className="footer-container">
          <div className="footer-content">
            <p className="footer-text">
              Built with ❤️ by PM Coders
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
