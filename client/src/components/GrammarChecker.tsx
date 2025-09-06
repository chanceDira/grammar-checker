import { useState } from "react";
import type { GrammarError } from '../types';

import {
  CheckCircle,
  AlertCircle,
  Download,
  Copy,
  Type,
  TrendingUp,
  Hash,
  FileText,
} from "lucide-react";
import TextEditor from "./TextEditor";
import SuggestionPanel from "./SuggestionPanel";
import ThemeToggle from "./ThemeToggle";
import { checkGrammar } from "../services/grammarService";
import { trackEvent } from "../utils/analytics";

const GrammarChecker = () => {
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<GrammarError[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [selectedError, setSelectedError] = useState<GrammarError | null>(null);
  const [correctedText, setCorrectedText] = useState("");

  const handleCheckGrammar = async () => {
    if (!text.trim()) return;

    setIsChecking(true);
    setHasChecked(false);

    try {
      trackEvent("grammar_check_started", { textLength: text.length });

      const result = await checkGrammar(text);


      setErrors(result.errors || []);
      setCorrectedText(result.correctedText || text);
      setHasChecked(true);

      trackEvent("grammar_check_completed", {
        textLength: text.length,
        errorsFound: result.errors?.length || 0,
      });
    } catch (error) {
      console.error("Grammar check failed:", error);
      trackEvent("grammar_check_failed", { error: error instanceof Error ? error.message : 'Unknown error' });
      alert("Failed to check grammar. Please try again later.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleApplySuggestion = (errorId: string, suggestion: string) => {
    const error = errors.find((e) => e.id === errorId);
    if (!error) return;

    const newText = text.replace(error.context, suggestion);
    setText(newText);

    setErrors(errors.filter((e) => e.id !== errorId));
    setSelectedError(null);

    trackEvent("suggestion_applied", { errorType: error.type });
  };

  const handleCopyText = () => {
    const textToCopy = correctedText || text;
    navigator.clipboard.writeText(textToCopy);
    trackEvent("text_copied", { hasCorrections: !!correctedText });
  };

  const handleDownloadText = () => {
    const textToDownload = correctedText || text;
    const blob = new Blob([textToDownload], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "corrected-text.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    trackEvent("text_downloaded", { hasCorrections: !!correctedText });
  };

  const handleClearText = () => {
    setText("");
    setErrors([]);
    setHasChecked(false);
    setSelectedError(null);
    setCorrectedText("");

    trackEvent("text_cleared");
  };

  const getStats = () => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = text.trim()
      ? text.split(/[.!?]+/).filter((s) => s.trim()).length
      : 0;
    return { words, sentences, characters: text.length };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-3xl font-bold text-slate-900 dark:text-slate-100 
    mb-2"
            >
              Grammar Checker
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              AI-powered writing assistant for perfect grammar
            </p>
          </div>
          <ThemeToggle />
        </header>

        {text && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="card stats-card">
              <div className="flex items-center justify-center mb-2">
                <Hash className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </div>
              <div
                className="text-2xl font-semibold text-slate-900 
    dark:text-slate-100"
              >
                {stats.characters}
              </div>
              <div
                className="text-sm text-slate-500 
    dark:text-slate-400"
              >
                Characters
              </div>
            </div>
            <div className="card stats-card">
              <div className="flex items-center justify-center mb-2">
                <Type className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </div>
              <div
                className="text-2xl font-semibold text-slate-900 
    dark:text-slate-100"
              >
                {stats.words}
              </div>
              <div
                className="text-sm text-slate-500 
    dark:text-slate-400"
              >
                Words
              </div>
            </div>
            <div className="card stats-card">
              <div className="flex items-center justify-center mb-2">
                <FileText className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </div>
              <div
                className="text-2xl font-semibold text-slate-900 
    dark:text-slate-100"
              >
                {stats.sentences}
              </div>
              <div
                className="text-sm text-slate-500 
    dark:text-slate-400"
              >
                Sentences
              </div>
            </div>
            <div className="card stats-card">
              <div className="flex items-center justify-center mb-2">
                {hasChecked ? (
                  errors.length === 0 ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )
                ) : (
                  <TrendingUp
                    className="w-5 h-5 text-slate-500 
    dark:text-slate-400"
                  />
                )}
              </div>
              <div
                className="text-2xl font-semibold text-slate-900 
    dark:text-slate-100"
              >
                {hasChecked ? errors.length : "—"}
              </div>
              <div
                className="text-sm text-slate-500 
    dark:text-slate-400"
              >
                Issues
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card text-editor-container">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-xl font-semibold text-slate-900 
    dark:text-slate-100"
                >
                  Your Text
                </h2>
                <div className="flex gap-2">
                  {text && (
                    <>
                      <button
                        onClick={handleCopyText}
                        className="btn-ghost flex items-center gap-2"
                        title="Copy text"
                      >
                        <Copy size={16} />
                        <span className="hidden sm:inline">Copy</span>
                      </button>
                      <button
                        onClick={handleDownloadText}
                        className="btn-ghost flex items-center gap-2"
                        title="Download text"
                      >
                        <Download size={16} />
                        <span className="hidden sm:inline">Download</span>
                      </button>
                      <button
                        onClick={handleClearText}
                        className="btn-secondary"
                      >
                        Clear
                      </button>
                    </>
                  )}
                </div>
              </div>

              <TextEditor
                text={text}
                onChange={setText}
                errors={errors}
                onErrorClick={setSelectedError}
              />

              <div
                className="flex flex-col sm:flex-row justify-between 
    items-start sm:items-center gap-4 mt-4 pt-4 border-t border-slate-200 
    dark:border-slate-700"
              >
                <div className="flex items-center gap-4">
                  {hasChecked && (
                    <div className="flex items-center gap-2">
                      {errors.length === 0 ? (
                        <div
                          className="flex items-center gap-2 text-green-600 
    dark:text-green-400"
                        >
                          <CheckCircle size={18} />
                          <span className="text-sm font-medium">
                            No issues found
                          </span>
                        </div>
                      ) : (
                        <div
                          className="flex items-center gap-2 text-red-600 
    dark:text-red-400"
                        >
                          <AlertCircle size={18} />
                          <span className="text-sm font-medium">
                            {errors.length} issue
                            {errors.length !== 1 ? "s" : ""}
                            found
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleCheckGrammar}
                  disabled={!text.trim() || isChecking}
                  className={`btn-primary flex items-center gap-2 ${
                    !text.trim() || isChecking ? "" : ""
                  }`}
                >
                  {isChecking ? (
                    <>
                      <div
                        className="w-4 h-4 border-2 border-white 
    border-t-transparent rounded-full animate-spin"
                      ></div>
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <Type size={16} />
                      <span>Check Grammar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <SuggestionPanel
              errors={errors}
              selectedError={selectedError}
              onErrorSelect={setSelectedError}
              onApplySuggestion={handleApplySuggestion}
              hasChecked={hasChecked}
              isChecking={isChecking}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrammarChecker;
