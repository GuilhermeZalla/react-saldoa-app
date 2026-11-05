import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 130 140"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M88 30H49c-16 0-27 9-27 22s11 20 27 20h30c16 0 27 8 27 21s-11 23-27 23H40"
                fill="none"
                stroke="currentColor"
                strokeWidth="19"
                strokeLinecap="round"
            />
            <path
                d="m31 101-13 15 13 14M97 15l13 15-13 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
