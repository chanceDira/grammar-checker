import React, { useState, useRef } from "react";
import type { TextEditorProps } from '../types';
import { Edit3, FileText } from "lucide-react";

const TextEditor: React.FC<TextEditorProps> = ({ text, onChange, errors = [], onErrorClick }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [, setSelection] = useState({ start: 0, end: 0 });

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleSelectionChange = () => {
    if (textareaRef.current) {
      setSelection({
        start: textareaRef.current.selectionStart || 0,
        end: textareaRef.current.selectionEnd || 0,
      });
    }
  };

  const renderHighlightedText = () => {
    if (!errors.length) return text;

    const result = [];
    const currentText = text;
    let processedLength = 0;

    const sortedErrors = [...errors]
      .filter((error) => error.context && currentText.includes(error.context))
      .sort((a, b) => a.start - b.start);

    sortedErrors.forEach((error, index) => {
      const errorIndex = currentText.indexOf(error.context, processedLength);

      if (errorIndex !== -1) {
        if (errorIndex > processedLength) {
          result.push(
            <span key={`text-${index}`}>
              {currentText.slice(processedLength, errorIndex)}
            </span>
          );
        }

        result.push(
          <span
            key={`error-${error.id}`}
            className="grammar-error-highlight"
            onClick={() => onErrorClick(error)}
            title={`Click to see suggestions: ${error.message}`}
          >
            {error.context}
          </span>
        );

        processedLength = errorIndex + error.context.length;
      }
    });

    if (processedLength < currentText.length) {
      result.push(
        <span key="remaining">{currentText.slice(processedLength)}</span>
      );
    }

    return result.length > 0 ? result : text;
  };

  const isEmpty = !text.trim();

  return (
    <div className="relative">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onSelect={handleSelectionChange}
          onKeyUp={handleSelectionChange}
          onClick={handleSelectionChange}
          placeholder=""
          className={`relative w-full min-h-[350px] p-4 border-0 rounded-lg 
    resize-none text-base leading-relaxed bg-transparent z-10 outline-none ring-0 
    focus:ring-0 text-slate-900 dark:text-slate-100 ${
      errors.length > 0 ? "text-transparent" : ""
    }`}
          style={{
            caretColor: "rgb(59 130 246)",
            fontFamily: "inherit",
          }}
        />

        <div
          className="absolute inset-0 p-4 text-transparent whitespace-pre-wrap 
    break-words text-base leading-relaxed z-20 overflow-hidden pointer-events-none"
          style={{
            wordWrap: "break-word",
            fontFamily: "inherit",
          }}
        >
          {renderHighlightedText()}
        </div>

        {isEmpty && (
          <div className="absolute inset-0 p-4 pointer-events-none z-30">
            <div
              className="flex flex-col items-center justify-center h-full 
    text-slate-400 dark:text-slate-500"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <Edit3 className="w-6 h-6" />
                </div>
                <FileText className="w-8 h-8" />
              </div>
              <h3
                className="text-xl font-semibold mb-3 text-slate-600 dark:text-slate-400"
              >
                Start typing your text
              </h3>
              <p
                className="text-center text-slate-500 dark:text-slate-500 max-w-md leading-relaxed mb-6"
              >
                Paste or type your content here. Our AI will analyze it for
                grammar, spelling, and punctuation errors to help you write
                better.
              </p>
              <div className="text-sm text-slate-400 dark:text-slate-500">
                <span
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-md"
                >
                  Tip: Try pasting a paragraph or essay
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {text && (
        <div className="flex justify-between items-center mt-3 text-sm">
          <div className="flex items-center gap-4">
            <span className="text-slate-500 dark:text-slate-400">
              <span className="font-medium">{text.length}</span> characters
            </span>
            {text.length > 1000 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span
                  className="text-green-600 dark:text-green-400 font-medium"
                >
                  Good length
                </span>
              </div>
            )}
          </div>
          {errors.length > 0 && (
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 bg-red-500 rounded-full animate-pulse"
              ></div>
              <span className="text-red-600 dark:text-red-400 font-medium">
                {errors.length} issue{errors.length !== 1 ? "s" : ""} found
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TextEditor;
