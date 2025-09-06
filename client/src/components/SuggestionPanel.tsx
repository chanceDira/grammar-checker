import {
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Clock,
  Zap,
  ArrowRight,
  FileText,
  Type,
  Circle,
  Palette,
} from "lucide-react";
import { useRef, useEffect } from "react";
import type { SuggestionPanelProps, ErrorItemProps } from '../types';

const SuggestionPanel: React.FC<SuggestionPanelProps> = ({
  errors,
  selectedError,
  onErrorSelect,
  onApplySuggestion,
  hasChecked,
  isChecking,
}) => {
  if (isChecking) {
    return (
      <div className="card suggestions-panel">
        <h3
          className="text-xl font-semibold text-slate-900 dark:text-slate-100 
  mb-6 flex items-center gap-2"
        >
          <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
          Analyzing...
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="loading-skeleton h-16 rounded-lg"></div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <div
            className="w-8 h-8 border-2 border-blue-600 border-t-transparent 
  rounded-full animate-spin mx-auto mb-3"
          ></div>
          <p className="text-slate-600 dark:text-slate-400">
            Checking your text with AI...
          </p>
        </div>
      </div>
    );
  }

  if (!hasChecked) {
    return (
      <div className="card suggestions-panel">
        <h3
          className="text-xl font-semibold text-slate-900 dark:text-slate-100 
  mb-6 flex items-center gap-2"
        >
          <Lightbulb className="w-5 h-5 text-amber-500" />
          Suggestions
        </h3>
        <div className="text-center py-8">
          <div
            className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-full w-fit 
  mx-auto mb-6"
          >
            <Lightbulb size={32} className="text-amber-500" />
          </div>
          <h4
            className="font-medium text-slate-700 dark:text-slate-300 
  mb-2"
          >
            Ready to check
          </h4>
          <p
            className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed
   mb-6"
          >
            Click "Check Grammar" to analyze your text and get intelligent
            suggestions for improvements.
          </p>
          <div
            className="flex items-center justify-center gap-2 p-3 bg-blue-50 
  dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800/30"
          >
            <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span
              className="text-sm text-blue-700 dark:text-blue-300 
  font-medium"
            >
              AI-powered analysis
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (errors.length === 0) {
    return (
      <div className="card suggestions-panel">
        <h3
          className="text-xl font-semibold text-slate-900 dark:text-slate-100 
  mb-6 flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5 text-green-600" />
          Perfect!
        </h3>
        <div className="text-center py-8">
          <div
            className="p-4 bg-green-50 dark:bg-green-950/20 rounded-full w-fit 
  mx-auto mb-6"
          >
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">
            No issues found
          </h4>
          <p
            className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed
   mb-6"
          >
            Your text looks great! No grammar, spelling, or punctuation errors
            detected.
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div
              className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border
   border-green-200 dark:border-green-800/30"
            >
              <div
                className="font-medium text-green-800 
  dark:text-green-300"
              >
                Grammar
              </div>
              <div className="text-green-600 dark:text-green-400">
                ✓ Perfect
              </div>
            </div>
            <div
              className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border
   border-green-200 dark:border-green-800/30"
            >
              <div
                className="font-medium text-green-800 
  dark:text-green-300"
              >
                Style
              </div>
              <div className="text-green-600 dark:text-green-400">✓ Clean</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card suggestions-panel">
      <h3
        className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6
   flex items-center gap-2"
      >
        <AlertCircle className="w-5 h-5 text-red-500" />
        Issues Found
        <span
          className="ml-auto px-2.5 py-1 bg-red-100 dark:bg-red-950/30 
    text-red-800 dark:text-red-300 text-sm font-medium rounded-full"
        >
          {errors.length}
        </span>
      </h3>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {errors.map((error, index) => (
          <ErrorItem
            key={error.id || index}
            error={error}
            isSelected={selectedError?.id === error.id}
            onSelect={() => onErrorSelect(error)}
            onApplySuggestion={onApplySuggestion}
            index={index}
          />
        ))}
      </div>

      <div
        className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border 
    border-blue-200 dark:border-blue-800/30"
      >
        <h4
          className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex 
    items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Quick Tip
        </h4>
        <p className="text-sm text-blue-700 dark:text-blue-400">
          Click on highlighted text in the editor or select issues below to see
          suggestions and apply fixes.
        </p>
      </div>
    </div>
  );
};

const ErrorItem: React.FC<ErrorItemProps> = ({
  error,
  isSelected,
  onSelect,
  onApplySuggestion,
  index,
}) => {
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelected && errorRef.current) {
      errorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [isSelected]);
  const getErrorTypeInfo = (type: string) => {
    switch (type?.toLowerCase()) {
      case "spelling":
        return {
          color: "spelling",
          icon: FileText,
          label: "Spelling",
        };
      case "grammar":
        return {
          color: "grammar",
          icon: Type,
          label: "Grammar",
        };
      case "punctuation":
        return {
          color: "punctuation",
          icon: Circle,
          label: "Punctuation",
        };
      case "style":
        return {
          color: "style",
          icon: Palette,
          label: "Style",
        };
      default:
        return {
          color: "grammar",
          icon: AlertCircle,
          label: "Issue",
        };
    }
  };

  const errorInfo = getErrorTypeInfo(error.type);
  const IconComponent = errorInfo.icon;

  return (
    <div
      ref={errorRef}
      className={`error-item ${isSelected ? "selected" : ""}`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white dark:bg-slate-600 rounded">
            <IconComponent className="w-3 h-3 text-slate-600 dark:text-slate-300" />
          </div>
          <span className={`error-badge ${errorInfo.color}`}>
            {errorInfo.label}
          </span>
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-500">
          #{index + 1}
        </div>
      </div>

      <div className="mb-3">
        <div className="mb-2">
          <code
            className="px-2 py-1 bg-red-50 dark:bg-red-950/30 rounded text-sm 
    font-mono text-red-700 dark:text-red-400 border border-red-200 
    dark:border-red-800/30"
          >
            "{error.context}"
          </code>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {error.message}
        </p>
      </div>

      {isSelected && error.suggestions && error.suggestions.length > 0 && (
        <div
          className="mt-4 pt-3 border-t border-slate-200 
    dark:border-slate-600"
        >
          <h4
            className="text-sm font-medium text-slate-700 dark:text-slate-300 
    mb-3 flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4 text-green-600" />
            Suggestions
          </h4>
          <div className="space-y-2">
            {error.suggestions.map((suggestion, suggestionIndex) => (
              <div key={suggestionIndex} className="suggestion-item">
                <code
                  className="text-sm font-mono text-green-800 
    dark:text-green-300 font-medium"
                >
                  "{suggestion}"
                </code>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onApplySuggestion(error.id, suggestion);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs
    px-3 py-1.5 rounded font-medium transition-colors duration-200"
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isSelected && error.suggestions && error.suggestions.length > 0 && (
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Click to see {error.suggestions.length}
          suggestion{error.suggestions.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
};

export default SuggestionPanel;