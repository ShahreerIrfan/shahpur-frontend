import { ReactNode } from "react";

interface IconBoxProps {
    children: ReactNode;
    size?: "sm" | "md" | "lg";
}

export default function IconBox({ children, size = "md" }: IconBoxProps) {
    const sizeClasses = {
        sm: "w-10 h-10",
        md: "w-14 h-14",
        lg: "w-16 h-16",
    };

    return (
        <div className={`${sizeClasses[size]} bg-primary-50 rounded-lg flex items-center justify-center mb-4`}>
            {children}
        </div>
    );
}
