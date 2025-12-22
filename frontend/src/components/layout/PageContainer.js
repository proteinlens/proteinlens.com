import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '@/utils/cn';
export function PageContainer({ children, className }) {
    return (_jsx("main", { className: cn('flex-1 pb-20 md:pb-0', className), children: children }));
}
