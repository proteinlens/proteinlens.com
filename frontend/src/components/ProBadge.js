import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './ProBadge.css';
export const ProBadge = ({ size = 'medium', showLabel = true, }) => {
    return (_jsxs("span", { className: `pro-badge pro-badge--${size}`, title: "Pro Subscriber", children: [_jsx("span", { className: "pro-badge__icon", children: "\u2B50" }), showLabel && _jsx("span", { className: "pro-badge__text", children: "Pro" })] }));
};
export default ProBadge;
