import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from '@/utils/cn';
export function ImagePreview({ file, onRemove, onReplace }) {
    const [previewUrl, setPreviewUrl] = React.useState('');
    React.useEffect(() => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [file]);
    return (_jsx("div", { className: "w-full max-w-2xl mx-auto px-4 py-6", children: _jsxs("div", { className: "bg-card border border-border rounded-lg overflow-hidden", children: [_jsx("div", { className: "relative w-full aspect-square bg-muted", children: previewUrl && (_jsx("img", { src: previewUrl, alt: "Meal preview", className: "w-full h-full object-cover" })) }), _jsxs("div", { className: "p-4 md:p-6 bg-card border-t border-border", children: [_jsx("div", { className: "flex items-center justify-between mb-4", children: _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-sm md:text-base truncate", children: file.name }), _jsxs("p", { className: "text-xs md:text-sm text-muted-foreground", children: [(file.size / 1024 / 1024).toFixed(2), " MB"] })] }) }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: onReplace, className: cn('flex-1 h-10 md:h-11 px-4 rounded-lg font-medium transition-all', 'bg-secondary text-secondary-foreground hover:opacity-90', 'focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2', 'min-h-[44px] md:min-h-[40px]' // Touch target
                                    ), children: [_jsx("span", { className: "inline-block md:hidden", children: "Replace" }), _jsx("span", { className: "hidden md:inline-block", children: "Replace Photo" })] }), _jsxs("button", { onClick: onRemove, className: cn('flex-1 h-10 md:h-11 px-4 rounded-lg font-medium transition-all', 'border border-border text-foreground hover:bg-muted', 'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2', 'min-h-[44px] md:min-h-[40px]' // Touch target
                                    ), children: [_jsx("span", { className: "inline-block md:hidden", children: "Remove" }), _jsx("span", { className: "hidden md:inline-block", children: "Remove" })] })] })] })] }) }));
}
